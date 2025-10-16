import React, { useState, useEffect, useRef } from 'react';

const AssetType = {
    STOCK: 'stock',
    FOREX: 'forex',
    CRYPTO: 'crypto',
    COMMODITY: 'commodity',
    INDEX: 'index',
    IPO: 'ipo'
};

const AssetSelector = ({ onAssetSelect, currentSymbol, currentAssetType }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTab, setSelectedTab] = useState(AssetType.STOCK);
    const [assets, setAssets] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef();

    // Popular assets by category
    const popularAssets = {
        [AssetType.STOCK]: [
            { symbol: 'AAPL', name: 'Apple Inc.', price: 175.43, change: 2.1 },
            { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2847.63, change: -1.2 },
            { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.85, change: 0.8 },
            { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: -3.2 },
            { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.28, change: 4.5 },
            { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 3127.45, change: 1.7 },
            { symbol: 'META', name: 'Meta Platforms Inc.', price: 487.23, change: -0.5 },
            { symbol: 'NFLX', name: 'Netflix Inc.', price: 445.87, change: 2.3 }
        ],
        [AssetType.FOREX]: [
            { symbol: 'EURUSD=X', name: 'EUR/USD', price: 1.0875, change: 0.12 },
            { symbol: 'GBPUSD=X', name: 'GBP/USD', price: 1.2634, change: -0.08 },
            { symbol: 'USDJPY=X', name: 'USD/JPY', price: 149.85, change: 0.25 },
            { symbol: 'USDCHF=X', name: 'USD/CHF', price: 0.8976, change: -0.15 },
            { symbol: 'AUDUSD=X', name: 'AUD/USD', price: 0.6543, change: 0.18 },
            { symbol: 'USDCAD=X', name: 'USD/CAD', price: 1.3687, change: 0.05 }
        ],
        [AssetType.CRYPTO]: [
            { symbol: 'BTC-USD', name: 'Bitcoin', price: 67845.32, change: 3.2 },
            { symbol: 'ETH-USD', name: 'Ethereum', price: 3456.78, change: 2.8 },
            { symbol: 'ADA-USD', name: 'Cardano', price: 0.4567, change: -1.2 },
            { symbol: 'SOL-USD', name: 'Solana', price: 98.45, change: 5.7 },
            { symbol: 'DOT-USD', name: 'Polkadot', price: 6.78, change: -2.1 },
            { symbol: 'MATIC-USD', name: 'Polygon', price: 0.8934, change: 1.8 }
        ],
        [AssetType.COMMODITY]: [
            { symbol: 'GC=F', name: 'Gold', price: 2034.50, change: 0.8 },
            { symbol: 'CL=F', name: 'Crude Oil', price: 87.65, change: -1.2 },
            { symbol: 'SI=F', name: 'Silver', price: 24.87, change: 1.5 },
            { symbol: 'NG=F', name: 'Natural Gas', price: 3.45, change: -2.3 },
            { symbol: 'HG=F', name: 'Copper', price: 3.87, change: 0.9 }
        ],
        [AssetType.INDEX]: [
            { symbol: '^GSPC', name: 'S&P 500', price: 4567.89, change: 0.5 },
            { symbol: '^DJI', name: 'Dow Jones', price: 35678.90, change: 0.3 },
            { symbol: '^IXIC', name: 'NASDAQ', price: 14567.34, change: 0.8 },
            { symbol: '^RUT', name: 'Russell 2000', price: 1987.65, change: -0.2 },
            { symbol: '^VIX', name: 'VIX', price: 18.45, change: -5.2 }
        ]
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter assets based on search term
    const getFilteredAssets = () => {
        const assetList = popularAssets[selectedTab] || [];
        if (!searchTerm) return assetList;

        return assetList.filter(asset =>
            asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const handleAssetSelect = (asset) => {
        onAssetSelect(asset.symbol, selectedTab);
        setIsOpen(false);
        setSearchTerm('');
    };

    const getAssetTypeIcon = (type) => {
        switch (type) {
            case AssetType.STOCK: return '📈';
            case AssetType.FOREX: return '💱';
            case AssetType.CRYPTO: return '₿';
            case AssetType.COMMODITY: return '🥇';
            case AssetType.INDEX: return '📊';
            case AssetType.IPO: return '🚀';
            default: return '📈';
        }
    };

    const formatPrice = (price, assetType) => {
        switch (assetType) {
            case AssetType.FOREX:
                return price.toFixed(4);
            case AssetType.CRYPTO:
                return price < 1 ? price.toFixed(6) : price.toLocaleString();
            default:
                return price.toLocaleString();
        }
    };

    return (
        <div className="asset-selector" ref={dropdownRef}>
            <div className="selector-trigger" onClick={() => setIsOpen(!isOpen)}>
                <div className="current-asset">
                    <span className="asset-icon">{getAssetTypeIcon(currentAssetType)}</span>
                    <span className="asset-symbol">{currentSymbol}</span>
                    <span className="asset-type">{currentAssetType}</span>
                </div>
                <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
            </div>

            {isOpen && (
                <div className="selector-dropdown">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search assets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                            autoFocus
                        />
                    </div>

                    <div className="asset-tabs">
                        {Object.values(AssetType).map(type => (
                            <button
                                key={type}
                                className={`tab-button ${selectedTab === type ? 'active' : ''}`}
                                onClick={() => setSelectedTab(type)}
                            >
                                {getAssetTypeIcon(type)} {type.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <div className="assets-list">
                        {getFilteredAssets().map(asset => (
                            <div
                                key={asset.symbol}
                                className="asset-item"
                                onClick={() => handleAssetSelect(asset)}
                            >
                                <div className="asset-info">
                                    <div className="asset-symbol-name">
                                        <span className="symbol">{asset.symbol}</span>
                                        <span className="name">{asset.name}</span>
                                    </div>
                                    <div className="asset-price">
                                        <span className="price">${formatPrice(asset.price, selectedTab)}</span>
                                        <span className={`change ${asset.change >= 0 ? 'positive' : 'negative'}`}>
                                            {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="quick-actions">
                        <button className="quick-action-btn">
                            📋 Watchlist
                        </button>
                        <button className="quick-action-btn">
                            ⭐ Favorites
                        </button>
                        <button className="quick-action-btn">
                            🔥 Trending
                        </button>
                    </div>
                </div>
            )}

            <style jsx>{`
                .asset-selector {
                    position: relative;
                    min-width: 200px;
                }

                .selector-trigger {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0.75rem 1rem;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .selector-trigger:hover {
                    background: rgba(255, 255, 255, 0.15);
                    border-color: #00d4ff;
                }

                .current-asset {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .asset-icon {
                    font-size: 1.2rem;
                }

                .asset-symbol {
                    font-weight: 600;
                    color: #ffffff;
                }

                .asset-type {
                    font-size: 0.75rem;
                    color: rgba(255, 255, 255, 0.7);
                    text-transform: uppercase;
                }

                .dropdown-arrow {
                    transition: transform 0.2s ease;
                    color: rgba(255, 255, 255, 0.7);
                }

                .dropdown-arrow.open {
                    transform: rotate(180deg);
                }

                .selector-dropdown {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: rgba(15, 15, 35, 0.95);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 0.5rem;
                    backdrop-filter: blur(10px);
                    z-index: 1000;
                    max-height: 500px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .search-container {
                    padding: 1rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .search-input {
                    width: 100%;
                    padding: 0.5rem;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 0.25rem;
                    color: #ffffff;
                    font-size: 0.9rem;
                }

                .search-input::placeholder {
                    color: rgba(255, 255, 255, 0.5);
                }

                .search-input:focus {
                    outline: none;
                    border-color: #00d4ff;
                    box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
                }

                .asset-tabs {
                    display: flex;
                    padding: 0.5rem;
                    gap: 0.25rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    overflow-x: auto;
                }

                .tab-button {
                    padding: 0.5rem 0.75rem;
                    background: transparent;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 0.25rem;
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 0.75rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                }

                .tab-button:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #ffffff;
                }

                .tab-button.active {
                    background: rgba(0, 212, 255, 0.2);
                    border-color: #00d4ff;
                    color: #00d4ff;
                }

                .assets-list {
                    flex: 1;
                    overflow-y: auto;
                    max-height: 300px;
                }

                .asset-item {
                    padding: 0.75rem 1rem;
                    cursor: pointer;
                    transition: background 0.2s ease;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .asset-item:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .asset-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .asset-symbol-name {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .symbol {
                    font-weight: 600;
                    color: #ffffff;
                    font-size: 0.9rem;
                }

                .name {
                    font-size: 0.75rem;
                    color: rgba(255, 255, 255, 0.7);
                }

                .asset-price {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 0.25rem;
                }

                .price {
                    font-weight: 500;
                    color: #ffffff;
                    font-size: 0.9rem;
                }

                .change {
                    font-size: 0.75rem;
                    font-weight: 500;
                }

                .change.positive {
                    color: #4ade80;
                }

                .change.negative {
                    color: #f87171;
                }

                .quick-actions {
                    display: flex;
                    padding: 0.5rem;
                    gap: 0.5rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }

                .quick-action-btn {
                    flex: 1;
                    padding: 0.5rem;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 0.25rem;
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 0.75rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .quick-action-btn:hover {
                    background: rgba(255, 255, 255, 0.15);
                    color: #ffffff;
                }
            `}</style>
        </div>
    );
};

export default AssetSelector;