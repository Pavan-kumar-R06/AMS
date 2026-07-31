
// Account Settings//


const API_URL =
    window.location.hostname === "localhost"
        ? "http://localhost:5000"
        : "https://apartment-management-system-nine.vercel.app";

// Logged in user
const user = JSON.parse(localStorage.getItem("amsUser"));

if (!user) {
    window.location.href = "index.html";
}

// Welcome Message
document.getElementById("welcomeMessage").textContent =
    `Welcome, ${user.name}`;



// Load Profile//


async function loadProfile() {

    try {

        const res = await fetch(
            `${API_URL}/api/account/profile/${user.id}/${user.role}`
        );

        const data = await res.json();

        if (!res.ok) {
            showNotification(data.message, "error");
            return;
        }

        document.getElementById("fullName").value = data.name || "";
        document.getElementById("email").value = data.email || "";

    }

    catch (err) {

        console.error(err);
     showNotification("Unable to load profile.", "error");

    }

}

loadProfile();



// Update Profile//


document
    .getElementById("updateProfileBtn")
    .addEventListener("click", updateProfile);

async function updateProfile() {

    const name =
        document.getElementById("fullName").value.trim();

    const email =
        document.getElementById("email").value.trim();

    if (!name || !email) {

      showNotification("Please fill in all fields.", "error");

        return;

    }

    try {

        const res = await fetch(

            `${API_URL}/api/account/profile`,

            {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    id: user.id,
                    role: user.role,
                    name,
                    email

                })

            }

        );

        const data = await res.json();

      showNotification(
    data.message,
    res.ok ? "success" : "error"
);

        if (!res.ok) return;

        user.name = name;
        user.email = email;

        localStorage.setItem(
            "amsUser",
            JSON.stringify(user)
        );

        document.getElementById("welcomeMessage").textContent =
            `Welcome, ${name}`;

    }

    catch (err) {

        console.error(err);

    showNotification("Something went wrong while updating profile.", "error");

    }

}

// Change Password//


document
    .getElementById("changePasswordBtn")
    .addEventListener("click", changePassword);

async function changePassword() {

    const currentPassword =
        document.getElementById("currentPassword").value;

    const newPassword =
        document.getElementById("newPassword").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    // Check if all fields are filled
    if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
    ) {

        showNotification("Please fill all password fields.", "error");
        return;

    }

    // Check if new password and confirm password match
    if (newPassword !== confirmPassword) {

        showNotification(
            "New password and Confirm password do not match.",
            "error"
        );
        return;

    }

    // Strong Password Validation
    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_\-+=])[A-Za-z\d@$!%*?&^#()_\-+=]{6,}$/;

    if (!passwordRegex.test(newPassword)) {

        showNotification(
            "Password must contain at least 6 characters, one uppercase letter, one lowercase letter, one number and one special character.",
            "error"
        );
        return;

    }

    try {

        const res = await fetch(

            `${API_URL}/api/account/password`,

            {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    id: user.id,
                    role: user.role,
                    currentPassword,
                    newPassword

                })

            }

        );

        const data = await res.json();

        showNotification(
            data.message,
            res.ok ? "success" : "error"
        );

        if (!res.ok) return;

        document.getElementById("currentPassword").value = "";
        document.getElementById("newPassword").value = "";
        document.getElementById("confirmPassword").value = "";

    }

    catch (err) {

        console.error(err);

        showNotification(
            "Unable to change password.",
            "error"
        );

    }

}

// Toggle Password//


document
    .querySelectorAll(".toggle-password")
    .forEach(icon => {

        icon.addEventListener("click", () => {

            const input =
                icon.previousElementSibling;

            if (input.type === "password") {

                input.type = "text";

                icon.classList.replace(
                    "fa-eye",
                    "fa-eye-slash"
                );

            }

            else {

                input.type = "password";

                icon.classList.replace(
                    "fa-eye-slash",
                    "fa-eye"
                );

            }

        });

    });

function showNotification(message, type = "success") {

    const box = document.getElementById("notification");
    const text = document.getElementById("notificationText");
    const icon = box.querySelector("i");

    text.innerText = message;

    box.classList.remove("success", "error");

    if (type === "success") {
        box.classList.add("success");
        icon.className = "fas fa-check-circle";
    } else {
        box.classList.add("error");
        icon.className = "fas fa-exclamation-circle";
    }

    box.classList.add("show");

    setTimeout(() => {
        box.classList.remove("show");
    }, 3500);
}

// Logout//


document
    .getElementById("logoutBtn")
    .addEventListener("click", () => {

        localStorage.removeItem("amsUser");

        window.location.href = "index.html";

    });


