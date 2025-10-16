from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import List, Optional, Dict, Any
import logging
from ..services.computer_vision_agent import chart_pattern_agent, multimodal_agent

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/analyze-chart")
async def analyze_chart_image(
    image: UploadFile = File(..., description="Chart image file"),
    ticker: Optional[str] = Form(None, description="Stock ticker symbol")
):
    """Analyze uploaded chart image for patterns and insights"""
    try:
        # Validate file type
        if not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image data
        image_data = await image.read()
        
        # Convert to base64 for processing
        import base64
        image_b64 = base64.b64encode(image_data).decode()
        image_data_url = f"data:{image.content_type};base64,{image_b64}"
        
        # Analyze chart
        analysis = await chart_pattern_agent.analyze_chart_image(image_data_url)
        
        # Add ticker information if provided
        if ticker:
            analysis['ticker'] = ticker.upper()
        
        return {
            'success': True,
            'analysis': analysis,
            'filename': image.filename
        }
        
    except Exception as e:
        logger.error(f"Error analyzing chart image: {e}")
        raise HTTPException(status_code=500, detail=f"Chart analysis failed: {str(e)}")

@router.post("/multimodal-analysis")
async def multimodal_analysis(
    chart_image: Optional[UploadFile] = File(None, description="Chart image file"),
    news_text: Optional[str] = Form(None, description="News article text"),
    earnings_transcript: Optional[str] = Form(None, description="Earnings call transcript"),
    social_posts: Optional[List[str]] = Form(None, description="Social media posts"),
    ticker: Optional[str] = Form(None, description="Stock ticker symbol")
):
    """Perform comprehensive multimodal analysis combining chart, text, and social data"""
    try:
        # Process chart image if provided
        chart_data = None
        if chart_image and chart_image.content_type.startswith('image/'):
            image_data = await chart_image.read()
            import base64
            image_b64 = base64.b64encode(image_data).decode()
            chart_data = f"data:{chart_image.content_type};base64,{image_b64}"
        
        # Perform multimodal analysis
        analysis = await multimodal_agent.analyze_multimodal_data(
            chart_image=chart_data,
            news_text=news_text,
            earnings_transcript=earnings_transcript,
            social_posts=social_posts
        )
        
        # Add ticker information if provided
        if ticker:
            analysis['ticker'] = ticker.upper()
        
        return {
            'success': True,
            'analysis': analysis,
            'data_sources': {
                'chart_provided': chart_data is not None,
                'news_provided': news_text is not None,
                'earnings_provided': earnings_transcript is not None,
                'social_provided': social_posts is not None and len(social_posts) > 0
            }
        }
        
    except Exception as e:
        logger.error(f"Error in multimodal analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Multimodal analysis failed: {str(e)}")

@router.get("/pattern-templates")
async def get_pattern_templates():
    """Get available chart pattern templates and descriptions"""
    try:
        templates = chart_pattern_agent.pattern_templates
        
        return {
            'success': True,
            'patterns': templates,
            'total_patterns': len(templates)
        }
        
    except Exception as e:
        logger.error(f"Error getting pattern templates: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/detect-patterns")
async def detect_specific_patterns(
    image: UploadFile = File(..., description="Chart image file"),
    pattern_types: List[str] = Form(..., description="Specific pattern types to detect"),
    confidence_threshold: float = Form(0.7, description="Minimum confidence threshold")
):
    """Detect specific chart patterns with custom confidence threshold"""
    try:
        # Validate file type
        if not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read and process image
        image_data = await image.read()
        import base64
        image_b64 = base64.b64encode(image_data).decode()
        image_data_url = f"data:{image.content_type};base64,{image_b64}"
        
        # Set custom confidence threshold
        original_threshold = chart_pattern_agent.confidence_threshold
        chart_pattern_agent.confidence_threshold = confidence_threshold
        
        try:
            # Analyze chart
            analysis = await chart_pattern_agent.analyze_chart_image(image_data_url)
            
            # Filter for requested pattern types
            if 'patterns_detected' in analysis:
                filtered_patterns = [
                    pattern for pattern in analysis['patterns_detected']
                    if pattern['type'] in pattern_types
                ]
                analysis['patterns_detected'] = filtered_patterns
            
        finally:
            # Restore original threshold
            chart_pattern_agent.confidence_threshold = original_threshold
        
        return {
            'success': True,
            'analysis': analysis,
            'requested_patterns': pattern_types,
            'confidence_threshold': confidence_threshold
        }
        
    except Exception as e:
        logger.error(f"Error detecting specific patterns: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/support-resistance")
