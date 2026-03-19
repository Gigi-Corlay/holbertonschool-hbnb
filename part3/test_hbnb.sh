#!/bin/bash

# On suppose que vous êtes déjà dans part3
PROJECT_DIR=$(pwd)

# Supprimer l'ancienne base de données
if [ -f "instance/development.db" ]; then
    echo "Suppression de l'ancienne DB..."
    rm instance/development.db
fi

# Activer l'environnement virtuel (optionnel si déjà activé)
echo "Activation du venv..."
source venv/bin/activate

# Lancer Flask en arrière-plan
echo "Démarrage du serveur Flask..."
export FLASK_APP=run.py
export FLASK_ENV=development
flask run > flask.log 2>&1 &

# Récupérer le PID pour pouvoir le tuer après le test
FLASK_PID=$!
echo "Flask lancé avec PID $FLASK_PID, attente 3 secondes..."
sleep 3

# Test login
echo "Test login..."
LOGIN_RESPONSE=$(curl -s -X POST "http://127.0.0.1:5000/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"john.doe@example.com","password":"your_password"}')

echo "Réponse login : $LOGIN_RESPONSE"

# Extraire le token du JSON
TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

# Test endpoint protégé
echo "Appel de /api/v1/protected avec le token..."
curl -s -X GET "http://127.0.0.1:5000/api/v1/protected" \
    -H "Authorization: Bearer $TOKEN"

# Arrêter le serveur Flask
echo -e "\nArrêt du serveur Flask..."
kill $FLASK_PID
