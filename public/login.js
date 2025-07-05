// Modal controls
document.addEventListener('DOMContentLoaded', function () {
    const signupModal = document.getElementById('signupModal');
    const forgotModal = document.getElementById('forgotModal');
    const showSignup = document.getElementById('show-signup');
    const showForgot = document.getElementById('show-forgot');
    const closeSignup = document.getElementById('close-signup');
    const closeForgot = document.getElementById('close-forgot');
    const closeReset = document.getElementById('close-reset');

    closeSignup.onclick = () => signupModal.style.display = 'none';
    closeForgot.onclick = () => forgotModal.style.display = 'none';
    closeReset.onclick = () => {
        const resetModal = document.getElementById('resetPasswordModal');
        resetModal.style.display = 'none';
    };

    signupModal.style.display = 'none';

    // Check if reset link is triggered via ?reset=email@example.com
    const urlParams = new URLSearchParams(window.location.search);
    const resetEmail = urlParams.get('reset');
    if (resetEmail) {
        const resetModal = document.getElementById('resetPasswordModal');
        const resetEmailInput = document.getElementById('resetEmail');
        if (resetModal && resetEmailInput) {
            resetEmailInput.value = resetEmail;
            resetModal.style.display = 'block';
        }
    }

    showSignup.onclick = e => {
        e.preventDefault();
        signupModal.style.display = 'flex';
        console.log("Signup modal should now show!");
    };

    showForgot.onclick = e => {
        e.preventDefault();
        forgotModal.style.display = 'block';
    };

    closeSignup.onclick = () => signupModal.style.display = 'none';
    closeForgot.onclick = () => forgotModal.style.display = 'none';

    window.onclick = e => {
        if (e.target === signupModal) signupModal.style.display = 'none';
        if (e.target === forgotModal) forgotModal.style.display = 'none';
        if (e.target === document.getElementById('resetPasswordModal')) {
            document.getElementById('resetPasswordModal').style.display = 'none';
        }
    };


    // Login form
    document.getElementById('loginForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        if (!this.checkValidity()) {
            this.reportValidity();
            return;
        }

        const email = this.email.value.trim();
        const password = this.password.value;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Logged in:", data.user);
                sessionStorage.setItem("userId", data.user.id);
                window.location.href = 'matches.html';
            } else if (response.status === 401) {
                alert("Incorrect password.");
            } else if (response.status === 404) {
                alert("User does not exist.");
            } else {
                alert("Login failed. Please try again.");
            }
        } catch (err) {
            console.error("Login error:", err);
            alert("Error while logging in.");
        }
    });


    // Signup form
    document.getElementById('signupForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        console.log("✅ Signup form submitted with method:", e.target.method);

        if (!this.checkValidity()) {
            this.reportValidity();
            return;
        }

        const user = {
            first_name: this.firstName.value.trim(),
            last_name: this.lastName.value.trim(),
            email: this.email.value.trim(),
            password: this.password.value,
            phone_number: this.phone.value.trim(),
        };

        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            });
            if (response.ok) {
                const data = await response.json();
                console.log("Signed in:", data.user);
                sessionStorage.setItem("userId", data.userId);
                window.location.href = 'dog_profile.html';
            } else if (response.status === 409) {
                alert("An account with this email already exists.");
            } else {
                alert("Signup failed. Please try again.");
            }
        } catch (err) {
            console.error("Signup error:", err);
            alert("Error while signing in.");
        }
    });

    // Forgot password form
    // Forgot password form - server-based validation and reset email sending
    document.getElementById('forgotForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        const form = e.target;
        const messageEl = document.getElementById('forgotMessage');
        const email = form.forgotEmail.value.trim();

        // Clear previous error messages
        messageEl.style.display = 'none';
        messageEl.textContent = '';

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        try {
            // Step 1: Check if email exists in database
            const checkResponse = await fetch('/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (checkResponse.status === 404) {
                messageEl.textContent = 'No user found with this email.';
                messageEl.style.display = 'block';
                return;
            }

            if (!checkResponse.ok) {
                alert("Error checking email. Please try again.");
                return;
            }

            // Step 2: Send reset email
            const sendResponse = await fetch('/send-reset-mail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (!sendResponse.ok) {
                alert("Error sending reset email. Please try again.");
                return;
            }

            // Show confirmation toast
            forgotModal.style.display = 'none';
            const toast = document.createElement('div');
            toast.textContent = `A reset link was sent to ${email}`;
            toast.style.position = 'fixed';
            toast.style.bottom = '20px';
            toast.style.left = '50%';
            toast.style.transform = 'translateX(-50%)';
            toast.style.backgroundColor = '#4CAF50';
            toast.style.color = 'white';
            toast.style.padding = '12px 20px';
            toast.style.borderRadius = '6px';
            toast.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
            toast.style.zIndex = '9999';
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';

            document.body.appendChild(toast);
            setTimeout(() => toast.style.opacity = '1', 100);
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 500);
            }, 3000);

        } catch (err) {
            console.error("Forgot password error:", err);
            alert("Something went wrong. Please try again.");
        }
    });

});

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('terms-link').onclick = function (e) {
        e.preventDefault();
        alert("Terms of Service: \n\nIf you actually read this, you get a gold star. Please play nice and always pet the dogs.");
    };

    document.getElementById('privacy-link').onclick = function (e) {
        e.preventDefault();
        alert("Privacy Policy: \n\nAll your dog play dates are kept top secret. We don’t even tell the cats.");
    };
});
// Handle reset password form submission
document.getElementById('resetPasswordForm')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('resetEmail').value.trim();
    const newPassword = document.getElementById('newPassword').value.trim();

    if (!newPassword) {
        alert("Please enter a new password.");
        return;
    }

    try {
        // Send request to server to update the user's password
        const updateRes = await fetch('/update-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, newPassword })
        });

        if (!updateRes.ok) {
            alert("Failed to update password. Please try again.");
            return;
        }

        // After successful password update, log the user in
        const loginRes = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: newPassword })
        });

        if (loginRes.ok) {
            const data = await loginRes.json();
            sessionStorage.setItem("userId", data.user.id);
            window.location.href = 'matches.html';
        } else {
            alert("Password updated but login failed.");
        }
    } catch (err) {
        console.error("Reset password error:", err);
        alert("Something went wrong during password reset.");
    }
});

