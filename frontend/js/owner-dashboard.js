document.addEventListener('DOMContentLoaded', () => {
    const welcomeMessage = document.getElementById('welcomeMessage');
    const flatNumber = document.getElementById('flatNumber');
    const parkingSlot = document.getElementById('parkingSlot');
    const activeRequests = document.getElementById('activeRequests');
    const logoutButton = document.getElementById('logoutBtn'); 

    const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://ams-git-main-pavankumar060905-8109s-projects.vercel.app";

    async function loadDashboard() {
        try {
            const ownerId = localStorage.getItem('ownerId');
            if (!ownerId) {
                welcomeMessage.textContent = 'Welcome, Guest. Please log in.';
                return;
            }

            const res = await fetch(`${API_URL}/api/owner/dashboard?ownerId=${ownerId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to fetch dashboard data');
            }
            const data = await res.json();

            welcomeMessage.textContent = `Welcome, ${data.name || 'owner'}`;

            if (data.flat) {
                flatNumber.textContent = data.flat.number || 'N/A';
                const cardDetails = document.querySelector('#flatNumber').parentElement.querySelector('.card-details');
                if (cardDetails) {
                    cardDetails.innerHTML = `
                        <div>Floor: ${data.flat.floor || '-'}</div>
                        <div>Area: ${data.flat.area || '-'} sqft</div>
                    `;
                }
            } else {
                 flatNumber.textContent = 'N/A';
            }

            // Parking Info
            if (data.parking) {
                parkingSlot.textContent = data.parking.slotNumber || 'N/A';
                const cardDetails = document.querySelector('#parkingSlot').parentElement.querySelector('.card-details');
                if (cardDetails) {
                    cardDetails.innerHTML = `
                        <div>Vehicle: ${data.parking.vehicle || '-'}</div>
                        <div>Type: ${data.parking.vehicleType || '-'}</div>
                    `;
                }
            } else {
                parkingSlot.textContent = 'None';
            }

            if (data.activeRequests) {
                activeRequests.textContent = data.activeRequests.total || 0;
                const cardDetails = document.querySelector('#activeRequests').parentElement.querySelector('.card-details');
                if (cardDetails) {
                    cardDetails.innerHTML = `
                        <div>${data.activeRequests.pending || 0} Pending</div>
                        <div>${data.activeRequests.working || 0} Working/Assigned</div>
                    `;
                }
            }
        } catch (err) {
            console.error('DASHBOARD CLIENT ERROR:', err);
            welcomeMessage.textContent = 'Error loading data.';
            alert(err.message || 'Error loading dashboard data.');
        }
    }
    if (logoutButton) {
        logoutButton.addEventListener('click', async (e) => {
            e.preventDefault();
            
            localStorage.removeItem('amsUser');
            localStorage.removeItem('ownerId'); 
            localStorage.removeItem('ownerId');

            try {
                await fetch(`${API_URL}/api/auth/logout`, {
                    method: 'POST'
                });
            } catch (err) {
                console.warn("Server logout failed, but client data is cleared.", err);
            }

            window.location.href = 'index.html'; 
        });
    }

    loadDashboard();
});

