# very small sentiment helper using vader for demo
from nltk.sentiment.vader import SentimentIntensityAnalyzer

_analyzer = None
def init():
    global _analyzer
    if _analyzer is None:
        _analyzer = SentimentIntensityAnalyzer()

def analyze(text: str):
    init()
    s = _analyzer.polarity_scores(text)
    return s
