#!/usr/bin/python3
from abc import ABC, abstractmethod


class Repository(ABC):
    """
    Interface abstraite pour un repository CRUD
    """

    @abstractmethod
    def add(self, obj):
        """
        Ajouter un objet
        """
        pass

    @abstractmethod
    def get(self, obj_id):
        """
        Récupérer un objet par son ID
        """
        pass

    @abstractmethod
    def get_all(self):
        """
        Récupérer tous les objets
        """
        pass

    @abstractmethod
    def update(self, obj_id, data):
        """Mettre à jour un objet par son ID"""
        pass

    @abstractmethod
    def delete(self, obj_id):
        """
        Supprimer un objet par son ID
        """
        pass

    @abstractmethod
    def get_by_attribute(self, attr_name, attr_value):
        """
        Récupérer un objet par un attribut spécifique
        """
        pass


class InMemoryRepository(Repository):
    """
    Implémentation en mémoire du repository CRUD
    """

    def __init__(self):
        self._storage = {}

    def add(self, obj):
        self._storage[obj.id] = obj
        return obj

    def get(self, obj_id):
        return self._storage.get(obj_id)

    def get_all(self):
        return list(self._storage.values())

    def update(self, obj_id, data):
        obj = self.get(obj_id)
        if obj:
            # Mise à jour sûre : utilise setattr pour chaque attribut
            for key, value in data.items():
                setattr(obj, key, value)
            return obj
        return None

    def delete(self, obj_id):
        if obj_id in self._storage:
            del self._storage[obj_id]

    def get_by_attribute(self, attr_name, attr_value):
        """
        Récupère le premier objet dont l'attribut correspond
        """
        return next(
            (obj for obj in self._storage.values()
             if getattr(obj, attr_name, None) == attr_value),
            None
        )
