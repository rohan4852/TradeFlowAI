import asyncio
import time
import logging
from typing import Dict, List, Optional, Callable, Any
from dataclasses import dataclass
from enum import Enum
from collections import defaultdict, deque

logger = logging.getLogger(__name__)

class MessageType(Enum):
    MARKET_DATA = "MARKET_DATA"
    ORDER = "ORDER"
    TRADE = "TRADE"
    NEWS = "NEWS"
    PREDICTION = "PREDICTION"
    RISK_UPDATE = "RISK_UPDATE"

@dataclass
class StreamMessage:
    msg_type: MessageType
    symbol: str
    timestamp_ns: int
    data: Dict[str, Any]
    sequence_id: int = 0
    client_id: str = ""

class VVPStreamingEngine:
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        self.subscribers: Dict[str, List[Callable]] = defaultdict(list)
        self.queue = deque()
        self.is_running = False
        self._task: Optional[asyncio.Task] = None

    def subscribe(self, message_type: str, callback: Callable[[StreamMessage], Any]):
        self.subscribers[message_type].append(callback)
        logger.debug(f"Added subscriber for {message_type}")

    def unsubscribe(self, message_type: str, callback: Callable[[StreamMessage], Any]):
        if callback in self.subscribers.get(message_type, []):
            self.subscribers[message_type].remove(callback)

    async def publish_message(self, message: StreamMessage) -> bool:
        # Enqueue message and schedule dispatch
        self.queue.append(message)
        return True

    async def _dispatcher(self):
        while self.is_running:
            if not self.queue:
                await asyncio.sleep(0.01)
                continue
            message = self.queue.popleft()
            callbacks = list(self.subscribers.get(message.msg_type.value, []))
            for cb in callbacks:
                try:
                    if asyncio.iscoroutinefunction(cb):
                        asyncio.create_task(cb(message))
                    else:
                        # run sync callbacks in background thread
                        loop = asyncio.get_running_loop()
                        loop.run_in_executor(None, cb, message)
                except Exception as e:
                    logger.error(f"Error dispatching message: {e}")

    async def start(self):
        if self.is_running:
            return
        self.is_running = True
        self._task = asyncio.create_task(self._dispatcher())

    async def stop(self):
        if not self.is_running:
            return
        self.is_running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass

# Global engine instance
_vvp_engine: Optional[VVPStreamingEngine] = None

def get_vvp_engine() -> VVPStreamingEngine:
    global _vvp_engine
    if _vvp_engine is None:
        _vvp_engine = VVPStreamingEngine()
    return _vvp_engine

async def initialize_vvp_engine(config: Dict[str, Any] = None) -> VVPStreamingEngine:
    engine = get_vvp_engine()
    await engine.start()
    return engine

async def shutdown_vvp_engine():
    global _vvp_engine
    if _vvp_engine is not None:
        await _vvp_engine.stop()
        _vvp_engine = None