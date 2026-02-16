import { loadEmployees, saveEmployees } from './data.js';

class DirectoryApp {
    constructor() {
        this.state = {
            employees: loadEmployees(),
            filteredEmployees: [],
            currentFilter: 'all',
            selectedEmployee: null
        };
        this.state.filteredEmployees = [...this.state.employees];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderEmployees();
        this.setupIntersectionObserver();
        this.createModal();
        this.createExportModal();
    }

    setupEventListeners() {
        const searchInputs = ['searchName', 'searchOffice', 'searchManager', 'searchDepartment'];
        searchInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.filterEmployees());
            }
        });

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.state.currentFilter = e.currentTarget.dataset.filter || 'all';
                this.filterEmployees();
            });
        });

        const addBtn = document.getElementById('addEmployeeBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                window.location.href = 'add-employee.html';
            });
        }

        // Export all button
        const exportAllBtn = document.getElementById('exportAllBtn');
        if (exportAllBtn) {
            exportAllBtn.addEventListener('click', () => this.exportAllToCSV());
        }
    }

    createModal() {
        const modal = document.createElement('div');
        modal.id = 'employeeModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close" onclick="window.directoryApp.closeModal()">✕</button>
                <div id="modalBody"></div>
            </div>
        `;
        document.body.appendChild(modal);

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    openModal(employee) {
        this.state.selectedEmployee = employee;
        const modal = document.getElementById('employeeModal');
        const modalBody = document.getElementById('modalBody');

        const departmentClass = employee.department.toLowerCase();

        modalBody.innerHTML = `
            <div class="employee-modal-header">
                <div class="modal-avatar">${this.getAvatarContent(employee)}</div>
                <div class="modal-employee-info">
                    <h2>${employee.name}</h2>
                    <div class="modal-title">${employee.title}</div>
                    <span class="department-badge ${departmentClass}">${employee.department}</span>
                </div>
            </div>

            <div class="modal-details-grid">
                <div class="modal-detail-group">
                    <div class="modal-detail-label">Email</div>
                    <div class="modal-detail-value"><a href="mailto:${employee.email}">${employee.email}</a></div>
                </div>
                <div class="modal-detail-group">
                    <div class="modal-detail-label">Phone</div>
                    <div class="modal-detail-value"><a href="tel:${employee.phone}">${employee.phone}</a></div>
                </div>
                <div class="modal-detail-group">
                    <div class="modal-detail-label">Office</div>
                    <div class="modal-detail-value">${employee.office}</div>
                </div>
                <div class="modal-detail-group">
                    <div class="modal-detail-label">Manager</div>
                    <div class="modal-detail-value">${employee.manager}</div>
                </div>
                <div class="modal-detail-group">
                    <div class="modal-detail-label">Employee ID</div>
                    <div class="modal-detail-value">${employee.employeeId}</div>
                </div>
                <div class="modal-detail-group">
                    <div class="modal-detail-label">Start Date</div>
                    <div class="modal-detail-value">${new Date(employee.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
                <div class="modal-detail-group" style="grid-column: 1 / -1;">
                    <div class="modal-detail-label">Address</div>
                    <div class="modal-detail-value">${employee.address}</div>
                </div>
            </div>

            <div class="export-buttons">
                <button class="export-btn" onclick="window.directoryApp.copyToClipboard()">
                    📋 Copy
                </button>
                <button class="export-btn" onclick="window.directoryApp.exportToVCard()">
                    📇 vCard
                </button>
                <button class="export-btn primary" onclick="window.directoryApp.emailEmployee()">
                    ✉️ Email
                </button>
            </div>
        `;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modal = document.getElementById('employeeModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        this.state.selectedEmployee = null;
    }

    copyToClipboard() {
        const emp = this.state.selectedEmployee;
        if (!emp) return;

        const text = `${emp.name}
${emp.title}
${emp.department}

Email: ${emp.email}
Phone: ${emp.phone}
Office: ${emp.office}
Manager: ${emp.manager}
Address: ${emp.address}`;

        navigator.clipboard.writeText(text).then(() => {
            this.showToast('Copied to clipboard!');
        });
    }

    exportToVCard() {
        const emp = this.state.selectedEmployee;
        if (!emp) return;

        const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${emp.name}
TITLE:${emp.title}
ORG:${emp.department}
EMAIL:${emp.email}
TEL:${emp.phone}
ADR:;;${emp.address};;;
END:VCARD`;

        const blob = new Blob([vcard], { type: 'text/vcard' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${emp.name.replace(/\s+/g, '_')}.vcf`;
        a.click();
        URL.revokeObjectURL(url);

        this.showToast('vCard downloaded!');
    }

    emailEmployee() {
        const emp = this.state.selectedEmployee;
        if (!emp) return;

        window.location.href = `mailto:${emp.email}`;
    }

    createExportModal() {
        const modal = document.createElement('div');
        modal.id = 'exportModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content export-modal-content">
                <button class="modal-close" onclick="window.directoryApp.closeExportModal()">✕</button>
                <h2 style="font-size: 1.75rem; font-weight: 700; color: var(--black); margin-bottom: 8px;">Export to CSV</h2>
                <p style="color: var(--gray-600); margin-bottom: 24px;">Select the fields you want to include in the export</p>

                <div class="select-all-actions">
                    <button class="link-btn" onclick="window.directoryApp.selectAllFields()">Select All</button>
                    <button class="link-btn" onclick="window.directoryApp.deselectAllFields()">Deselect All</button>
                    <span class="selected-count" id="selectedFieldCount">0 fields selected</span>
                </div>

                <div class="export-fields-grid" id="exportFieldsGrid"></div>

                <div class="export-actions">
                    <button class="export-btn" onclick="window.directoryApp.closeExportModal()">Cancel</button>
                    <button class="export-btn primary" onclick="window.directoryApp.performExport()" style="flex: 2;">
                        ⬇️ Export Selected Fields
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Close on overlay click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeExportModal();
            }
        });
    }

    openExportModal() {
        const modal = document.getElementById('exportModal');
        const grid = document.getElementById('exportFieldsGrid');

        const fields = [
            { key: 'name', label: 'Name' },
            { key: 'title', label: 'Job Title' },
            { key: 'department', label: 'Department' },
            { key: 'office', label: 'Office' },
            { key: 'manager', label: 'Manager' },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Phone' },
            { key: 'address', label: 'Address' },
            { key: 'employeeId', label: 'Employee ID' },
            { key: 'startDate', label: 'Start Date' }
        ];

        grid.innerHTML = fields.map(field => `
            <div class="field-checkbox selected" data-field="${field.key}">
                <input type="checkbox" id="field-${field.key}" checked onchange="window.directoryApp.updateFieldSelection()">
                <label for="field-${field.key}">${field.label}</label>
            </div>
        `).join('');

        this.updateSelectedCount();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeExportModal() {
        const modal = document.getElementById('exportModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    updateFieldSelection() {
        const checkboxes = document.querySelectorAll('.field-checkbox');
        checkboxes.forEach(box => {
            const checkbox = box.querySelector('input[type="checkbox"]');
            if (checkbox.checked) {
                box.classList.add('selected');
            } else {
                box.classList.remove('selected');
            }
        });
        this.updateSelectedCount();
    }

    updateSelectedCount() {
        const checked = document.querySelectorAll('.field-checkbox input:checked').length;
        const countEl = document.getElementById('selectedFieldCount');
        if (countEl) {
            countEl.textContent = `${checked} field${checked !== 1 ? 's' : ''} selected`;
        }
    }

    selectAllFields() {
        document.querySelectorAll('.field-checkbox input[type="checkbox"]').forEach(cb => {
            cb.checked = true;
        });
        this.updateFieldSelection();
    }

    deselectAllFields() {
        document.querySelectorAll('.field-checkbox input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
        this.updateFieldSelection();
    }

    performExport() {
        const selectedFields = Array.from(document.querySelectorAll('.field-checkbox input:checked'))
            .map(cb => cb.id.replace('field-', ''));

        if (selectedFields.length === 0) {
            alert('Please select at least one field to export');
            return;
        }

        const employees = this.state.filteredEmployees.length > 0
            ? this.state.filteredEmployees
            : this.state.employees;

        const fieldLabels = {
            name: 'Name',
            title: 'Title',
            department: 'Department',
            office: 'Office',
            manager: 'Manager',
            email: 'Email',
            phone: 'Phone',
            address: 'Address',
            employeeId: 'Employee ID',
            startDate: 'Start Date'
        };

        const headers = selectedFields.map(field => fieldLabels[field]);
        const rows = employees.map(emp => selectedFields.map(field => emp[field] || ''));

        const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `employees_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        this.closeExportModal();
        this.showToast(`CSV exported with ${selectedFields.length} fields!`);
    }

    exportAllToCSV() {
        this.openExportModal();
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'success-message show';
        toast.innerHTML = `
            <div class="success-content">
                <svg class="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.1 }
        );

        document.querySelectorAll('.employee-card').forEach(card => {
            observer.observe(card);
        });
    }

    getInitials(name) {
        return name.split(' ').map(n => n[0]).join('');
    }

    getAvatarContent(emp) {
        if (emp.photoUrl) {
            return `
                <img src="${emp.photoUrl}"
                     alt="${emp.name}"
                     class="avatar-img"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="avatar-initials" style="display: none;">${this.getInitials(emp.name)}</div>
            `;
        }
        return `<div class="avatar-initials">${this.getInitials(emp.name)}</div>`;
    }

    getDepartmentClass(department) {
        return department.toLowerCase();
    }

    filterEmployees() {
        const getName = () => document.getElementById('searchName')?.value.toLowerCase() || '';
        const getOffice = () => document.getElementById('searchOffice')?.value.toLowerCase() || '';
        const getManager = () => document.getElementById('searchManager')?.value.toLowerCase() || '';
        const getDepartment = () => document.getElementById('searchDepartment')?.value.toLowerCase() || '';

        const searchName = getName();
        const searchOffice = getOffice();
        const searchManager = getManager();
        const searchDepartment = getDepartment();

        this.state.filteredEmployees = this.state.employees.filter(emp => {
            const nameParts = emp.name.toLowerCase().split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts[nameParts.length - 1] || '';

            const matchesName = !searchName ||
                               emp.name.toLowerCase().includes(searchName) ||
                               firstName.includes(searchName) ||
                               lastName.includes(searchName);

            const matchesOffice = emp.office.toLowerCase().includes(searchOffice);
            const matchesManager = emp.manager.toLowerCase().includes(searchManager);
            const matchesDepartment = emp.department.toLowerCase().includes(searchDepartment) ||
                                    emp.title.toLowerCase().includes(searchDepartment);
            const matchesFilter = this.state.currentFilter === 'all' || emp.department === this.state.currentFilter;

            return matchesName && matchesOffice && matchesManager && matchesDepartment && matchesFilter;
        });

        this.renderEmployees();
    }

    renderEmployees() {
        const grid = document.getElementById('directoryGrid');
        const resultsInfo = document.getElementById('resultsInfo');

        if (!grid || !resultsInfo) return;

        if (this.state.filteredEmployees.length === 0) {
            grid.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">🔍</div>
                    <h3>No employees found</h3>
                    <p>Try adjusting your search criteria</p>
                </div>
            `;
            resultsInfo.textContent = 'No results';
            return;
        }

        resultsInfo.textContent = `${this.state.filteredEmployees.length} ${this.state.filteredEmployees.length === 1 ? 'employee' : 'employees'}`;

        grid.innerHTML = this.state.filteredEmployees.map((emp, index) => `
            <div class="employee-card" style="animation-delay: ${index * 0.05}s" onclick="window.directoryApp.openModal(${JSON.stringify(emp).replace(/"/g, '&quot;')})">
                <div class="employee-header">
                    <div class="avatar">${this.getAvatarContent(emp)}</div>
                    <div class="employee-name">
                        <h3>${emp.name}</h3>
                        <div class="title">${emp.title}</div>
                        <span class="department-badge ${this.getDepartmentClass(emp.department)}">${emp.department}</span>
                    </div>
                </div>
                <div class="employee-details">
                    <div class="detail-row">
                        <span class="detail-label">Office</span>
                        <span class="detail-value">${emp.office}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Manager</span>
                        <span class="detail-value">${emp.manager}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Email</span>
                        <span class="detail-value"><a href="mailto:${emp.email}" onclick="event.stopPropagation()">${emp.email}</a></span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="card-action-btn" onclick="event.stopPropagation(); window.location.href='mailto:${emp.email}'">
                        ✉️ Email
                    </button>
                    <button class="card-action-btn" onclick="event.stopPropagation(); window.location.href='tel:${emp.phone}'">
                        📞 Call
                    </button>
                </div>
            </div>
        `).join('');

        setTimeout(() => this.setupIntersectionObserver(), 100);
    }
}

// Make app globally accessible
window.directoryApp = null;

document.addEventListener('DOMContentLoaded', () => {
    window.directoryApp = new DirectoryApp();
});