#!/usr/bin/python3
import uuid
from app.extensions import db, bcrypt
from app.models.base_model import BaseModel


class User(BaseModel, db.Model):
    __tablename__ = "users"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    password = db.Column(db.String(128), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

    # Relationships
    places = db.relationship('Place', backref='owner', lazy=True)
    reviews = db.relationship('Review', backref='user', lazy=True)

    def __init__(self, first_name, last_name, email, password, is_admin=False, **kwargs):
        super().__init__(**kwargs)

        # Validation des champs
        if not first_name or not first_name.strip():
            raise ValueError("first_name is required")
        if not last_name or not last_name.strip():
            raise ValueError("last_name is required")
        if not email or not email.strip():
            raise ValueError("email is required")
        if not password or not password.strip():
            raise ValueError("password is required")

        self.first_name = first_name.strip()
        self.last_name = last_name.strip()
        self.email = email.strip().lower()
        self.set_password(password)
        self.is_admin = is_admin

    def set_password(self, raw_password):
        """
        Hash the password using bcrypt
        """
        self.password = bcrypt.generate_password_hash(raw_password).decode('utf-8')

    def verify_password(self, raw_password):
        """
        Check hashed password
        """
        return bcrypt.check_password_hash(self.password, raw_password)

    def update_user(self, data):
        """
        Met à jour les informations de l'utilisateur
        """
        if "first_name" in data:
            if not data["first_name"] or not data["first_name"].strip():
                raise ValueError("first_name cannot be empty")
            data["first_name"] = data["first_name"].strip()
        if "last_name" in data:
            if not data["last_name"] or not data["last_name"].strip():
                raise ValueError("last_name cannot be empty")
            data["last_name"] = data["last_name"].strip()
        if "email" in data:
            if not data["email"] or not data["email"].strip():
                raise ValueError("email cannot be empty")
            data["email"] = data["email"].strip().lower()
        if "password" in data:
            if not data["password"] or not data["password"].strip():
                raise ValueError("password cannot be empty")
            data["password"] = bcrypt.generate_password_hash(data["password"]).decode('utf-8')
        if "is_admin" in data:
            data["is_admin"] = bool(data["is_admin"])

        self.update(data)

    def __repr__(self):
        return f"<User id={self.id} email={self.email} admin={self.is_admin}>"
