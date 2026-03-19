#!/usr/bin/python3
from app.extensions import db
from app.models.base_model import BaseModel


class Amenity(BaseModel, db.Model):
    __tablename__ = "amenities"

    id = db.Column(db.String(36), primary_key=True)
    name = db.Column(db.String(50), nullable=False)

    def __init__(self, name, **kwargs):
        super().__init__(**kwargs)

        if not name or not name.strip() or len(name.strip()) > 50:
            raise ValueError("Amenity name is required and cannot exceed 50 characters")

        self.name = name.strip()

    def update_amenity(self, data):
        if "name" in data:
            name = data["name"]
            if not name or not name.strip():
                raise ValueError("Amenity name cannot be empty")
            if len(name.strip()) > 50:
                raise ValueError("Amenity name cannot exceed 50 characters")
            data["name"] = name.strip()

        self.update(data)

    def __repr__(self):
        return f"<Amenity id={self.id} name={self.name}>"
