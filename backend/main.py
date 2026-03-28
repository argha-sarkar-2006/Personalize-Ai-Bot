import os
import shutil
import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from train_model import process_document
from retrieve_data import generate_summary, answer_question, extract_mindmap

app = FastAPI(title="Personalised NLP Model API")

# Allow all CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATASET_DIR = "./dataset/files"
os.makedirs(DATASET_DIR, exist_ok=True)

# Keep track of the last uploaded CSV for statistics mapping
LAST_CSV_PATH = None

class ChatRequest(BaseModel):
    question: str

@app.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    global LAST_CSV_PATH
    try:
        file_path = os.path.join(DATASET_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in [".pdf", ".docx", ".csv"]:
            raise HTTPException(status_code=400, detail="Unsupported file format.")
            
        if ext == ".csv":
            LAST_CSV_PATH = file_path

        # Process and store into Chroma Vector DB
        process_document(file_path, ext)
        
        return {"status": "success", "message": f"{file.filename} processed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/summary")
async def get_summary():
    try:
        summary = generate_summary()
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat_bot(request: ChatRequest):
    try:
        answer = answer_question(request.question)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/statistics")
async def get_statistics():
    global LAST_CSV_PATH
    if not LAST_CSV_PATH or not os.path.exists(LAST_CSV_PATH):
        return {"error": "No CSV file uploaded yet."}
    try:
        df = pd.read_csv(LAST_CSV_PATH)
        # Select numeric columns
        numeric_cols = df.select_dtypes(include="number")
        if numeric_cols.empty:
            return {"error": "No financial/numerical data found in the CSV."}
        
        # Calculate some basic financial/numerical stats
        stats = {
            "columns": list(numeric_cols.columns),
            "summary": numeric_cols.describe().to_dict(),
            "sum": numeric_cols.sum().to_dict()
        }
        return {"statistics": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/mindmap")
async def get_mindmap():
    try:
        mindmap_md = extract_mindmap()
        return {"mindmap": mindmap_md}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Change port if needed
    uvicorn.run(app, host="0.0.0.0", port=8000)
