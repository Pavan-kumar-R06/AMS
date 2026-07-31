const logoutButton = document.getElementById("logoutBtn");

const API_URL =
    window.location.hostname === "localhost"
        ? "http://localhost:5000"
        : "https://ams-git-main-pavankumar060905-8109s-projects.vercel.app/";

const usersApi = `${API_URL}/api/users`;

document.addEventListener("DOMContentLoaded", () => {

    loadUsers();

   document
    .getElementById("passwordForm")
    .addEventListener("submit", createUser);

    document
        .getElementById("cancelPasswordBtn")
        .addEventListener("click", closePasswordModal);

});

function showToast(message, type = "success") {

    const container = document.getElementById("toastContainer");

    const toast = document.createElement("div");

    toast.className = `toast ${type}`;

    toast.innerHTML = `
        <i class="fas ${
            type === "success"
                ? "fa-check-circle"
                : "fa-circle-exclamation"
        }"></i>

        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {

        toast.remove();

    }, 3000);

}

async function loadUsers() {

    try {

        const res = await fetch(usersApi);

        const users = await res.json();

        const tbody = document.getElementById("usersTableBody");

        tbody.innerHTML = "";

        users.forEach(user => {

            const tr = document.createElement("tr");

            let statusHTML = "";

            if (user.status === "System Account") {

                statusHTML = `
                    <span class="status-badge">
                        🟢 System Account
                    </span>
                `;

            }

            else if (user.status === "Password Created") {

                statusHTML = `
                    <span class="status-badge">
                        🟢 Password Created
                    </span>
                `;

            }

            else {

                statusHTML = `
                    <button
                        class="btn btn-primary"
                        onclick="openPasswordModal('${user.role}',${user.owner_id ?? "null"},${user.staff_id ?? "null"})">

                        <i class="fas fa-key"></i>
                        Create Password

                    </button>
                `;

            }

            tr.innerHTML = `

                <td>${user.username}</td>

                <td>${user.role}</td>

                <td>${statusHTML}</td>

            `;

            tbody.appendChild(tr);

        });

    }

    catch (err) {

        console.error(err);

    }

}

function openPasswordModal(role, ownerId, staffId) {

    document.getElementById("role").value = role.toLowerCase();

    document.getElementById("ownerId").value =
        ownerId ?? "";

    document.getElementById("staffId").value =
        staffId ?? "";

    document.getElementById("username").value = "";

    document.getElementById("loginPassword").value = "";

    document.getElementById("passwordModal").style.display = "block";

}
function closePasswordModal() {

    document.getElementById("passwordModal").style.display = "none";

}

async function createUser(e) {

    e.preventDefault();

    const payload = {

        username: document.getElementById("username").value,

        password: document.getElementById("loginPassword").value,

        role: document.getElementById("role").value,

        owner_id:
            document.getElementById("ownerId").value || null,

        staff_id:
            document.getElementById("staffId").value || null

    };

    try {

        const res = await fetch(usersApi, {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(payload)

        });

        const data = await res.json();

        if (!res.ok) {

            showToast(data.error, "error");

            return;

        }

        showToast("Password created successfully");

        closePasswordModal();

        loadUsers();

    }

    catch (err) {

        console.error(err);

        showToast("Failed to create user", "error");

    }

}

if (logoutButton) {

    logoutButton.addEventListener("click", async (e) => {

        e.preventDefault();

        localStorage.removeItem("amsUser");
        localStorage.removeItem("adminId");
        localStorage.removeItem("staffId");
        localStorage.removeItem("ownerId");

        window.location.href = "index.html";

    });

}