const logoutButton = document.getElementById('logoutBtn'); 
document.addEventListener('DOMContentLoaded', () => {
    const statusToggle = document.getElementById('statusToggle');
    const statusText = document.getElementById('statusText');
    const staffId = localStorage.getItem('staffId'); 

        const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://ams-git-main-pavankumar060905-8109s-projects.vercel.app";

    async function loadProfile() {
        try {
            if (!staffId) {
                document.getElementById('profileContainer').innerHTML = '<p style="color:red;">Error: Staff ID missing. Please log in.</p>';
                throw new Error('Staff ID missing in localStorage');
            }

            const res = await fetch(`${API_URL}/api/staff/profile?staffId=${staffId}`);
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to fetch profile');
            }

            const data = await res.json();
            document.getElementById('staffId').textContent = data.id || 'N/A';
            document.getElementById('staffName').textContent = data.name || 'N/A';
            document.getElementById('staffRole').textContent = data.role || 'N/A';
            document.getElementById('staffContact').textContent = data.contact || 'N/A';
            document.getElementById('staffEmail').textContent = data.email || 'N/A';
            document.getElementById('staffJoinDate').textContent = new Date(data.joinDate).toLocaleDateString() || 'N/A';
            statusToggle.checked = data.status === 'Active';
            statusText.textContent = data.status;
            statusText.style.color = data.status === 'Active' ? 'green' : 'red';
        } catch (err) {
            console.error(err);
            alert('Error loading profile: ' + err.message);
        }
    }

    statusToggle.addEventListener('change', async () => {
        if (!staffId) {
            alert('Cannot update status: Staff ID is missing.');
            statusToggle.checked = !statusToggle.checked;
            return;
        }

        const newStatus = statusToggle.checked ? 'Active' : 'Inactive';
        try {
            const res = await fetch(`${API_URL}/api/staff/profile/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ staffId, status: newStatus }) 
            });

            if (!res.ok) {
                 const errorData = await res.json();
                 throw new Error(errorData.message || errorData.error || 'Failed to update status');
            }

            statusText.textContent = newStatus;
            statusText.style.color = newStatus === 'Active' ? 'green' : 'red';
            console.log(`Status changed to ${newStatus} successfully.`);
            
        } catch (err) {
            console.error(err);
            alert('Error updating status: ' + err.message);
            statusToggle.checked = !statusToggle.checked; 
        }
    });

    loadProfile();
});

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