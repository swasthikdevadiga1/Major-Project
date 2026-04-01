from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from database.models import User
from services.document_service import DocumentService
from services.rag_service import RAGService


admin_bp = Blueprint("admin", __name__)


def _ensure_admin(user_id):
    user = User.query.get(int(user_id))
    return user and user.role == "admin"


@admin_bp.get("/documents")
@jwt_required()
def list_documents():
    if not _ensure_admin(get_jwt_identity()):
        return jsonify({"error": "Admin access required."}), 403

    documents = DocumentService.list_documents()
    return jsonify(
        [
            {
                "id": doc.id,
                "filename": doc.filename,
                "status": doc.status,
                "pages": doc.pages,
                "chunks": doc.chunks,
                "created_at": doc.created_at.isoformat(),
            }
            for doc in documents
        ]
    )


@admin_bp.post("/upload")
@jwt_required()
def upload():
    user_id = get_jwt_identity()
    if not _ensure_admin(user_id):
        return jsonify({"error": "Admin access required."}), 403

    files = request.files.getlist("files") or []
    if not files:
        single_file = request.files.get("file")
        if single_file:
            files = [single_file]

    if not files:
        return jsonify({"error": "At least one PDF file is required."}), 400

    service = DocumentService(current_app.config)
    doc_service = DocumentService(current_app.config)
    rag_service = RAGService(current_app.config)
    processed_documents = []
    for file in files:
        document = None
        try:
            document = service.save_upload(file, uploaded_by=int(user_id))
            doc_service.update_status(document.id, "processing", pages=0, chunks=0)
            current_app.logger.info("Processing started for %s (id=%s)", document.filename, document.id)

            current_app.logger.info("Extracting text from %s", document.filename)
            pages = doc_service.extract_text(document.stored_path)
            current_app.logger.info("Extracted %s non-empty pages from %s", len(pages), document.filename)

            chunks = doc_service.chunk_pages(pages)
            current_app.logger.info("Created %s chunks for %s", len(chunks), document.filename)
            if not chunks:
                doc_service.mark_processed(document.id, pages=len(pages), chunks=0, status="failed")
                processed_documents.append(
                    {
                        "id": document.id,
                        "filename": document.filename,
                        "status": "failed",
                        "pages": len(pages),
                        "chunks": 0,
                        "error": "No extractable text was found in the uploaded PDF.",
                    }
                )
                continue

            current_app.logger.info("Building FAISS index for %s", document.filename)
            rag_service.build_or_update_index(document.id, document.filename, chunks)
            doc_service.mark_processed(document.id, pages=len(pages), chunks=len(chunks))
            current_app.logger.info("Processing completed for %s", document.filename)
            processed_documents.append(
                {
                    "id": document.id,
                    "filename": document.filename,
                    "status": "processed",
                    "pages": len(pages),
                    "chunks": len(chunks),
                }
            )

        except ValueError as exc:
            if document:
                doc_service.mark_processed(document.id, pages=0, chunks=0, status="failed")
            processed_documents.append(
                {
                    "id": document.id if document else None,
                    "filename": file.filename,
                    "status": "failed",
                    "pages": 0,
                    "chunks": 0,
                    "error": str(exc),
                }
            )
            current_app.logger.exception("Validation failure while processing %s", file.filename)
        except Exception as exc:
            if document:
                doc_service.mark_processed(document.id, pages=0, chunks=0, status="failed")
            processed_documents.append(
                {
                    "id": document.id if document else None,
                    "filename": file.filename,
                    "status": "failed",
                    "pages": 0,
                    "chunks": 0,
                    "error": str(exc),
                }
            )
            current_app.logger.exception("Upload or processing failed for %s", file.filename)

    failed_documents = [doc for doc in processed_documents if doc["status"] != "processed"]
    if not processed_documents:
        return jsonify({"error": "No files were processed."}), 500
    return jsonify(
        {
            "message": (
                "Documents uploaded and processed successfully."
                if not failed_documents
                else "Upload completed with some processing failures."
            ),
            "documents": processed_documents,
        }
    ), (207 if failed_documents else 200)
