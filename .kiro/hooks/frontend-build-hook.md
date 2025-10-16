# Frontend Build Hook

## Trigger
**Event**: File save in `frontend/` directory or manual trigger
**Button Label**: "Build & Test Frontend"

## Description
Automatically build the React frontend, run tests, and ensure the development server is working correctly with proper API integration.

## Execution Steps
1. Navigate to `frontend/vite-project` directory
2. Install dependencies: `npm install`
3. Run linting and type checking: `npm run lint` (if configured)
4. Build the project: `npm run build`
5. Start development server: `npm run dev`
6. Test API connectivity from frontend
7. Validate that charts and components render correctly
8. Check for console errors or warnings
9. Generate build report with bundle size and performance metrics

## Success Criteria
- Dependencies install without conflicts
- Build completes without errors or warnings
- Development server starts on port 5173
- Frontend can connect to backend API
- Charts render with sample data
- No console errors in browser
- Build artifacts are properly generated

## Error Handling
- If npm install fails, suggest clearing node_modules and package-lock.json
- If build fails, highlight specific compilation errors
- If server won't start, check port availability
- If API connection fails, verify backend is running
- If charts don't render, check data format and chart library setup
- Provide specific guidance for common React/Vite issues