#!/usr/bin/python3

from flask_restx import Namespace, Resource
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

api = Namespace('protected', description='Protected operations')

@api.route('/')
class ProtectedResource(Resource):
    @jwt_required()
    def get(self):
        """
        Example protected endpoint that requires a valid JWT token.
        Returns the current user ID and whether the user is admin.
        """
        current_user_id = get_jwt_identity()
        claims = get_jwt()
        return {
            'message': f'Hello, user {current_user_id}',
            'is_admin': claims.get('is_admin', False)
        }, 200
