// Settings Management
const DEFAULT_DEPARTMENTS = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'Executive'];
const DEFAULT_OFFICES = ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Boston, MA', 'Remote'];

class SettingsManager {
    constructor() {
        this.unsavedChanges = false;
        this.currentDepartments = [];
        this.currentOffices = [];
        this.init();
    }

    init() {
        this.loadSettings();
        this.renderDepartments();
        this.renderOffices();
        this.setupEventListeners();
        this.updateSaveButton();
    }

    loadSettings() {
        // Initialize with defaults if not set
        if (!localStorage.getItem('departments')) {
            localStorage.setItem('departments', JSON.stringify(DEFAULT_DEPARTMENTS));
        }
        if (!localStorage.getItem('offices')) {
            localStorage.setItem('offices', JSON.stringify(DEFAULT_OFFICES));
        }

        // Load into current state
        this.currentDepartments = [...this.getDepartments()];
        this.currentOffices = [...this.getOffices()];
    }

    getDepartments() {
        const stored = localStorage.getItem('departments');
        return stored ? JSON.parse(stored) : DEFAULT_DEPARTMENTS;
    }

    saveDepartments(departments) {
        localStorage.setItem('departments', JSON.stringify(departments));
    }

    getOffices() {
        const stored = localStorage.getItem('offices');
        return stored ? JSON.parse(stored) : DEFAULT_OFFICES;
    }

    saveOffices(offices) {
        localStorage.setItem('offices', JSON.stringify(offices));
    }

