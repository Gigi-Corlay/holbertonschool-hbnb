#!/usr/bin/python3

from flask_restx import Namespace, Resource, fields
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.services import facade

api = Namespace("reviews", description="Reviews operations")


# -------------------
# Swagger Models
# -------------------
review_model = api.model('Review', {
    'text': fields.String(required=True, description='Text of the review', example='Great place!'),
    'rating': fields.Integer(required=True, description='Rating of the place (1-5)', example=5),
    'place_id': fields.String(required=True, description='ID of the place')
})

review_response_model = api.model('ReviewResponse', {
    'id': fields.String(description='Review ID'),
    'text': fields.String(description='Text of the review'),
    'rating': fields.Integer(description='Rating of the place (1-5)'),
    'user_id': fields.String(description='ID of the user'),
    'place_id': fields.String(description='ID of the place')
})

# -------------------
# List / Create Reviews
# -------------------
@api.route("/")
class ReviewList(Resource):

    @api.response(200, 'List of reviews retrieved successfully', [review_response_model])
    def get(self):
        """
        Retrieve all reviews (public)
        """
        reviews = facade.get_all_reviews()
        return [{
            "id": r.id,
            "text": r.text,
            "rating": r.rating,
            "user_id": r.user_id,
            "place_id": r.place_id
        } for r in reviews], 200

    @jwt_required()
    @api.expect(review_model, validate=True)
    @api.response(201, 'Review created successfully', review_response_model)
    @api.response(401, 'Missing or invalid token')
    @api.response(400, 'Invalid input data')
    def post(self):
        """
        Create a new review (authenticated users only)
        """
        current_user_id = get_jwt_identity()
        data = request.get_json()
        data["user_id"] = current_user_id

        try:
            review = facade.create_review(data)
            return {
                "message": "Review created successfully",
                "review": {
                    "id": review.id,
                    "text": review.text,
                    "rating": review.rating,
                    "user_id": review.user_id,
                    "place_id": review.place_id
                }
            }, 201
        except ValueError as e:
            return {'error': str(e)}, 400

# -------------------
# Review Detail / Update / Delete
# -------------------
@api.route("/<string:review_id>")
class ReviewDetail(Resource):

    @api.response(200, 'Review retrieved successfully', review_response_model)
    @api.response(404, 'Review not found')
    def get(self, review_id):
        """
        Get a review by ID (public)
        """
        review = facade.get_review(review_id)
        if not review:
            return {"error": "Review not found"}, 404
        return {
            "id": review.id,
            "text": review.text,
            "rating": review.rating,
            "user_id": review.user_id,
            "place_id": review.place_id
        }, 200

    @jwt_required()
    @api.expect(review_model, validate=True)
    @api.response(200, 'Review updated successfully', review_response_model)
    @api.response(403, 'Unauthorized action')
    @api.response(404, 'Review not found')
    def put(self, review_id):
        """
        Update a review (owner or admin)
        """
        claims = get_jwt()
        is_admin = claims.get("is_admin", False)
        current_user_id = get_jwt_identity()

        review = facade.get_review(review_id)
        if not review:
            return {'error': 'Review not found'}, 404

        if not is_admin and review.user_id != current_user_id:
            return {'error': 'Unauthorized action'}, 403

        try:
            updated_review = facade.update_review(review_id, request.get_json())
            return {
                "message": "Review updated successfully",
                "review": {
                    "id": updated_review.id,
                    "text": updated_review.text,
                    "rating": updated_review.rating,
                    "user_id": updated_review.user_id,
                    "place_id": updated_review.place_id
                }
            }, 200
        except ValueError as e:
            return {'error': str(e)}, 400

    @jwt_required()
    @api.response(200, 'Review deleted successfully')
    @api.response(403, 'Unauthorized action')
    @api.response(404, 'Review not found')
    def delete(self, review_id):
        """
        Delete a review (owner or admin)
        """
        claims = get_jwt()
        is_admin = claims.get("is_admin", False)
        current_user_id = get_jwt_identity()

        review = facade.get_review(review_id)
        if not review:
            return {'error': 'Review not found'}, 404

        if not is_admin and review.user_id != current_user_id:
            return {'error': 'Unauthorized action'}, 403

        facade.delete_review(review_id)
        return {'message': 'Review deleted successfully'}, 200
