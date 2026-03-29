#!/usr/bin/python3
from app.models.user import User
from app.persistence.repository import SQLAlchemyRepository
from app import db


class UserRepository(SQLAlchemyRepository):
    def __init__(self):
        super().__init__(User)

    def get_user_by_email(self, email):
        return self.model.query.filter_by(email=email).first()

    def create_user(self, first_name, last_name, email, password):
        user = User(first_name=first_name, last_name=last_name, email=email)
        user.hash_password(password)
        db.session.add(user)
        db.session.commit()
        return user
