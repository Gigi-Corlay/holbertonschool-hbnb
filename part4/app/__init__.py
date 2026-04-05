#!/usr/bin/python3
import os
from flask import Flask, render_template
from flask_restx import Api
from flask_cors import CORS

from app.extensions import db, bcrypt, jwt
from app.api.v1.users import api as users_ns
from app.api.v1.amenities import api as amenities_ns
from app.api.v1.places import api as places_ns
from app.api.v1.reviews import api as reviews_ns
from app.api.v1.auth import api as auth_ns

import config as app_config

def create_app(config_class=app_config.DevelopmentConfig):
    """
    Application Factory for Flask.
    Returns a Flask app with all API namespaces registered.
    """
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Crée le dossier instance si inexistant
    os.makedirs(app.instance_path, exist_ok=True)
    db_path = os.path.join(app.instance_path, 'development.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'

    # ⚡ CORS pour autoriser le frontend sur un autre port
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialisation des extensions
    bcrypt.init_app(app)
    jwt.init_app(app)
    db.init_app(app)

    # Config API RestX
    authorizations = {
        'Bearer': {
            'type': 'apiKey',
            'in': 'header',
            'name': 'Authorization',
            'description': 'JWT token. Format: Bearer <token>'
        }
    }
    api = Api(
        app,
        version='1.0',
        title='HBnB API',
        description='HBnB Application API',
        doc='/api/v1/',
        authorizations=authorizations,
        security='Bearer'
    )

    # Register API namespaces
    api.add_namespace(auth_ns, path='/api/v1/auth')
    api.add_namespace(users_ns, path='/api/v1/users')
    api.add_namespace(amenities_ns, path='/api/v1/amenities')
    api.add_namespace(places_ns, path='/api/v1/places')
    api.add_namespace(reviews_ns, path='/api/v1/reviews')

    # HTML routes pour Jinja
    @app.route('/')
    def index_page():
        return render_template('index.html')

    @app.route("/place/<int:place_id>")
    def place_page(place_id):
        # Ici tu peux récupérer ton lieu depuis la DB
        # Exemple placeholder si juste JS:
        place = {
            "id": place_id,
            "name": f"Place {place_id}",
            "images": [],
            "description": "",
            "owner": {"first_name": "Owner"},
            "amenities": []
        }
        return render_template("place.html", place=place)

    return app
