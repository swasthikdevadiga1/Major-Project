from pathlib import Path

from langchain.docstore.document import Document as LCDocument
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_openai import ChatOpenAI


class RAGService:
    def __init__(self, app_config):
        self.vector_store_path = Path(app_config["VECTOR_STORE_PATH"])
        self.vector_store_path.parent.mkdir(parents=True, exist_ok=True)
        self.embedding_model = app_config["EMBEDDING_MODEL"]
        self.chat_model = app_config["CHAT_MODEL"]
        self.api_key = app_config["OPENAI_API_KEY"]

    def _embeddings(self):
        return HuggingFaceEmbeddings(
            model_name=self.embedding_model,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )

    def _llm(self):
        if not self.api_key:
            raise RuntimeError("OPENAI_API_KEY is not configured.")
        return ChatOpenAI(
            model=self.chat_model,
            api_key=self.api_key,
            temperature=0.2,
            timeout=60,
            max_retries=2,
        )

    def build_or_update_index(self, document_id: int, filename: str, chunks):
        docs = [
            LCDocument(
                page_content=chunk["content"],
                metadata={"page": chunk["page"], "document_id": document_id, "filename": filename},
            )
            for chunk in chunks
        ]
        embeddings = self._embeddings()
        if self.vector_store_path.exists():
            vector_store = FAISS.load_local(
                str(self.vector_store_path),
                embeddings,
                allow_dangerous_deserialization=True,
            )
            vector_store.add_documents(docs)
        else:
            vector_store = FAISS.from_documents(docs, embeddings)
        vector_store.save_local(str(self.vector_store_path))

    def retrieve(self, query: str, top_k: int = 4):
        if not self.vector_store_path.exists():
            return []
        embeddings = self._embeddings()
        vector_store = FAISS.load_local(
            str(self.vector_store_path),
            embeddings,
            allow_dangerous_deserialization=True,
        )
        return vector_store.similarity_search(query, k=top_k)

    def answer_with_context(self, query: str, retrieved_docs):
        if not retrieved_docs:
            return {
                "answer": "I could not find relevant information in the college knowledge base yet.",
                "sources": [],
            }

        llm = self._llm()
        context = "\n\n".join(
            [
                f"Source: {doc.metadata.get('filename')} | Page: {doc.metadata.get('page')}\n{doc.page_content}"
                for doc in retrieved_docs
            ]
        )
        prompt = f"""
You are a college information assistant. Answer the user's question using only the context below.
If the answer is uncertain, say so clearly and avoid making up details.

Context:
{context}

Question:
{query}
"""
        response = llm.invoke(prompt)
        return {
            "answer": response.content,
            "sources": [
                {
                    "filename": doc.metadata.get("filename"),
                    "page": doc.metadata.get("page"),
                }
                for doc in retrieved_docs
            ],
        }
