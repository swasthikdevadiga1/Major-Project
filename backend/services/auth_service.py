from flask_jwt_extended import create_access_token

from database.extensions import db
from database.models import User


class AuthService:
    @staticmethod
    def create_user(name: str, email: str, password: str, role: str = "student") -> User:
        user = User(name=name, email=email.lower().strip(), role=role)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        return user

    @staticmethod
    def authenticate(email: str, password: str):
        user = User.query.filter_by(email=email.lower().strip()).first()
        if not user or not user.check_password(password):
            return None

        token = create_access_token(
            identity=str(user.id),
            additional_claims={"email": user.email, "role": user.role, "name": user.name},
        )
        return {
            "access_token": token,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
            },
        }

    @staticmethod
    def user_exists(email: str) -> bool:
        return User.query.filter_by(email=email.lower().strip()).first() is not None
