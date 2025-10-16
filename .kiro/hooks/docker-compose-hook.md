# Docker Compose Hook

## Trigger
**Event**: File save in `docker-compose.yml` or manual trigger
**Button Label**: "Deploy Full Stack"

## Description
Deploy the complete AI Trading LLM system using Docker Compose, ensuring all services start correctly and can communicate with each other.

## Execution Steps
1. Validate `docker-compose.yml` configuration
2. Check that all required Dockerfiles exist
3. Build all services: `docker-compose build`
4. Start all services: `docker-compose up -d`
5. Wait for services to be healthy
6. Test inter-service communication
7. Verify frontend can access backend API
8. Check that all ports are properly exposed
9. Generate deployment status report

## Success Criteria
- All Docker images build successfully
- All services start without errors
- Health checks pass for all services
- Frontend is accessible on port 5173
- Backend API is accessible on port 8000
- Services can communicate internally
- No port conflicts or networking issues

## Error Handling
- If Docker build fails, check Dockerfile syntax and dependencies
- If services won't start, check port conflicts and resource requirements
- If networking fails, validate Docker Compose network configuration
- If health checks fail, investigate service-specific issues
- If resource limits are exceeded, suggest adjusting Docker settings
- Provide specific guidance for common Docker Compose issues