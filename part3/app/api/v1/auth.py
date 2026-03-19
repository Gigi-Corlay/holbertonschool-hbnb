#!/usr/bin/python3
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from app.services import facade
from datetime import timedelta

api = Namespace('auth', description='Authentication operations')

# ---------------------------------------------------
# Swagger / Input model
# ---------------------------------------------------
login_model = api.model('Login', {
    'email': fields.String(required=True, description='User email', example='user@example.com'),
    'password': fields.String(required=True, description='User password', example='password123')
})

# ---------------------------------------------------
# Login Endpoint
# ---------------------------------------------------
@api.route('/login')
class Login(Resource):
    @api.expect(login_model)
    @api.response(200, 'Login successful')
    @api.response(401, 'Invalid credentials')
    def post(self):
        """
        Authenticate user and return a JWT token
        """
        credentials = api.payload
        user = facade.get_user_by_email(credentials['email'])

        # Vérification du mot de passe
        if not user or not user.verify_password(credentials['password']):
            return {'error': 'Invalid email or password'}, 401

        # Création du token JWT (expire dans 1 heure)
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={"is_admin": user.is_admin},
            expires_delta=timedelta(hours=1)
        )
        return {'access_token': access_token}, 200

# ---------------------------------------------------
# Example Protected Endpoint
# ---------------------------------------------------
@api.route('/protected')
class ProtectedResource(Resource):
    @jwt_required()
    def get(self):
        """
        Example protected endpoint that requires a valid JWT token
        """
        current_user_id = get_jwt_identity()
        claims = get_jwt()
        return {
            'message': f'Hello, user {current_user_id}',
            'is_admin': claims.get('is_admin', False)
        }, 200
