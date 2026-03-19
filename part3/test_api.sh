#!/bin/bash
# =============================================================================
# Script de test API HBnB - Part 3
# Usage: bash test_api.sh
# =============================================================================

BASE_URL="http://127.0.0.1:5000/api/v1"
# Reset DB avant chaque run
rm -f instance/development.db
python setup_db.py > /dev/null 2>&1


GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass=0
fail=0
get_body() { echo "$1" | sed '$d'; }
get_status() { echo "$1" | tail -n 1; }


# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------
check() {
    local description="$1"
    local expected="$2"
    local actual="$3"

    if echo "$actual" | grep -q "\"$expected\"" 2>/dev/null || \
       [ "$actual" = "$expected" ]; then
        echo -e "${GREEN}✅ PASS${NC} — $description"
        ((pass++))
    else
        echo -e "${RED}❌ FAIL${NC} — $description"
        echo -e "   Expected: $expected"
        echo -e "   Got:      $actual"
        ((fail++))
    fi
}

check_status() {
    local description="$1"
    local expected_code="$2"
    local actual_code="$3"
    local body="$4"

    if [ "$actual_code" = "$expected_code" ]; then
        echo -e "${GREEN}✅ PASS${NC} — $description (HTTP $actual_code)"
        ((pass++))
    else
        echo -e "${RED}❌ FAIL${NC} — $description"
        echo -e "   Expected HTTP $expected_code, got HTTP $actual_code"
        echo -e "   Body: $body"
        ((fail++))
    fi
}

section() {
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW} $1${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# -----------------------------------------------------------------------------
# 1. LOGIN ADMIN
# -----------------------------------------------------------------------------
section "1. AUTHENTIFICATION"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email": "admin@example.com", "password": "adminpass"}')

BODY=$(get_body "$RESPONSE")
STATUS=$(echo "$RESPONSE" | tail -n 1)

check_status "Login admin" "200" "$STATUS" "$BODY"
ADMIN_TOKEN=$(echo "$BODY" | python3 -c "import sys,json; d=json.loads(' '.join(sys.stdin.read().split())); print(d.get('access_token',''))")

if [ -z "$ADMIN_TOKEN" ]; then
    echo -e "${RED}⛔ Token admin introuvable — vérifiez que le serveur tourne et que l'admin existe${NC}"
    echo -e "${YELLOW}   Lancez d'abord: python setup_db.py${NC}"
    exit 1
fi
echo "   Token admin: ${ADMIN_TOKEN:0:30}..."

# -----------------------------------------------------------------------------
# 2. USERS
# -----------------------------------------------------------------------------
section "2. USERS"

# POST /users/ - Créer un user (admin)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/users/" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d '{"email": "newuser@example.com", "first_name": "John", "last_name": "Doe", "password": "password123"}')
BODY=$(get_body "$RESPONSE")
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "POST /users/ - Créer user (admin)" "201" "$STATUS" "$BODY"
USER_ID=$(echo "$BODY" | python3 -c "import sys,json; d=json.loads(' '.join(sys.stdin.read().split())); print(d.get('id',''))" 2>/dev/null)
echo "   User ID: $USER_ID"

# POST /users/ - Sans token (401)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/users/" \
    -H "Content-Type: application/json" \
    -d '{"email": "noauth@example.com", "first_name": "No", "last_name": "Auth", "password": "pass"}')
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "POST /users/ - Sans token (401)" "401" "$STATUS"

# POST /users/ - Email dupliqué (400)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/users/" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d '{"email": "newuser@example.com", "first_name": "John", "last_name": "Doe", "password": "password123"}')
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "POST /users/ - Email dupliqué (400)" "400" "$STATUS"

# POST /users/ - Email invalide (400)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/users/" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d '{"email": "not-an-email", "first_name": "Bad", "last_name": "Email", "password": "pass"}')
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "POST /users/ - Email invalide (400)" "400" "$STATUS"

# GET /users/ - Lister (admin)
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/users/" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "GET /users/ - Lister (admin)" "200" "$STATUS"

# GET /users/:id
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/users/$USER_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "GET /users/:id - Existant (200)" "200" "$STATUS"

# GET /users/:id - Inexistant (404)
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/users/nonexistent-id" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "GET /users/:id - Inexistant (404)" "404" "$STATUS"

# Obtenir le token du user créé
RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email": "newuser@example.com", "password": "password123"}')
USER_TOKEN=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.loads(' '.join(sys.stdin.read().split())); print(d.get('access_token',''))")
echo "   Token user: ${USER_TOKEN:0:30}..."

# PUT /users/:id - Update par l'owner (200)
RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/users/$USER_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $USER_TOKEN" \
    -d '{"email": "updatedemail@example.com", "first_name": "Johnny", "last_name": "Doe"}')
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "PUT /users/:id - Update par owner (200)" "200" "$STATUS"

