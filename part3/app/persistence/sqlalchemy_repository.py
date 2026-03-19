#!/usr/bin/python3
from app.extensions import db
from app.persistence.repository import Repository


class SQLAlchemyRepository(Repository):
    """
    Repository implementation using SQLAlchemy
    """

    def __init__(self, model):
        self.model = model

    def add(self, obj):
        """
        Add a new object to the database
        """
        try:
            db.session.add(obj)
            db.session.commit()
            return obj
        except Exception as e:
            db.session.rollback()
            raise RuntimeError(f"Error adding object: {e}") from e

    def get(self, obj_id):
        """
        Retrieve object by primary key
        """
        return db.session.get(self.model, obj_id)

    def get_all(self):
        """
        Retrieve all objects of this model
        """
        return self.model.query.all()

    def update(self, obj_id, data):
        """
        Update object attributes
        """
        obj = self.get(obj_id)
        if not obj:
            return None
        try:
            for key, value in data.items():
                if hasattr(obj, key):
                    setattr(obj, key, value)
            db.session.commit()
            return obj
        except Exception as e:
            db.session.rollback()
            raise RuntimeError(f"Error updating object: {e}") from e

    def delete(self, obj_id):
        """
        Delete object by primary key
        """
        obj = self.get(obj_id)
        if not obj:
            return None
        try:
            db.session.delete(obj)
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            raise RuntimeError(f"Error deleting object: {e}") from e

    def get_by_attribute(self, attr_name, attr_value):
        """
        Retrieve first object matching attribute
        """
        if not hasattr(self.model, attr_name):
            raise AttributeError(
                f"{self.model.__name__} has no attribute '{attr_name}'"
            )
        return self.model.query.filter(
            getattr(self.model, attr_name) == attr_value
        ).first()