    setupEventListeners() {
        // Add department
        document.getElementById('addDepartmentBtn')?.addEventListener('click', () => {
            const input = document.getElementById('newDepartment');
            if (input && input.value.trim()) {
                this.addDepartment(input.value.trim());
                input.value = '';
            }
        });

        // Add office
        document.getElementById('addOfficeBtn')?.addEventListener('click', () => {
            const input = document.getElementById('newOffice');
            if (input && input.value.trim()) {
                this.addOffice(input.value.trim());
                input.value = '';
            }
        });

        // Enter key support
        document.getElementById('newDepartment')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('addDepartmentBtn')?.click();
            }
        });

        document.getElementById('newOffice')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('addOfficeBtn')?.click();
            }
        });

        // Save and Cancel buttons
        document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
            this.saveAllChanges();
        });

        document.getElementById('cancelSettingsBtn')?.addEventListener('click', () => {
            this.cancelChanges();
        });

        // Warn before leaving with unsaved changes
        window.addEventListener('beforeunload', (e) => {
            if (this.unsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        });
    }

    markAsChanged() {
        this.unsavedChanges = true;
        this.updateSaveButton();
    }

    updateSaveButton() {
        const saveBtn = document.getElementById('saveSettingsBtn');
        const cancelBtn = document.getElementById('cancelSettingsBtn');
        const indicator = document.getElementById('unsavedIndicator');

        if (saveBtn && cancelBtn && indicator) {
            if (this.unsavedChanges) {
                saveBtn.disabled = false;
                cancelBtn.disabled = false;
                indicator.style.display = 'inline-flex';
                saveBtn.classList.add('has-changes');
            } else {
                saveBtn.disabled = true;
                cancelBtn.disabled = true;
                indicator.style.display = 'none';
                saveBtn.classList.remove('has-changes');
            }
        }
    }

    saveAllChanges() {
        this.saveDepartments(this.currentDepartments);
        this.saveOffices(this.currentOffices);
        this.unsavedChanges = false;
        this.updateSaveButton();
        this.showToast('✅ Changes saved successfully!');
    }

    cancelChanges() {
        if (confirm('Discard all unsaved changes?')) {
            this.currentDepartments = [...this.getDepartments()];
            this.currentOffices = [...this.getOffices()];
            this.unsavedChanges = false;
            this.renderDepartments();
            this.renderOffices();
            this.updateSaveButton();
            this.showToast('Changes discarded');
        }
    }

    addDepartment(name) {
        if (!this.currentDepartments.includes(name)) {
            this.currentDepartments.push(name);
            this.markAsChanged();
            this.renderDepartments();
            this.showToast(`Department "${name}" added (unsaved)`);
        } else {
            alert('This department already exists');
        }
    }

    deleteDepartment(name) {
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
            this.currentDepartments = this.currentDepartments.filter(d => d !== name);
            this.markAsChanged();
            this.renderDepartments();
            this.showToast(`Department "${name}" deleted (unsaved)`);
        }
    }

    editDepartment(oldName, newName) {
        if (newName && newName !== oldName) {
            this.currentDepartments = this.currentDepartments.map(d => d === oldName ? newName : d);
            this.markAsChanged();
            this.renderDepartments();
            this.showToast(`Department updated (unsaved)`);
        }
    }

    addOffice(name) {
        if (!this.currentOffices.includes(name)) {
            this.currentOffices.push(name);
            this.markAsChanged();
            this.renderOffices();
            this.showToast(`Office "${name}" added (unsaved)`);
        } else {
            alert('This office already exists');
        }
    }

    deleteOffice(name) {
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
            this.currentOffices = this.currentOffices.filter(o => o !== name);
            this.markAsChanged();
            this.renderOffices();
            this.showToast(`Office "${name}" deleted (unsaved)`);
        }
    }

    editOffice(oldName, newName) {
        if (newName && newName !== oldName) {
            this.currentOffices = this.currentOffices.map(o => o === oldName ? newName : o);
            this.markAsChanged();
            this.renderOffices();
            this.showToast(`Office updated (unsaved)`);
        }
    }

    renderDepartments() {
        const container = document.getElementById('departmentsList');
        if (!container) return;

        container.innerHTML = this.currentDepartments.map(dept => `
            <div class="option-item">
                <input type="text" value="${dept}" class="option-input" data-original="${dept}" data-type="department">
                <div class="option-actions">
                    <button class="option-btn edit" onclick="window.settingsManager.startEdit(this)">
                        ✏️
                    </button>
                    <button class="option-btn delete" onclick="window.settingsManager.deleteDepartment('${dept.replace(/'/g, "\\'")}')">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');

        const countEl = document.getElementById('departmentCount');
        if (countEl) {
            countEl.textContent = `${this.currentDepartments.length} departments`;
        }
    }

    renderOffices() {
        const container = document.getElementById('officesList');
        if (!container) return;

        container.innerHTML = this.currentOffices.map(office => `
            <div class="option-item">
                <input type="text" value="${office}" class="option-input" data-original="${office}" data-type="office">
                <div class="option-actions">
                    <button class="option-btn edit" onclick="window.settingsManager.startEdit(this)">
                        ✏️
                    </button>
                    <button class="option-btn delete" onclick="window.settingsManager.deleteOffice('${office.replace(/'/g, "\\'")}')">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');

        const countEl = document.getElementById('officeCount');
        if (countEl) {
            countEl.textContent = `${this.currentOffices.length} locations`;
        }
    }

    startEdit(button) {
        const item = button.closest('.option-item');
        const input = item.querySelector('.option-input');
        const editBtn = item.querySelector('.edit');

        if (input.disabled) {
            // Enable editing
            input.disabled = false;
            input.focus();
            input.select();
            editBtn.textContent = '✅';
            editBtn.classList.add('save');
        } else {
            // Save changes
            const original = input.dataset.original;
            const newValue = input.value.trim();
            const type = input.dataset.type;

            if (newValue) {
                if (type === 'department') {
                    this.editDepartment(original, newValue);
                } else {
                    this.editOffice(original, newValue);
                }
            }

            input.disabled = true;
            editBtn.textContent = '✏️';
            editBtn.classList.remove('save');
        }
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
}

window.settingsManager = null;

document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManager();
});