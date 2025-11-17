from fastapi import APIRouter
from typing import Any, Dict
from ..services.realtime_market_data import realtime_service, DataProvider

router = APIRouter()


def _serialize_provider_health() -> Dict[str, Any]:
    out = {}
    for p, h in realtime_service.provider_health.items():
        key = p.value if isinstance(p, DataProvider) else str(p)
        # backoff_until may be datetime
        bo = h.get('backoff_until')
        out[key] = {
            'failure_count': h.get('failure_count', 0),
            'backoff_until': bo.isoformat() if getattr(bo, 'isoformat', None) else bo
        }
    return out


def _serialize_provider_stats() -> Dict[str, Any]:
    out = {}
    for p, s in realtime_service.provider_stats.items():
        key = p.value if isinstance(p, DataProvider) else str(p)
        last_rate = s.get('last_rate_info', {})
        out[key] = {
            'requests': s.get('requests', 0),
            'successes': s.get('successes', 0),
            'failures': s.get('failures', 0),
            'last_rate_info': last_rate
        }
    return out


@router.get("/")
def provider_health():
    """Return runtime provider health and stats for diagnostics."""
    return {
        'provider_health': _serialize_provider_health(),
        'provider_stats': _serialize_provider_stats(),
        'cached_quotes': list(realtime_service.data_cache.keys())
    }
