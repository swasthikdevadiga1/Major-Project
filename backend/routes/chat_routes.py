from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from agents.document_agent import DocumentAgent
from agents.faq_agent import FAQAgent
from agents.supervisor_agent import SupervisorAgent
from database.extensions import db
from database.models import ChatMessage
from services.rag_service import RAGService


chat_bp = Blueprint("chat", __name__)


@chat_bp.post("/chat")
@jwt_required()
def chat():
    payload = request.get_json() or {}
    message = (payload.get("message") or "").strip()
    if not message:
        return jsonify({"error": "Message is required."}), 400

    user_id = int(get_jwt_identity())
    rag_service = RAGService(current_app.config)
    supervisor = SupervisorAgent(DocumentAgent(rag_service), FAQAgent())

    db.session.add(ChatMessage(user_id=user_id, role="user", message=message))
    try:
        response = supervisor.route(message)
    except Exception as exc:
        db.session.rollback()
        return jsonify({"error": f"Chat processing failed: {exc}"}), 500
    db.session.add(
        ChatMessage(
            user_id=user_id,
            role="assistant",
            message=response["answer"],
            intent=response.get("intent"),
        )
    )
    db.session.commit()

    return jsonify(response)
