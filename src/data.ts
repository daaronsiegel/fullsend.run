import { Employee } from './types.js';

export const employees: Employee[] = [];

// Storage functions
export function saveEmployees(employees: Employee[]): void {
    localStorage.setItem('employees', JSON.stringify(employees));
}

export function loadEmployees(): Employee[] {
    const stored = localStorage.getItem('employees');
    return stored ? JSON.parse(stored) : employees;
}

export function addEmployee(employee: Employee): void {
    const allEmployees = loadEmployees();
    allEmployees.push(employee);
    saveEmployees(allEmployees);
}

export function getNextEmployeeId(): number {
    const allEmployees = loadEmployees();
    return Math.max(...allEmployees.map(e => e.id), 0) + 1;
}