// Live reload functionality
let lastModified = Date.now();
setInterval(async () => {
    try {
        const response = await fetch(window.location.href, { method: 'HEAD' });
        const modified = new Date(response.headers.get('Last-Modified')).getTime();
        if (lastModified && modified > lastModified) {
            console.log('File changed, reloading...');
            window.location.reload();
        }
        lastModified = modified;
    } catch (e) {
        // Silently fail if can't check
    }
}, 1000);

// Populate employee table
function populateEmployeeTable() {
    const tbody = document.getElementById('employeeTableBody');
    if (!tbody) return;

    tbody.innerHTML = employees.map(emp => `
        <tr>
            <td>${emp.name}</td>
            <td>${emp.title}</td>
            <td>${emp.department}</td>
            <td>${emp.email}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn">Edit</button>
                    <button class="action-btn delete">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Navigation
document.querySelectorAll('.nav-item[data-section]').forEach(item => {
    item.addEventListener('click', function() {
        // Update active state
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');

        // Show selected section
        const section = this.dataset.section;
        document.querySelectorAll('.content-section').forEach(sec => sec.style.display = 'none');
        const targetSection = document.getElementById(`${section}-section`);
        if (targetSection) {
            targetSection.style.display = 'block';
        }
    });
});

// Modal functions
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Close modal when clicking outside
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
        }
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    populateEmployeeTable();
});