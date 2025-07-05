// Toggle contact information visibility and send a match request
function showContact(button) {
    const info = button.nextElementSibling;
    info.style.display = info.style.display === 'none' ? 'block' : 'none';

    // Match logic
    const otherDogId = button.getAttribute('data-dog-id');
    const userId = sessionStorage.getItem('userId');
    if (!userId) return;

    fetch('/dogs')
        .then(res => res.json())
        .then(dogs => {
            const myDog = dogs.find(d => d.owner_id === parseInt(userId));
            if (!myDog) {
                alert("Please post a dog profile first.");
                return;
            }

            // Prevent match with own dog
            if (myDog.id === parseInt(otherDogId)) return;

            fetch('/create-match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dog1_id: myDog.id,
                    dog2_id: parseInt(otherDogId)
                })
            })
                .then(res => {
                    if (res.ok) {
                        console.log("✅ Match created.");
                    } else {
                        console.error("❌ Failed to create match.");
                    }
                });
        });
}

document.addEventListener('DOMContentLoaded', function () {
    const adsSection = document.getElementById('ads-section');
    const myAdsContainer = document.getElementById('my-ads');
    const toggleMyAdsBtn = document.getElementById('toggle-my-ads');
    // Allow user to toggle visibility of their own ads
    if (toggleMyAdsBtn) {
        toggleMyAdsBtn.addEventListener('click', () => {
            if (myAdsContainer.style.display === 'none') {
                myAdsContainer.style.display = 'grid';
                toggleMyAdsBtn.textContent = 'Hide My Ads';
            } else {
                myAdsContainer.style.display = 'none';
                toggleMyAdsBtn.textContent = 'Show My Ads';
            }
        });
    }
    const otherAdsContainer = document.getElementById('other-ads');
    const noAdsDiv = document.getElementById('no-ads');
    const form = document.querySelector('.filter-form');
    const TWO_MINUTES = 2 * 60 * 1000;
    const userId = sessionStorage.getItem('userId');

    let allAds = [];

    // Filter ads based on selected options
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const filters = Object.fromEntries(new FormData(form).entries());

        const filteredAds = allAds.filter(ad => {
            return (
                (!filters.city || ad.city.toLowerCase() === filters.city.toLowerCase()) &&
                (!filters.size || ad.size.toLowerCase() === filters.size.toLowerCase()) &&
                (!filters.gender || ad.gender.toLowerCase() === filters.gender.toLowerCase()) &&
                (!filters.energy || ad.energy_level.toLowerCase() === filters.energy.toLowerCase())
            );
        });

        renderAds(filteredAds);
    });

    // Render dog ads: always show user's dogs, filter others
    function renderAds(filteredAds) {
        myAdsContainer.innerHTML = '';
        otherAdsContainer.innerHTML = '';
        noAdsDiv.style.display = 'none';

        const now = Date.now();
        const myId = parseInt(userId);

        // Show all my dogs regardless of filters
        const myDogs = allAds.filter(dog => dog.owner_id === myId);
        myDogs.forEach(dog => {
            const card = createDogCard(dog, now);
            myAdsContainer.appendChild(card);
        });

        // Show only other dogs that match filters
        const otherDogs = filteredAds.filter(dog => dog.owner_id !== myId);
        if (otherDogs.length === 0) {
            noAdsDiv.style.display = 'block';
        } else {
            otherDogs.forEach(dog => {
                const card = createDogCard(dog, now);
                otherAdsContainer.appendChild(card);
            });
        }
    }

    // Create and return a dog card DOM element
    function createDogCard(dog, now) {
        const card = document.createElement('div');
        card.classList.add('dog-card', 'animate');

        if (dog.timestamp && now - dog.timestamp < TWO_MINUTES) {
            const badge = document.createElement('span');
            badge.classList.add('badge');
            badge.textContent = 'New!';
            card.appendChild(badge);
        }

        card.innerHTML +=
            `<img src="${dog.image_url}" alt="Dog ${dog.name}">
            <h3>${dog.name}</h3>
            <p><strong>Breed:</strong> ${dog.breed}</p>
            <p><strong>Age:</strong> ${dog.age}</p>
            <p><strong>Gender:</strong> ${dog.gender}</p>
            <p><strong>Size:</strong> ${dog.size}</p>
            <p><strong>Energy:</strong> ${dog.energy_level}</p>
            <p><strong>City:</strong> ${dog.city}</p>
            <button onclick="showContact(this)" data-dog-id="${dog.id}">Show Contact Info</button>
            <div class="contact-info" style="display:none;">
                <p><strong>Owner:</strong> ${dog.owner}</p>
                <p><strong>Phone:</strong> ${dog.phone}</p>
                <p><strong>Email:</strong> ${dog.email}</p>
            </div>`;
        return card;
    }

    // Show login status in header
    const greeting = document.getElementById('greeting');
    const userInfo = document.getElementById('userInfo');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginLink = document.getElementById('menu-login');
    const statusIcon = document.getElementById('login-status-icon');

    if (userId) {
        fetch(`/users/${userId}`)
            .then(res => res.json())
            .then(user => {
                if (userInfo) userInfo.style.display = "flex";
                if (greeting) greeting.textContent = `Hi, ${user.first_name}!`;
                if (statusIcon) statusIcon.textContent = "🟢";
                if (loginLink) loginLink.style.display = "none";
            })
            .catch(err => {
                console.error("Failed to fetch user info", err);
            });
    } else {
        if (userInfo) userInfo.style.display = "none";
        if (greeting) greeting.textContent = "";
        if (statusIcon) statusIcon.textContent = "🔴";
        if (loginLink) loginLink.style.display = "inline";
    }

    // Logout handler
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }

    // Initial load: get all ads
    fetch('/dogs')
        .then(response => response.json())
        .then(data => {
            allAds = data;
            populateCityOptions(allAds);
            renderAds(allAds);
        })
        .catch(err => {
            console.error('Failed to load ads:', err);
            noAdsDiv.style.display = 'block';
        });

    // Populate city filter dropdown with unique cities
    function populateCityOptions(ads) {
        const citySelect = document.getElementById("city-filter");
        const myId = parseInt(sessionStorage.getItem("userId"));

        // Get unique cities only from ads that are not mine
        const cities = [...new Set(
            ads
                .filter(ad => ad.owner_id !== myId)
                .map(ad => ad.city?.trim())
                .filter(Boolean)
        )].sort();

        cities.forEach(city => {
            const option = document.createElement("option");
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
    }


    // Footer links alerts
    document.getElementById('terms-link').onclick = function (e) {
        e.preventDefault();
        alert("Terms of Service:\n\nIf you actually read this, you get a gold star. Please play nice and always pet the dogs.");
    };

    document.getElementById('privacy-link').onclick = function (e) {
        e.preventDefault();
        alert("Privacy Policy:\n\nAll your dog play dates are kept top secret. We don’t even tell the cats.");
    };
});
