"""Traffic simulation engine.

Walks the architecture graph from Client nodes and computes latency,
bottlenecks, maximum supported RPS, and per-component load percentages.
"""

from __future__ import annotations

from collections import defaultdict
from typing import Any

# ---------------------------------------------------------------------------
# Capacity model
# ---------------------------------------------------------------------------

# (max_rps, base_latency_ms)
CAPACITY: dict[str, tuple[int, float]] = {
    "Client": (0, 0),              # unlimited source
    "CDN": (50_000, 10),
    "Load Balancer": (10_000, 5),
    "API Gateway": (8_000, 15),
    "Microservice": (5_000, 50),   # per instance -- scaled by replicas
    "Cache": (20_000, 2),
    "Message Queue": (15_000, 10),
    "Database": (2_000, 20),
    "DNS Server": (100_000, 2),
    "Firewall": (50_000, 3),
    "Storage": (10_000, 15),
    "Search Engine": (8_000, 25),
    "Monitoring": (100_000, 1),    # monitoring doesn't bottleneck
    "Auth Service": (10_000, 20),
    "Serverless Function": (20_000, 30),
    "Container": (15_000, 10),
}


def _effective_capacity(node: dict) -> tuple[int, float]:
    """Return (max_rps, latency_ms) for a node, accounting for replicas."""
    node_type: str = node.get("node_type", "")
    base = CAPACITY.get(node_type)
    if base is None:
        return (1_000, 30)

    max_rps, latency = base
    if max_rps == 0:
        return (0, latency)

    replicas = 1
    config = node.get("config") or {}
    if isinstance(config, dict):
        replicas = int(config.get("replicas", 1))

    return (max_rps * replicas, latency)


# ---------------------------------------------------------------------------
# Graph helpers
# ---------------------------------------------------------------------------

def _build_adjacency(nodes: list[dict], edges: list[dict]):
    """Build adjacency list keyed by node id (as string).

    Edges reference nodes by their string id (source_node / target_node).
    We also build a lookup from id -> node dict.
    """
    id_to_node: dict[str, dict] = {}
    for n in nodes:
        nid = str(n["id"])
        id_to_node[nid] = n

    adj: dict[str, list[str]] = defaultdict(list)
    for e in edges:
        src = str(e["source_node"])
        tgt = str(e["target_node"])
        adj[src].append(tgt)

    return id_to_node, adj


