#!/usr/bin/python3

from app.extensions import db
from app.models.user import User
from app.models.place import Place
from app.models.review import Review
from app.models.amenity import Amenity

from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.exc import IntegrityError


class HBnBFacade:
    """
    Facade pour gérer les opérations CRUD de l'application.
    """

    # ---------------------- USERS ---------------------- #

    @staticmethod
    def create_user(first_name, last_name, email, password, is_admin=False):
        hashed_password = generate_password_hash(password)

        user = User(
            first_name=first_name,
            last_name=last_name,
            email=email.lower(),
            password=hashed_password,
            is_admin=is_admin
        )

        db.session.add(user)

        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            raise ValueError("A user with this email already exists.")

        return user

    @staticmethod
    def get_user_by_id(user_id):
        return User.query.get(user_id)

    @staticmethod
    def get_user_by_email(email):
        return User.query.filter_by(email=email.lower()).first()

    @staticmethod
    def update_user(user_id, **kwargs):
        user = Facade.get_user_by_id(user_id)

        if not user:
            return None

        for key, value in kwargs.items():
            if key == "password":
                setattr(user, key, generate_password_hash(value))
            elif hasattr(user, key):
                setattr(user, key, value)

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise

        return user

    @staticmethod
    def delete_user(user_id):
        user = Facade.get_user_by_id(user_id)

        if not user:
            return False

        try:
            db.session.delete(user)
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise

        return True

    @staticmethod
    def authenticate_user(email, password):
        user = Facade.get_user_by_email(email)

        if user and check_password_hash(user.password, password):
            return user

        return None

    # ---------------------- PLACES ---------------------- #

    @staticmethod
    def create_place(title, description, price, latitude, longitude):
        place = Place(
            title=title,
            description=description,
            price=price,
            latitude=latitude,
            longitude=longitude
        )

        db.session.add(place)

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise

        return place

    @staticmethod
    def get_place_by_id(place_id):
        return Place.query.get(place_id)

    @staticmethod
    def update_place(place_id, **kwargs):
        place = Facade.get_place_by_id(place_id)

        if not place:
            return None

        for key, value in kwargs.items():
            if hasattr(place, key):
                setattr(place, key, value)

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise

        return place

    @staticmethod
    def delete_place(place_id):
        place = Facade.get_place_by_id(place_id)

        if not place:
            return False

        try:
            db.session.delete(place)
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise

        return True

    # ---------------------- REVIEWS ---------------------- #

    @staticmethod
    def create_review(text, rating):
        review = Review(text=text, rating=rating)

        db.session.add(review)

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise

        return review

    @staticmethod
    def get_review_by_id(review_id):
        return Review.query.get(review_id)

    @staticmethod
    def update_review(review_id, **kwargs):
        review = Facade.get_review_by_id(review_id)

        if not review:
            return None

        for key, value in kwargs.items():
            if hasattr(review, key):
                setattr(review, key, value)

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise

        return review

    @staticmethod
    def delete_review(review_id):
        review = Facade.get_review_by_id(review_id)

        if not review:
            return False

        try:
            db.session.delete(review)
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise

        return True

    # ---------------------- AMENITIES ---------------------- #

    @staticmethod
    def create_amenity(name):
        amenity = Amenity(name=name)

        db.session.add(amenity)

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise

        return amenity

    @staticmethod
    def get_amenity_by_id(amenity_id):
        return Amenity.query.get(amenity_id)

    @staticmethod
    def update_amenity(amenity_id, **kwargs):
        amenity = Facade.get_amenity_by_id(amenity_id)

        if not amenity:
            return None

        for key, value in kwargs.items():
            if hasattr(amenity, key):
                setattr(amenity, key, value)

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise

        return amenity

    @staticmethod
    def delete_amenity(amenity_id):
        amenity = Facade.get_amenity_by_id(amenity_id)

        if not amenity:
            return False

        try:
            db.session.delete(amenity)
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise

        return True
