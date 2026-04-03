const API_URL = 'http://127.0.0.1:5000/api/v1';
let currentPlace = null;

/* ======================
    COOKIE & AUTH
====================== */
function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [key, value] = cookie.trim().split('=');
        if (key === name) return value;
    }
    return null;
}

function isAuthenticated() {
    return !!getCookie('token');
}

function toggleLoginLink() {
    const loginLink = document.querySelector('.login-button');
    if (!loginLink) return;

    if (isAuthenticated()) {
        loginLink.textContent = 'Déconnexion';
        loginLink.href = '#';
        loginLink.onclick = () => {
            document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            window.location.href = 'index.html';
        };
    } else {
        loginLink.textContent = 'Connexion';
        loginLink.href = 'login.html';
        loginLink.onclick = null;
    }
}

/* ======================
    FALLBACK DATA
====================== */
const fallbackPlaces = [
        {
        id: 1,
        uuid: "7b4f5cc3-4bd8-4b6b-b721-c2306cd0ce01",
        name: "Beautiful Beach House",
        price_by_night: 55,
        description: "A beautiful beach house with amazing views",
        owner: { first_name: "John" },
        amenities: [{ name: "Wifi" }, { name: "Pool" }, { name: "Air Conditioning" }],
        reviews: [
        { user: { first_name: "Jane" }, text: "Great place!", rating: 4 },
        { user: { first_name: "Robert" }, text: "Amazing location.", rating: 5 }
        ],
        images: ["images/card_pool.jpg", "images/card_boad.jpg", "images/card_apartement.jpg"]
        },
        {
        id: 2,
        uuid: "e6dcb145-ce39-4dc4-8331-43f3fd401845",
        name: "Cozy Cabin",
        price_by_night: 100,
        description: "A beautiful cabin near Vannes harbor",
        owner: { first_name: "Tom" },
        amenities: [{ name: "Wifi" }, { name: "Air Conditioning" }],
        reviews: [{ user: { first_name: "Alice" }, text: "Very cozy!", rating: 4 }],
        images: ["images/card_boad.jpg", "images/card_pool.jpg"]
        },
        {
        id: 3,
        uuid: "9160d2f0-bd44-4b00-8eca-564337bbd031",
        name: "Modern Apartment",
        price_by_night: 200,
        description: "A modern apartment with breathtaking views",
        owner: { first_name: "David" },
        amenities: [
            { name: "Wifi" },
            { name: "Air Conditioning" },
            { name: "Home Cinema" },
            { name: "Jacuzzi" }
        ],
        reviews: [{ user: { first_name: "Eve" }, text: "Amazing place!", rating: 5 }],
        images: ["images/card_apartement.jpg", "images/card_pool.jpg"]
        }
    ];
    
    // Mapping UUID → fallback
    const fallbackPlacesByUUID = {};
    fallbackPlaces.forEach(p => {
        fallbackPlacesByUUID[p.uuid] = p;
    });
    
    function loadPlace() {
        const placeId = getPlaceIdFromURL();
        if (!placeId) return;
    
        currentPlace = fallbackPlacesByUUID[placeId] || fallbackPlaces[0];
    
        displayPlaceDetails(currentPlace);
        displayReviews(currentPlace.reviews || []);
        setupAddReviewForm();
    }
    
    document.addEventListener("DOMContentLoaded", () => {
        toggleLoginLink();
        loadPlace();
    });

/* ======================
    LOAD HTML REVIEWS
====================== */
async function loadReviewsSection() {
    const res = await fetch("place_review.html");
    const html = await res.text();
    document.getElementById("place-reviews").innerHTML = html;
}

/* ======================
    UTILS
====================== */
function createElement(tag, className = '', innerHTML = '') {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (innerHTML) el.innerHTML = innerHTML;
    return el;
}

function getPlaceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

async function loadPlace() {
    const placeId = getPlaceIdFromURL();
    if (!placeId) return;

    // Appel à l'API pour récupérer la place
    const res = await fetch(`http://localhost:5000/api/v1/places/${placeId}`);
    const place = await res.json();

    document.getElementById("place-title").textContent = place.title;
    document.getElementById("place-description").textContent = place.description;
    document.getElementById("place-price").textContent = `$${place.price}`;
    // et pour les images, amenities, reviews, etc.
}

