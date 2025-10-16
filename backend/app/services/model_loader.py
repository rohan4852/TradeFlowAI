import os, asyncio
from typing import Dict, Any

# AI API Keys - prioritize Gemini over OpenAI
GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY')  # for Gemini API
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')  # for GPT-5 via API (fallback)
LOCAL_MODEL_PATH = os.environ.get('LOCAL_MODEL_PATH')  # path to local HF model + adapter

_model_mode = None
_local_model = None  # placeholder for HF model object

async def initialize_model():
    global _model_mode, _local_model
    if GOOGLE_API_KEY:
        _model_mode = 'gemini_api'
        print('Model mode: Gemini via Google AI API')
    elif OPENAI_API_KEY:
        _model_mode = 'gpt5_api'
        print('Model mode: GPT-5 via API (fallback)')
    elif LOCAL_MODEL_PATH:
        _model_mode = 'local'
        # load local transformers model if available (deferred import)
        try:
            from transformers import AutoTokenizer, AutoModelForCausalLM
            import torch, bitsandbytes as bnb
            _local_model = {
                'tokenizer': AutoTokenizer.from_pretrained(LOCAL_MODEL_PATH),
                'model': AutoModelForCausalLM.from_pretrained(LOCAL_MODEL_PATH, device_map='auto', load_in_8bit=True)
            }
            print('Loaded local model from', LOCAL_MODEL_PATH)
        except Exception as e:
            print('Failed to load local model:', e)
            _model_mode = None
    else:
        _model_mode = None
        print('No model configured. Set OPENAI_API_KEY or LOCAL_MODEL_PATH')


async def get_prediction(req: Dict[str, Any]):
    """Main inference function. Returns structured JSON:"""
    if _model_mode == 'gemini_api':
        return await _predict_gemini(req)
    elif _model_mode == 'gpt5_api':
        return await _predict_gpt5(req)
    elif _model_mode == 'local' and _local_model:
        return _predict_local(req)
    else:
        raise RuntimeError('No model configured. Set GOOGLE_API_KEY, OPENAI_API_KEY, or LOCAL_MODEL_PATH')


async def _predict_gemini(req: Dict[str, Any]):
    """Call Gemini API. You must implement the API call using Google AI SDK."""
    # Example structured prompt (you should refine prompts heavily)
    prompt = build_prompt(req)
    # IMPORTANT: user must set GOOGLE_API_KEY; actual HTTP call omitted here.
    # Below is a pseudo-response structure to allow the demo to function without keys.
    return {
        'signal': 'BUY',
        'confidence': 0.72,
        'target': None,
        'rationale': 'Gemini AI would analyze price window + news + indicators and return recommendation.'
    }

async def _predict_gpt5(req: Dict[str, Any]):
    """Call GPT-5 (fallback). You must implement the API call using provider SDK."""
    # Example structured prompt (you should refine prompts heavily)
    prompt = build_prompt(req)
    # IMPORTANT: user must set OPENAI_API_KEY; actual HTTP call omitted here.
    # Below is a pseudo-response structure to allow the demo to function without keys.
    return {
        'signal': 'HOLD',
        'confidence': 0.45,
        'target': None,
        'rationale': 'GPT-5 API would analyze price window + news + indicators and return recommendation.'
    }

def _predict_local(req: Dict[str, Any]):
    tokenizer = _local_model['tokenizer']
    model = _local_model['model']
    prompt = build_prompt(req)
    inputs = tokenizer(prompt, return_tensors='pt').to(model.device)
    with torch.no_grad():
        out = model.generate(**inputs, max_new_tokens=200)
    text = tokenizer.decode(out[0], skip_special_tokens=True)
    # simple parsing placeholder
    return {'signal':'HOLD','confidence':0.3,'target':None,'rationale':text}


def build_prompt(req: Dict[str, Any]):
    # Minimal prompt. Replace with robust template (include indicators, news, etc.)
    return f"""You are a financial assistant. Given the stock ticker {req.get('ticker')} and a lookback of {req.get('lookback')} candles, provide a concise recommendation (BUY/HOLD/SELL), a numeric target if available, a confidence score (0-1), and a short rationale."""
