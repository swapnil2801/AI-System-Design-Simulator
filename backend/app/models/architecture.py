from datetime import datetime
from typing import List

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Architecture(Base):
    __tablename__ = "architectures"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    # Relationships
    nodes: Mapped[List["Node"]] = relationship(
        "Node", back_populates="architecture", cascade="all, delete-orphan"
    )
    edges: Mapped[List["Edge"]] = relationship(
        "Edge", back_populates="architecture", cascade="all, delete-orphan"
    )


# Avoid circular import issues -- the related models import Base from the
# same module (app.database) and will be registered automatically.
from app.models.edge import Edge  # noqa: E402, F401
from app.models.node import Node  # noqa: E402, F401
