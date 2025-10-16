# Training Pipeline Hook

## Trigger
**Event**: File save in `training/` directory or manual trigger
**Button Label**: "Run Training Pipeline"

## Description
Execute the complete ML training pipeline from data preparation through model fine-tuning, ensuring proper dataset formatting and efficient QLoRA training.

## Execution Steps
1. Check for available training data in `data/examples/`
2. Execute `python training/prepare_jsonl.py --output training/train.jsonl` to prepare dataset
3. Validate JSONL format and training examples
4. Check GPU availability and memory requirements
5. Execute `accelerate launch training/qlora_train.py --dataset training/train.jsonl --model mistralai/Mistral-7B-Instruct-v0.1 --out models/stock-lora`
6. Monitor training progress and log metrics
7. Validate saved model adapters
8. Update model configuration for inference

## Success Criteria
- Training dataset is properly formatted in JSONL
- Training completes without out-of-memory errors
- Model adapters are saved to `models/stock-lora`
- Training logs show decreasing loss
- Model can be loaded for inference

## Error Handling
- If insufficient data, suggest collecting more examples
- If GPU memory issues, recommend reducing batch size or using CPU
- If model loading fails, check HuggingFace authentication
- If training crashes, preserve logs and suggest debugging steps
- Provide clear guidance on hardware requirements