import { addEmployee, getNextEmployeeId, loadEmployees } from './data.js';
import { ImageProcessor } from './image-utils.js';

class AddEmployeeForm {
    constructor() {
        this.form = document.getElementById('addEmployeeForm');
        this.selectedPhotoDataUrl = null;
        this.init();
    }

    init() {
        if (!this.form) return;

        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }

        this.populateManagerDropdown();
        this.populateDepartmentDropdown();
        this.populateOfficeDropdown();
        this.setupPhotoUpload();
    }

    populateManagerDropdown() {
        const managerSelect = document.getElementById('manager');
        if (!managerSelect) return;

        const employees = loadEmployees();
        const managers = employees.filter(e =>
            e.title.includes('Manager') ||
            e.title.includes('Director') ||
            e.title.includes('Officer') ||
            e.title.includes('CEO')
        );

        managerSelect.innerHTML = '<option value="">Select Manager</option>' +
            managers.map(m => `<option value="${m.name}">${m.name} - ${m.title}</option>`).join('');
    }

    populateDepartmentDropdown() {
        const departmentSelect = document.getElementById('department');
        if (!departmentSelect) return;

        const departments = JSON.parse(localStorage.getItem('departments') || '["Engineering", "Sales", "Marketing", "HR", "Finance", "Operations", "Executive"]');

        departmentSelect.innerHTML = '<option value="">Select Department</option>' +
            departments.map(d => `<option value="${d}">${d}</option>`).join('');
    }

    populateOfficeDropdown() {
        const officeSelect = document.getElementById('office');
        if (!officeSelect) return;

        const offices = JSON.parse(localStorage.getItem('offices') || '["San Francisco, CA", "New York, NY", "Austin, TX", "Seattle, WA", "Boston, MA", "Remote"]');

        officeSelect.innerHTML = '<option value="">Select Office</option>' +
            offices.map(o => `<option value="${o}">${o}</option>`).join('');
    }

    setupPhotoUpload() {
        const photoPreview = document.getElementById('photoPreview');
        const photoInput = document.getElementById('photoInput');
        const removePhotoBtn = document.getElementById('removePhotoBtn');

        if (!photoPreview || !photoInput || !removePhotoBtn) return;

        // Click to upload
        photoPreview.addEventListener('click', () => {
            photoInput.click();
        });

        // File input change
        photoInput.addEventListener('change', (e) => {
            const target = e.target;
            const file = target.files?.[0];
            if (file) {
                this.handlePhotoSelection(file);
            }
        });

        // Drag and drop
        photoPreview.addEventListener('dragover', (e) => {
            e.preventDefault();
            photoPreview.classList.add('drag-over');
        });

        photoPreview.addEventListener('dragleave', () => {
            photoPreview.classList.remove('drag-over');
        });

        photoPreview.addEventListener('drop', (e) => {
            e.preventDefault();
            photoPreview.classList.remove('drag-over');

            const file = e.dataTransfer?.files[0];
            if (file) {
                this.handlePhotoSelection(file);
            }
        });

        // Remove photo button
        removePhotoBtn.addEventListener('click', () => {
            this.clearPhoto();
        });
    }

    async handlePhotoSelection(file) {
        // Validate file
        const validation = ImageProcessor.validateImageFile(file);
        if (!validation.valid) {
            alert(validation.error);
            return;
        }

        try {
            // Process image
            const dataUrl = await ImageProcessor.processImage(file);
            this.selectedPhotoDataUrl = dataUrl;

            // Update preview
            const photoPreview = document.getElementById('photoPreview');
            const photoPreviewImg = document.getElementById('photoPreviewImg');
            const photoPlaceholder = photoPreview?.querySelector('.photo-placeholder');
            const removePhotoBtn = document.getElementById('removePhotoBtn');

            if (photoPreviewImg && photoPreview && removePhotoBtn) {
                photoPreviewImg.src = dataUrl;
                photoPreviewImg.style.display = 'block';
                if (photoPlaceholder) {
                    photoPlaceholder.style.display = 'none';
                }
                photoPreview.classList.add('has-photo');
                removePhotoBtn.style.display = 'block';
            }
        } catch (error) {
            alert('Failed to process image. Please try another file.');
            console.error('Image processing error:', error);
        }
    }

    clearPhoto() {
        this.selectedPhotoDataUrl = null;

        const photoPreview = document.getElementById('photoPreview');
        const photoPreviewImg = document.getElementById('photoPreviewImg');
        const photoPlaceholder = photoPreview?.querySelector('.photo-placeholder');
        const photoInput = document.getElementById('photoInput');
        const removePhotoBtn = document.getElementById('removePhotoBtn');

        if (photoPreviewImg && photoPreview && removePhotoBtn && photoInput) {
            photoPreviewImg.src = '';
            photoPreviewImg.style.display = 'none';
            if (photoPlaceholder) {
                photoPlaceholder.style.display = 'flex';
            }
            photoPreview.classList.remove('has-photo');
            removePhotoBtn.style.display = 'none';
            photoInput.value = '';
        }
    }

    handleSubmit(e) {
        e.preventDefault();

        if (!this.form) return;

        const formData = new FormData(this.form);

        const employee = {
            id: getNextEmployeeId(),
            name: formData.get('name'),
            title: formData.get('title'),
            department: formData.get('department'),
            office: formData.get('office'),
            manager: formData.get('manager'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            employeeId: formData.get('employeeId'),
            startDate: formData.get('startDate'),
            photoUrl: this.selectedPhotoDataUrl || undefined
        };

        if (!employee.name || !employee.email || !employee.department) {
            alert('Please fill in all required fields');
            return;
        }

        addEmployee(employee);
        this.showSuccessMessage();

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }

    showSuccessMessage() {
        const message = document.createElement('div');
        message.className = 'success-message';
        message.innerHTML = `
            <div class="success-content">
                <svg class="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Employee added successfully!</span>
            </div>
        `;
        document.body.appendChild(message);

        setTimeout(() => {
            message.classList.add('show');
        }, 100);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AddEmployeeForm();
});