# PUT /users/:id - Email déjà utilisé (400)
RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/users/$USER_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $USER_TOKEN" \
    -d '{"email": "admin@example.com"}')
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "PUT /users/:id - Email déjà pris (400)" "400" "$STATUS"

# PUT /users/:id - Inexistant (404)
RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/users/nonexistent-id" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d '{"first_name": "Ghost"}')
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "PUT /users/:id - Inexistant (404)" "404" "$STATUS"

# -----------------------------------------------------------------------------
# 3. AMENITIES
# -----------------------------------------------------------------------------
section "3. AMENITIES"

# POST /amenities/ - Créer (admin)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/amenities/" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d '{"name": "Swimming Pool"}')
BODY=$(get_body "$RESPONSE")
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "POST /amenities/ - Créer (admin) (201)" "201" "$STATUS" "$BODY"
AMENITY_ID=$(echo "$BODY" | python3 -c "import sys,json; d=json.loads(' '.join(sys.stdin.read().split())); print(d.get('id',''))" 2>/dev/null)
echo "   Amenity ID: $AMENITY_ID"

# POST /amenities/ - Sans token (401)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/amenities/" \
    -H "Content-Type: application/json" \
    -d '{"name": "Sauna"}')
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "POST /amenities/ - Sans token (401)" "401" "$STATUS"

# POST /amenities/ - Nom vide (400)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/amenities/" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d '{"name": ""}')
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "POST /amenities/ - Nom vide (400)" "400" "$STATUS"

# POST /amenities/ - Doublon (400)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/amenities/" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d '{"name": "Swimming Pool"}')
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "POST /amenities/ - Doublon (400)" "400" "$STATUS"

# GET /amenities/ - Public (200)
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/amenities/")
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "GET /amenities/ - Public (200)" "200" "$STATUS"

# GET /amenities/:id (200)
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/amenities/$AMENITY_ID")
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "GET /amenities/:id - Existant (200)" "200" "$STATUS"

# GET /amenities/:id - Inexistant (404)
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/amenities/nonexistent-id")
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "GET /amenities/:id - Inexistant (404)" "404" "$STATUS"

# PUT /amenities/:id - Update (admin) (200)
RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/amenities/$AMENITY_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d '{"name": "Updated Amenity"}')
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "PUT /amenities/:id - Update (admin) (200)" "200" "$STATUS"

# PUT /amenities/:id - Inexistant (404)
RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/amenities/nonexistent-id" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d '{"name": "Ghost"}')
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "PUT /amenities/:id - Inexistant (404)" "404" "$STATUS"

# -----------------------------------------------------------------------------
# 4. PLACES
# -----------------------------------------------------------------------------
section "4. PLACES"

# POST /places/ - Créer (200)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/places/" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $USER_TOKEN" \
    -d "{\"title\": \"Cozy Apartment\", \"description\": \"Nice place\", \"price\": 120.0, \"latitude\": 48.8566, \"longitude\": 2.3522, \"owner_id\": \"$USER_ID\"}")
BODY=$(get_body "$RESPONSE")
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "POST /places/ - Créer (201)" "201" "$STATUS" "$BODY"
PLACE_ID=$(echo "$BODY" | python3 -c "import sys,json; d=json.loads(' '.join(sys.stdin.read().split())); print(d.get('id',''))" 2>/dev/null)
echo "   Place ID: $PLACE_ID"

# POST /places/ - Prix négatif (400)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/places/" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $USER_TOKEN" \
    -d "{\"title\": \"Bad Price\", \"price\": -50.0, \"latitude\": 48.8566, \"longitude\": 2.3522, \"owner_id\": \"$USER_ID\"}")
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "POST /places/ - Prix négatif (400)" "400" "$STATUS"

# POST /places/ - Latitude invalide (400)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/places/" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $USER_TOKEN" \
    -d "{\"title\": \"Bad Lat\", \"price\": 100.0, \"latitude\": 999.0, \"longitude\": 2.3522, \"owner_id\": \"$USER_ID\"}")
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "POST /places/ - Latitude invalide (400)" "400" "$STATUS"

# GET /places/ - Public (200)
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/places/")
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "GET /places/ - Public (200)" "200" "$STATUS"

# GET /places/:id (200)
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/places/$PLACE_ID")
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "GET /places/:id - Existant (200)" "200" "$STATUS"

# GET /places/:id - Inexistant (404)
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/places/nonexistent-id")
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "GET /places/:id - Inexistant (404)" "404" "$STATUS"

# PUT /places/:id - Update par owner (200)
RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/places/$PLACE_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $USER_TOKEN" \
    -d "{\"title\": \"Updated Apartment\", \"price\": 150.0, \"latitude\": 48.8566, \"longitude\": 2.3522, \"owner_id\": \"$USER_ID\"}")
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "PUT /places/:id - Update owner (200)" "200" "$STATUS"

