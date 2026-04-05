# HBnB — Front-End Web Client & End-to-End API Integration

## 📚 Table of Contents

- [📌 Project Context](#-project-context)
- [📌 Overview](#-overview)
- [📊 Project at a Glance](#-project-at-a-glance)
- [✨ Main Features](#-main-features)
- [🏗️ Architecture Overview](#️-architecture-overview)
- [🗂️ Project Structure](#️-project-structure)
- [🛠️ Tech Stack](#️-tech-stack)
- [📦 Installation](#-installation)
- [🚀 Running the Application](#-running-the-application)
- [🔐 Authentication](#-authentication)
- [👤 Demo Accounts](#-demo-accounts)
- [🖥️ Front-End Pages](#️-front-end-pages)
- [🌐 API Endpoints](#-api-endpoints)
  - [Auth](#auth)
  - [Places](#places)
  - [Reviews](#reviews)
- [🎨 UI / UX Highlights](#-ui--ux-highlights)
- [🗃️ Demo Data](#️-demo-data)
- [⚙️ Configuration](#️-configuration)
- [📎 Notes](#-notes)
- [👥 Authors](#-authors)

---

## 📌 Project Context

This project is a front-end client for an Airbnb-inspired application. It connects to a REST API backend to:

- List accommodations
- Show detailed place pages
- Handle user login and JWT authentication
- Allow authenticated users to submit reviews

It demonstrates end-to-end integration between a front-end client and a RESTful API while providing a responsive, user-friendly interface.

---

## 📌 Overview

The front-end client includes:

- Responsive multi-page interface
- JWT-based login for users
- Dynamic place listing and filtering
- Detailed place pages with review summaries
- Review submission for authenticated users
- Fallback data in case the API is unavailable

---

## 📊 Project at a Glance

- **HTML pages**: `index.html`, `place.html`, `login.html`
- **JavaScript files**: `scripts.js`, `place.js`
- **CSS files**: `styles.css`
- **Images**: avatars, place images, backgrounds
- **Fallback data**: predefined places for offline use
- **API endpoints**: `/auth/login`, `/places`, `/places/<id>/reviews`

---

## ✨ Main Features

- **JWT authentication** with secure login
- **Dynamic place catalog** with cards and pricing
- **Detailed place pages** with images, reviews, and host info
- **Authenticated review creation**
- **Responsive UI** for mobile and desktop
- **Price filter** for browsing places
- **Fallback data** for offline usage

---

## 🐍 Back-End Setup (Flask API)

The project uses a Flask REST API with Flask-RESTX and Flask-CORS.

### 1. Create a virtual environment

```bash
python3 -m venv venv
```

### 2. Activate the virtual environment

**Linux / Mac**
```bash
source venv/bin/activate
```

**Windows**
```bash
venv\Scripts\activate
```
### 3. Install dependencies
```bash
pip install flask flask-restx flask-cors
```
Or if you have a requirements file:
```bash
pip install -r requirements.txt
```

###  4. Run the Flask API
```bash
python3 app.py
```
The API should run on:
```
http://127.0.0.1:5000
```

---

## 🔗 Front-End + Back-End Workflow

To run the full project:

### Start the Flask API:
```bash
python3 app.py
```

### Start the front-end server:
```
python3 -m http.server 5500
```

### Open in your browser:

```
http://127.0.0.1:5500/index.html
```

The front-end will communicate with the API at:
```
http://127.0.0.1:5000/api/v1/
```
---

# Et ta section Authors à corriger en Markdown

```markdown
## 👥 Authors

- **Your Name**
- HBnB Project — Holberton School

---

## 🏗️ Architecture Overview

### Front end

- HTML pages with static structure
- CSS for layout, cards, forms, and hero sections
- JavaScript handles:
  - Authentication and cookies
  - Fetching data from API
  - Rendering places and reviews
  - Form submission and validation
  - Dynamic filtering

### Back end

- REST API providing endpoints for authentication, places, and reviews
- JWT used for protected routes

---

## 🗂️ Project Structure

```bash
project/
├── index.html
├── place.html
├── login.html
├── scripts.js
├── place.js
├── styles.css
├── images/
│   ├── avatars/
│   ├── places/
│   └── backgrounds/
└── README.md

---

## 🛠️ Tech Stack
- HTML5
- CSS3
- JavaScript (ES6)
- Fetch API for REST requests
- JWT for authentication
- Optional backend: Flask API or any REST server

---

## Python Dependencies

Main backend dependencies:

- Flask
- Flask-RESTX
- Flask-CORS
- Flask-JWT-Extended
- Flask-Bcrypt

---

## 📦 Installation

### 2. Clone the repository

```bash
git clone https://github.com/yourusername/hbnb-frontend.git
cd hbnb-frontend
```

### 2. Serve files locally (using VS Code Live Server, Python, or any static server):

```bash
Python 3 example
python3 -m http.server 5500
```
### 3. Open http://127.0.0.1:5500/index.html in your browser.

---

##  🚀 Running the Application
- Navigate to the homepage to view the catalog
- Click on a place to see detailed info
- Log in to submit a review
- Reviews are dynamically added without page reload

---

🔐 Authentication
- Login via login.html using email and password
- JWT token is stored in cookies for authenticated flows
- Protected actions (like review submission) require the JWT

---

## 👤 Demo Accounts

Example demo account:

| Role | Email           | Password  |
|------|-----------------|-----------|
| User | test@test.com   | test      |

---

## 🖥️ Front-End Pages

| File        | Purpose                              |
|-------------|--------------------------------------|
| index.html  | Catalog of places                    |
| place.html  | Detailed view of a place             |
| login.html  | Login form                           |
| scripts.js  | Main front-end logic                 |
| place.js    | Place page logic and fallback data   |
| styles.css  | Global styles                        |

---

## 🌐 API Endpoints

### Auth

| Method | Endpoint      | Auth   | Description                    |
|--------|--------------|--------|--------------------------------|
| POST   | /auth/login  | Public | Login user and receive JWT     |

### Places

| Method | Endpoint       | Auth   | Description         |
|--------|---------------|--------|---------------------|
| GET    | /places       | Public | List all places     |
| GET    | /places/<id>  | Public | Get place details   |

### Reviews

| Method | Endpoint                 | Auth         | Description        |
|--------|--------------------------|--------------|--------------------|
| POST   | /places/<id>/reviews     | JWT required | Submit a review    |

---

## 🎨 UI / UX Highlights

The front-end interface is built using **Bootstrap 5** along with custom CSS to create a responsive and user-friendly design.

### UI Features

- Responsive layout using Bootstrap grid system
- Modern cards for places and reviews
- Styled forms and buttons with Bootstrap components
- Hero sections with background images
- Dynamic price filtering
- Star rating display for reviews
- Form validation and user feedback

---

## 🗃️ Demo Data
- 3 fallback places
- Default avatars and images
- Predefined prices for offline testing
- Reviews dynamically generated upon submission

---

## ⚙️ Configuration
- API URL defined in scripts.js:

```JavaScript
const API_URL = 'http://127.0.0.1:5000/api/v1';
```

- JWT stored in cookies for authentication
- Fallback data used if API is unavailable

---

##  📎 Notes
- Ensure the backend API is running before testing review submission
- Reset the browser cookies to log in as a different user
- Use the fallback data to test the UI without a backend

---

👥 Authors
- Georgia Boulnois
- HBnB Project — Holberton School
