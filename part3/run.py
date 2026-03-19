#!/usr/bin/python3
import contextlib
from app import create_app

"""
Création de l'application Flask avec la configuration par défaut
"""
app = create_app()

"""
Création de l'admin user dans le contexte Flask
"""
with app.app_context():
    from app.services import facade

    """
    Ignore les exceptions si l'utilisateur existe déjà
    """
    with contextlib.suppress(Exception):
        facade.create_user(
            first_name="Admin",
            last_name="User",
            email="admin@example.com",
            password="adminpass",
            is_admin=True  # Assure que cet utilisateur est admin
        )
        print("Admin user created successfully")

"""
Lancement du serveur Flask
"""
if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)
