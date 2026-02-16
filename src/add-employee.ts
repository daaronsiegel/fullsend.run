import { Employee } from './types.js';
import { addEmployee, getNextEmployeeId, loadEmployees } from './data.js';
import { ImageProcessor } from './image-utils.js';

class AddEmployeeForm {
    private form: HTMLFormElement | null;
    private selectedPhotoDataUrl: string | null = null;

    constructor() {
        this.form = document.getElementById('addEmployeeForm') as HTMLFormElement;
        this.init();
    }

    private init(): void {
        if (!this.form) return;

        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Cancel button
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }

        // Populate manager dropdown
        this.populateManagerDropdown();

        // Setup photo upload
        this.setupPhotoUpload();
    }

    private populateManagerDropdown(): void {
        const managerSelect = document.getElementById('manager') as HTMLSelectElement;
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

    private setupPhotoUpload(): void {
        const photoPreview = document.getElementById('photoPreview');
        const photoInput = document.getElementById('photoInput') as HTMLInputElement;
        const removePhotoBtn = document.getElementById('removePhotoBtn');

        if (!photoPreview || !photoInput || !removePhotoBtn) return;

        // Click to upload
        photoPreview.addEventListener('click', () => {
            photoInput.click();
        });

        // File input change
        photoInput.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
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

    private async handlePhotoSelection(file: File): Promise<void> {
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
            const photoPreviewImg = document.getElementById('photoPreviewImg') as HTMLImageElement;
            const photoPlaceholder = photoPreview?.querySelector('.photo-placeholder');
            const removePhotoBtn = document.getElementById('removePhotoBtn');

            if (photoPreviewImg && photoPreview && removePhotoBtn) {
                photoPreviewImg.src = dataUrl;
                photoPreviewImg.style.display = 'block';
                if (photoPlaceholder) {
                    (photoPlaceholder as HTMLElement).style.display = 'none';
                }
                photoPreview.classList.add('has-photo');
                removePhotoBtn.style.display = 'block';
            }
        } catch (error) {
            alert('Failed to process image. Please try another file.');
            console.error('Image processing error:', error);
        }
    }

    private clearPhoto(): void {
        this.selectedPhotoDataUrl = null;

        const photoPreview = document.getElementById('photoPreview');
        const photoPreviewImg = document.getElementById('photoPreviewImg') as HTMLImageElement;
        const photoPlaceholder = photoPreview?.querySelector('.photo-placeholder');
        const photoInput = document.getElementById('photoInput') as HTMLInputElement;
        const removePhotoBtn = document.getElementById('removePhotoBtn');

        if (photoPreviewImg && photoPreview && removePhotoBtn && photoInput) {
            photoPreviewImg.src = '';
            photoPreviewImg.style.display = 'none';
            if (photoPlaceholder) {
                (photoPlaceholder as HTMLElement).style.display = 'flex';
            }
            photoPreview.classList.remove('has-photo');
            removePhotoBtn.style.display = 'none';
            photoInput.value = '';
        }
    }

    private handleSubmit(e: Event): void {
        e.preventDefault();

        if (!this.form) return;

        const formData = new FormData(this.form);

        const employee: Employee = {
            id: getNextEmployeeId(),
            name: formData.get('name') as string,
            title: formData.get('title') as string,
            department: formData.get('department') as string,
            office: formData.get('office') as string,
            manager: formData.get('manager') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            address: formData.get('address') as string,
            employeeId: formData.get('employeeId') as string,
            startDate: formData.get('startDate') as string,
            photoUrl: this.selectedPhotoDataUrl || undefined
        };

        // Validate required fields
        if (!employee.name || !employee.email || !employee.department) {
            alert('Please fill in all required fields');
            return;
        }

        // Add employee
        addEmployee(employee);

        // Show success message
        this.showSuccessMessage();

        // Redirect after delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }

    private showSuccessMessage(): void {
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

// Initialize form when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AddEmployeeForm();
});