document.addEventListener('DOMContentLoaded', () => {

    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    const API_URL =
        window.location.hostname === "localhost"
            ? "http://localhost:5000"
            : "https://apartment-management-system-nine.vercel.app";

    loginForm.addEventListener('submit', async (e) => {

        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const role = document.getElementById('role').value;

        if (!username || !password || !role) {
            errorMessage.style.display = 'block';
            errorMessage.textContent = 'All fields are required';
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, role })
            });

            const data = await res.json();
            

            if (!res.ok) {
                errorMessage.style.display = 'block';
                errorMessage.textContent = data.message || "Invalid login";
                return;
            }

            localStorage.setItem("amsUser", JSON.stringify(data.user));

            const userId = data.user.id; 

            if (role === "owner") {
                localStorage.setItem("ownerId", userId); 
            } else if (role === "staff") {
                localStorage.setItem("staffId", userId);
            }

            if (role === "admin") window.location.href = "admin-dashboard.html";
            else if (role === "staff") window.location.href = "staff-dashboard.html";
            else window.location.href = "owner-dashboard.html";

        } catch (err) {
            console.error(err);
            errorMessage.style.display = 'block';
            errorMessage.textContent = "Server error. Try again later.";
        }
    });
});

