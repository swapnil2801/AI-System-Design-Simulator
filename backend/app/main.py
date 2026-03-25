import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine

# Import all models so they are registered with Base.metadata
from app.models import architecture, edge, node, simulation, user  # noqa: F401

# ---------------------------------------------------------------------------
# Lazy router imports -- the router modules are expected to exist under
# app/routers/.  They are imported inside a try/except so the application
# can still start even if a router module has not been created yet.
# ---------------------------------------------------------------------------

app = FastAPI(
    title="System Design Tool API",
    description="Backend API for the collaborative system-design tool.",
    version="1.0.0",
)

# CORS -----------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables (useful during development; use Alembic in production) --
Base.metadata.create_all(bind=engine)

# Routers --------------------------------------------------------------
_ROUTER_MODULES = [
    "app.routers.auth",
    "app.routers.architectures",
    "app.routers.simulation",
    "app.routers.analysis",
    "app.routers.cost",
]

for _module_path in _ROUTER_MODULES:
    try:
        import importlib

        _mod = importlib.import_module(_module_path)
        if hasattr(_mod, "router"):
            app.include_router(_mod.router)
    except ModuleNotFoundError:
        # Router not yet implemented -- skip silently during development
        pass


# Root endpoint ---------------------------------------------------------
@app.get("/")
def root():
    return {
        "message": "Welcome to the System Design Tool API",
        "docs": "/docs",
        "version": "1.0.0",
    }


port = int(os.getenv("PORT", 8000))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)