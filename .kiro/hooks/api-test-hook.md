# API Test Hook

## Trigger
**Event**: File save in `backend/` directory or manual trigger
**Button Label**: "Test API Endpoints"

## Description
Automatically test all API endpoints to ensure they're working correctly, validate response formats, and check error handling.

## Execution Steps
1. Start the FastAPI server if not already running: `uvicorn backend.app.main:app --reload --port 8000`
2. Wait for server to be ready (health check)
3. Test OHLCV data endpoint with sample ticker (e.g., AAPL)
4. Test news data endpoint with sample ticker
5. Test trading recommendation endpoint
6. Test error handling with invalid inputs
7. Validate response schemas and HTTP status codes
8. Check API documentation at `/docs` endpoint
9. Generate test report with results

## Success Criteria
- All endpoints return expected HTTP status codes
- Response data matches expected schemas
- Error handling works correctly for invalid inputs
- API documentation is accessible and complete
- No server errors or crashes during testing

## Error Handling
- If server fails to start, check port availability and dependencies
- If endpoints return errors, log detailed error information
- If schema validation fails, highlight specific mismatches
- If documentation is missing, suggest updating OpenAPI specs
- Provide specific guidance for fixing each type of failure