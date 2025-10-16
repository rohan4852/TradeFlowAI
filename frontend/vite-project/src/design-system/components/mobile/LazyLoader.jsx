import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { createIntersectionObserver } from '../../utils/mobilePerformance';

const LoaderContainer = styled.div`
  min-height: ${props => props.minHeight || '200px'};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.neutral[50]};
  border-radius: 8px;
`;

const SkeletonLoader = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    ${props => props.theme.colors.neutral[200]} 25%,
    ${props => props.theme.colors.neutral[100]} 50%,
    ${props => props.theme.colors.neutral[200]} 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;
  
  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

const ErrorContainer = styled.div`
  padding: 20px;
  text-align: center;
  color: ${props => props.theme.colors.error[600]};
  background: ${props => props.theme.colors.error[50]};
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.error[200]};
`;

const RetryButton = styled.button`
  margin-top: 12px;
  padding: 8px 16px;
  background: ${props => props.theme.colors.error[600]};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: ${props => props.theme.colors.error[700]};
  }
`;

export const LazyLoader = ({
    children,
    fallback,
    errorFallback,
    minHeight = '200px',
    rootMargin = '50px',
    threshold = 0.1,
    onLoad,
    onError
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const observer = createIntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !isVisible) {
                        setIsVisible(true);
                        setIsLoading(true);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { rootMargin, threshold }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [rootMargin, threshold, isVisible]);

    useEffect(() => {
        if (isVisible && isLoading) {
            // Simulate loading delay for demonstration
            const timer = setTimeout(() => {
                try {
                    setIsLoading(false);
                    onLoad?.();
                } catch (err) {
                    setError(err);
                    setIsLoading(false);
                    onError?.(err);
                }
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [isVisible, isLoading, onLoad, onError]);

    const handleRetry = () => {
        setError(null);
        setIsLoading(true);
    };

    if (error) {
        return (
            <LoaderContainer ref={containerRef} minHeight={minHeight}>
                {errorFallback || (
                    <ErrorContainer>
                        <div>Failed to load content</div>
                        <RetryButton onClick={handleRetry}>
                            Retry
                        </RetryButton>
                    </ErrorContainer>
                )}
            </LoaderContainer>
        );
    }

    if (!isVisible || isLoading) {
        return (
            <LoaderContainer ref={containerRef} minHeight={minHeight}>
                {fallback || <SkeletonLoader />}
            </LoaderContainer>
        );
    }

    return (
        <div ref={containerRef}>
            {children}
        </div>
    );
};