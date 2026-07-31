const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://apartment-management-system-nine.vercel.app";

const API_BASE = `${API_URL}/api/staff`;

const staffTableBody = document.getElementById("staffTableBody");
const paginationEl = document.getElementById("pagination");
const addStaffBtn = document.getElementById("addStaffBtn");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const statusFilter = document.getElementById("statusFilter");
const roleFilter = document.getElementById("roleFilter");
const staffModal = document.getElementById("staffModal");
const modalTitle = document.getElementById("modalTitle");
const closeModalBtn = document.getElementById("closeModal");
const staffForm = document.getElementById("staffForm");
const staffIdInput = document.getElementById("staffId");
const staffNameInput = document.getElementById("staffName");
const roleInput = document.getElementById("role");
const contactNoInput = document.getElementById("contactNo");
const statusInput = document.getElementById("status");
const joinDateInput = document.getElementById("joinDate");
const deleteModal = document.getElementById("deleteModal");
const closeDeleteModalBtn = document.getElementById("closeDeleteModal");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const logoutButton = document.getElementById('logoutBtn'); 

let staffList = [];
let currentPage = 1;
const PAGE_SIZE = 8;
let toDeleteId = null;

function openModal() { staffModal.style.display = "flex"; }
function closeModal() { staffModal.style.display = "none"; }
function openDeleteModal() { deleteModal.style.display = "flex"; }
function closeDeleteModal() { deleteModal.style.display = "none"; }

function formatDate(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d)) return "-";
    return d.toLocaleDateString();
}

async function fetchStaff() {
    const q = new URLSearchParams();
    const searchVal = searchInput.value.trim();
    if (searchVal) q.set("search", searchVal);
    if (statusFilter.value) q.set("status", statusFilter.value);
    if (roleFilter.value) q.set("role", roleFilter.value);

    const url = `${API_BASE}?${q.toString()}`;
    try {
        staffTableBody.innerHTML = `<tr><td colspan="7" class="table-loading">Loading...</td></tr>`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load staff");
        const data = await res.json();
        staffList = Array.isArray(data) ? data : [];
        currentPage = 1;
        renderTable();
    } catch (err) {
        staffTableBody.innerHTML = `<tr><td colspan="7" class="table-loading">Error loading staff</td></tr>`;
        console.error(err);
    }
}

function renderTable() {
    if (!staffList.length) {
        staffTableBody.innerHTML = `<tr><td colspan="7">No staff found</td></tr>`;
        paginationEl.innerHTML = "";
        return;
    }

    const totalPages = Math.ceil(staffList.length / PAGE_SIZE);
    if (currentPage > totalPages) currentPage = totalPages || 1;

    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = staffList.slice(start, start + PAGE_SIZE);

    staffTableBody.innerHTML = pageItems.map(s => `
        <tr>
            <td>${s.staff_id}</td>
            <td>${escapeHtml(s.staffName)}</td>
            <td>${escapeHtml(s.role)}</td>
            <td>${escapeHtml(s.phone || "-")}</td>
            <td>${s.is_active ? "Active" : "Inactive"}</td>
            <td>${formatDate(s.created_at)}</td>
            <td>
                <button class="btn btn-edit" onclick="editStaff(${s.staff_id})" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="btn btn-delete" onclick="confirmDelete(${s.staff_id})" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join("");

    let pager = "";
    if (totalPages > 1) {
        pager += `<button ${currentPage===1? "disabled": ""} class="page-btn" data-page="${currentPage-1}">Prev</button>`;
        for (let p = 1; p <= totalPages; p++) {
            pager += `<button class="page-btn ${p===currentPage? 'active': ''}" data-page="${p}">${p}</button>`;
        }
        pager += `<button ${currentPage===totalPages? "disabled": ""} class="page-btn" data-page="${currentPage+1}">Next</button>`;
    }
    paginationEl.innerHTML = pager;

    [...paginationEl.querySelectorAll(".page-btn")].forEach(btn => {
        btn.addEventListener("click", () => {
            const p = Number(btn.dataset.page);
            if (!isNaN(p)) {
                currentPage = p;
                renderTable();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
}

function escapeHtml(text) {
    if (text === null || text === undefined) return "-";
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

addStaffBtn.addEventListener("click", () => {
    modalTitle.textContent = "Add New Staff";
    staffForm.reset();
    staffIdInput.value = "";
    joinDateInput.value = "";
    statusInput.value = "Active";
    openModal();
});

closeModalBtn?.addEventListener("click", closeModal);
document.getElementById("cancelBtn")?.addEventListener("click", closeModal);

searchBtn.addEventListener("click", fetchStaff);
searchInput.addEventListener("keyup", (e) => { if (e.key === "Enter") fetchStaff(); });
statusFilter.addEventListener("change", fetchStaff);
roleFilter.addEventListener("change", fetchStaff);

staffForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
        staffName: staffNameInput.value.trim(),
        role: roleInput.value,
        phone: contactNoInput.value.trim(),
        is_active: statusInput.value === "Active" ? 1 : 0,
        created_at: joinDateInput.value || null
    };

    if (!payload.staffName) return alert("Name is required");
    if (!payload.role) return alert("Role is required");

    try {
        const id = staffIdInput.value;
        const method = id ? "PUT" : "POST";
        const url = id ? `${API_BASE}/${id}` : API_BASE;

        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const err = await res.json().catch(()=>({ error: 'Unknown' }));
            throw new Error(err.error || "Failed to save");
        }

        closeModal();
        await fetchStaff();
    } catch (err) {
        console.error(err);
        alert("Error saving staff: " + (err.message || ""));
    }
});

window.editStaff = async function (id) {
    const staff = staffList.find(s => s.staff_id === id);
    if (!staff) return alert("Staff not found");

    modalTitle.textContent = "Edit Staff";
    staffIdInput.value = staff.staff_id;
    staffNameInput.value = staff.staffName || "";
    roleInput.value = staff.role || "";
    contactNoInput.value = staff.phone || "";
    statusInput.value = staff.is_active ? "Active" : "Inactive";
    joinDateInput.value = staff.created_at ? new Date(staff.created_at).toISOString().slice(0,10) : "";

    openModal();
};

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
        toDeleteId = null;
        await fetchStaff();
    } catch (err) {
        console.error(err);
        alert("Error deleting staff");
    }
});

closeDeleteModalBtn?.addEventListener("click", () => { toDeleteId = null; closeDeleteModal(); });
cancelDeleteBtn?.addEventListener("click", () => { toDeleteId = null; closeDeleteModal(); });

window.addEventListener("click", (e) => {
    if (e.target === staffModal) closeModal();
    if (e.target === deleteModal) closeDeleteModal();
});

fetchStaff();
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