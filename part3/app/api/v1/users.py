#!/usr/bin/python3

from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from app.services import facade

api = Namespace('users', description='User operations')

# -------------------
# Swagger Models
# -------------------
user_input_model = api.model('UserInput', {
    'first_name': fields.String(required=True, description='First name'),
    'last_name': fields.String(required=True, description='Last name'),
    'email': fields.String(required=True, description='Email address'),
    'password': fields.String(required=True, description='Password'),
    'is_admin': fields.Boolean(description='Admin flag')
})

login_model = api.model('Login', {
    'email': fields.String(required=True, description='User email'),
    'password': fields.String(required=True, description='User password')
})

user_response_model = api.model('UserResponse', {
    'id': fields.String(description='User ID'),
    'first_name': fields.String(description='First name'),
    'last_name': fields.String(description='Last name'),
    'email': fields.String(description='Email'),
    'is_admin': fields.Boolean(description='Admin flag')
})

token_model = api.model('Token', {
    'access_token': fields.String(description='JWT access token')
})

# -------------------
# User Registration
# -------------------
@api.route('/')
class UserRegister(Resource):

    @api.expect(user_input_model, validate=True)
    @api.response(201, 'User successfully created', user_response_model)
    @api.response(400, 'Invalid input data')
    def post(self):
        """
        Register a new user
        """
        data = api.payload
        try:
            user = facade.create_user(
                first_name=data['first_name'],
                last_name=data['last_name'],
                email=data['email'],
                password=data['password'],
                is_admin=data.get('is_admin', False)
            )
            return {
                'id': user.id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'is_admin': user.is_admin
            }, 201
        except ValueError as e:
            return {'error': str(e)}, 400

# -------------------
# User Login
# -------------------
@api.route('/login')
class UserLogin(Resource):

    @api.expect(login_model, validate=True)
    @api.response(200, 'Login successful', token_model)
    @api.response(401, 'Invalid credentials')
    def post(self):
        """
        Authenticate user and return a JWT token
        """
        data = api.payload
        user = facade.authenticate_user(data['email'], data['password'])
        if not user:
            return {'error': 'Invalid credentials'}, 401
        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={'is_admin': user.is_admin}
        )
        return {'access_token': access_token}, 200

# -------------------
# Get User Info
# -------------------
@api.route('/<string:user_id>')
class UserResource(Resource):

    @jwt_required()
    @api.response(200, 'User retrieved successfully', user_response_model)
    @api.response(403, 'Access forbidden')
    @api.response(404, 'User not found')
    def get(self, user_id):
        """
        Retrieve user details (self only or admin)
        """
        current_user_id = get_jwt_identity()
        claims = get_jwt()
        is_admin = claims.get('is_admin', False)

        user = facade.get_user_by_id(user_id)
        if not user:
            return {'error': 'User not found'}, 404

        # Normal users can see only their own info; admins can see any
        if not is_admin and str(user.id) != str(current_user_id):
            return {'error': 'Access forbidden'}, 403

        return {
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'is_admin': user.is_admin
        }, 200
