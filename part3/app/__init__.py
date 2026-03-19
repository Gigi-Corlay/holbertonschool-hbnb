#!/usr/bin/python3
import os
from flask import Flask
from flask_restx import Api
from app.extensions import db, bcrypt, jwt

# Import des namespaces API
from app.api.v1.users import api as users_ns
from app.api.v1.amenities import api as amenities_ns
from app.api.v1.places import api as places_ns
from app.api.v1.reviews import api as reviews_ns
from app.api.v1.auth import api as auth_ns
from app.api.v1.protected import api as protected_ns
from app.api.v1.admin import api as admin_ns

from config import config


def create_app(config_name='development'):
    """
    Create and configure the Flask application.
    """
    app = Flask(__name__, instance_relative_config=True)

    """
    Charger la configuration
    """
    config_class = config.get(config_name) or config.get('default')
    app.config.from_object(config_class)

    """
    Initialiser les extensions
    """
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    """
    Créer la base de données si nécessaire
    """
    with app.app_context():
        db.create_all()

    """
    Configuration Swagger / JWT
    """
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

    """
    Enregistrement des namespaces
    """
    api.add_namespace(auth_ns, path='/api/v1/auth')
    api.add_namespace(protected_ns, path='/api/v1/protected')
    api.add_namespace(users_ns, path='/api/v1/users')
    api.add_namespace(amenities_ns, path='/api/v1/amenities')
    api.add_namespace(places_ns, path='/api/v1/places')
    api.add_namespace(reviews_ns, path='/api/v1/reviews')
    api.add_namespace(admin_ns, path='/api/v1/admin')

    return app
