import re
from pathlib import Path
from uuid import uuid4

from PyPDF2 import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter

from database.extensions import db
from database.models import Document


class DocumentService:
    def __init__(self, app_config):
        self.upload_folder = Path(app_config["UPLOAD_FOLDER"])
        self.allowed_extensions = app_config["ALLOWED_EXTENSIONS"]
        self.upload_folder.mkdir(parents=True, exist_ok=True)

    def allowed_file(self, filename: str) -> bool:
        return "." in filename and filename.rsplit(".", 1)[1].lower() in self.allowed_extensions

    def save_upload(self, file_storage, uploaded_by=None) -> Document:
        if not file_storage or not self.allowed_file(file_storage.filename):
            raise ValueError("Only PDF documents are supported.")

        suffix = Path(file_storage.filename).suffix
        safe_name = f"{uuid4().hex}{suffix}"
        target_path = self.upload_folder / safe_name
        file_storage.save(target_path)

        document = Document(
            filename=file_storage.filename,
            stored_path=str(target_path),
            status="uploaded",
            uploaded_by=uploaded_by,
        )
        db.session.add(document)
        db.session.commit()
        return document

    @staticmethod
    def update_status(document_id: int, status: str, pages=None, chunks=None):
        document = Document.query.get(document_id)
        if not document:
            return
        document.status = status
        if pages is not None:
            document.pages = pages
        if chunks is not None:
            document.chunks = chunks
        db.session.commit()

    def extract_text(self, file_path: str):
        reader = PdfReader(file_path)
        pages = []
        for index, page in enumerate(reader.pages, start=1):
            raw = page.extract_text() or ""
            cleaned = self.clean_text(raw)
            if cleaned:
                pages.append({"page": index, "text": cleaned})
        return pages

    @staticmethod
    def clean_text(text: str) -> str:
        text = re.sub(r"\s+", " ", text).strip()
        text = re.sub(r"[^\x20-\x7E\n\r\t]", " ", text)
        return text

    @staticmethod
    def chunk_pages(pages):
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=900,
            chunk_overlap=150,
            separators=["\n\n", "\n", ".", " ", ""],
        )
        chunks = []
        for page in pages:
            for chunk in splitter.split_text(page["text"]):
                chunks.append(
                    {
                        "page": page["page"],
                        "content": chunk,
                    }
                )
        return chunks

    def mark_processed(self, document_id: int, pages: int, chunks: int, status: str = "processed"):
        document = Document.query.get(document_id)
        if not document:
            return
        document.pages = pages
        document.chunks = chunks
        document.status = status
        db.session.commit()

    @staticmethod
    def list_documents():
        return Document.query.order_by(Document.created_at.desc()).all()
