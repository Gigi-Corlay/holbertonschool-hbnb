const API_URL = 'http://127.0.0.1:5000/api/v1';
let currentPlace = null;

/* ======================
    AMENITY ICONS
====================== */
function getAmenityIcon(name) {
    const icons = {
        wifi: `<img src="images/icon_wifi.png" width="18">`,
        bedroom: `<img src="images/icon_bed.png" width="18">`,
        bath: `<img src="images/icon_bath.png" width="18">`,
        bathroom: `<img src="images/icon_bath.png" width="18">`,
        pool: `<i class="bi bi-water"></i>`
    };

    return icons[name.toLowerCase()] || '';
}

/* ======================
    FALLBACK DATA
====================== */
const fallbackPlaces = [
    {
        id: 1,
        name: "Beautiful Beach House",
        images: ["images/house-1.webp","images/house-2.jpg","images/house-3.webp"],
        price_by_night: 55,
        description: "A beautiful beach house with amazing views",
        owner: { first_name: "John" },
        amenities: [{ name: "Wifi" }, { name: "Pool" }],
    },
    {
        id: 2,
        name: "Cozy Cabin",
        images: ["images/baot_1.webp","images/baot_2.jpg","images/baot_3.webp"],
        price_by_night: 100,
        description: "A cozy cabin",
        owner: { first_name: "Tom" },
        amenities: [{ name: "Wifi" }, { name: "Bedroom" }],
    },
    {
        id: 3,
        name: "Modern Apartment",
        images: ["images/apartement-1.webp","images/apartement-2.webp","images/apartement-3.jpg"],
        price_by_night: 200,
        description: "Modern apartment",
        owner: { first_name: "David" },
        amenities: [{ name: "Wifi" }, { name: "Bathroom" }],
    }
];

const fallbackPlacesById = Object.fromEntries(fallbackPlaces.map(p => [p.id, p]));

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
    return params.get('id');
}

function getPlaceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id'); // retourne le place ID
}

/* ======================
    DISPLAY PLACE DETAILS
====================== */
function displayPlaceDetails(place) {
    const section = document.getElementById('place-details');
    if (!section) return;

    section.innerHTML = '';

    // Title
    const title = createElement('h1', 'text-center mb-4 mt-3', place.name);

    // Carousel
    const carouselId = `carousel-${place.id}`;
    const carousel = createElement('div', 'carousel slide mb-4');
    carousel.id = carouselId;

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

    // Controls
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

    // Init Bootstrap Carousel
    new bootstrap.Carousel(carousel, { interval: false });

    // Info card
    const card = createElement('div', 'text-block text-center mb-4');
    const info = createElement('div', 'place-info');

    info.innerHTML = `
        <p><strong>Host:</strong> ${place.owner?.first_name || 'Unknown'}</p>
        <p><strong>Price per night:</strong> $${place.price_by_night}</p>
        <p><strong>Description:</strong> ${place.description}</p>
        <p><strong>Amenities:</strong></p>
        <div class="amenities">
            ${(place.amenities || []).map(a => `
                <span class="amenity-badge">
                    ${getAmenityIcon(a.name)} ${a.name}
                </span>
            `).join('')}
        </div>
    `;

    card.appendChild(info);
    section.append(title, carousel, card);
}

/* ======================
    LOAD STATIC REVIEWS
====================== */
function loadStaticReviews() {
    const place = currentPlace || fallbackPlaces[0];
    const fileName = `place_review_${place.id}.html`;

    const container = document.getElementById('reviews-container');
    if (!container) return;

    fetch(fileName)
        .then(response => response.ok ? response.text() : Promise.reject('No reviews'))
        .then(html => container.innerHTML = html)
        .catch(() => container.innerHTML = '<p>No reviews found.</p>');
}

/* ======================
    ADD REVIEW FORM
====================== */
function injectReviewForm() {
    const container = document.getElementById('add-review-container');
    if (!container) return;

    container.innerHTML = `
        <section id="add-review-${currentPlace.id}" class="mb-5">
            <h3 class="mb-3">Add a Review</h3>
            <div class="border rounded p-4">
                <form id="add-review-form" class="d-flex flex-column gap-3">
                    <div class="mb-3">
                        <label for="review-text" class="form-label">Your Review:</label>
                        <textarea id="review-text" class="form-control" rows="4"></textarea>
                    </div>
                    <div class="d-flex flex-row bd-highlight mb-2">
                        <label for="rating" class="form-label me-2 mb-0 p-2 bd-highlight">Rating:</label>
                        <select id="rating" class="form-select w-auto">
                            <option value="">Select rating</option>
                            <option value="1">1 Star</option>
                            <option value="2">2 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="5">5 Stars</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-rose mx-auto px-3 py-2">Submit Review</button>
                </form>
            </div>
        </section>
    `;

    attachReviewFormListener();
}
/* ======================
    REVIEW FORM LISTENER
====================== */
function attachReviewFormListener() {
    const form = document.getElementById('add-review-form');
    if (!form) return;

    form.addEventListener('submit', e => {
        e.preventDefault();

        const reviewText = document.getElementById('review-text').value.trim();
        const rating = document.getElementById('rating').value;

        if (!reviewText || !rating) {
            alert('Please enter review text and rating');
            return;
        }

        alert('Review submitted!');
        form.reset();

        const reviewsContainer = document.getElementById('reviews-container');
        if (reviewsContainer) {
            const newReview = createElement('div', 'review mb-2 p-2 border');
            newReview.innerHTML = `<strong>Rating:</strong> ${rating} <br> ${reviewText}`;
            reviewsContainer.appendChild(newReview);
        }
    });
}

/* ======================
    INIT
====================== */
document.addEventListener('DOMContentLoaded', () => {
    const placeId = parseInt(getPlaceIdFromURL());
    currentPlace = placeId ? fallbackPlacesById[placeId] : fallbackPlaces[0];

    displayPlaceDetails(currentPlace);
    loadStaticReviews();
    injectReviewForm();
});
