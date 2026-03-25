"""Infrastructure cost estimator for architecture nodes with multi-cloud support."""

from __future__ import annotations

from typing import Any

# ---------------------------------------------------------------------------
# Multi-cloud monthly cost model (USD)
# ---------------------------------------------------------------------------

CLOUD_COSTS: dict[str, dict[str, float]] = {
    "aws": {
        "Client": 0, "CDN": 35, "Load Balancer": 22, "API Gateway": 28,
        "Microservice": 18, "Cache": 28, "Message Queue": 18, "Database": 45,
        "DNS Server": 5, "Firewall": 20, "Storage": 25, "Search Engine": 80,
        "Monitoring": 30, "Auth Service": 15, "Serverless Function": 10,
        "Container": 35,
    },
    "azure": {
        "Client": 0, "CDN": 30, "Load Balancer": 20, "API Gateway": 25,
        "Microservice": 15, "Cache": 25, "Message Queue": 15, "Database": 40,
        "DNS Server": 4, "Firewall": 18, "Storage": 22, "Search Engine": 75,
        "Monitoring": 25, "Auth Service": 12, "Serverless Function": 8,
        "Container": 30,
    },
    "gcp": {
        "Client": 0, "CDN": 32, "Load Balancer": 21, "API Gateway": 26,
        "Microservice": 16, "Cache": 26, "Message Queue": 16, "Database": 42,
        "DNS Server": 4, "Firewall": 19, "Storage": 23, "Search Engine": 70,
        "Monitoring": 28, "Auth Service": 13, "Serverless Function": 9,
        "Container": 32,
    },
}


def _compute_cost_for_provider(
    nodes: list[dict[str, Any]], provider: str
) -> tuple[float, dict[str, float]]:
    """Compute total cost and breakdown for a single cloud provider."""
    cost_table = CLOUD_COSTS.get(provider, CLOUD_COSTS["aws"])
    breakdown: dict[str, float] = {}
    total: float = 0.0

    for node in nodes:
        node_type: str = node.get("node_type", "")
        label: str = node.get("label", node_type)
        base_cost = cost_table.get(node_type, 0.0)

        # Parse replicas from configuration
        replicas = 1
        config = node.get("config") or {}
        if isinstance(config, dict):
            replicas = int(config.get("replicas", 1))

        cost = base_cost * replicas
        breakdown[label] = round(cost, 2)
        total += cost

    return round(total, 2), breakdown


def estimate_cost(
    nodes: list[dict[str, Any]], cloud_provider: str = "aws"
) -> dict[str, Any]:
    """Estimate the monthly infrastructure cost for the given nodes.

    Supports multi-cloud pricing for AWS, Azure, and GCP.

    Returns::

        {
            "total_monthly_cost": <float>,
            "breakdown": { "<label>": <float>, ... },
            "cloud_provider": "<str>",
            "comparison": {
                "aws":   { "total": <float>, "breakdown": { ... } },
                "azure": { "total": <float>, "breakdown": { ... } },
                "gcp":   { "total": <float>, "breakdown": { ... } },
            }
        }
    """
    provider = cloud_provider.lower() if cloud_provider else "aws"
    if provider not in CLOUD_COSTS:
        provider = "aws"

    total, breakdown = _compute_cost_for_provider(nodes, provider)

    # Build comparison across all providers
    comparison: dict[str, dict[str, Any]] = {}
    for p in CLOUD_COSTS:
        p_total, p_breakdown = _compute_cost_for_provider(nodes, p)
        comparison[p] = {"total": p_total, "breakdown": p_breakdown}

    return {
        "total_monthly_cost": total,
        "breakdown": breakdown,
        "cloud_provider": provider,
        "comparison": comparison,
    }
