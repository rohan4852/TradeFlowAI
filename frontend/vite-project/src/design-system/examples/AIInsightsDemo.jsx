import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
    PredictionCard,
    PredictionTimeline,
    RecommendationPanel,
    ConfidenceIndicator,
    PredictionFilters,
    AnalysisProgressIndicator,
    Button,
    ThemeProvider,
    lightTheme,
    darkTheme
} from '../index';

const DemoContainer = styled.div`
  padding: ${({ theme }) => theme.spacing[6]};
  background: ${({ theme }) => theme.color.background.primary};
  min-height: 100vh;
`;

const DemoSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.color.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
`;

const DemoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: ${({ theme }) => theme.spacing[6]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
`;

const ControlPanel = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[4]};
  margin-bottom: ${({ theme }) => theme.spacing[6]};
  flex-wrap: wrap;
`;

// Mock data
const mockPredictions = [
    {
        id: 'pred-1',
        symbol: 'AAPL',
        type: 'price_target',
        title: 'AAPL Bullish Breakout',
        description: 'Strong momentum above key resistance level. Technical indicators suggest continued upward movement.',
        confidence: 87,
        targetPrice: 185.50,
        currentPrice: 178.25,
        expectedReturn: 4.1,
        timeframe: '2 weeks',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        accuracy: 82,
        reasoning: 'RSI oversold bounce, volume confirmation, support at 175'
    },
    {
        id: 'pred-2',
        symbol: 'TSLA',
        type: 'trend_reversal',
        title: 'TSLA Trend Reversal Signal',
        description: 'Bearish divergence detected. Expect pullback to support levels.',
        confidence: 73,
        targetPrice: 220.00,
        currentPrice: 245.80,
        expectedReturn: -10.5,
        timeframe: '1 week',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        accuracy: 76,
        reasoning: 'MACD divergence, overbought conditions, resistance at 250'
    },
    {
        id: 'pred-3',
        symbol: 'MSFT',
        type: 'support_resistance',
        title: 'MSFT Support Hold',
        description: 'Strong support level holding. Good risk/reward setup for long position.',
        confidence: 91,
        targetPrice: 365.00,
        currentPrice: 342.15,
        expectedReturn: 6.7,
        timeframe: '3 weeks',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'correct',
        actualReturn: 7.2,
        accuracy: 94,
        reasoning: 'Multiple support tests, institutional buying, earnings catalyst'
    }
];

const mockRecommendations = [
    {
        id: 'rec-1',
        symbol: 'AAPL',
        title: 'Buy AAPL on Dip',
        description: 'Strong support level reached after recent pullback. Good entry point with favorable risk/reward ratio.',
        confidence: 85,
        priority: 'high',
        action: 'buy',
        targetPrice: 180.50,
        potentialReturn: 5.2,
        riskLevel: 'medium',
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        type: 'price_target'
    },
    {
        id: 'rec-2',
        symbol: 'TSLA',
        title: 'Reduce TSLA Position',
        description: 'High volatility expected around earnings. Consider taking profits and reducing exposure.',
        confidence: 72,
        priority: 'medium',
        action: 'sell',
        targetPrice: 220.00,
        potentialReturn: 3.1,
        riskLevel: 'high',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        type: 'volatility'
    },
    {
        id: 'rec-3',
        symbol: 'MSFT',
        title: 'Hold MSFT Long-term',
        description: 'Stable growth trajectory with strong fundamentals. Maintain current position for long-term gains.',
        confidence: 68,
        priority: 'low',
        action: 'hold',
        targetPrice: 350.00,
        potentialReturn: 2.8,
        riskLevel: 'low',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'trend_analysis'
    }
];

export const AIInsightsDemo = () => {
    const [theme, setTheme] = useState(lightTheme);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [filters, setFilters] = useState({
        status: 'all',
        confidence: { min: 0, max: 100 },
        accuracy: { min: 0, max: 100 },
        timeframe: 'all',
        symbol: '',
        type: 'all',
        dateRange: 'all'
    });

    // Simulate analysis progress
    useEffect(() => {
        if (isAnalyzing && analysisProgress < 100) {
            const timer = setTimeout(() => {
                setAnalysisProgress(prev => Math.min(prev + Math.random() * 15, 100));
            }, 500);
            return () => clearTimeout(timer);
        } else if (analysisProgress >= 100) {
            setTimeout(() => {
                setIsAnalyzing(false);
                setAnalysisProgress(0);
            }, 1000);
        }
    }, [isAnalyzing, analysisProgress]);

    const startAnalysis = () => {
        setIsAnalyzing(true);
        setAnalysisProgress(0);
    };

    const handleAcceptPrediction = (prediction) => {
        console.log('Accepted prediction:', prediction);
        alert(`Accepted prediction for ${prediction.symbol}`);
    };

    const handleDismissPrediction = (predictionId) => {
        console.log('Dismissed prediction:', predictionId);
        alert(`Dismissed prediction ${predictionId}`);
    };

    const handleViewDetails = (item) => {
        console.log('View details:', item);
        alert(`Viewing details for ${item.symbol}`);
    };

    const handleAcceptRecommendation = (recommendation) => {
        console.log('Accepted recommendation:', recommendation);
        alert(`Accepted recommendation: ${recommendation.action.toUpperCase()} ${recommendation.symbol}`);
    };

    const handleDismissRecommendation = (recommendationId) => {
        console.log('Dismissed recommendation:', recommendationId);
        alert(`Dismissed recommendation ${recommendationId}`);
    };

    const handleRefresh = () => {
        console.log('Refreshing recommendations...');
        alert('Refreshing AI recommendations...');
    };

    return (
        <ThemeProvider theme={theme}>
            <DemoContainer>
                <ControlPanel>
                    <Button
                        variant={theme === lightTheme ? 'primary' : 'outline'}
                        onClick={() => setTheme(lightTheme)}
                    >
                        Light Theme
                    </Button>
                    <Button
                        variant={theme === darkTheme ? 'primary' : 'outline'}
                        onClick={() => setTheme(darkTheme)}
                    >
                        Dark Theme
                    </Button>
                    <Button
                        variant="outline"
                        onClick={startAnalysis}
                        disabled={isAnalyzing}
                    >
                        {isAnalyzing ? 'Analyzing...' : 'Start AI Analysis'}
                    </Button>
                </ControlPanel>

                {isAnalyzing && (
                    <DemoSection>
                        <SectionTitle>AI Analysis Progress</SectionTitle>
                        <AnalysisProgressIndicator
                            progress={analysisProgress}
                            title="Market Analysis in Progress"
                            description="Analyzing market conditions, technical indicators, and generating insights..."
                            estimatedTimeRemaining={Math.max(0, Math.floor((100 - analysisProgress) * 0.5))}
                            onCancel={() => {
                                setIsAnalyzing(false);
                                setAnalysisProgress(0);
                            }}
                        />
                    </DemoSection>
                )}

                <DemoSection>
                    <SectionTitle>Confidence Indicators</SectionTitle>
                    <DemoGrid>
                        <div>
                            <h4>Bar Indicator</h4>
                            <ConfidenceIndicator
                                confidence={85}
                                label="Prediction Confidence"
                                variant="bar"
                                size="md"
                            />
                        </div>
                        <div>
                            <h4>Segments Indicator</h4>
                            <ConfidenceIndicator
                                confidence={72}
                                label="Model Accuracy"
                                variant="segments"
                                size="md"
                            />
                        </div>
                        <div>
                            <h4>Circular Indicator</h4>
                            <ConfidenceIndicator
                                confidence={91}
                                label="Signal Strength"
                                variant="circular"
                                size="lg"
                            />
                        </div>
                    </DemoGrid>
                </DemoSection>

                <DemoSection>
                    <SectionTitle>Prediction Cards</SectionTitle>
                    <DemoGrid>
                        {mockPredictions.map(prediction => (
                            <PredictionCard
                                key={prediction.id}
                                prediction={prediction}
                                onAccept={handleAcceptPrediction}
                                onDismiss={handleDismissPrediction}
                                onViewDetails={handleViewDetails}
                            />
                        ))}
                    </DemoGrid>
                </DemoSection>

                <DemoSection>
                    <SectionTitle>Prediction Filters</SectionTitle>
                    <PredictionFilters
                        filters={filters}
                        onFiltersChange={setFilters}
                        predictions={mockPredictions}
                    />
                </DemoSection>

                <DemoSection>
                    <SectionTitle>Prediction Timeline</SectionTitle>
                    <PredictionTimeline
                        predictions={mockPredictions}
                        onPredictionClick={handleViewDetails}
                        showAccuracyStats={true}
                    />
                </DemoSection>

                <DemoSection>
                    <SectionTitle>Recommendation Panel</SectionTitle>
                    <RecommendationPanel
                        recommendations={mockRecommendations}
                        onRefresh={handleRefresh}
                        onAcceptRecommendation={handleAcceptRecommendation}
                        onDismissRecommendation={handleDismissRecommendation}
                        onViewDetails={handleViewDetails}
                        analysisProgress={isAnalyzing ? analysisProgress : null}
                    />
                </DemoSection>
            </DemoContainer>
        </ThemeProvider>
    );
};

export default AIInsightsDemo;