from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SimulationRequest(BaseModel):
    architecture_id: int
    requests_per_second: int
    average_request_size: float
    concurrent_users: int = 100
    read_write_ratio: float = 80.0        # % reads (e.g. 80 means 80% read, 20% write)
    peak_multiplier: float = 1.0          # e.g. 3.0 = 3x normal traffic
    cache_hit_ratio: float = 0.0          # 0-100 %
    availability_target: float = 99.9     # SLA target %
    session_duration: float = 300.0       # avg session duration in seconds


class SimulationResponse(BaseModel):
    system_latency: float
    bottlenecks: list[str]
    max_supported_rps: int
    component_loads: dict
    peak_latency: float = 0.0
    concurrent_users: int = 0
    effective_rps: int = 0
    read_throughput: float = 0.0
    write_throughput: float = 0.0
    cache_offload_pct: float = 0.0
    availability_estimate: float = 99.9
    bandwidth_mbps: float = 0.0


class SimulationRecord(BaseModel):
    id: int
    architecture_id: int
    request_rate: int
    results_json: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
