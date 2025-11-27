from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends, HTTPException
from typing import List, Dict, Any
import json
import logging
from ..services.streaming_engine import streaming_agent, live_prediction_agent, risk_monitoring_agent
from ..services.security_agent import security_agent
from ..services.realtime_market_data import realtime_service, AssetType
from ..services.realtime_websocket_service import realtime_websocket_service
from ..services.free_websocket_service import free_websocket_service

logger = logging.getLogger(__name__)
router = APIRouter()

@router.websocket("/ws/{client_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    client_id: str,
    subscriptions: str = Query(..., description="Comma-separated list of subscriptions")
):
    """WebSocket endpoint for real-time data streaming"""
    subscription_list = [sub.strip() for sub in subscriptions.split(',')]
    
    try:
        await streaming_agent.connect_websocket(websocket, client_id, subscription_list)
        
        while True:
            # Keep connection alive and handle client messages
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Handle subscription changes
                if message.get('type') == 'subscribe':
                    new_subs = message.get('subscriptions', [])
                    for sub in new_subs:
                        if sub not in subscription_list:
                            subscription_list.append(sub)
                            await streaming_agent.connect_websocket(websocket, client_id, [sub])
                
                elif message.get('type') == 'unsubscribe':
                    remove_subs = message.get('subscriptions', [])
                    for sub in remove_subs:
                        if sub in subscription_list:
                            subscription_list.remove(sub)
                    await streaming_agent.disconnect_websocket(websocket, remove_subs)
                
            except WebSocketDisconnect:
                break
            except Exception as e:
                logger.error(f"WebSocket message error: {e}")
                break
                
    except WebSocketDisconnect:
        logger.info(f"Client {client_id} disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        await streaming_agent.disconnect_websocket(websocket, subscription_list)

@router.post("/live-predictions/start")
async def start_live_predictions(
    tickers: List[str],
    update_interval: int = Query(300, description="Update interval in seconds")
):
    """Start live prediction generation for specified tickers"""
    try:
        await live_prediction_agent.start_live_predictions(tickers, update_interval)
        return {
            'message': f'Live predictions started for {len(tickers)} tickers',
            'tickers': tickers,
            'update_interval': update_interval
        }
    except Exception as e:
        logger.error(f"Error starting live predictions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/live-predictions/stop")
async def stop_live_predictions(tickers: List[str]):
    """Stop live prediction generation for specified tickers"""
    try:
        await live_prediction_agent.stop_live_predictions(tickers)
        return {
            'message': f'Live predictions stopped for {len(tickers)} tickers',
            'tickers': tickers
        }
    except Exception as e:
        logger.error(f"Error stopping live predictions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/risk-monitoring/start")
async def start_risk_monitoring(
    portfolio_id: str,
    check_interval: int = Query(60, description="Check interval in seconds")
):
    """Start continuous risk monitoring for a portfolio"""
    try:
        await risk_monitoring_agent.start_risk_monitoring(portfolio_id, check_interval)
        return {
            'message': f'Risk monitoring started for portfolio {portfolio_id}',
            'portfolio_id': portfolio_id,
            'check_interval': check_interval
        }
    except Exception as e:
        logger.error(f"Error starting risk monitoring: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/streaming/status")
async def get_streaming_status():
    """Get current streaming status and active connections"""
    try:
        status = {
            'active_connections': {
                subscription: len(connections) 
                for subscription, connections in streaming_agent.active_connections.items()
            },
            'streaming_tasks': list(streaming_agent.streaming_tasks.keys()),
            'live_predictions': list(live_prediction_agent.prediction_tasks.keys()),
            'risk_monitoring': list(risk_monitoring_agent.monitoring_tasks.keys()),
            'realtime_market_data': realtime_service.get_market_status(),
            'professional_service': realtime_websocket_service.get_service_status(),
            'free_service': free_websocket_service.get_service_status()
        }
        return status
    except Exception as e:
        logger.error(f"Error getting streaming status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.websocket("/market-data")
async def free_market_websocket(websocket: WebSocket):
    """Free WebSocket endpoint for real-time market data (no API keys required)"""
    await free_websocket_service.websocket_endpoint(websocket)

@router.websocket("/free-data/{client_id}")
async def free_websocket_endpoint(websocket: WebSocket, client_id: str):
    """Free WebSocket endpoint with client ID (no API keys required)"""
    await free_websocket_service.websocket_endpoint(websocket, client_id)

@router.websocket("/professional-data/{client_id}")
async def professional_websocket_endpoint(websocket: WebSocket, client_id: str):
    """Professional WebSocket endpoint with client ID (requires API keys)"""
    await realtime_websocket_service.websocket_endpoint(websocket, client_id)