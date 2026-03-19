#!/usr/bin/python3
from flask import request
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from app.services import facade
from functools import wraps

api = Namespace('admin', description='Admin operations')


# ---------------------------------------------------
# Admin decorator
# ---------------------------------------------------
def admin_required(fn):
    """
    Restrict access to admins only
    """
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if not claims.get("is_admin"):
            return {"error": "Admin privileges required"}, 403
        return fn(*args, **kwargs)
    return wrapper


# ---------------------------------------------------
# Swagger Models
# ---------------------------------------------------
user_model = api.model('AdminUser', {
    'email': fields.String(required=True, description='Email address'),
    'first_name': fields.String(required=True, description='First name'),
    'last_name': fields.String(required=True, description='Last name'),
    'password': fields.String(required=True, description='Password')
})

amenity_model = api.model('AdminAmenity', {
    'name': fields.String(required=True, description='Name of the amenity')
})


# ---------------------------------------------------
# USERS
# ---------------------------------------------------
@api.route('/users/')
class AdminUserCreate(Resource):

    @admin_required
    @api.expect(user_model)
    def post(self):
        """
        Create a new user (Admin only)
        """
        data = request.get_json()
        if facade.get_user_by_email(data.get("email")):
            return {"error": "Email already registered"}, 400
        new_user = facade.create_user(data)
        return {
            "id": new_user.id,
            "email": new_user.email,
            "first_name": new_user.first_name,
            "last_name": new_user.last_name
        }, 201


@api.route('/users/<string:user_id>')
class AdminUserModify(Resource):

    @admin_required
    @api.expect(user_model)
    def put(self, user_id):
        """
        Modify an existing user (Admin only)
        """
        data = request.get_json()
        email = data.get("email")
        if email:
            existing_user = facade.get_user_by_email(email)
            if existing_user and str(existing_user.id) != user_id:
                return {"error": "Email already in use"}, 400
        updated_user = facade.update_user(user_id, data)
        if not updated_user:
            return {"error": "User not found"}, 404
        return {
            "id": updated_user.id,
            "email": updated_user.email,
            "first_name": updated_user.first_name,
            "last_name": updated_user.last_name
        }, 200

    @admin_required
    def delete(self, user_id):
        """
        Delete a user (Admin only)
        """
        deleted = facade.delete_user(user_id)
        if not deleted:
            return {"error": "User not found"}, 404
        return {"message": "User deleted"}, 200


# ---------------------------------------------------
# AMENITIES
# ---------------------------------------------------
@api.route('/amenities/')
class AdminAmenityCreate(Resource):

    @admin_required
    @api.expect(amenity_model)
    def post(self):
        """
        Create a new amenity (Admin only)
        """
        data = request.get_json()
        new_amenity = facade.create_amenity(data)
        return {
            "id": new_amenity.id,
            "name": new_amenity.name
        }, 201


@api.route('/amenities/<string:amenity_id>')
class AdminAmenityModify(Resource):

    @admin_required
    @api.expect(amenity_model)
    def put(self, amenity_id):
        """
        Modify an amenity (Admin only)
        """
        data = request.get_json()
        updated_amenity = facade.update_amenity(amenity_id, data)
        if not updated_amenity:
            return {"error": "Amenity not found"}, 404
        return {
            "id": updated_amenity.id,
            "name": updated_amenity.name
        }, 200

    @admin_required
    def delete(self, amenity_id):
        """
        Delete an amenity (Admin only)
        """
        deleted = facade.delete_amenity(amenity_id)
        if not deleted:
            return {"error": "Amenity not found"}, 404
        return {"message": "Amenity deleted"}, 200


# ---------------------------------------------------
# PLACES
# ---------------------------------------------------
@api.route('/places/<string:place_id>')
class AdminPlaceModify(Resource):

    @admin_required
    def put(self, place_id):
        """
        Modify a place (admin can bypass ownership)
        """
        claims = get_jwt()
        current_user_id = get_jwt_identity()
        is_admin = claims.get("is_admin")

        place = facade.get_place(place_id)
        if not place:
            return {"error": "Place not found"}, 404

        if not is_admin and str(place.owner_id) != current_user_id:
            return {"error": "Unauthorized action"}, 403

        data = request.get_json()
        updated_place = facade.update_place(place_id, data)
        if not updated_place:
            return {"error": "Place not found"}, 404
        return updated_place, 200

    @admin_required
    def delete(self, place_id):
        """
        Delete a place (admin can bypass ownership)
        """
        claims = get_jwt()
        current_user_id = get_jwt_identity()
        is_admin = claims.get("is_admin")

        place = facade.get_place(place_id)
        if not place:
            return {"error": "Place not found"}, 404

        if not is_admin and str(place.owner_id) != current_user_id:
            return {"error": "Unauthorized action"}, 403

        deleted = facade.delete_place(place_id)
        if not deleted:
            return {"error": "Place not found"}, 404
        return {"message": "Place deleted"}, 200


# ---------------------------------------------------
# REVIEWS
# ---------------------------------------------------
@api.route('/reviews/<string:review_id>')
class AdminReviewModify(Resource):

    @admin_required
    def put(self, review_id):
        """
        Modify a review (admin can bypass ownership)
        """
        claims = get_jwt()
        current_user_id = get_jwt_identity()
        is_admin = claims.get("is_admin")

        review = facade.get_review(review_id)
        if not review:
            return {"error": "Review not found"}, 404

        if not is_admin and str(review.user_id) != current_user_id:
            return {"error": "Unauthorized action"}, 403

        data = request.get_json()
        updated_review = facade.update_review(review_id, data)
        if not updated_review:
            return {"error": "Review not found"}, 404
        return updated_review, 200

    @admin_required
    def delete(self, review_id):
        """
        Delete a review (admin can bypass ownership)
        """
        claims = get_jwt()
        current_user_id = get_jwt_identity()
        is_admin = claims.get("is_admin")

        review = facade.get_review(review_id)
        if not review:
            return {"error": "Review not found"}, 404

        if not is_admin and str(review.user_id) != current_user_id:
            return {"error": "Unauthorized action"}, 403

        deleted = facade.delete_review(review_id)
        if not deleted:
            return {"error": "Review not found"}, 404
        return {"message": "Review deleted"}, 200