/* ======================
    DISPLAY PLACE DETAILS
====================== */
function displayPlaceDetails(place) {
    const section = document.getElementById('place-details');
    if (!section) return;

    section.innerHTML = '';

    const title = createElement('h1', 'text-center mb-4', place.name);

    /* ===== CAROUSEL ===== */
    const carouselId = `carousel-${place.id}`;
    const carousel = createElement('div', 'carousel slide mb-4');
    carousel.id = carouselId;
    carousel.setAttribute('data-bs-ride', 'false');

    const carouselInner = createElement('div', 'carousel-inner');

    (place.images || []).forEach((imgSrc, index) => {
        const item = createElement('div', `carousel-item ${index === 0 ? 'active' : ''}`);
        const img = createElement('img', 'd-block w-100');
        img.src = imgSrc;
        img.style.height = '400px';
        img.style.objectFit = 'cover';

        item.appendChild(img);
        carouselInner.appendChild(item);
    });

    carousel.appendChild(carouselInner);

    const prevBtn = createElement('button', 'carousel-control-prev');
    prevBtn.type = 'button';
    prevBtn.setAttribute('data-bs-target', `#${carouselId}`);
    prevBtn.setAttribute('data-bs-slide', 'prev');
    prevBtn.innerHTML = `<span class="carousel-control-prev-icon"></span>`;

    const nextBtn = createElement('button', 'carousel-control-next');
    nextBtn.type = 'button';
    nextBtn.setAttribute('data-bs-target', `#${carouselId}`);
    nextBtn.setAttribute('data-bs-slide', 'next');
    nextBtn.innerHTML = `<span class="carousel-control-next-icon"></span>`;

    carousel.append(prevBtn, nextBtn);

    /* ===== INFOS ===== */
    const card = createElement('div', 'text-block text-center'); // <-- class text-block
    const info = createElement('div');

    info.innerHTML = `
        <p><strong>Host:</strong> ${place.owner?.first_name || 'Unknown'}</p>
        <p><strong>Price per night:</strong> $${place.price_by_night}</p>
        <p><strong>Description:</strong> ${place.description}</p>
        <p><strong>Amenities:</strong> ${place.amenities.map(a => a.name).join(', ')}</p>
    `;

    card.appendChild(info);
    section.append(title, carousel, card);
}

/* ======================
    DISPLAY REVIEWS
====================== */
function displayReviews(reviews) {
    const section = document.getElementById('reviews');
    if (!section) return;

    section.innerHTML = '<h2 class="mb-3">Reviews</h2>';

    if (!reviews || reviews.length === 0) {
        section.innerHTML += '<p>No reviews yet.</p>';
        return;
    }

    reviews.forEach(r => {
        const article = createElement('article', 'review-card p-3 border rounded shadow-sm mb-3');

        article.innerHTML = `
            <p><strong>${r.user?.first_name || 'User'}:</strong></p>
            <p>${r.text}</p>
            <p>
                <strong>Rating:</strong>
                ${[1,2,3,4,5].map(i =>
                    `<i class="${i <= r.rating ? 'bi bi-star-fill text-warning' : 'bi bi-star text-secondary'}"></i>`
                ).join('')}
            </p>
        `;

        section.appendChild(article);
    });
}

/* ======================
    ADD REVIEW FORM
====================== */
function setupAddReviewForm() {
    const addReviewSection = document.getElementById('add-review');
    if (!addReviewSection) return;

    if (!isAuthenticated()) {
        addReviewSection.style.display = 'none';
        return;
    }

    addReviewSection.style.display = 'block';

    const reviewForm = document.getElementById('review-form');
    if (!reviewForm) return;

    reviewForm.onsubmit = async (e) => {
        e.preventDefault();

        const reviewText = reviewForm.querySelector('#review-text').value.trim();
        const rating = parseInt(reviewForm.querySelector('#rating').value);

        if (!reviewText || !rating) return alert('Please fill all fields');

        try {
            const token = getCookie('token');

            const response = await fetch(`${API_URL}/reviews/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    place_id: currentPlace.id,
                    text: reviewText,
                    rating
                })
            });

            if (!response.ok) throw new Error('Failed to submit review');

            const newReview = await response.json();

            currentPlace.reviews.push(newReview);
            displayReviews(currentPlace.reviews);

            reviewForm.reset();

        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };
}

/* ======================
    LOAD PLACE
====================== */
function loadPlace() {
    const placeId = getPlaceIdFromURL();
    if (!placeId) return;

    // Mapping UUID → fallback
    const fallbackPlacesByUUID = {
        "7b4f5cc3-4bd8-4b6b-b721-c2306cd0ce01": fallbackPlaces[0],
        "e6dcb145-ce39-4dc4-8331-43f3fd401845": fallbackPlaces[1],
        "9160d2f0-bd44-4b00-8eca-564337bbd031": fallbackPlaces[2]
    };

    // Récupère la place selon l'UUID, fallback vers la première si non trouvé
    currentPlace = fallbackPlacesByUUID[placeId] || fallbackPlaces[0];

    // Affiche les infos de la place
    displayPlaceDetails(currentPlace);

    // Affiche les reviews
    displayReviews(currentPlace.reviews || []);

    // Prépare le formulaire si l'utilisateur est connecté
    setupAddReviewForm();
}

/* ======================
    INIT
====================== */
document.addEventListener('DOMContentLoaded', async () => {
    toggleLoginLink();
    await loadReviewsSection();
    loadPlace();
});
