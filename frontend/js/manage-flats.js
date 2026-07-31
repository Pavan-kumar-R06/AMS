
const logoutButton = document.getElementById('logoutBtn');
const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://ams-git-main-pavankumar060905-8109s-projects.vercel.app/";

    
const apiUrl = `${API_URL}/api/flats`;
const ownersApiUrl = `${API_URL}/api/owners`; 

document.addEventListener('DOMContentLoaded', () => {
    loadFlats();
    loadAllFlatsForFilter(); 

    const addBtn = document.getElementById('addFlatBtn');
    const flatForm = document.getElementById('flatForm');

    addBtn.addEventListener('click', () => openModal());
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('searchBtn').addEventListener('click', loadFlats);
    document.getElementById('statusFilter').addEventListener('change', loadFlats);
    document.getElementById('floorFilter').addEventListener('change', loadFlats);

    flatForm.addEventListener('submit', saveFlat);
});

async function loadAllFlatsForFilter() {
    try {
        const res = await fetch(apiUrl);
        const allFlats = await res.json();
        
        populateFloorFilter(allFlats);
    } catch (error) {
        console.error("Failed to load floors for filter:", error);
    }
}


async function loadFlats() {
    const search = document.getElementById('searchInput').value || '';
    const status = document.getElementById('statusFilter').value || '';
    const floor = document.getElementById('floorFilter').value || '';

    const query = `?search=${search}&status=${status}&floor=${floor}`;
    const res = await fetch(apiUrl + query);
    const flats = await res.json();

    const tbody = document.getElementById('flatsTableBody');
    tbody.innerHTML = '';

    flats.forEach(flat => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${flat.flat_id}</td>
            <td>${flat.flat_number}</td>
            <td>${flat.floor_no}</td>
            <td>${flat.flat_type}</td>
            <td>${flat.status}</td>
            <td>${flat.area_sqft}</td>
            <td>${flat.ownerName || ''}</td>
            <td>
                <button onclick="editFlat(${flat.flat_id})" class="btn btn-edit"><i class="fas fa-edit"></i></button>
                <button onclick="confirmDelete(${flat.flat_id})" class="btn btn-delete"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });

}

function populateFloorFilter(flats) {
    const floorFilter = document.getElementById('floorFilter');
    const floors = [...new Set(flats.map(f => f.floor_no))].sort((a, b) => a - b); 
    
    const selectedValue = floorFilter.value;
    
    floorFilter.innerHTML = `<option value="">All Floors</option>`;
    floors.forEach(f => {
        floorFilter.innerHTML += `<option value="${f}">${f}</option>`;
    });

    floorFilter.value = selectedValue;
}

function openModal(flat = null) {
    const modal = document.getElementById('flatModal');
    modal.style.display = 'block';
    document.getElementById('modalTitle').innerText = flat ? 'Edit Flat' : 'Add New Flat';

    if (flat) {
        document.getElementById('flatId').value = flat.flat_id;
        document.getElementById('flatNumber').value = flat.flat_number;
        document.getElementById('floorNo').value = flat.floor_no;
        document.getElementById('moduleType').value = flat.flat_type;
        document.getElementById('area_sqft').value = flat.area_sqft;
        document.getElementById('status').value = flat.status;
        document.getElementById('ownerId').value = flat.owner_id || '';
    } else {
        document.getElementById('flatForm').reset();
        document.getElementById('flatId').value = '';
    }

    loadOwners();
}

function closeModal() {
    document.getElementById('flatModal').style.display = 'none';
}

async function loadOwners() {
    try {
        const res = await fetch(ownersApiUrl);
        const owners = await res.json();
        const ownerSelect = document.getElementById('ownerId');

        ownerSelect.innerHTML = '<option value="">Select Owner (Optional)</option>';
        owners.forEach(o => {
            ownerSelect.innerHTML += `<option value="${o.owner_id}">${o.ownerName}</option>`;
        });
    } catch (err) {
        console.error('Failed to load owners:', err);
    }
}

async function saveFlat(e) {
    e.preventDefault();

    const flatId = document.getElementById('flatId').value;
    const payload = {
        flat_number: document.getElementById('flatNumber').value,
        floor_no: document.getElementById('floorNo').value,
        flat_type: document.getElementById('moduleType').value,
        area_sqft: document.getElementById('area_sqft').value || 0,
        status: document.getElementById('status').value || 'Vacant',
        apartment_id: 1 
    };

    const ownerId = document.getElementById('ownerId').value;
    if (ownerId) payload.owner_id = ownerId;

    const method = flatId ? 'PUT' : 'POST';
    const url = flatId ? `${apiUrl}/${flatId}` : apiUrl;

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok) {
            closeModal();
            loadFlats();
            loadAllFlatsForFilter(); 
        } else {
            alert(`Error saving flat: ${data.error || 'Unknown error'}`);
        }
    } catch (err) {
        console.error('Network error:', err);
        alert('Network error while saving flat');
    }
}

async function editFlat(flatId) {
    try {
        const res = await fetch(`${apiUrl}/${flatId}`);
        const flat = await res.json();
        openModal(flat);
    } catch (err) {
        console.error('Failed to fetch flat:', err);
        alert('Failed to fetch flat data');
    }
}

function confirmDelete(flatId) {
    const deleteModal = document.getElementById('deleteModal');
    deleteModal.style.display = 'block';

    document.getElementById('confirmDeleteBtn').onclick = async () => {
        try {
            await fetch(`${apiUrl}/${flatId}`, { method: 'DELETE' });
            deleteModal.style.display = 'none';
            loadFlats();
            // 🛠️ FIX: Refresh the filter options after deleting a flat
            loadAllFlatsForFilter(); 
        } catch (err) {
            console.error('Failed to delete flat:', err);
            alert('Failed to delete flat');
        }
    };

    document.getElementById('cancelDeleteBtn').onclick = () => {
        deleteModal.style.display = 'none';
    };
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