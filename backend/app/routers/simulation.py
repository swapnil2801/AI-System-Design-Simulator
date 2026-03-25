"""Simulation router -- run traffic simulations and retrieve history."""

import json
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.architecture import Architecture
from app.models.simulation import Simulation as SimulationModel
from app.models.user import User
from app.routers.auth import get_current_user
from app.schemas.simulation import SimulationRecord, SimulationRequest, SimulationResponse
from app.services.simulation_engine import simulate_traffic

router = APIRouter(tags=["simulation"])


def _get_architecture_or_404(arch_id: int, user: User, db: Session) -> Architecture:
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


@router.post("/simulate", response_model=SimulationResponse)
def run_simulation(
    payload: SimulationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Run a traffic simulation against the given architecture."""
    arch = _get_architecture_or_404(payload.architecture_id, current_user, db)

    # Prepare node / edge dicts for the simulation engine
    nodes = []
    for n in arch.nodes:
        config = {}
        if n.configuration_json:
            try:
                config = json.loads(n.configuration_json)
            except (json.JSONDecodeError, TypeError):
                pass
        nodes.append(
            {
                "id": n.id,
                "node_type": n.node_type,
                "label": n.label,
                "config": config,
            }
        )

    edges = [
        {"source_node": e.source_node, "target_node": e.target_node}
        for e in arch.edges
    ]

    results = simulate_traffic(
        nodes=nodes,
        edges=edges,
        requests_per_second=payload.requests_per_second,
        average_request_size=payload.average_request_size,
        concurrent_users=payload.concurrent_users,
        read_write_ratio=payload.read_write_ratio,
        peak_multiplier=payload.peak_multiplier,
        cache_hit_ratio=payload.cache_hit_ratio,
        availability_target=payload.availability_target,
        session_duration=payload.session_duration,
    )

    # Persist simulation record
    record = SimulationModel(
        architecture_id=arch.id,
        request_rate=payload.requests_per_second,
        results_json=json.dumps(results),
    )
    db.add(record)
    db.commit()

    return SimulationResponse(**results)


@router.get("/simulations/{architecture_id}", response_model=List[SimulationRecord])
def get_simulation_history(
    architecture_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return the simulation history for an architecture."""
    # Verify ownership
    _get_architecture_or_404(architecture_id, current_user, db)

    records = (
        db.query(SimulationModel)
        .filter(SimulationModel.architecture_id == architecture_id)
        .order_by(SimulationModel.created_at.desc())
        .all()
    )
    return records
