from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends, HTTPException
from typing import List, Dict, Any
import json
import logging
from ..services.streaming_engine import streaming_agent, live_prediction_agent, risk_monitoring_agent
from ..services.security_agent import security_agent
from ..services.realtime_market_data import realtime_service, AssetType

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
            'realtime_market_data': realtime_service.get_market_status()
        }
        return status
    except Exception as e:
        logger.error(f"Error getting streaming status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.websocket("/market-data")
async def realtime_market_websocket(websocket: WebSocket):
    """WebSocket endpoint for real-time market data"""
    await websocket.accept()
    
    active_subscriptions = {}
    
    try:
        while True:
            try:
                # Receive message from client
                data = await websocket.receive_text()
                message = json.loads(data)
                
                action = message.get('action')
                symbol = message.get('symbol')
                asset_type = message.get('asset_type', 'stock')
                
                if action == 'subscribe' and symbol:
                    # Subscribe to real-time updates for this symbol
                    def send_update(quote):
                        try:
                            update_data = {
                                'type': 'quote_update',
                                'symbol': quote.symbol,
                                'asset_type': quote.asset_type,
                                'price': quote.price,
                                'change': quote.change,
                                'change_percent': quote.change_percent,
                                'volume': quote.volume,
                                'bid': quote.bid,
                                'ask': quote.ask,
                                'high_24h': quote.high_24h,
                                'low_24h': quote.low_24h,
                                'timestamp': quote.timestamp.isoformat(),
                                'provider': quote.provider
                            }
                            
                            # Send via WebSocket (non-blocking)
                            import asyncio
                            asyncio.create_task(websocket.send_text(json.dumps(update_data)))
                        except Exception as e:
                            logger.error(f"Error sending WebSocket update: {e}")
                    
                    # Subscribe to the real-time service
                    try:
                        asset_type_enum = AssetType(asset_type)
                        realtime_service.subscribe(symbol, asset_type_enum, send_update)
                        active_subscriptions[symbol] = (asset_type_enum, send_update)
                        
                        # Send confirmation
                        await websocket.send_text(json.dumps({
                            'type': 'subscription_confirmed',
                            'symbol': symbol,
                            'asset_type': asset_type
                        }))
                        
                        logger.info(f"WebSocket subscribed to {symbol} ({asset_type})")
                        
                    except ValueError:
                        await websocket.send_text(json.dumps({
                            'type': 'error',
                            'message': f'Invalid asset type: {asset_type}'
                        }))
                
                elif action == 'unsubscribe' and symbol:
                    # Unsubscribe from updates
                    if symbol in active_subscriptions:
                        asset_type_enum, callback = active_subscriptions[symbol]
                        realtime_service.unsubscribe(symbol, asset_type_enum, callback)
                        del active_subscriptions[symbol]
                        
                        await websocket.send_text(json.dumps({
                            'type': 'unsubscription_confirmed',
                            'symbol': symbol
                        }))
                        
                        logger.info(f"WebSocket unsubscribed from {symbol}")
                
                elif action == 'get_quote' and symbol:
                    # Get current quote
                    try:
                        asset_type_enum = AssetType(asset_type)
                        quote = await realtime_service.get_quote(symbol, asset_type_enum)
                        
                        if quote:
                            quote_data = {
                                'type': 'quote_response',
                                'symbol': quote.symbol,
                                'asset_type': quote.asset_type,
                                'price': quote.price,
                                'change': quote.change,
                                'change_percent': quote.change_percent,
                                'volume': quote.volume,
                                'bid': quote.bid,
                                'ask': quote.ask,
                                'high_24h': quote.high_24h,
                                'low_24h': quote.low_24h,
                                'timestamp': quote.timestamp.isoformat(),
                                'provider': quote.provider
                            }
                            await websocket.send_text(json.dumps(quote_data))
                        else:
                            await websocket.send_text(json.dumps({
                                'type': 'error',
                                'message': f'No quote available for {symbol}'
                            }))
                    except Exception as e:
                        await websocket.send_text(json.dumps({
                            'type': 'error',
                            'message': f'Error fetching quote: {str(e)}'
                        }))
                
            except WebSocketDisconnect:
                break
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({
                    'type': 'error',
                    'message': 'Invalid JSON format'
                }))
            except Exception as e:
                logger.error(f"WebSocket message processing error: {e}")
                await websocket.send_text(json.dumps({
                    'type': 'error',
                    'message': 'Internal server error'
                }))
                
    except WebSocketDisconnect:
        logger.info("Real-time market data WebSocket disconnected")
    except Exception as e:
        logger.error(f"Real-time WebSocket error: {e}")
    finally:
        # Clean up subscriptions
        for symbol, (asset_type_enum, callback) in active_subscriptions.items():
            try:
                realtime_service.unsubscribe(symbol, asset_type_enum, callback)
            except Exception as e:
                logger.error(f"Error unsubscribing from {symbol}: {e}")