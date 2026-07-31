
const parkingTableBody = document.getElementById('parkingTableBody');
const parkingForm = document.getElementById('parkingForm');
const parkingModal = document.getElementById('parkingModal');
const addParkingBtn = document.getElementById('addParkingBtn');
const closeModalBtn = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const deleteModal = document.getElementById('deleteModal');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const flatSelect = document.getElementById('flatId');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const statusFilter = document.getElementById('statusFilter');
const vehicleTypeFilter = document.getElementById('vehicleTypeFilter');
const logoutButton = document.getElementById('logoutBtn'); 

const statusInput = document.getElementById('statusInput'); 

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://ams-git-main-pavankumar060905-8109s-projects.vercel.app";


let editingSlotId = null;
let deleteSlotId = null;
let parkingSlots = [];

async function loadFlats() {
    try {
        const res = await fetch(`${API_URL}/api/flats`);
        const flats = await res.json();
        flatSelect.innerHTML = `<option value="">Select Flat (Optional)</option>` +
            flats.map(f => `<option value="${f.flat_id}">${f.flat_number}</option>`).join('');
    } catch (err) {
        console.error(err);
    }
}

async function loadParkingSlots() {
    try {
        const res = await fetch(`${API_URL}/api/parking`);
        parkingSlots = await res.json(); 
        displayParkingSlots(parkingSlots);
    } catch (err) {
        console.error(err);
    }
}

function displayParkingSlots(slots) {
    if (slots.length === 0) {
        parkingTableBody.innerHTML = `<tr><td colspan="7" class="table-loading">No parking slots found</td></tr>`;
        return;
    }
    parkingTableBody.innerHTML = slots.map(slot => {
        const statusText = slot.is_allocated ? "Allocated" : "Vacant"; 
        return `
        <tr>
            <td>${slot.parking_id}</td>
            <td>${slot.slot_number}</td>
            <td>${slot.vehicle_no || '-'}</td>
            <td>${slot.vehicle_type || '-'}</td>
            <td>${slot.flat_number || '-'}</td>
            <td>${statusText}</td>
            <td>
                <button onclick="openEditModal(${slot.parking_id})" class="btn btn-edit"><i class="fas fa-edit"></i></button>
                <button onclick="openDeleteModal(${slot.parking_id})" class="btn btn-delete"><i class="fas fa-trash"></i></button>
            
                </td>
        </tr>`;
    }).join('');
}

addParkingBtn.addEventListener('click', () => {
    editingSlotId = null;
    parkingForm.reset();
    document.getElementById('modalTitle').textContent = 'Add New Parking Slot';
    statusInput.value = 'Vacant'; 
    parkingModal.style.display = 'block';
});

closeModalBtn.addEventListener('click', () => parkingModal.style.display = 'none');
cancelBtn.addEventListener('click', () => parkingModal.style.display = 'none');
parkingForm.addEventListener('submit', async e => {
    e.preventDefault();
    
    const vehicleNoValue = document.getElementById('vehicleNo').value.trim();
    const selectedStatus = statusInput.value; 

    const isAllocatedValue = selectedStatus === 'Allocated' ? 1 : 0;
    
    if (isAllocatedValue === 1 && !vehicleNoValue) {
        return alert("Vehicle Number is required if the status is Allocated.");
    }
    
    const data = {
        slot_number: document.getElementById('slotNumber').value,
        vehicle_no: vehicleNoValue || null, 
        vehicle_type: document.getElementById('vehicleType').value || null,
        flat_id: document.getElementById('flatId').value || null,
        is_allocated: isAllocatedValue 
    };
    
    const url = editingSlotId ? `${API_URL}/api/parking/${editingSlotId}` : `${API_URL}/api/parking`;
    const method = editingSlotId ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(err.error || 'Failed to save parking slot');
        }
        
        parkingModal.style.display = 'none';
        loadParkingSlots();
    } catch (err) {
        console.error(err);
        alert("Error saving slot: " + (err.message || ''));
    }
});

async function openEditModal(id) {
    try {
        const res = await fetch(`${API_URL}/api/parking/${id}`);
        const slot = await res.json();
        
        editingSlotId = id;
        document.getElementById('modalTitle').textContent = 'Edit Parking Slot';
        document.getElementById('slotNumber').value = slot.slot_number;
        
        document.getElementById('vehicleNo').value = slot.vehicle_no || ''; 
        document.getElementById('vehicleType').value = slot.vehicle_type || ''; 
        
        document.getElementById('flatId').value = slot.flat_id || '';
        
        statusInput.value = slot.is_allocated ? 'Allocated' : 'Vacant';
        
        parkingModal.style.display = 'block';
    } catch (err) {
        console.error(err);
    }
}

function openDeleteModal(id) {
    deleteSlotId = id;
    deleteModal.style.display = 'block';
}

cancelDeleteBtn.addEventListener('click', () => deleteModal.style.display = 'none');

confirmDeleteBtn.addEventListener('click', async () => {
    if (!deleteSlotId) return;
    try {
        await fetch(`${API_URL}/api/parking/${deleteSlotId}`, { method: 'DELETE' });
        deleteModal.style.display = 'none';
        loadParkingSlots();
    } catch (err) {
        console.error(err);
    }
});

searchBtn.addEventListener('click', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const status = statusFilter.value; 
    const vehicleType = vehicleTypeFilter.value;
    
    const filtered = parkingSlots.filter(slot => {
        const slotStatus = slot.is_allocated ? "Allocated" : "Vacant"; 
        return (
            (!searchTerm || slot.slot_number.toLowerCase().includes(searchTerm) || (slot.vehicle_no && slot.vehicle_no.toLowerCase().includes(searchTerm))) &&
            (!status || slotStatus === status) && 
            (!vehicleType || slot.vehicle_type === vehicleType)
        );
    });
    displayParkingSlots(filtered);
});

loadFlats();
loadParkingSlots();

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




//////akdfjjkasdbfbiasdndnvjndjkdnfvadkjvds