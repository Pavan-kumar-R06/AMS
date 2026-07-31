    const logoutButton = document.getElementById('logoutBtn');
const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://ams-git-main-pavankumar060905-8109s-projects.vercel.app/";

const apiUrl = `${API_URL}/api/owners`;
const flatsApi = `${API_URL}/api/flats`;
const usersApi = `${API_URL}/api/users`;

document.addEventListener('DOMContentLoaded', () => {
    loadOwners();
    loadFlats();

    document.getElementById('addOwnerBtn').addEventListener('click', () => openModal());
    document.getElementById('cancelBtn').addEventListener('click', () => closeModal());

    document.getElementById('ownerForm').addEventListener('submit', saveOwner);
    
});

async function loadOwners() {
    const res = await fetch(apiUrl);
    const owners = await res.json();
    const tbody = document.getElementById('ownersTableBody');
    tbody.innerHTML = '';

    owners.forEach(owner => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${owner.owner_id}</td>
            <td>${owner.ownerName}</td>
            <td>${owner.phone || ''}</td>
            <td>${owner.email || ''}</td>
            <td>${owner.flat_number || ''}</td>
           
        <td>
    <button onclick="editOwner(${owner.owner_id})" class="btn btn-edit">
        <i class="fas fa-edit"></i>
    </button>

    <button onclick="confirmDelete(${owner.owner_id})" class="btn btn-delete">
        <i class="fas fa-trash"></i>
    </button>
</td>
        `;
        tbody.appendChild(tr);
    });
}

async function loadFlats() {
    const res = await fetch(flatsApi);
    const flats = await res.json();
    const select = document.getElementById('flatId');
    select.innerHTML = '<option value="">Select Flat (Optional)</option>';

    flats
        .filter(f => f.status !== 'Occupied') 
        .forEach(f => {
            select.innerHTML += `<option value="${f.flat_id}">${f.flat_number} (${f.flat_type})</option>`;
        });
}

function openModal(owner = null) {
    const modal = document.getElementById('ownerModal');
    modal.style.display = 'block';
    document.getElementById('modalTitle').innerText = owner ? 'Edit Owner' : 'Add New Owner';

    if (owner) {
        document.getElementById('ownerId').value = owner.owner_id;
        document.getElementById('ownerName').value = owner.ownerName;
        document.getElementById('contactNo').value = owner.phone || '';
        document.getElementById('email').value = owner.email || '';
        document.getElementById('flatId').value = owner.flat_id || '';
    } else {
        document.getElementById('ownerForm').reset();
        document.getElementById('ownerId').value = '';
    }
}

function closeModal() {
    document.getElementById('ownerModal').style.display = 'none';
}



async function saveOwner(e) {
    e.preventDefault();
    const ownerId = document.getElementById('ownerId').value;

    const payload = {
        ownerName: document.getElementById('ownerName').value,
        phone: document.getElementById('contactNo').value || null,
        email: document.getElementById('email').value || null,
        flat_id: document.getElementById('flatId').value || null
    };

    const method = ownerId ? 'PUT' : 'POST';
    const url = ownerId ? `${apiUrl}/${ownerId}` : apiUrl;

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (res.ok) {
            closeModal();
            loadOwners();
            loadFlats();
        } else {
            alert(`Error saving owner: ${data.error || 'Unknown error'}`);
        }
    } catch (err) {
        console.error('Network error:', err);
        alert('Network error while saving owner');
    }
}

async function editOwner(ownerId) {
    try {
        const res = await fetch(`${apiUrl}/${ownerId}`);
        const owner = await res.json();
        openModal(owner);
    } catch (err) {
        console.error('Failed to fetch owner:', err);
        alert('Failed to fetch owner data');
    }
}

function confirmDelete(ownerId) {
    const deleteModal = document.getElementById('deleteModal');
    deleteModal.style.display = 'block';

    // document.getElementById('confirmDeleteBtn').onclick = async () => {
    //     try {
    //         await fetch(`${apiUrl}/${ownerId}`, { method: 'DELETE' });
    //         deleteModal.style.display = 'none';
    //         loadOwners();
    //         loadFlats();
    //     } catch (err) {
    //         console.error('Failed to delete owner:', err);
    //         alert('Failed to delete owner');
    //     }
    // };
document.getElementById('confirmDeleteBtn').onclick = async () => {
    try {
        const res = await fetch(`${apiUrl}/${ownerId}`, {
            method: 'DELETE'
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error);
            return;
        }

        deleteModal.style.display = 'none';
        loadOwners();
        loadFlats();

    } catch (err) {
        console.error('Failed to delete owner:', err);
        alert('Failed to delete owner');
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