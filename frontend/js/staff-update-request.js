const logoutButton = document.getElementById('logoutBtn'); 
    const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://ams-git-main-pavankumar060905-8109s-projects.vercel.app/";

const API_BASE = `${API_URL}/api/staff`; 

document.addEventListener("DOMContentLoaded", () => {
    const staffId = localStorage.getItem("staffId");

    if (!staffId) {
        alert("Unauthorized. Please login again.");
        window.location.href = "../login.html";
        return;
    }

    fetchAssignedRequests(staffId);

    document.getElementById("requestSelect").addEventListener("change", () => {
        const requestId = document.getElementById("requestSelect").value;
        if (requestId) fetchRequestDetails(requestId, staffId);
        else document.getElementById("requestDetails").style.display = "none";
    });

    document.getElementById("updateStatusForm").addEventListener("submit", (e) => {
        e.preventDefault();
        updateRequestStatus(staffId);
    });

    document.getElementById("logoutBtn").addEventListener("click", logoutUser);
});

async function fetchAssignedRequests(staffId) {
    try {
        const response = await fetch(`${API_BASE}/assigned-list?staffId=${staffId}`);
        const requests = await response.json();

        const dropdown = document.getElementById("requestSelect");
        dropdown.innerHTML = `<option value="">Select a request</option>`;

        if (!requests.length) {
            dropdown.innerHTML = `<option value="">No active requests</option>`;
            return;
        }

        requests.forEach(req => {
            const option = document.createElement("option");
            option.value = req.id;
            option.textContent = `${req.title} (#${req.id})`;
            dropdown.appendChild(option);
        });

    } catch (error) {
        console.error("Error fetching requests:", error);
        alert("Failed to load requests");
    }
}

async function fetchRequestDetails(requestId, staffId) {
    try {
        const response = await fetch(`${API_BASE}/details/${requestId}?staffId=${staffId}`);
        const data = await response.json();

        if (!data) return;

        document.getElementById("detailRequestId").textContent = data.id;
        document.getElementById("detailownerName").textContent = data.ownerName;
        document.getElementById("detailFlatNo").textContent = data.flatNumber;
        document.getElementById("detailServiceType").textContent = data.serviceType;
        document.getElementById("detailCurrentStatus").textContent = data.status;
        document.getElementById("detailDescription").textContent = data.description;

        document.getElementById("requestDetails").style.display = "block";
    } catch (error) {
        console.error("Error fetching details:", error);
        alert("Failed to load details");
    }
}

async function updateRequestStatus(staffId) {
    const requestId = document.getElementById("requestSelect").value;
    const newStatus = document.querySelector("input[name='newStatus']:checked").value;
    const updateNotes = document.getElementById("updateNotes").value;
    const completionTime = document.getElementById("completionTime").value;

    const payload = {
        staffId,
        status: capitalize(newStatus),
        notes: updateNotes || null,
        completionTime: completionTime || null
    };

    try {
        const response = await fetch(`${API_BASE}/update-request/${requestId}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            showSuccessModal();
            resetForm();
            fetchAssignedRequests(staffId);
        } else {
            alert(result.error || "Update failed");
        }
    } catch (error) {
        console.error("Error updating request:", error);
        alert("Internal error");
    }
}

function resetForm() {
    document.getElementById("updateStatusForm").reset();
    document.getElementById("requestDetails").style.display = "none";
}

function showSuccessModal() {
    document.getElementById("successModal").style.display = "block";
}

function closeSuccessModal() {
    document.getElementById("successModal").style.display = "none";
}

function logoutUser() {
    localStorage.clear();
    window.location.href = "../login.html";
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}
if (logoutButton) {
        logoutButton.addEventListener('click', async (e) => {
            e.preventDefault();
            
            localStorage.removeItem('amsUser');
            localStorage.removeItem('adminId');
            localStorage.removeItem('staffId');
            localStorage.removeItem('ownerId');
            
            try {
                await fetch(`${API_URL}/api/auth/logout`, {
                    method: 'POST'
                });
            } catch (err) {
                console.warn("Server logout endpoint failed, but client data is cleared.", err);
            }

            window.location.href = 'index.html'; 
        });
    }