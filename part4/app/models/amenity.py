#!/usr/bin/python3
from app.extensions import db
from app.models.base_model import BaseModel


class Amenity(BaseModel):
    __tablename__ = 'amenities'

    # Columns mapped to the database
    name        = db.Column(db.String(50), nullable=False, unique=True)
    description = db.Column(db.String(255), nullable=True)

    def update_amenity(self, data):
        """Update amenity with validation"""
        if "name" in data:
            if not data["name"] or not data["name"].strip():
                raise ValueError("Amenity name cannot be empty")
            if len(data["name"]) > 50:
                raise ValueError("Amenity name cannot exceed 50 characters")
        self.update(data)
