#!/usr/bin/python3

from app import create_app
from app.persistence.user_repository import UserRepository

# Crée l'application Flask
app = create_app()

# Désactive strict slashes pour éviter les redirects
app.url_map.strict_slashes = False

if __name__ == "__main__":
    # Active le context Flask pour que db.session fonctionne
    with app.app_context():
        repo = UserRepository()
        repo.create_user("Test", "User", "test@test.com", "test")
        print("Utilisateur créé !")

    app.run(host='0.0.0.0', port=5000, debug=True)