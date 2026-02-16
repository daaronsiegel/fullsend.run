export const employees = [];

export function saveEmployees(employees) {
    localStorage.setItem('employees', JSON.stringify(employees));
}

export function loadEmployees() {
    const stored = localStorage.getItem('employees');
    return stored ? JSON.parse(stored) : employees;
}

export function addEmployee(employee) {
    const allEmployees = loadEmployees();
    allEmployees.push(employee);
    saveEmployees(allEmployees);
}

export function getNextEmployeeId() {
    const allEmployees = loadEmployees();
    return Math.max(...allEmployees.map(e => e.id), 0) + 1;
}