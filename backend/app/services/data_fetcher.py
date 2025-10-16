def fetch_ohlcv(ticker: str, period='6mo', interval='1d'):
    # Lazy import heavy libs to avoid startup overhead when module is imported
    import yfinance as yf
    import pandas as pd

    # returns pandas DataFrame with OHLCV
    df = yf.download(ticker, period=period, interval=interval, progress=False)
    return df.reset_index().to_dict(orient='records')
