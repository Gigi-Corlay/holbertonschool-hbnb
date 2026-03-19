# HBnB Project – Part 3  
## Backend amélioré avec authentification et base de données

## Présentation

Dans **la partie 3 du projet HBnB**, le backend est amélioré afin d’ajouter :

- L’authentification des utilisateurs avec JWT
- La gestion des rôles (Admin / Utilisateur)
- Une base de données persistante
- L’utilisation de SQLAlchemy comme ORM
- SQLite pour le développement et MySQL pour la production

Dans les parties précédentes, les données étaient stockées **en mémoire**.  
Cela signifie que **toutes les données étaient perdues lorsque le serveur redémarrait**.

Dans cette partie, l'application devient **plus réaliste et plus proche d’un backend utilisé en production**.

---

# Objectifs du projet

Les principaux objectifs de cette partie sont :

- Implémenter l’authentification JWT
- Mettre en place un contrôle d’accès basé sur les rôles
- Remplacer le stockage en mémoire par une base de données
- Utiliser SQLAlchemy ORM
- Utiliser SQLite pour le développement
- Préparer l'application pour MySQL en production
- Concevoir et visualiser le schéma de base de données
- Assurer la cohérence et la validation des données

---

# Concepts importants

## Authentification

L’authentification permet de **vérifier l’identité d’un utilisateur**.

Le projet utilise **JWT (JSON Web Token)** pour gérer les sessions utilisateur.

### Fonctionnement

Utilisateur se connecte
        ↓
Le serveur vérifie les identifiants
        ↓
Le serveur génère un token JWT
        ↓
Le client stocke le token
        ↓
Le client envoie le token dans les requêtes protégées


| Action                            | Utilisateur | Admin |
| --------------------------------- | ----------- | ----- |
| Créer un logement                 | ✅           | ✅     |
| Modifier son logement             | ✅           | ✅     |
| Supprimer n’importe quel logement | ❌           | ✅     |
| Créer des utilisateurs            | ❌           | ✅     |
| Gérer les équipements             | ❌           | ✅     |
