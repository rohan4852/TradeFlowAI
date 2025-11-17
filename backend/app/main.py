from fastapi import FastAPI, HTTPException, Depends
import os
from pathlib import Path

# Load .env file into environment early so running from editors/terminals that
# don't inject .env still pick up configuration values (like GOOGLE_CLIENT_ID).
# We only set variables that are missing to avoid overwriting explicitly set env vars.
def _load_dotenv_if_present():
    env_path = Path(__file__).resolve().parents[1] / ".env"
    if not env_path.exists():
        return

    try:
        with env_path.open("r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, val = line.split("=", 1)
                key = key.strip()
                val = val.strip().strip('"').strip("'")
                if key and os.getenv(key) is None:
                    os.environ[key] = val
    except Exception:
        # Don't fail startup simply due to env parsing issues; log at debug level
        import logging
        logging.getLogger(__name__).debug("Failed to load .env file safely")


_load_dotenv_if_present()
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import logging
try:
    # When package is installed or run as module (preferred)
    from .routes import market_data, predictions, social, tools, auth, trading
    from .services.data_integration import MultiSourceDataIntegrator, NewsDataIntegrator
    from .services.prediction_engine import HybridPredictionEngine
    from .services.realtime_market_data import realtime_service
    from .services.notification_service import notification_service
    from .services.trading_service import trading_service
    from .database.connection import connect_database, disconnect_database, create_tables
    from .middleware.rate_limiting import limiter
except ImportError:
    # Robust fallback when running the module as a script (e.g. `python app/main.py`).
    # We add the repository `backend` root to sys.path and import the submodules
    # using the `app.` package namespace so their intra-package relative imports
    # continue to work (avoids "relative import beyond top-level package").
    import sys
    import importlib
    from pathlib import Path

    # backend/app/main.py -> backend is two parents up? actually parents[1] gives backend
    backend_root = Path(__file__).resolve().parents[1]
    if str(backend_root) not in sys.path:
        sys.path.insert(0, str(backend_root))

    # Import route modules as app.routes.* so their relative imports (e.g. `..models`)
    # resolve correctly.
    market_data = importlib.import_module("app.routes.market_data")
    predictions = importlib.import_module("app.routes.predictions")
    social = importlib.import_module("app.routes.social")
    tools = importlib.import_module("app.routes.tools")
    auth = importlib.import_module("app.routes.auth")
    trading = importlib.import_module("app.routes.trading")

    # Services
    svc_data_integration = importlib.import_module("app.services.data_integration")
    MultiSourceDataIntegrator = getattr(svc_data_integration, "MultiSourceDataIntegrator")
    NewsDataIntegrator = getattr(svc_data_integration, "NewsDataIntegrator")

    svc_prediction_engine = importlib.import_module("app.services.prediction_engine")
    HybridPredictionEngine = getattr(svc_prediction_engine, "HybridPredictionEngine")

    svc_realtime = importlib.import_module("app.services.realtime_market_data")
    realtime_service = getattr(svc_realtime, "realtime_service")

    svc_notification = importlib.import_module("app.services.notification_service")
    notification_service = getattr(svc_notification, "notification_service")

    svc_trading = importlib.import_module("app.services.trading_service")
    trading_service = getattr(svc_trading, "trading_service")

    db = importlib.import_module("app.database.connection")
    connect_database = getattr(db, "connect_database")
    disconnect_database = getattr(db, "disconnect_database")
    create_tables = getattr(db, "create_tables")

    mw = importlib.import_module("app.middleware.rate_limiting")
    limiter = getattr(mw, "limiter")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Trading LLM API",
    description="Advanced AI-powered trading intelligence platform",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add rate limiting
app.state.limiter = limiter

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(market_data.router, prefix="/api/v1/market", tags=["Market Data"])
app.include_router(predictions.router, prefix="/api/v1/predictions", tags=["Predictions"])
app.include_router(social.router, prefix="/api/v1/social", tags=["Social Trading"])
app.include_router(tools.router, prefix="/api/v1/tools", tags=["Trading Tools"])
app.include_router(trading.router, prefix="/api/v1/trading", tags=["Trading"])

# Import new route modules
try:
    from .routes import streaming, computer_vision, broker_integration, security
except ImportError:
    # Fallback for script execution (python app/main.py)
    import sys
    import importlib
    from pathlib import Path

    backend_root = Path(__file__).resolve().parents[1]
    if str(backend_root) not in sys.path:
        sys.path.insert(0, str(backend_root))

    streaming = importlib.import_module("app.routes.streaming")
    computer_vision = importlib.import_module("app.routes.computer_vision")
    broker_integration = importlib.import_module("app.routes.broker_integration")
    security = importlib.import_module("app.routes.security")

# Include new routers
app.include_router(streaming.router, prefix="/api/v1/streaming", tags=["Real-time Streaming"])
app.include_router(computer_vision.router, prefix="/api/v1/computer-vision", tags=["Computer Vision"])
app.include_router(broker_integration.router, prefix="/api/v1/broker", tags=["Broker Integration"])
app.include_router(security.router, prefix="/api/v1/security", tags=["Security"])

# Provider health/debug endpoint
try:
    from .routes import provider_health
    app.include_router(provider_health.router, prefix="/api/v1/provider-health", tags=["Provider Health"])
except Exception:
    logger.debug("Provider health router failed to load")

@app.get("/")
def read_root():
    return {
        "message": "AI Trading LLM API",
        "version": "2.0.0",
        "features": [
            "Multi-source data integration",
            "Hybrid AI predictions",
            "Social trading platform",
            "Advanced trading tools",
            "Real-time market analysis"
        ]
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": "2024-01-01T00:00:00Z",
        "services": {
            "data_integration": "operational",
            "prediction_engine": "operational",
            "social_platform": "operational",
            "realtime_market_data": "operational" if realtime_service.is_running else "stopped"
        }
    }

from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI lifespan handler replacing deprecated on_event handlers.

    This connects to the database, starts background services, and ensures a
    clean shutdown. Errors are logged but won't prevent the app from starting
    in development environments.
    """
    try:
        # Connect to database and create tables
        try:
            await connect_database()
            await create_tables()
            logger.info("Database connected and tables created")
        except Exception as e:
            logger.warning(f"Database startup failed (continuing): {e}")

        # Start real-time market data service in background
        try:
            import asyncio
            asyncio.create_task(realtime_service.start())
            logger.info("Real-time market data service started")
        except Exception as e:
            logger.warning(f"Realtime service failed to start (continuing): {e}")

        # Start notification service if available
        try:
            await notification_service.start()
            logger.info("Notification service started")
        except Exception as e:
            logger.warning(f"Notification service failed to start (continuing): {e}")

        yield

    finally:
        # Graceful shutdown
        try:
            await realtime_service.stop()
        except Exception:
            logger.debug("Realtime service stop failed or not running")
        try:
            await notification_service.stop()
        except Exception:
            logger.debug("Notification service stop failed or not running")
        try:
            await disconnect_database()
        except Exception:
            logger.debug("Database disconnect failed or not connected")


app.router.lifespan_context = lifespan
