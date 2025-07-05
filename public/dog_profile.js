// Dog profile form logic
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('dogForm');
    const greeting = document.getElementById('greeting');
    const userInfo = document.getElementById('userInfo');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginLink = document.getElementById('menu-login');
    const statusIcon = document.getElementById('login-status-icon');
    const mainContent = document.getElementById("main-content");
    const unauthorizedMessage = document.getElementById("unauthorized-message");

    // Show or hide content based on login status stored in sessionStorage
    const userId = sessionStorage.getItem("userId");
    if (userId) {
        if (mainContent) mainContent.style.display = "block";
        if (unauthorizedMessage) unauthorizedMessage.style.display = "none";

        fetch(`/users/${userId}`)
            .then(res => res.json())
            .then(user => {
                if (userInfo) userInfo.style.display = "flex";
                if (greeting) greeting.textContent = `Hi, ${user.first_name}!`;
                if (statusIcon) statusIcon.textContent = "🟢";
                if (loginLink) loginLink.style.display = "none";
            })
            .catch(err => {
                console.error("❌ Failed to fetch user info:", err);
            });
    } else {
        if (mainContent) mainContent.style.display = "none";
        if (unauthorizedMessage) unauthorizedMessage.style.display = "block";
    }


    // Logout button clears session and redirects to login page
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.clear();
            window.location.href = 'login.html';
        });
    }

    // Track which submit button was clicked (add-another vs. finish)
    let lastClickedButton = null;
    form.querySelectorAll('button[type="submit"]').forEach(button => {
        button.addEventListener('click', () => {
            lastClickedButton = button.value;
        });
    });

    // Form submit handler using FormData
    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        const formData = new FormData(form);
        const file = form.querySelector('input[name="image"]').files[0]; // ← תיקון כאן

        if (!file) {
            alert("Please select an image.");
            return;
        }

        const ownerId = sessionStorage.getItem("userId");
        if (!ownerId) {
            alert("You must be logged in to add a dog.");
            return;
        }

        formData.append('owner_id', ownerId);

        try {
            const response = await fetch('/add-dog', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to add dog.");
            }

            console.log("Dog added:", result);

            if (lastClickedButton === 'add-another') {
                form.reset();
                form.classList.remove('was-validated');
                alert("Dog added! You can enter another one 🐶");
            } else {
                window.location.href = 'matches.html';
            }

        } catch (err) {
            console.error("Error submitting dog:", err);
            alert("Something went wrong: " + err.message);
        }
    });

    // Legal footer links
    document.getElementById('terms-link').onclick = function (e) {
        e.preventDefault();
        alert("Terms of Service:\n\nIf you actually read this, you get a gold star. Please play nice and always pet the dogs.");
    };

    document.getElementById('privacy-link').onclick = function (e) {
        e.preventDefault();
        alert("Privacy Policy:\n\nAll your dog play dates are kept top secret. We don’t even tell the cats.");
    };
});
