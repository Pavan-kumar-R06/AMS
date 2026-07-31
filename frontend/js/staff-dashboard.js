document.addEventListener('DOMContentLoaded', () => {
    const welcomeMessage = document.getElementById('welcomeMessage');
    const totalRequests = document.getElementById('totalRequests');
    const pendingRequests = document.getElementById('pendingRequests');
    const workingRequests = document.getElementById('workingRequests');
    const completedRequests = document.getElementById('completedRequests');
    const logoutButton = document.getElementById('logoutBtn'); 
    const staffId = localStorage.getItem('staffId');

    const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://ams-git-main-pavankumar060905-8109s-projects.vercel.app/";

    async function loadDashboard() {
        if (!staffId) {
            welcomeMessage.textContent = `Welcome, Guest. Please log in.`;
            return; 
        }
        
        try {
            const res = await fetch(`${API_URL}/api/staff/dashboard?staffId=${staffId}`, {
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

            welcomeMessage.textContent = `Welcome, ${data.name || 'Staff'}`;
            totalRequests.textContent = data.totalRequests || 0;
            pendingRequests.textContent = data.requests.pending || 0;
            workingRequests.textContent = data.requests.working || 0;
            completedRequests.textContent = data.requests.completed || 0;

        } catch (err) {
            console.error(err);
            alert('Error loading dashboard');
        }
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', async (e) => {
            e.preventDefault();
            
            localStorage.removeItem('amsUser');
            localStorage.removeItem('staffId');

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


