"""CRUD router for architectures, nodes, and edges."""

import json
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.architecture import Architecture
from app.models.edge import Edge
from app.models.node import Node
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.architecture import (
    ArchitectureCreate,
    ArchitectureListResponse,
    ArchitectureResponse,
    EdgeCreate,
    EdgeResponse,
    NodeCreate,
    NodeResponse,
)

router = APIRouter(prefix="/architectures", tags=["architectures"])

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _serialize_config(config: dict | None) -> str | None:
    """Convert a dict to a JSON string for storage."""
    if config is None:
        return None
    return json.dumps(config)


def _deserialize_config(raw: str | None) -> dict | None:
    """Convert a stored JSON string back to a dict."""
    if raw is None:
        return None
    try:
        return json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        return None


def _node_to_response(node: Node) -> NodeResponse:
    """Build a NodeResponse, deserializing the configuration_json field."""
    return NodeResponse(
        id=node.id,
        node_type=node.node_type,
        label=node.label,
        position_x=node.position_x,
        position_y=node.position_y,
        configuration_json=_deserialize_config(node.configuration_json),
    )


def _arch_to_response(arch: Architecture) -> ArchitectureResponse:
    return ArchitectureResponse(
        id=arch.id,
        user_id=arch.user_id,
        name=arch.name,
        created_at=arch.created_at,
        nodes=[_node_to_response(n) for n in arch.nodes],
        edges=[EdgeResponse.model_validate(e) for e in arch.edges],
    )


def _get_architecture_or_404(
    arch_id: int, user: User, db: Session
) -> Architecture:
    arch = (
        db.query(Architecture)
        .filter(Architecture.id == arch_id, Architecture.user_id == user.id)
        .first()
    )
    if not arch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Architecture not found",
        )
    return arch


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.get("/", response_model=List[ArchitectureListResponse])
def list_architectures(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return all architectures belonging to the current user."""
    archs = (
        db.query(Architecture)
        .filter(Architecture.user_id == current_user.id)
        .order_by(Architecture.created_at.desc())
        .all()
    )
    return [
        ArchitectureListResponse(
            id=a.id,
            name=a.name,
            created_at=a.created_at,
            node_count=len(a.nodes),
            edge_count=len(a.edges),
        )
        for a in archs
    ]


@router.post(
    "/", response_model=ArchitectureResponse, status_code=status.HTTP_201_CREATED
)
def create_architecture(
    payload: ArchitectureCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new architecture with its nodes and edges."""
    arch = Architecture(name=payload.name, user_id=current_user.id)
    db.add(arch)
    db.flush()  # get arch.id before adding children

    # Create nodes and build index→db_id mapping for edge references
    index_to_db_id: dict[str, str] = {}
    for idx, node_data in enumerate(payload.nodes):
        node = Node(
            architecture_id=arch.id,
            node_type=node_data.node_type,
            label=node_data.label,
            position_x=node_data.position_x,
            position_y=node_data.position_y,
            configuration_json=_serialize_config(node_data.configuration_json),
        )
        db.add(node)
        db.flush()
        index_to_db_id[str(idx)] = str(node.id)

    for edge_data in payload.edges:
        edge = Edge(
            architecture_id=arch.id,
            source_node=index_to_db_id.get(edge_data.source_node, edge_data.source_node),
            target_node=index_to_db_id.get(edge_data.target_node, edge_data.target_node),
        )
        db.add(edge)

    db.commit()
    db.refresh(arch)
    return _arch_to_response(arch)


@router.get("/{arch_id}", response_model=ArchitectureResponse)
def get_architecture(
    arch_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return a single architecture with its nodes and edges."""
    arch = _get_architecture_or_404(arch_id, current_user, db)
    return _arch_to_response(arch)


@router.put("/{arch_id}", response_model=ArchitectureResponse)
def update_architecture(
    arch_id: int,
    payload: ArchitectureCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Replace an architecture's name, nodes, and edges entirely."""
    arch = _get_architecture_or_404(arch_id, current_user, db)

    arch.name = payload.name

    # Remove existing children
    db.query(Edge).filter(Edge.architecture_id == arch.id).delete()
    db.query(Node).filter(Node.architecture_id == arch.id).delete()

    # Re-create nodes and build index→db_id mapping for edge references
    index_to_db_id: dict[str, str] = {}
    for idx, node_data in enumerate(payload.nodes):
        node = Node(
            architecture_id=arch.id,
            node_type=node_data.node_type,
            label=node_data.label,
            position_x=node_data.position_x,
            position_y=node_data.position_y,
            configuration_json=_serialize_config(node_data.configuration_json),
        )
        db.add(node)
        db.flush()
        index_to_db_id[str(idx)] = str(node.id)

    for edge_data in payload.edges:
        edge = Edge(
            architecture_id=arch.id,
            source_node=index_to_db_id.get(edge_data.source_node, edge_data.source_node),
            target_node=index_to_db_id.get(edge_data.target_node, edge_data.target_node),
        )
        db.add(edge)

    db.commit()
    db.refresh(arch)
    return _arch_to_response(arch)


@router.delete("/{arch_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_architecture(
    arch_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete an architecture and all its children (cascade)."""
    from app.models.simulation import Simulation as SimulationModel

    arch = _get_architecture_or_404(arch_id, current_user, db)
    db.query(SimulationModel).filter(SimulationModel.architecture_id == arch.id).delete()
    db.delete(arch)
    db.commit()


@router.post("/{arch_id}/nodes", response_model=NodeResponse, status_code=status.HTTP_201_CREATED)
def add_node(
    arch_id: int,
    payload: NodeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a single node to an existing architecture."""
    arch = _get_architecture_or_404(arch_id, current_user, db)
    node = Node(
        architecture_id=arch.id,
        node_type=payload.node_type,
        label=payload.label,
        position_x=payload.position_x,
        position_y=payload.position_y,
        configuration_json=_serialize_config(payload.configuration_json),
    )
    db.add(node)
    db.commit()
    db.refresh(node)
    return _node_to_response(node)


@router.post("/{arch_id}/edges", response_model=EdgeResponse, status_code=status.HTTP_201_CREATED)
def add_edge(
    arch_id: int,
    payload: EdgeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a single edge to an existing architecture."""
    arch = _get_architecture_or_404(arch_id, current_user, db)
    edge = Edge(
        architecture_id=arch.id,
        source_node=payload.source_node,
        target_node=payload.target_node,
    )
    db.add(edge)
    db.commit()
    db.refresh(edge)
    return EdgeResponse.model_validate(edge)
