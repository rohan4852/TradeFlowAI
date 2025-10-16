# Project Structure

## Root Level
- `docker-compose.yml`: Multi-service orchestration
- `README.md`: Project documentation and quickstart
- `LICENSE`: Project licensing

## Backend (`/backend`)
- **Purpose**: FastAPI server providing trading prediction API
- **Structure**:
  - `app/`: Main application code (closed folder - contains FastAPI routes, models, business logic)
  - `Dockerfile`: Python 3.10-slim container definition
  - `requirements.txt`: Python dependencies (FastAPI, transformers, torch, etc.)
- **Port**: 8000

## Frontend (`/frontend`)
- **Purpose**: React web interface with trading charts
- **Structure**:
  - `vite-project/`: Vite-based React application (closed folder)
- **Port**: 5173 (development)

## Data (`/data`)
- **Purpose**: Data collection and processing utilities
- **Structure**:
  - `collect/`: Data collection scripts (closed folder)
  - `services_stub.py`: Utility functions for JSON data handling
- **Pattern**: Modular data services with JSON persistence

## Training (`/training`)
- **Purpose**: ML model training and fine-tuning
- **Structure**:
  - `Dockerfile`: PyTorch CUDA container for GPU training
  - `prepare_jsonl.py`: Dataset preparation script (converts data to JSONL format)
  - `qlora_train.py`: QLoRA fine-tuning implementation
  - `requirements.txt`: ML-specific dependencies (transformers, PEFT, accelerate)
- **Output**: Trained adapters saved to `models/` directory

## Configuration (`/.kiro`)
- **Purpose**: Kiro AI assistant configuration and steering rules
- **Structure**:
  - `steering/`: Markdown files defining project conventions and guidelines

## Architectural Patterns
- **Microservices**: Separate containers for backend, frontend, and training
- **API-First**: RESTful backend with clear separation from frontend
- **Adapter Pattern**: PEFT/QLoRA for efficient model fine-tuning
- **Data Pipeline**: Collect → Process → Train → Serve workflow
- **Environment-Based Config**: API keys and model paths via environment variables