# DELETE /places/:id - Par owner (200)
RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/places/$PLACE_ID" \
    -H "Authorization: Bearer $USER_TOKEN")
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "DELETE /places/:id - Par owner (200)" "200" "$STATUS"

# DELETE /places/:id - Déjà supprimé (404)
RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/places/$PLACE_ID" \
    -H "Authorization: Bearer $USER_TOKEN")
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "DELETE /places/:id - Déjà supprimé (404)" "404" "$STATUS"

# -----------------------------------------------------------------------------
# 5. REVIEWS
# -----------------------------------------------------------------------------
section "5. REVIEWS"

# Recréer une place pour les reviews
RESPONSE=$(curl -s -X POST "$BASE_URL/places/" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $USER_TOKEN" \
    -d "{\"title\": \"Review Test Place\", \"price\": 100.0, \"latitude\": 48.8566, \"longitude\": 2.3522, \"owner_id\": \"$USER_ID\"}")
BODY=$(get_body "$RESPONSE")
PLACE_ID=$(echo "$BODY" | python3 -c "import sys,json; d=json.loads(' '.join(sys.stdin.read().split())); print(d.get('id',''))" 2>/dev/null)

# Créer un second user pour reviewer
RESPONSE=$(curl -s -X POST "$BASE_URL/users/" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d '{"email": "reviewer@example.com", "first_name": "Jane", "last_name": "Smith", "password": "password123"}')
RESPONSE2=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email": "reviewer@example.com", "password": "password123"}')
USER_TOKEN_2=$(echo "$RESPONSE2" | python3 -c "import sys,json; d=json.loads(' '.join(sys.stdin.read().split())); print(d.get('access_token',''))")

# POST /reviews/ - Créer (201)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/reviews/" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $USER_TOKEN_2" \
    -d "{\"text\": \"Great place!\", \"rating\": 4, \"place_id\": \"$PLACE_ID\"}")
BODY=$(get_body "$RESPONSE")
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "POST /reviews/ - Créer (201)" "201" "$STATUS" "$BODY"
REVIEW_ID=$(echo "$BODY" | python3 -c "import sys,json; d=json.loads(' '.join(sys.stdin.read().split())); print(d.get('id',''))" 2>/dev/null)
echo "   Review ID: $REVIEW_ID"

# POST /reviews/ - Rating invalide (400)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/reviews/" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $USER_TOKEN_2" \
    -d "{\"text\": \"Bad rating\", \"rating\": 0, \"place_id\": \"$PLACE_ID\"}")
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "POST /reviews/ - Rating 0 (400)" "400" "$STATUS"

# POST /reviews/ - Sans token (401)
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/reviews/" \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"No auth\", \"rating\": 3, \"place_id\": \"$PLACE_ID\"}")
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "POST /reviews/ - Sans token (401)" "401" "$STATUS"

# GET /reviews/ - Public (200)
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/reviews/")
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "GET /reviews/ - Public (200)" "200" "$STATUS"

# GET /reviews/:id (200)
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/reviews/$REVIEW_ID")
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "GET /reviews/:id - Existant (200)" "200" "$STATUS"

# PUT /reviews/:id - Update owner (200)
RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/reviews/$REVIEW_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $USER_TOKEN_2" \
    -d "{\"text\": \"Updated review!\", \"rating\": 5, \"place_id\": \"$PLACE_ID\"}")
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "PUT /reviews/:id - Update owner (200)" "200" "$STATUS"

# PUT /reviews/:id - Non-owner (403)
RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/reviews/$REVIEW_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $USER_TOKEN" \
    -d "{\"text\": \"Hacked!\", \"rating\": 1, \"place_id\": \"$PLACE_ID\"}")
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "PUT /reviews/:id - Non-owner (403)" "403" "$STATUS"

# DELETE /reviews/:id - Owner (200)
RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/reviews/$REVIEW_ID" \
    -H "Authorization: Bearer $USER_TOKEN_2")
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "DELETE /reviews/:id - Owner (200)" "200" "$STATUS"

# DELETE /reviews/:id - Déjà supprimé (404)
RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/reviews/$REVIEW_ID" \
    -H "Authorization: Bearer $USER_TOKEN_2")
STATUS=$(echo "$RESPONSE" | tail -n 1)
check_status "DELETE /reviews/:id - Déjà supprimé (404)" "404" "$STATUS"

# -----------------------------------------------------------------------------
# RÉSUMÉ
# -----------------------------------------------------------------------------
section "RÉSUMÉ"
total=$((pass + fail))
echo -e "Total  : $total tests"
echo -e "${GREEN}Passés : $pass${NC}"
echo -e "${RED}Échoués: $fail${NC}"

if [ $fail -eq 0 ]; then
    echo -e "\n${GREEN}🎉 Tous les tests sont passés !${NC}"
else
    echo -e "\n${RED}⚠️  $fail test(s) ont échoué.${NC}"
fi
