#!/usr/bin/python3

from app import create_app
from app.persistence.user_repository import UserRepository
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Crée l'application Flask
app = create_app()
app.url_map.strict_slashes = False

if __name__ == "__main__":
    with app.app_context():
        repo = UserRepository()

        # Vérifie si l'utilisateur existe déjà
        existing_user = repo.get_user_by_email("test@test.com")
        if existing_user:
            print("User test@test.com already exists!")
        else:
            # Crée l'utilisateur test
            repo.create_user(
                first_name="Test",
                last_name="User",
                email="test@test.com",
                password="test"
            )
            print("User created successfully!")
