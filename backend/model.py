import os
from dotenv import load_dotenv
import google.generativeai as genai
from langchain_google_genai import GoogleGenerativeAIEmbeddings

load_dotenv()

# Configure Google API Key
api_key = "AIzaSyDC8ZE2pBMn0fUqBuSOVlry5Ug6zUWTUVM"
if api_key:
    genai.configure(api_key=api_key)

def get_llm():
    """Initialize and return the Google Generative AI model."""
    model_name = os.getenv("GOOGLE_MODEL", "gemini-1.5-flash")
    
    model = genai.GenerativeModel(
        model_name=model_name,
        generation_config={
            "temperature": 0.1,
            "max_output_tokens": 2048,
        }
    )
    return model

def get_embeddings():
    """Initialize and return the Google Generative AI embedding model."""
    model_name = os.getenv("GOOGLE_EMBEDDING_MODEL", "models/embedding-001")
    
    return GoogleGenerativeAIEmbeddings(
        model=model_name,
        google_api_key=api_key
    )

