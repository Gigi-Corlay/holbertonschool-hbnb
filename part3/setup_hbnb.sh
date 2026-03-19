#!/bin/bash

# Variables
DB_NAME="hbnb_db"
DB_USER="root"
DB_PASS="ton_mot_de_passe"

# 1. Créer la base de données
mysql -u "$DB_USER" -p"$DB_PASS" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"

# 2. Créer les tables et insérer les données
mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" <<EOF
-- Table User
CREATE TABLE IF NOT EXISTS User (
    id CHAR(36) PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    is_admin BOOLEAN DEFAULT FALSE
);

-- Table Place
CREATE TABLE IF NOT EXISTS Place (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    price DECIMAL(10,2),
    latitude FLOAT,
    longitude FLOAT,
    owner_id CHAR(36),
    CONSTRAINT fk_place_owner FOREIGN KEY (owner_id)
        REFERENCES User(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- Table Review
CREATE TABLE IF NOT EXISTS Review (
    id CHAR(36) PRIMARY KEY,
    text TEXT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    user_id CHAR(36),
    place_id CHAR(36),
    CONSTRAINT fk_review_user FOREIGN KEY (user_id)
        REFERENCES User(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_review_place FOREIGN KEY (place_id)
        REFERENCES Place(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT unique_review UNIQUE (user_id, place_id)
);

-- Table Amenity
CREATE TABLE IF NOT EXISTS Amenity (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) UNIQUE
);

-- Table Place_Amenity
CREATE TABLE IF NOT EXISTS Place_Amenity (
    place_id CHAR(36),
    amenity_id CHAR(36),
    PRIMARY KEY (place_id, amenity_id),
    CONSTRAINT fk_pa_place FOREIGN KEY (place_id)
        REFERENCES Place(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_pa_amenity FOREIGN KEY (amenity_id)
        REFERENCES Amenity(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Insérer l'admin
INSERT INTO User (id, first_name, last_name, email, password, is_admin)
VALUES ('36c9050e-ddd3-4c3b-9731-9f487208bbc1', 'Admin', 'HBnB', 'admin@hbnb.io', '\$2b\$12\$uI6QX6K9k8kfjwJzv23nYu8x2LlJ3x5yKqQpwzFhLq1Vt7yB2H8cC', TRUE);

-- Insérer les amenities
INSERT INTO Amenity (id, name) VALUES
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'WiFi'),
('550e8400-e29b-41d4-a716-446655440000', 'Swimming Pool'),
('c9bf9e57-1685-4c89-bafb-ff5af830be8a', 'Air Conditioning');
EOF

echo "Base de données et tables créées, données initiales insérées."
