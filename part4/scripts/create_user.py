#!/usr/bin/python3

import sys
import os

# Add the parent folder to the PYTHONPATH to find the 'app' package
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, db
from app.persistence.user_repository import UserRepository
from app.models.place import Place

# created the Flask application
app = create_app()
app.url_map.strict_slashes = False

if __name__ == "__main__":
    with app.app_context():
        # ---------- USERS ----------
        repo = UserRepository()

        existing_user = repo.get_user_by_email("test@test.com")
        if existing_user:
            print("User test@test.com already exists!")
            user_id = existing_user.id
        else:
            user = repo.create_user(
                first_name="Test",
                last_name="User",
                email="test@test.com",
                password="test"
            )
            print("User created successfully!")
            user_id = user.id

        # ---------- PLACES ----------
        test_places = [
            {"title": "Beautiful Beach House", "price": 100, "description": "A lovely house by the sea", "latitude": 34.01, "longitude": -118.49},
            {"title": "Cozy Cabin", "price": 55, "description": "Small and cozy cabin in the woods", "latitude": 45.32, "longitude": -122.67},
            {"title": "Modern Apartment", "price": 150, "description": "Apartment in the city center", "latitude": 40.71, "longitude": -74.00},
        ]

        for place_data in test_places:
            existing_place = Place.query.filter_by(title=place_data["title"]).first()
            if existing_place:
                print(f"Place '{place_data['title']}' already exists!")
                continue

            place = Place(
                title=place_data["title"],
                price=place_data["price"],
                description=place_data["description"],
                latitude=place_data["latitude"],
                longitude=place_data["longitude"],
                owner_id=user_id,
                image_path="images/beach_house.jpg"
            )
            db.session.add(place)
            db.session.commit()
            print(f"Place '{place_data['title']}' created successfully!")