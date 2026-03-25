#!/usr/bin/python3
from app.extensions import db
from app.models.base_model import BaseModel

class Review(BaseModel):
    __tablename__ = 'reviews'

    # Columns mapped to the database
    text     = db.Column(db.String(1000), nullable=False)
    rating   = db.Column(db.Integer, nullable=False)
    # ForeignKeys: references places and users tables
    place_id = db.Column(db.String(36), db.ForeignKey('places.id'), nullable=False)
    user_id  = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)

    def validate_rating(self, rating):
        """Validates that rating is between 1 and 5"""
        if isinstance(rating, bool) or not isinstance(rating, int) or not (1 <= rating <= 5):
            raise ValueError("Rating must be an integer between 1 and 5")

    def update_review(self, data):
        """Update review with validation"""
        if "text" in data:
            if not data["text"] or not data["text"].strip():
                raise ValueError("text is required")
        if "rating" in data:
            self.validate_rating(data["rating"])
        self.update(data)
