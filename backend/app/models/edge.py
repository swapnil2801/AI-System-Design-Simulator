from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Edge(Base):
    __tablename__ = "edges"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    architecture_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("architectures.id", ondelete="CASCADE"), nullable=False
    )
    source_node: Mapped[str] = mapped_column(String(255), nullable=False)
    target_node: Mapped[str] = mapped_column(String(255), nullable=False)

    # Relationship back to architecture
    architecture = relationship("Architecture", back_populates="edges")
