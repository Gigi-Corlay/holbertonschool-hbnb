-- ---------------------------
-- Insert Admin User
-- ---------------------------
INSERT INTO User (id, first_name, last_name, email, password, is_admin)
VALUES (
    '36c9050e-ddd3-4c3b-9731-9f487208bbc1',
    'Admin',
    'HBnB',
    'admin@hbnb.io',
    '$2b$12$uI6QX6K9k8kfjwJzv23nYu8x2LlJ3x5yKqQpwzFhLq1Vt7yB2H8cC', -- exemple hash bcrypt
    TRUE
);

-- ---------------------------
-- Insert Initial Amenities
-- ---------------------------
INSERT INTO Amenity (id, name) VALUES
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'WiFi'),
('550e8400-e29b-41d4-a716-446655440000', 'Swimming Pool'),
('c9bf9e57-1685-4c89-bafb-ff5af830be8a', 'Air Conditioning');
