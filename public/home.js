document.addEventListener('DOMContentLoaded', async function () {
    const dropdownBtn = document.getElementById('homeDropdownBtn');
    const dropdown = document.getElementById('homeDropdown');

    // Toggle dropdown menu
    if (dropdownBtn && dropdown) {
        dropdownBtn.addEventListener('click', function (e) {
            e.preventDefault();
            dropdown.style.display = (dropdown.style.display === 'block') ? 'none' : 'block';
        });

        document.addEventListener('click', function (event) {
            if (!dropdown.contains(event.target) && event.target !== dropdownBtn) {
                dropdown.style.display = 'none';
            }
        });
    }

    // Handle login state
    const greeting = document.getElementById('greeting');
    const userInfo = document.getElementById('userInfo');
    const statusIcon = document.getElementById('login-status-icon');
    const loginLink = document.getElementById('menu-login');
    const logoutBtn = document.getElementById('logoutBtn');
    const findBtn = document.getElementById('find-playmates-btn');
    const userId = sessionStorage.getItem('userId');

    if (userId) {
        try {
            const res = await fetch(`/users/${userId}`);
            if (res.ok) {
                const user = await res.json();
                if (userInfo) userInfo.style.display = 'flex';
                if (greeting) greeting.textContent = `Hi, ${user.first_name}!`;
                if (statusIcon) statusIcon.textContent = '🟢';
                if (loginLink) loginLink.style.display = 'none';

                if (findBtn) {
                    findBtn.textContent = "Go to Matches";
                    findBtn.onclick = (e) => {
                        e.preventDefault();
                        window.location.href = 'matches.html';
                    };
                }
            }
        } catch (err) {
            console.error("Failed to fetch user info", err);
        }
    } else {
        if (userInfo) userInfo.style.display = 'none';
        if (greeting) greeting.textContent = '';
        if (statusIcon) statusIcon.textContent = '🔴';
        if (loginLink) loginLink.style.display = 'inline';

        if (findBtn) {
            findBtn.onclick = (e) => {
                e.preventDefault();
                window.location.href = 'login.html';
            };
        }
    }

    // Logout button (now clears sessionStorage)
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('userId');
            window.location.href = 'login.html';
        });
    }

    // Legal links (terms & privacy)
    document.getElementById('terms-link').onclick = function (e) {
        e.preventDefault();
        alert("Terms of Service:\n\nIf you actually read this, you get a gold star. Please play nice and always pet the dogs.");
    };

    document.getElementById('privacy-link').onclick = function (e) {
        e.preventDefault();
        alert("Privacy Policy:\n\nAll your dog play dates are kept top secret. We don’t even tell the cats.");
    };
});
