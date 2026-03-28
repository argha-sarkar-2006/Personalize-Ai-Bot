from langchain_community.vectorstores import Chroma
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

from model import get_llm, get_embeddings
from train_model import VECTOR_STORE_DIR, get_summary_prompt, get_chat_prompt, get_mindmap_prompt

def get_retriever():
    """Retrieve the Chroma vector store as a retriever."""
    embeddings = get_embeddings()
    vectorstore = Chroma(persist_directory=VECTOR_STORE_DIR, embedding_function=embeddings)
    return vectorstore.as_retriever(search_kwargs={"k": 5})

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

def generate_summary() -> str:
    """Generate summary from the stored dataset."""
    llm = get_llm()
    retriever = get_retriever()
    prompt = get_summary_prompt()
    
    # Retrieve top chunks (for a summary we might want more docs, but we start with top K)
    # A generic approach is querying for a high-level summary concept
    docs = retriever.invoke("dataset overview summary")
    context_text = format_docs(docs)
    
    chain = prompt | llm | StrOutputParser()
    return chain.invoke({"context": context_text})

def answer_question(question: str) -> str:
    """Answer a user question based on the dataset."""
    llm = get_llm()
    retriever = get_retriever()
    prompt = get_chat_prompt()
    
    chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )
    return chain.invoke(question)

def extract_mindmap() -> str:
    """Extract a markdown list representation of the dataset for a mind map."""
    llm = get_llm()
    retriever = get_retriever()
    prompt = get_mindmap_prompt()
    
    docs = retriever.invoke("key topics, components, and structure")
    context_text = format_docs(docs)
    
    chain = prompt | llm | StrOutputParser()
    return chain.invoke({"context": context_text})
