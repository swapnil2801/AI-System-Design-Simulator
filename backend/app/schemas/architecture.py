from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class NodeCreate(BaseModel):
    node_type: str
    label: str
    position_x: float
    position_y: float
    configuration_json: Optional[dict] = None


class NodeResponse(BaseModel):
    id: int
    node_type: str
    label: str
    position_x: float
    position_y: float
    configuration_json: Optional[dict] = None

    model_config = ConfigDict(from_attributes=True)


class EdgeCreate(BaseModel):
    source_node: str
    target_node: str


class EdgeResponse(BaseModel):
    id: int
    source_node: str
    target_node: str

    model_config = ConfigDict(from_attributes=True)


class ArchitectureCreate(BaseModel):
    name: str
    nodes: list[NodeCreate]
    edges: list[EdgeCreate]


class ArchitectureResponse(BaseModel):
    id: int
    user_id: int
    name: str
    created_at: datetime
    nodes: list[NodeResponse]
    edges: list[EdgeResponse]

    model_config = ConfigDict(from_attributes=True)


class ArchitectureListResponse(BaseModel):
    id: int
    name: str
    created_at: datetime
    node_count: int = 0
    edge_count: int = 0

    model_config = ConfigDict(from_attributes=True)
