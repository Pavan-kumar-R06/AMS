document.addEventListener('DOMContentLoaded', () => {
    const totalFlats = document.getElementById('totalFlats');
    const occupiedFlats = document.getElementById('occupiedFlats');
    const vacantFlats = document.getElementById('vacantFlats');
    const totalStaff = document.getElementById('totalStaff');
    const activeStaff = document.getElementById('activeStaff');
    const inactiveStaff = document.getElementById('inactiveStaff');
    const totalOwners = document.getElementById('totalOwners');
    const totalParkingSlots = document.getElementById('totalParkingSlots');

    const staffWorkloadBody = document.getElementById('staffWorkloadBody');
    const recentRequestsBody = document.getElementById('recentRequestsBody');
    const apartmentSummaryBody = document.getElementById('apartmentSummaryBody');
    const logoutButton = document.getElementById('logoutBtn');
    const welcomeMessage = document.getElementById('welcomeMessage');

    const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://apartment-management-system-nine.vercel.app";
    



    async function loadDashboard() {
        try {
            const res = await fetch(`${API_URL}/api/admin-dashboard`);
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: 'Unknown server response' }));
                throw new Error(errorData.error || 'Failed to fetch dashboard data');
            }
            const data = await res.json();

            const storedUser = localStorage.getItem('amsUser');
            if (storedUser) {
                try {
                    const user = JSON.parse(storedUser);
                    welcomeMessage.textContent = `Welcome, ${user.username || 'Admin'}`;
                } catch {
                    welcomeMessage.textContent = `Welcome, Admin`;
                }
            } else {
                 welcomeMessage.textContent = `Welcome, Admin`;
            }

            totalFlats.textContent = data.totalFlats ?? 0;
            occupiedFlats.textContent = data.occupiedFlats ?? 0;
            vacantFlats.textContent = data.vacantFlats ?? 0;
            totalStaff.textContent = data.totalStaff ?? 0;
            activeStaff.textContent = data.activeStaff ?? 0;
            inactiveStaff.textContent = data.inactiveStaff ?? 0;
            totalOwners.textContent = data.totalOwners ?? 0;
            totalParkingSlots.textContent = data.totalParkingSlots ?? 0;

            staffWorkloadBody.innerHTML = '';
            (data.staffWorkload || []).forEach(staff => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${staff.staffName || '-'}</td>
                    <td>${staff.role || '-'}</td>
                    <td>${staff.status || '-'}</td>
                    <td>${staff.totalRequests ?? 0}</td>
                    <td>${staff.completedRequests ?? 0}</td>
                    <td>${staff.pendingRequests ?? 0}</td>
                `;
                staffWorkloadBody.appendChild(tr);
            });
            if (!data.staffWorkload?.length) staffWorkloadBody.innerHTML = '<tr><td colspan="6">No staff data found</td></tr>';

            recentRequestsBody.innerHTML = '';
            (data.recentRequests || []).forEach(req => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${req.requestId ?? '-'}</td>
                    <td>${req.ownerName || '-'}</td>
                    <td>${req.serviceType || '-'}</td>
                    <td>${req.assignedStaff || '-'}</td>
                    <td>${req.status || '-'}</td>
                    <td>${req.requestDate ? new Date(req.requestDate).toLocaleDateString() : '-'}</td>
                `;
                recentRequestsBody.appendChild(tr);
            });
            if (!data.recentRequests?.length) recentRequestsBody.innerHTML = '<tr><td colspan="6">No recent requests</td></tr>';

            apartmentSummaryBody.innerHTML = '';
            (data.apartments || []).forEach(apt => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${apt.name || '-'}</td>
                    <td>${apt.address || '-'}</td>
                    <td>${apt.totalFloors ?? '-'}</td>
                    <td>${apt.totalFlats ?? '-'}</td>
                    <td>${apt.occupiedFlats ?? '-'}</td>
                    <td>${apt.vacantFlats ?? '-'}</td>
                `;
                apartmentSummaryBody.appendChild(tr);
            });
            if (!data.apartments?.length) apartmentSummaryBody.innerHTML = '<tr><td colspan="6">No apartments data</td></tr>';

        } catch (err) {
            console.error(err);
            alert('Error loading dashboard data: ' + err.message);
        }
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

    loadDashboard();
});