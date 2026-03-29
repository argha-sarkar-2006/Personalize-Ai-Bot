# Personalised NLP Bot

A powerful, smart, and locally-hosted AI assistant that allows you to interact with your data (PDF, DOCX, and CSV) using Google Generative AI (Gemini) and LangChain. 

This application provides an intuitive dashboard to upload your documents, generate concise summaries, interact via a chatbot, extract mind maps, and compute statistics for CSV files.

---

## 🚀 Features

- **Document Processing**: Upload PDFs, Word documents (.docx), and CSV files.
- **Auto-Generated Summaries**: Instantly get comprehensive overviews of your uploaded datasets.
- **Interactive AI Chatbot**: Ask context-specific questions about your documents and get accurate answers based on the content (Retrieval-Augmented Generation).
- **Mind Map Extraction**: Visualize the hierarchical structure of your datasets with automatically generated markdown mind maps.
- **Data Statistics**: If you upload a CSV, automatically extract basic financial and numerical statistics (count, mean, standard deviation, min/max, percentiles).
- **FastAPI Backend**: Fast, asynchronous, and reliable backend.
- **Modern UI**: Clean, responsive frontend built with HTML, CSS, and Vanilla JavaScript.


## 🛠️ Technology Stack

- **Backend**: Python, FastAPI, Uvicorn
- **AI/NLP**: LangChain, Google Generative AI (Gemini Flash), Sentence-Transformers
- **Vector Database**: ChromaDB (locally persisted)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript, Marked.js (for markdown parsing)


## 📋 Prerequisites

Before running the project, ensure you have the following installed:
- Python 3.8+
- A valid Google Generative AI API Key


## ⚙️ Installation & Setup

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <your-repo-url>
   cd Personalize-Ai-Bot-main/Personalize-Ai-Bot-main
   ```

2. **Install Backend Dependencies**:
   Open a terminal in the project directory where `requirements.txt` is located and run:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `backend` directory (if not present) and configure your Google API key.
   Alternatively, you can place your `GOOGLE_API_KEY` or update the `api_key` in `backend/model.py`.
   *(Note: The current code has a hardcoded API key in `backend/model.py`. For security, it is highly recommended to use environment variables instead).*

4. **Run the Backend Server**:
   Navigate to the `backend` directory and start the FastAPI server:
   ```bash
   cd backend
   python main.py
   ```
   *The backend server will run at `http://localhost:8000`.*

5. **Run the Frontend**:
   You can run the frontend by opening the `frontend/index.html` file directly in your browser or by using a simple local server:
   ```bash
   cd ../frontend
   python -m http.server 3000
   ```
   *Then, open `http://localhost:3000` in your web browser.*


## 📂 Project Structure

```text
Personalize-Ai-Bot-main/
├── backend/
│   ├── dataset/             # Directory for uploaded files and ChromaDB vector store
│   ├── main.py              # FastAPI application entry point and endpoints
│   ├── model.py             # LLM and embeddings configuration (Google Gemini)
│   ├── retrieve_data.py     # RAG functions: summary, chat, mindmap retrieval
│   └── train_model.py       # Document loaders, text splitting, and vector storage
├── frontend/
│   ├── index.html           # Main dashboard UI
│   ├── script.js            # Frontend logic and API integration
│   └── style.css            # Styling for the application UI
├── requirements.txt         # Python dependencies
└── README.md                # Project documentation
```

## 💡 Usage

1. **Import Data**: Go to the "Import Data" tab and drag-and-drop or select your file (.pdf, .docx, .csv) to upload.
2. **Summary**: Navigate to the "Summary" tab and click "Generate" to get an overview of your text data.
3. **Chatbot**: Go to the "Chatbot" tab and ask specific questions about the content of your uploaded document.
4. **Statistics**: If you analyzed a CSV file, visit the "Statistics" tab and click "Fetch Data" to view tabular numerical insights.
5. **Mind Map**: Use the "Mind Map" tab to extract key structural concepts as a bulleted markdown list.
