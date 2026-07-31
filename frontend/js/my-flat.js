const flatDetailsContainer = document.querySelector('.flat-details');
const parkingInfoContainer = document.querySelector('.parking-info');
    const logoutButton = document.getElementById('logoutBtn'); 

    const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://apartment-management-system-nine.vercel.app";

async function loadFlatInfo() {
    try {
        const ownerId = localStorage.getItem('ownerId');
        if (!ownerId) {
            flatDetailsContainer.innerHTML = '<p>Please log in first.</p>';
            parkingInfoContainer.innerHTML = '';
            return;
        }
        const res = await fetch(`${API_URL}/api/owner/my-flat/${ownerId}`);
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Failed to fetch flat info');
        }

        const data = await res.json();
        flatDetailsContainer.innerHTML = `
            <div class="flat-detail-item">
                <div class="label">Flat Number</div>
                <div class="value">${data.flatNumber || '-'}</div>
            </div>
            <div class="flat-detail-item">
                <div class="label">Floor</div>
                <div class="value">${data.floorNo || '-'} Floor</div>
            </div>
            <div class="flat-detail-item">
                <div class="label">Area</div>
                <div class="value">${data.area || '-'} sqft</div>
            </div>
            <div class="flat-detail-item">
                <div class="label">Owner Name</div>
                <div class="value">${data.ownerName || '-'}</div> 
            </div>
            <div class="flat-detail-item">
                <div class="label">Contact</div>
                <div class="value">${data.ownerContact || '-'}</div>
            </div>
            <div class="flat-detail-item">
                <div class="label">Email</div>
                <div class="value">${data.ownerEmail || '-'}</div>
            </div>
        `;

        parkingInfoContainer.innerHTML = '';
        if (data.parkingSlots && Array.isArray(data.parkingSlots) && data.parkingSlots.length > 0) {
            const parkingHTML = data.parkingSlots.map(slot => `
                <div class="parking-slot">
                    <div class="parking-slot-icon"><i class="fas fa-car"></i></div>
                    <div class="parking-slot-info">
                        <div class="slot-number">${slot.slotNumber || '-'}</div>
                        <div class="vehicle-info">
                            <div><strong>Vehicle Number:</strong> ${slot.vehicleNo || '-'}</div>
                            <div><strong>Vehicle Type:</strong> ${slot.vehicleType || '-'}</div>
                            <div><strong>Status:</strong> <span class="status-badge ${slot.status === 'Occupied' ? 'status-active' : 'status-vacant'}">${slot.status || '-'}</span></div>
                        </div>
                    </div>
                </div>
            `).join('');

            parkingInfoContainer.innerHTML = `
                <h3><i class="fas fa-car"></i> Parking Slot Information</h3>
                ${parkingHTML}
            `;
        } else {
            parkingInfoContainer.innerHTML = '<p>No parking slots assigned.</p>';
        }

    } catch (err) {
        console.error(err);
        flatDetailsContainer.innerHTML = `<p>Error loading flat information: ${err.message}</p>`;
        parkingInfoContainer.innerHTML = '';
    }
}

window.addEventListener('DOMContentLoaded', loadFlatInfo);
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