import os
import sys
from pathlib import Path

from flask import Flask, jsonify
from flask_cors import CORS

CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from config.settings import Config
from database.extensions import bcrypt, db, jwt
from routes.admin_routes import admin_bp
from routes.auth_routes import auth_bp
from routes.chat_routes import chat_bp
from routes.voice_routes import voice_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
    os.makedirs(Path(app.config["VECTOR_STORE_PATH"]).parent, exist_ok=True)

    CORS(
        app,
        resources={r"/*": {"origins": app.config["CORS_ORIGINS"]}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
    )
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp, url_prefix="/admin")
    app.register_blueprint(chat_bp)
    app.register_blueprint(voice_bp)

    @app.get("/health")
    def health():
        return jsonify({"status": "ok"})

    with app.app_context():
        db.create_all()

    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
