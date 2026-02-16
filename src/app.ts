import { Employee, AppState } from './types.js';
import { loadEmployees, saveEmployees } from './data.js';

class DirectoryApp {
    private state: AppState;

    constructor() {
        this.state = {
            employees: loadEmployees(),
            filteredEmployees: [],
            currentFilter: 'all'
        };

        this.state.filteredEmployees = [...this.state.employees];
        this.init();
    }

    private init(): void {
        this.setupEventListeners();
        this.renderEmployees();
        this.setupIntersectionObserver();
    }

    private setupEventListeners(): void {
        // Search inputs
        const searchInputs = ['searchName', 'searchOffice', 'searchManager', 'searchDepartment'];
        searchInputs.forEach(id => {
            const element = document.getElementById(id) as HTMLInputElement;
            if (element) {
                element.addEventListener('input', () => this.filterEmployees());
            }
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLElement;
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                target.classList.add('active');
                this.state.currentFilter = target.dataset.filter || 'all';
                this.filterEmployees();
            });
        });

        // Add employee button
        const addBtn = document.getElementById('addEmployeeBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddEmployeeForm());
        }
    }

    private setupIntersectionObserver(): void {
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

    private getInitials(name: string): string {
        return name.split(' ').map(n => n[0]).join('');
    }

    private getAvatarContent(emp: Employee): string {
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

    private filterEmployees(): void {
        const getName = () => (document.getElementById('searchName') as HTMLInputElement)?.value.toLowerCase() || '';
        const getOffice = () => (document.getElementById('searchOffice') as HTMLInputElement)?.value.toLowerCase() || '';
        const getManager = () => (document.getElementById('searchManager') as HTMLInputElement)?.value.toLowerCase() || '';
        const getDepartment = () => (document.getElementById('searchDepartment') as HTMLInputElement)?.value.toLowerCase() || '';

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

    private renderEmployees(): void {
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
            <div class="employee-card" style="animation-delay: ${index * 0.05}s">
                <div class="employee-header">
                    <div class="avatar">${this.getAvatarContent(emp)}</div>
                    <div class="employee-name">
                        <h3>${emp.name}</h3>
                        <div class="title">${emp.title}</div>
                    </div>
                </div>
                <div class="employee-details">
                    <div class="detail-row">
                        <span class="detail-label">Department</span>
                        <span class="detail-value">${emp.department}</span>
                    </div>
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
                        <span class="detail-value"><a href="mailto:${emp.email}">${emp.email}</a></span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Phone</span>
                        <span class="detail-value"><a href="tel:${emp.phone}">${emp.phone}</a></span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Start Date</span>
                        <span class="detail-value">${new Date(emp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Re-setup intersection observer for new cards
        setTimeout(() => this.setupIntersectionObserver(), 100);
    }

    private showAddEmployeeForm(): void {
        window.location.href = 'add-employee.html';
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new DirectoryApp();
});