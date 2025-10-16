# Technology Stack

## Backend
- **Framework**: FastAPI with Uvicorn ASGI server
- **ML/AI**: Transformers, PyTorch, PEFT (QLoRA), bitsandbytes
- **Data**: yfinance for stock data, pandas for processing
- **Language**: Python 3.10+

## Frontend
- **Framework**: React with Vite build system
- **Charts**: Candlestick chart visualization
- **Port**: 5173 (development)

## Training Infrastructure
- **Base**: PyTorch with CUDA support (pytorch/pytorch:2.1-cuda11.8-cudnn8-runtime)
- **Techniques**: QLoRA fine-tuning with PEFT adapters
- **Acceleration**: Hugging Face Accelerate library
- **Data Format**: JSONL for training datasets

## Containerization
- **Orchestration**: Docker Compose
- **Backend**: Python 3.10-slim base image
- **Training**: PyTorch CUDA runtime image

## Common Commands

### Local Development
```bash
# Backend
python -m pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload --port 8000

# Frontend
cd frontend/vite-project
npm install
npm run dev
```

### Docker
```bash
# Full stack
docker-compose up

# Individual services
docker-compose up backend
docker-compose up frontend
```

### Training
```bash
# Generate sample dataset
python training/prepare_jsonl.py --output training/train.jsonl

# Run training
accelerate launch training/qlora_train.py --dataset training/train.jsonl --model mistralai/Mistral-7B-Instruct-v0.1 --out models/stock-lora
```

## Environment Variables
- `OPENAI_API_KEY`: For GPT-5 API access
- `LOCAL_MODEL_PATH`: Path to local HuggingFace model with adapters