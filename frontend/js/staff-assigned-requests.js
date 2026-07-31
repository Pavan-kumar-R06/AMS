const logoutButton = document.getElementById('logoutBtn'); 
document.addEventListener('DOMContentLoaded', () => {
    const requestsList = document.getElementById('assignedRequestsList');
    const statusFilter = document.getElementById('statusFilter');
    const refreshBtn = document.getElementById('refreshBtn');

    const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://ams-git-main-pavankumar060905-8109s-projects.vercel.app";

    let assignedRequests = [];
    const staffId = localStorage.getItem('staffId');

    const fetchRequests = async () => {
        if (!staffId) {
            requestsList.innerHTML = `<p class="error">Error: Staff ID missing. Please log in.</p>`;
            return;
        }
        
        const status = statusFilter.value;
        try {
            const statusQuery = status ? `&status=${status}` : '';
            const res = await fetch(`${API_URL}/api/staff/assigned-requests?staffId=${staffId}${statusQuery}`);
            
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch requests');
            assignedRequests = data; 
            renderRequests();
        } catch (err) {
            requestsList.innerHTML = `<p class="error">Error loading requests. ${err.message}</p>`;
            console.error(err);
        }
    };

    const renderRequests = () => {
        if (!assignedRequests || assignedRequests.length === 0) {
            requestsList.innerHTML = `<p>No assigned requests found.</p>`;
            return;
        }
        requestsList.innerHTML = assignedRequests.map(r => `
            <div class="request-card">
                <div><strong>Request ID:</strong> ${r.id}</div>
                <div><strong>Type:</strong> ${r.title}</div>
                <div><strong>Priority:</strong> ${r.priority || '-'}</div>
                <div><strong>Status:</strong> <span class="status-${r.status.toLowerCase()}">${r.status}</span></div> 
                <div><strong>Date:</strong> ${new Date(r.request_date).toLocaleDateString()}</div>
                </div>
        `).join('');
    };

    statusFilter.addEventListener('change', fetchRequests);
    refreshBtn.addEventListener('click', fetchRequests);
    fetchRequests();
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