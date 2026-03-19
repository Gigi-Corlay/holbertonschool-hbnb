#!/usr/bin/python3
from app.extensions import db
from app.models.base_model import BaseModel


"""
Association table for many-to-many relationship
"""
place_amenity = db.Table(
    "place_amenity",
    db.Column("place_id", db.String(36), db.ForeignKey("places.id"), primary_key=True),
    db.Column("amenity_id", db.String(36), db.ForeignKey("amenities.id"), primary_key=True)
)


class Place(BaseModel, db.Model):
    __tablename__ = "places"

    id = db.Column(db.String(36), primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), default="")
    price = db.Column(db.Float, nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)

    """
    Foreign key
    """
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)

    """
    Relationships
    """
    reviews = db.relationship('Review', backref='place', lazy=True)

    amenities = db.relationship(
        "Amenity",
        secondary=place_amenity,
        backref=db.backref("places", lazy=True),
        lazy=True
    )

    def __init__(self, title, price, latitude, longitude, description="", **kwargs):
        super().__init__(**kwargs)

        if not title or not title.strip() or len(title.strip()) > 100:
            raise ValueError("Place title is required and cannot exceed 100 characters")

        if description and len(description) > 255:
            raise ValueError("Place description cannot exceed 255 characters")

        if price < 0:
            raise ValueError("Price must be non-negative")

        self.title = title.strip()
        self.description = description.strip() if description else ""
        self.price = price
        self.latitude = latitude
        self.longitude = longitude

    def update_place(self, data):
        if "title" in data:
            title = data["title"]
            if not title or not title.strip() or len(title.strip()) > 100:
                raise ValueError("Place title cannot be empty or exceed 100 characters")
            data["title"] = title.strip()

        if "description" in data:
            description = data["description"]
            if description and len(description) > 255:
                raise ValueError("Place description cannot exceed 255 characters")
            data["description"] = description.strip() if description else ""

        if "price" in data:
            if data["price"] < 0:
                raise ValueError("Price must be non-negative")

        self.update(data)

    def __repr__(self):
        return f"<Place id={self.id} title={self.title}>"
