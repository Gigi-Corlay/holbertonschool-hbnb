#!/usr/bin/python3

from flask_restx import Namespace, Resource, fields
from app.services import facade
from app.api.v1.admin import admin_required

api = Namespace('amenities', description='Amenity operations')

# Modèle pour validation et Swagger
amenity_model = api.model('Amenity', {
    'name': fields.String(required=True, description='Name of the amenity', example='Pool')
})

# ------------------- Liste / Création -------------------
@api.route('/')
class AmenityList(Resource):

    @admin_required
    @api.expect(amenity_model, validate=True)
    @api.response(201, 'Amenity successfully created')
    @api.response(403, 'Admin privileges required')
    @api.response(400, 'Invalid input data')
    def post(self):
        """
        Créer une nouvelle amenity (Admin only)
        """
        data = api.payload
        try:
            new_amenity = facade.create_amenity(data)
        except ValueError as e:
            return {'error': str(e)}, 400

        return {'id': new_amenity.id, 'name': new_amenity.name}, 201

    @api.response(200, 'List of amenities retrieved successfully')
    def get(self):
        """Lister toutes les amenities (accessible à tous)"""
        amenities = facade.get_all_amenities()
        return [{'id': a.id, 'name': a.name} for a in amenities], 200


# ------------------- Détail / Mise à jour -------------------
@api.route('/<string:amenity_id>')
class AmenityDetail(Resource):

    @api.response(200, 'Amenity retrieved successfully')
    @api.response(404, 'Amenity not found')
    def get(self, amenity_id):
        """Récupérer une amenity par ID (accessible à tous)"""
        amenity = facade.get_amenity(amenity_id)
        if not amenity:
            return {'error': 'Amenity not found'}, 404
        return {'id': amenity.id, 'name': amenity.name}, 200

    @admin_required
    @api.expect(amenity_model, validate=True)
    @api.response(200, 'Amenity updated successfully')
    @api.response(403, 'Admin privileges required')
    @api.response(404, 'Amenity not found')
    @api.response(400, 'Invalid input data')
    def put(self, amenity_id):
        """
        Mettre à jour une amenity (Admin only)
        """
        data = api.payload
        try:
            updated_amenity = facade.update_amenity(amenity_id, data)
        except ValueError as e:
            return {'error': str(e)}, 400

        if not updated_amenity:
            return {'error': 'Amenity not found'}, 404

        return {'id': updated_amenity.id, 'name': updated_amenity.name}, 200