def _find_start_nodes(nodes: list[dict], adj: dict[str, list[str]]) -> list[dict]:
    """Return Client nodes, or nodes with no incoming edges as fallback."""
    clients = [n for n in nodes if n.get("node_type") == "Client"]
    if clients:
        return clients

    all_targets: set[str] = set()
    for targets in adj.values():
        all_targets.update(targets)
    return [n for n in nodes if str(n["id"]) not in all_targets]


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def simulate_traffic(
    nodes: list[dict],
    edges: list[dict],
    requests_per_second: int,
    average_request_size: float,
    concurrent_users: int = 100,
    read_write_ratio: float = 80.0,
    peak_multiplier: float = 1.0,
    cache_hit_ratio: float = 0.0,
    availability_target: float = 99.9,
    session_duration: float = 300.0,
) -> dict[str, Any]:
    """Simulate traffic flowing through the architecture graph.

    Returns a dict with:
        system_latency      -- total estimated latency in ms along the
                               critical (longest) path
        bottlenecks         -- labels of components at >80 % capacity
        max_supported_rps   -- minimum effective capacity across all
                               components on the critical path
        component_loads     -- {label: load_percentage} for every non-Client node
        peak_latency        -- latency under peak traffic
        concurrent_users    -- echo back concurrent users
        effective_rps       -- actual RPS after peak multiplier
        read_throughput     -- read operations per second
        write_throughput    -- write operations per second
        cache_offload_pct   -- percentage of reads served by cache
        availability_estimate -- estimated availability %
        bandwidth_mbps      -- estimated bandwidth in Mbps
    """
    empty = {
        "system_latency": 0,
        "bottlenecks": [],
        "max_supported_rps": 0,
        "component_loads": {},
        "peak_latency": 0,
        "concurrent_users": concurrent_users,
        "effective_rps": 0,
        "read_throughput": 0,
        "write_throughput": 0,
        "cache_offload_pct": 0,
        "availability_estimate": 0,
        "bandwidth_mbps": 0,
    }
    if not nodes:
        return empty

    # Apply peak multiplier to get effective RPS
    effective_rps = int(requests_per_second * max(peak_multiplier, 1.0))

    # Read/write split
    read_ratio = max(0, min(100, read_write_ratio)) / 100.0
    read_rps = effective_rps * read_ratio
    write_rps = effective_rps * (1 - read_ratio)

    # Cache offload: reduce read load on downstream components
    cache_offload = max(0, min(100, cache_hit_ratio)) / 100.0
    has_cache = any(n.get("node_type") == "Cache" for n in nodes)
    actual_cache_offload = cache_offload if has_cache else 0
    # Effective RPS hitting backend = writes + uncached reads
    backend_rps = int(write_rps + read_rps * (1 - actual_cache_offload))

    id_to_node, adj = _build_adjacency(nodes, edges)
    start_nodes = _find_start_nodes(nodes, adj)

    component_loads: dict[str, float] = {}
    visited: set[str] = set()

    path_latencies: list[float] = []
    path_min_caps: list[int] = []

    def _walk(nid: str, cumulative_latency: float, path_min_cap: int):
        if nid in visited:
            return
        visited.add(nid)

        node = id_to_node.get(nid)
        if node is None:
            visited.discard(nid)
            return

        cap, lat = _effective_capacity(node)
        cumulative_latency += lat

        label = node.get("label", node.get("node_type", nid))
        node_type = node.get("node_type", "")

        if cap > 0:
            # Cache and CDN see full traffic; backend sees reduced traffic
            if node_type in ("Cache", "CDN", "Load Balancer", "DNS Server",
                             "Firewall", "API Gateway"):
                load_rps = effective_rps
            else:
                load_rps = backend_rps

            load_pct = round((load_rps / cap) * 100, 2)
            component_loads[label] = load_pct
            path_min_cap = min(path_min_cap, cap) if path_min_cap > 0 else cap

        children = adj.get(nid, [])
        if not children:
            path_latencies.append(cumulative_latency)
            path_min_caps.append(path_min_cap)
        else:
            for child_id in children:
                _walk(child_id, cumulative_latency, path_min_cap)

        visited.discard(nid)

    for start in start_nodes:
        _walk(str(start["id"]), 0, 0)

    system_latency = max(path_latencies) if path_latencies else 0
    max_supported_rps = min(path_min_caps) if path_min_caps else 0

    bottlenecks = [
        label for label, load in component_loads.items() if load > 80
    ]

    # Peak latency = base latency scaled by load factor
    load_factor = (effective_rps / max_supported_rps) if max_supported_rps > 0 else 1
    peak_latency = round(system_latency * max(1, load_factor ** 0.5), 2)

    # Bandwidth estimation (Mbps)
    bandwidth_mbps = round((effective_rps * average_request_size * 8) / 1_000_000, 2)

    # Availability estimate based on component count and redundancy
    node_types = [n.get("node_type", "") for n in nodes]
    component_availability = 0.999  # per component
    num_serial = len(set(node_types) - {"Client", "Monitoring"})
    has_lb = "Load Balancer" in node_types
    # LB implies redundancy bonus
    redundancy_bonus = 0.5 if has_lb else 0.0
    raw_avail = component_availability ** max(num_serial - redundancy_bonus, 1)
    availability_estimate = round(min(raw_avail * 100, 99.999), 3)

    return {
        "system_latency": round(system_latency, 2),
        "bottlenecks": bottlenecks,
        "max_supported_rps": max_supported_rps,
        "component_loads": component_loads,
        "peak_latency": peak_latency,
        "concurrent_users": concurrent_users,
        "effective_rps": effective_rps,
        "read_throughput": round(read_rps, 1),
        "write_throughput": round(write_rps, 1),
        "cache_offload_pct": round(actual_cache_offload * 100, 1),
        "availability_estimate": availability_estimate,
        "bandwidth_mbps": bandwidth_mbps,
    }
