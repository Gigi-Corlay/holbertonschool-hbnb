#!/usr/bin/python3
from app.persistence.sqlalchemy_repository import SQLAlchemyRepository
from app.models.user import User


class UserRepository(SQLAlchemyRepository):
    """
    Repository for User model
    """

    def __init__(self):
        super().__init__(User)

    def get_by_email(self, email):
        if not email:
            return None
        return self.model.query.filter_by(email=email.lower()).first()
