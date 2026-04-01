from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from services.voice_service import VoiceService


voice_bp = Blueprint("voice", __name__)


@voice_bp.post("/voice")
@jwt_required()
def voice():
    audio_file = request.files.get("audio")
    if not audio_file:
        return jsonify({"error": "Audio file is required."}), 400

    try:
        transcript = VoiceService.transcribe_file(audio_file)
    except Exception as exc:
        return jsonify({"error": f"Voice transcription failed: {exc}"}), 500

    return jsonify({"transcript": transcript})
