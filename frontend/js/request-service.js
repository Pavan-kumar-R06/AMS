const logoutButton = document.getElementById('logoutBtn'); 

document.addEventListener('DOMContentLoaded', () => {
    const serviceForm = document.getElementById('serviceRequestForm');
    const resetBtn = document.getElementById('resetBtn');
    const successModal = document.getElementById('successModal');
    const closeSuccessModal = document.getElementById('closeSuccessModal');
    const okBtn = document.getElementById('okBtn');

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://apartment-management-system-nine.vercel.app";

    serviceForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const ownerId = localStorage.getItem('ownerId'); 
        
        if (!ownerId) {
            alert("Owner ID required. Please login as a owner.");
            return;
        }

        const requestData = {
            ownerId: parseInt(ownerId), // Ensure ID is sent as an integer
            title: document.getElementById('requestType').value,
            description: document.getElementById('description').value,
            priority: document.getElementById('priority').value,
            requestDate: document.getElementById('preferredDate').value,
            contactPhone: document.getElementById('contactPhone').value
        };

        if (!requestData.title || !requestData.description) {
            alert("Title and description required");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/owner/service-requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });

            const data = await res.json();
            console.log("Submit Response:", data);

            if (res.ok) {
                successModal.style.display = 'block';
                serviceForm.reset();
            } else {
                alert(data.error || 'Failed to submit request');
            }
        } catch (err) {
            console.error(err);
            alert('Server error. Try again later.');
        }
    });

    resetBtn.addEventListener('click', () => serviceForm.reset());
    closeSuccessModal.addEventListener('click', () => successModal.style.display = 'none');
    okBtn.addEventListener('click', () => successModal.style.display = 'none');
});

if (logoutButton) {
    logoutButton.addEventListener('click', async (e) => {
        e.preventDefault();
        
        localStorage.removeItem('amsUser');
        localStorage.removeItem('adminId');
        localStorage.removeItem('staffId');
        localStorage.removeItem('ownerId'); // Correct key to clear
        localStorage.removeItem('ownerId'); // Optional: Clear this too, just in case

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