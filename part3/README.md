# HBnB - Part 3

## ER Diagram (Entity-Relationship Diagram)

### Les tables :
- User
- Place
- Review
- Amenity
- Place_Amenity (table de liaison)

| Relation        | Type         |
| --------------- | ------------ |
| User → Place    | One-to-Many  |
| User → Review   | One-to-Many  |
| Place → Review  | One-to-Many  |
| Place ↔ Amenity | Many-to-Many |

```mermaid
erDiagram

USER {
    int id
    string first_name
    string last_name
    string email
    string password
    boolean is_admin
}

PLACE {
    int id
    string title
    string description
    float price
    float latitude
    float longitude
    int owner_id
}

REVIEW {
    int id
    string text
    int rating
    int user_id
    int place_id
}

AMENITY {
    int id
    string name
}

PLACE_AMENITY {
    int place_id
    int amenity_id
}

USER ||--o{ PLACE : owns
USER ||--o{ REVIEW : writes
PLACE ||--o{ REVIEW : receives

PLACE ||--o{ PLACE_AMENITY : has
AMENITY ||--o{ PLACE_AMENITY : included_in
```
