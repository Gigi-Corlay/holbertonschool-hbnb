#!/usr/bin/python3
import uuid
from app.extensions import db
from app.models.base_model import BaseModel

# Association table for Many-to-Many relationship between Place and Amenity
place_amenity = db.Table('place_amenity',
    db.Column('place_id', db.String(36), db.ForeignKey('places.id'), primary_key=True),
    db.Column('amenity_id', db.String(36), db.ForeignKey('amenities.id'), primary_key=True)
)

class Place(BaseModel):
    __tablename__ = 'places'
    
    # Columns mapped to the database
    title      = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    price       = db.Column(db.Float, nullable=False)
    latitude    = db.Column(db.Float, nullable=True)
    longitude   = db.Column(db.Float, nullable=True)
    owner_id    = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    image_path  = db.Column(db.String(255), nullable=True)
    uuid        = db.Column(db.String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False)

    # One-to-Many: Place → Review
    reviews   = db.relationship('Review', backref='place', lazy=True)
    # Many-to-Many: Place ↔ Amenity
    amenities = db.relationship('Amenity', secondary=place_amenity, lazy='subquery',
                                backref=db.backref('places', lazy=True))
    
    def update_details(self, data):
        """Update place details with validation"""
        if "title" in data:
            if not data["title"] or len(data["title"]) > 100:
                raise ValueError("Invalid title")

        if "price" in data:
            try:
                data["price"] = float(data["price"])
            except (ValueError, TypeError):
                raise ValueError("Price must be a valid number")
            if data["price"] <= 0:
                raise ValueError("Price must be positive")

        if "latitude" in data:
            try:
                data["latitude"] = float(data["latitude"])
            except (ValueError, TypeError):
                raise ValueError("Latitude must be a valid number")
            if not (-90 <= data["latitude"] <= 90):
                raise ValueError("Latitude must be between -90 and 90")

        if "longitude" in data:
            try:
                data["longitude"] = float(data["longitude"])
            except (ValueError, TypeError):
                raise ValueError("Longitude must be a valid number")
            if not (-180 <= data["longitude"] <= 180):
                raise ValueError("Longitude must be between -180 and 180")

        # All validations passed, now apply the changes and update the timestamp
        self.update(data)
