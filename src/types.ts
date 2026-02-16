export interface Employee {
    id: number;
    name: string;
    title: string;
    department: string;
    office: string;
    manager: string;
    email: string;
    phone: string;
    address: string;
    employeeId: string;
    startDate: string;
    photoUrl?: string;  // Base64 data URL
}

export interface FilterState {
    name: string;
    office: string;
    manager: string;
    department: string;
    category: string;
}

export interface AppState {
    employees: Employee[];
    filteredEmployees: Employee[];
    currentFilter: string;
}