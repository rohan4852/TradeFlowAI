# TODO: Remove Dummy Data and Enable Live Charts

## Tasks
- [x] Remove/disable mock data in frontend/vite-project/src/test-utils/test-data.js
- [x] Update frontend/vite-project/src/components/Chart.jsx to remove hardcoded dummy data
- [x] Update frontend/vite-project/src/components/ChartComponent.jsx to remove mock SVG chart
- [x] Verify RealTimeChart.jsx works with backend API for live data
- [x] Add INR currency pairs to backend/app/routes/market_data.py
- [x] Ensure predictions work in AI insights panel
- [x] Test the app to confirm no dummy data is displayed and live charts work

## Status
- Backend has real-time market data service using yfinance
- API endpoints exist for historical and real-time data
- Frontend components attempt to fetch real data but may need fixes
