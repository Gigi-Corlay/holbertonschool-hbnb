#!/usr/bin/python3
import pytest
from app.extensions import db
from app.models.user import User
from app.models.place import Place
from app.models.review import Review
from app.models.amenity import Amenity


@pytest.fixture(scope="module")
def init_db(app):
    """
    Initialise la base de données pour les tests.
    """
    db.create_all()
    yield
    db.session.remove()
    db.drop_all()


# ---------------------- USER ----------------------
def test_create_user(init_db):
    user = User(first_name="John", last_name="Doe", email="john@example.com", password="secret")
    db.session.add(user)
    db.session.commit()
    assert user.id is not None
    assert user.email == "john@example.com"


def test_update_user(init_db):
    user = User.query.first()
    user.first_name = "Jane"
    db.session.commit()
    assert user.first_name == "Jane"


# ---------------------- PLACE ----------------------
def test_create_place(init_db):
    user = User.query.first()
    place = Place(name="Test Place", description="Nice place", owner_id=user.id)
    db.session.add(place)
    db.session.commit()
    assert place.id is not None
    assert place.owner_id == user.id


# ---------------------- REVIEW ----------------------
def test_create_review(init_db):
    user = User.query.first()
    place = Place.query.first()
    review = Review(text="Great!", rating=5, user_id=user.id, place_id=place.id)
    db.session.add(review)
    db.session.commit()
    assert review.id is not None
    assert review.rating == 5


# ---------------------- AMENITY ----------------------
def test_create_amenity(init_db):
    amenity = Amenity(name="WiFi", description="High-speed internet")
    db.session.add(amenity)
    db.session.commit()
    assert amenity.id is not None
    assert amenity.name == "WiFi"
