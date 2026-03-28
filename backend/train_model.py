import os
from langchain_core.prompts import PromptTemplate
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader, CSVLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma

from model import get_embeddings

VECTOR_STORE_DIR = "./dataset/vector_store"

# Define Prompts for specifically refined outputs
def get_summary_prompt() -> PromptTemplate:
    template = """You are an expert data analyst. Read the following context extracted from the user's dataset and provide a comprehensive, concise, and structured summary. 

Context:
{context}

Summary:"""
    return PromptTemplate(template=template, input_variables=["context"])

def get_chat_prompt() -> PromptTemplate:
    template = """You are an AI assistant helping a user understand their dataset. Use the provided context to answer the user's question accurately. If the answer is not in the context, state that you do not know.

Context:
{context}

Question:
{question}

Answer:"""
    return PromptTemplate(template=template, input_variables=["context", "question"])

def get_mindmap_prompt() -> PromptTemplate:
    template = """You are an expert at extracting hierarchical structures from text. Based on the following context, create a simplified mind map structure. Output the structure strictly as a valid Markdown bulleted list, where sub-topics are indented.

Context:
{context}

Mind Map (Markdown List):"""
    return PromptTemplate(template=template, input_variables=["context"])

def process_document(file_path: str, file_ext: str):
    """
    Load document, split into chunks, and store in Chroma Vector Store.
    """
    loaders = {
        ".pdf": PyPDFLoader,
        ".docx": Docx2txtLoader,
        ".csv": CSVLoader
    }
    
    loader_cls = loaders.get(file_ext.lower())
    if not loader_cls:
        raise ValueError(f"Unsupported file extension: {file_ext}")

    loader = loader_cls(file_path)
    documents = loader.load()

    # Split text
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    chunks = text_splitter.split_documents(documents)

    # Embed and store
    embeddings = get_embeddings()
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=VECTOR_STORE_DIR
    )
    return True
