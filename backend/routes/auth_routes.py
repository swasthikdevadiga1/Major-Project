from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from database.models import User
from services.auth_service import AuthService


auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/setup-admin")
def setup_admin():
    if User.query.filter_by(role="admin").first():
        return jsonify({"error": "Admin account already exists."}), 409

    payload = request.get_json() or {}
    name = (payload.get("name") or "").strip()
    email = (payload.get("email") or "").strip()
    password = payload.get("password") or ""

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required."}), 400
    if AuthService.user_exists(email):
        return jsonify({"error": "Email already registered."}), 409

    user = AuthService.create_user(name=name, email=email, password=password, role="admin")
    return jsonify(
        {
            "message": "Admin account created successfully.",
            "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role},
        }
    ), 201


@auth_bp.post("/register")
def register():
    payload = request.get_json() or {}
    name = (payload.get("name") or "").strip()
    email = (payload.get("email") or "").strip()
    password = payload.get("password") or ""

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required."}), 400
    if AuthService.user_exists(email):
        return jsonify({"error": "Email already registered."}), 409

    user = AuthService.create_user(name=name, email=email, password=password, role="student")
    return jsonify(
        {
            "message": "Student account created successfully.",
            "user": {"id": user.id, "name": user.name, "email": user.email, "role": user.role},
        }
    ), 201


@auth_bp.post("/login")
def login():
    payload = request.get_json() or {}
    email = payload.get("email", "")
    password = payload.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    auth_payload = AuthService.authenticate(email, password)
    if not auth_payload:
        return jsonify({"error": "Invalid credentials."}), 401

    return jsonify(auth_payload)


@auth_bp.post("/logout")
@jwt_required()
def logout():
    return jsonify({"message": "Logout handled client-side. Discard the JWT token."}), 200


@auth_bp.get("/me")
@jwt_required()
def me():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({"error": "User not found."}), 404
    return jsonify(
        {"id": user.id, "name": user.name, "email": user.email, "role": user.role}
    )
