#!/usr/bin/python3
from flask_restx import Namespace, Resource, fields
from app.services import facade

api = Namespace('amenities', description='Amenity operations')


# Modèle pour validation et Swagger
amenity_model = api.model('Amenity', {
    'name': fields.String(required=True, description='Name of the amenity')
})


# ------------------- Liste / Création -------------------
@api.route('/')
class AmenityList(Resource):
    @api.expect(amenity_model, validate=True)
    @api.response(201, 'Amenity successfully created')
    @api.response(400, 'Invalid input data')
    def post(self):
        """Créer une nouvelle amenity"""
        try:
            amenity = facade.create_amenity(api.payload)
        except ValueError as e:
            return {'error': str(e)}, 400
        return {'id': amenity.id, 'name': amenity.name}, 201

    @api.response(200, 'List of amenities retrieved successfully')
    def get(self):
        """Lister toutes les amenities"""
        amenities = facade.get_all_amenities()
        return [{'id': a.id, 'name': a.name} for a in amenities], 200


# ------------------- Détail / Mise à jour -------------------
@api.route('/<string:amenity_id>')
class AmenityResource(Resource):
    @api.response(200, 'Amenity details retrieved successfully')
    @api.response(404, 'Amenity not found')
    def get(self, amenity_id):
        """Récupérer une amenity par ID"""
        amenity = facade.get_amenity(amenity_id)
        if not amenity:
            return {'error': 'Amenity not found'}, 404
        return {'id': amenity.id, 'name': amenity.name}, 200

    @api.expect(amenity_model, validate=True)
    @api.response(200, 'Amenity updated successfully')
    @api.response(404, 'Amenity not found')
    @api.response(400, 'Invalid input data')
    def put(self, amenity_id):
        """Mettre à jour une amenity"""
        try:
            updated = facade.update_amenity(amenity_id, api.payload)
        except ValueError as e:
            return {'error': str(e)}, 400
        if not updated:
            return {'error': 'Amenity not found'}, 404
        return {
            'message': 'Amenity updated successfully',
            'amenity': {
                'id': updated.id,
                'name': updated.name
            }
        }, 200
