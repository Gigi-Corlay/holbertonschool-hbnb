from app.persistence.sqlalchemy_repository import SQLAlchemyRepository
from app.models.amenity import Amenity


class AmenityRepository(SQLAlchemyRepository):

    def __init__(self):
        super().__init__(Amenity)
