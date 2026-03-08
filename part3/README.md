# HBnB - Part 2: Business Logic & API Endpoints
## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Models](#models)
- [API Endpoints](#api-endpoints)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Running the Tests](#running-the-tests)
- [Authors](#authors)

---

## Overview

**HBnB** is a simplified AirBnB clone developed as part of the Holberton School curriculum. This is **Part 2** of the project, which focuses on implementing the **Business Logic layer** and exposing it through a **RESTful API** built with Flask-RestX.

The application uses an **in-memory repository** for data persistence. This will be replaced by a SQL database-backed solution in Part 3.

Key design principle: all communication between the API layer and the business logic goes through a **Facade pattern**, which centralizes data operations and validation.

---

## Architecture

The project follows a **3-layer architecture**:

```
Presentation Layer  →  API endpoints (Flask-RestX)
        ↓
Business Logic Layer  →  Facade + Models
        ↓
Persistence Layer  →  In-Memory Repository
```

The **Facade** (`app/services/facade.py`) acts as a single entry point between the API and the models, handling validation, object creation, and data retrieval.

---

## Project Structure

```
part2/
├── app/
│   ├── __init__.py           # App factory (create_app)
│   ├── api/
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── users.py      # User endpoints
│   │       ├── places.py     # Place endpoints
│   │       ├── reviews.py    # Review endpoints
│   │       └── amenities.py  # Amenity endpoints
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base_model.py     # Base class with id, created_at, updated_at
│   │   ├── user.py
│   │   ├── place.py
│   │   ├── review.py
│   │   └── amenity.py
│   ├── services/
│   │   ├── __init__.py
│   │   └── facade.py         # HBnBFacade — central business logic
│   ├── persistence/
│   │   ├── __init__.py
│   │   └── repository.py     # InMemoryRepository
│   └── tests/
│       ├── __init__.py
│       └── test_models.py    # Full API test suite (54 tests)
├── run.py                    # Application entry point
├── config.py                 # Environment configuration
├── requirements.txt
└── README.md
```

---

## Models

### User
| Attribute    | Type    | Constraints                        |
|--------------|---------|------------------------------------|
| `first_name` | string  | Required, max 50 chars             |
| `last_name`  | string  | Required, max 50 chars             |
| `email`      | string  | Required, valid format, unique     |
| `password`   | string  | Optional                           |
| `is_admin`   | boolean | Default: False                     |

### Place
| Attribute     | Type   | Constraints                        |
|---------------|--------|------------------------------------|
| `title`       | string | Required, max 100 chars            |
| `description` | string | Optional                           |
| `price`       | float  | Required, must be positive         |
| `latitude`    | float  | Required, between -90 and 90       |
| `longitude`   | float  | Required, between -180 and 180     |
| `owner_id`    | string | Required, must reference valid User|

### Review
| Attribute  | Type    | Constraints                          |
|------------|---------|--------------------------------------|
| `text`     | string  | Required                             |
| `rating`   | integer | Required, between 1 and 5            |
| `user_id`  | string  | Required, must reference valid User  |
| `place_id` | string  | Required, must reference valid Place |

### Amenity
| Attribute | Type   | Constraints                   |
|-----------|--------|-------------------------------|
| `name`    | string | Required, max 50 chars, unique|

---

## API Endpoints

All endpoints are prefixed with `/api/v1`. The interactive Swagger documentation is available at `http://127.0.0.1:5000/api/v1/`.

### Users — `/api/v1/users/`

| Method | Endpoint             | Description          | Success | Error       |
|--------|----------------------|----------------------|---------|-------------|
| POST   | `/users/`            | Create a new user    | 201     | 400         |
| GET    | `/users/`            | List all users       | 200     | —           |
| GET    | `/users/<id>`        | Get user by ID       | 200     | 404         |
| PUT    | `/users/<id>`        | Update user          | 200     | 400, 404    |

### Amenities — `/api/v1/amenities/`

| Method | Endpoint             | Description          | Success | Error       |
|--------|----------------------|----------------------|---------|-------------|
| POST   | `/amenities/`        | Create a new amenity | 201     | 400         |
| GET    | `/amenities/`        | List all amenities   | 200     | —           |
| GET    | `/amenities/<id>`    | Get amenity by ID    | 200     | 404         |
| PUT    | `/amenities/<id>`    | Update amenity       | 200     | 400, 404    |

### Places — `/api/v1/places/`

| Method | Endpoint                  | Description               | Success | Error    |
|--------|---------------------------|---------------------------|---------|----------|
| POST   | `/places/`                | Create a new place        | 201     | 400      |
| GET    | `/places/`                | List all places           | 200     | —        |
| GET    | `/places/<id>`            | Get place by ID           | 200     | 404      |
| PUT    | `/places/<id>`            | Update place              | 200     | 400, 404 |
| GET    | `/places/<id>/reviews`    | Get all reviews for place | 200     | 404      |

### Reviews — `/api/v1/reviews/`

| Method | Endpoint             | Description          | Success | Error       |
|--------|----------------------|----------------------|---------|-------------|
| POST   | `/reviews/`          | Create a new review  | 201     | 400         |
| GET    | `/reviews/`          | List all reviews     | 200     | —           |
| GET    | `/reviews/<id>`      | Get review by ID     | 200     | 404         |
| PUT    | `/reviews/<id>`      | Update review        | 200     | 400, 404    |
| DELETE | `/reviews/<id>`      | Delete review        | 200     | 404         |

---

## Installation

**Requirements:** Python 3.8+

Clone the repository and navigate to the project folder:

```bash
git clone https://github.com/juliangf94/holbertonschool-hbnb.git
cd holbertonschool-hbnb/part2
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

Set up the environment variables by copying the example file:

```bash
cp .env.example .env
```

---

## Running the Application

```bash
python3 run.py
```

The API will be available at `http://127.0.0.1:5000`.
The Swagger UI documentation is available at `http://127.0.0.1:5000/api/v1/`.

---

## Running the Tests

The test suite covers all 17 API routes with 54 tests including success responses (20X), error responses (40X), and edge cases. The Flask test client is used internally — **no need to run the server** before executing the tests.

```bash
python3 -m pytest app/tests/test_models.py -v
```

Expected output:

```
54 passed in 0.37s
```

---

## Authors

-   **Fabien Cousin** — [cousinfabien](https://github.com/cousinfabien)/<https://github.com/cousinfabien>
-   **Georgia Boulnois** —  [Gigi-Corlay](https://github.com/Gigi-Corlay)/<https://github.com/Gigi-Corlay>
-   **Julian Gonzalez** — [juliangf94](https://github.com/juliangf94)/<https://github.com/Gigi-Corlay>

*Holberton School — 2025/2026*