async def analyze_support_resistance(
    image: UploadFile = File(..., description="Chart image file"),
    sensitivity: float = Form(0.02, description="Sensitivity for level clustering (0.01-0.05)")
):
    """Analyze support and resistance levels in chart image"""
    try:
        # Validate file type
        if not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Validate sensitivity
        if not 0.01 <= sensitivity <= 0.05:
            raise HTTPException(status_code=400, detail="Sensitivity must be between 0.01 and 0.05")
        
        # Read and process image
        image_data = await image.read()
        import base64
        image_b64 = base64.b64encode(image_data).decode()
        image_data_url = f"data:{image.content_type};base64,{image_b64}"
        
        # Analyze chart with focus on support/resistance
        analysis = await chart_pattern_agent.analyze_chart_image(image_data_url)
        
        # Extract only support/resistance information
        support_resistance = analysis.get('support_resistance', {})
        
        return {
            'success': True,
            'support_resistance': support_resistance,
            'sensitivity': sensitivity,
            'summary': {
                'support_levels_count': len(support_resistance.get('support_levels', [])),
                'resistance_levels_count': len(support_resistance.get('resistance_levels', [])),
                'strong_support': len([
                    level for level in support_resistance.get('support_levels', [])
                    if level.get('strength', 0) >= 3
                ]),
                'strong_resistance': len([
                    level for level in support_resistance.get('resistance_levels', [])
                    if level.get('strength', 0) >= 3
                ])
            }
        }
        
    except Exception as e:
        logger.error(f"Error analyzing support/resistance: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chart-insights")
async def generate_chart_insights(
    image: UploadFile = File(..., description="Chart image file"),
    include_trading_signals: bool = Form(True, description="Include trading signals in insights"),
    risk_tolerance: str = Form("medium", description="Risk tolerance: low, medium, high")
):
    """Generate comprehensive trading insights from chart analysis"""
    try:
        # Validate file type
        if not image.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Validate risk tolerance
        if risk_tolerance not in ['low', 'medium', 'high']:
            raise HTTPException(status_code=400, detail="Risk tolerance must be low, medium, or high")
        
        # Read and process image
        image_data = await image.read()
        import base64
        image_b64 = base64.b64encode(image_data).decode()
        image_data_url = f"data:{image.content_type};base64,{image_b64}"
        
        # Analyze chart
        analysis = await chart_pattern_agent.analyze_chart_image(image_data_url)
        
        # Generate enhanced insights based on risk tolerance
        insights = analysis.get('insights', [])
        patterns = analysis.get('patterns_detected', [])
        
        # Add risk-adjusted recommendations
        risk_adjusted_insights = []
        
        for pattern in patterns:
            if include_trading_signals:
                confidence = pattern.get('confidence', 0)
                
                # Adjust recommendations based on risk tolerance
                if risk_tolerance == 'low' and confidence < 0.8:
                    continue
                elif risk_tolerance == 'medium' and confidence < 0.6:
                    continue
                elif risk_tolerance == 'high' and confidence < 0.4:
                    continue
                
                action = "BUY" if pattern.get('bullish', False) else "SELL"
                risk_adjusted_insights.append(
                    f"{pattern['type']} pattern suggests {action} signal with {confidence:.1%} confidence"
                )
        
        return {
            'success': True,
            'original_insights': insights,
            'risk_adjusted_insights': risk_adjusted_insights,
            'trading_recommendation': {
                'overall_bias': 'BULLISH' if len([p for p in patterns if p.get('bullish', False)]) > len([p for p in patterns if not p.get('bullish', True)]) else 'BEARISH',
                'confidence_score': analysis.get('confidence_score', 0),
                'risk_tolerance': risk_tolerance,
                'patterns_count': len(patterns)
            }
        }
        
    except Exception as e:
        logger.error(f"Error generating chart insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))