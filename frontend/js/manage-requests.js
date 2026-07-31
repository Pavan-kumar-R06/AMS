

const requestsTableBody = document.getElementById("requestsTableBody");
const statusFilter = document.getElementById("statusFilter");
const staffFilter = document.getElementById("staffFilter");
const refreshBtn = document.getElementById("refreshBtn");
const updateModal = document.getElementById("updateRequestModal");
const closeUpdateModal = document.getElementById("closeUpdateModal");
const updateForm = document.getElementById("updateRequestForm");
const requestIdInput = document.getElementById("requestId");
const requestTypeInput = document.getElementById("requestType");
const descriptionInput = document.getElementById("description");
const assignedStaffSelect = document.getElementById("assignedStaff");
const statusSelect = document.getElementById("status");
const cancelUpdateBtn = document.getElementById("cancelUpdateBtn");
const logoutButton = document.getElementById('logoutBtn'); 

const deleteModal = document.getElementById("deleteModal");
const closeDeleteModalBtn = deleteModal.querySelector(".close-btn"); 
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://ams-git-main-pavankumar060905-8109s-projects.vercel.app/";

const API_BASE = `${API_URL}/api/requests`;
let toDeleteId = null; 

let requests = [];
let staffList = [];

function escapeHtml(text) {
    if (text === null || text === undefined) return "-";
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatDate(ts) {
    if (!ts) return "-";
    const d = new Date(ts);
    if (isNaN(d)) return "-";
    return d.toLocaleString();
}

function openDeleteModal() { deleteModal.style.display = "flex"; }
function closeDeleteModal() { 
    deleteModal.style.display = "none";
    toDeleteId = null; 
}

async function loadStaff() {
    try {
        const res = await fetch(`${API_BASE}/meta/staff`);
        staffList = await res.json();
        staffFilter.innerHTML = `<option value="">All Staff</option>`;
        assignedStaffSelect.innerHTML = `<option value="">Select Staff</option>`;

        staffList.forEach(s => {
            const opt = `<option value="${s.id}">${escapeHtml(s.name)} (${escapeHtml(s.role) || ''})</option>`;
            staffFilter.innerHTML += opt;
            assignedStaffSelect.innerHTML += opt;
        });
    } catch (err) {
        console.error("Failed to load staff", err);
    }
}

async function loadRequests() {
    requestsTableBody.innerHTML = `<tr><td colspan="8" class="table-loading">Loading...</td></tr>`;
    try {
        const q = new URLSearchParams();
        if (statusFilter.value) q.set("status", statusFilter.value);
        if (staffFilter.value) q.set("staff", staffFilter.value);

        const res = await fetch(`${API_BASE}?${q.toString()}`);
        requests = await res.json();

        renderTable();
    } catch (err) {
        console.error(err);
        requestsTableBody.innerHTML = `<tr><td colspan="8">Error loading requests</td></tr>`;
    }
}

function renderTable() {
    if (!requests || requests.length === 0) {
        requestsTableBody.innerHTML = `<tr><td colspan="8">No service requests found</td></tr>`;
        return;
    }

    requestsTableBody.innerHTML = requests.map(r => `
        <tr>
            <td>${r.id}</td>
            <td>${escapeHtml(r.ownerName || '-')}</td>
            <td>${escapeHtml(r.requestType)}</td>
            <td>${escapeHtml(r.description || '-')}</td>
            <td>${escapeHtml(r.staffName || '-')}</td>
            <td>${escapeHtml(r.status)}</td>
            <td>${formatDate(r.requestDate)}</td>
            <td>
                <button class="btn btn-edit" onclick="openUpdateModal(${r.id})" title="Update">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-delete" onclick="confirmDelete(${r.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join("");
}

window.openUpdateModal = function (id) {
    const req = requests.find(x => x.id === id);
    if (!req) return alert("Request not found");

    requestIdInput.value = req.id;
    requestTypeInput.value = req.requestType;
    descriptionInput.value = req.description || "";
    assignedStaffSelect.value = req.assignedStaffId || ""; 
    statusSelect.value = req.status || "Pending";

    updateModal.style.display = "flex";
};

updateForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = requestIdInput.value;
    const payload = {
        assignedStaffId: assignedStaffSelect.value || null, 
        status: statusSelect.value
    };

    try {
        const res = await fetch(`${API_BASE}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Unknown' }));
            throw new Error(err.error || "Failed to update");
        }
        await loadRequests();
        updateModal.style.display = "none";
    } catch (err) {
        console.error(err);
        alert("Error updating request: " + (err.message || ""));
    }
});

window.confirmDelete = (id) => {
    toDeleteId = id;
    openDeleteModal();
};

confirmDeleteBtn.addEventListener("click", async () => {
    if (!toDeleteId) return;
    try {
        const res = await fetch(`${API_BASE}/${toDeleteId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete");
        
        closeDeleteModal(); 
        await loadRequests();
    } catch (err) {
        console.error(err);
        alert("Error deleting request");
        closeDeleteModal(); 
    }
});

closeUpdateModal?.addEventListener("click", () => updateModal.style.display = "none");
cancelUpdateBtn?.addEventListener("click", () => updateModal.style.display = "none");

closeDeleteModalBtn?.addEventListener("click", closeDeleteModal);
cancelDeleteBtn?.addEventListener("click", closeDeleteModal);

statusFilter.addEventListener("change", loadRequests);
staffFilter.addEventListener("change", loadRequests);
refreshBtn.addEventListener("click", loadRequests);

window.addEventListener("click", (e) => {
    if (e.target === updateModal) updateModal.style.display = "none";
    if (e.target === deleteModal) closeDeleteModal();
});

(async function init() {
    await loadStaff();
    await loadRequests();

    const welcomeEl = document.getElementById("welcomeMessage");
    if (welcomeEl) {
        const user = localStorage.getItem("amsUser") ? JSON.parse(localStorage.getItem("amsUser")).username : "Admin"; 
        welcomeEl.textContent = `Welcome, ${user}`;
    }
})();

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