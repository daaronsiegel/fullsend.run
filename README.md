# Employee Directory - TypeScript Edition

A modern, polished employee directory application built with TypeScript, featuring a design inspired by Apple and UI.com with Butzel.com's professional color scheme.

## 🎨 Features

- **Modern Design**: Inspired by Apple.com and UI.com with smooth animations and transitions
- **Professional Color Scheme**: Red and black accents with professional grays from Butzel.com
- **TypeScript**: Fully typed for better code quality and maintainability
- **Clickable Cards**: Click any employee card to view full details in a modal
- **Export Functionality**:
  - Export individual employees to vCard (.vcf)
  - Copy employee details to clipboard
  - Export entire directory to CSV
- **Department Badges**: Color-coded badges for quick department identification
- **Quick Actions**: Email and call buttons directly from cards
- **Add Employees**: Dedicated page for manually adding new employees
- **Live Search**: Real-time filtering by name, office, manager, and department
- **Responsive**: Works beautifully on desktop, tablet, and mobile
- **Persistent Storage**: Uses localStorage to save employee data
- **Smooth Animations**: Intersection Observer API for scroll animations
- **Dark Accents**: Black buttons and elements for premium feel
- **Keyboard Shortcuts**: Press Escape to close modal

## 📁 Project Structure

```
/daaronsiegel/
├── src/                    # TypeScript source files
│   ├── types.ts           # Type definitions
│   ├── data.ts            # Employee data and storage functions
│   ├── app.ts             # Main directory app
│   └── add-employee.ts    # Add employee form logic
├── dist/                   # Compiled JavaScript (ES6 modules)
│   ├── data.js
│   ├── app.js
│   └── add-employee.js
├── index.html              # Main directory page
├── add-employee.html       # Add employee page
├── admin-console.html      # Admin console
├── styles-new.css          # Modern polished styles
├── add-employee.css        # Add employee page styles
├── admin-styles.css        # Admin console styles
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

## 🚀 Getting Started

1. **Open in browser**: Navigate to `http://localhost:8000/index.html`
2. **Search**: Use the search fields to filter employees
3. **Add Employee**: Click "Add Employee" button to add new team members
4. **Admin**: Access admin-console.html for advanced features

## 💻 TypeScript Development

### Source Files (src/)
- `types.ts` - Interface definitions for Employee, FilterState, and AppState
- `data.ts` - Employee data management and localStorage functions
- `app.ts` - Main application logic (DirectoryApp class)
- `add-employee.ts` - Add employee form handling (AddEmployeeForm class)

### Compiled Output (dist/)
The TypeScript files are compiled to modern ES6 modules in the `dist/` folder.

To compile TypeScript (requires Node.js):
```bash
npm install -g typescript
tsc
```

## 🎨 Design System

### Colors (Butzel.com inspired)
- **Red Dark**: #991b1b
- **Red**: #dc2626
- **Red Light**: #ef4444
- **Grays**: #f7fafc to #171923
- **Primary Accent**: Red (#dc2626)

### Typography
- **Font**: SF Pro Display, Segoe UI, Roboto
- **Headings**: 600 weight, tight letter-spacing
- **Body**: 400 weight, comfortable line-height

### Components
- **Glassmorphism nav**: Blurred backdrop with transparency
- **Smooth transitions**: cubic-bezier(0.4, 0, 0.2, 1)
- **Elevation**: 5-level shadow system
- **Border radius**: 8-16px for modern feel

## 📝 Adding Employees

Navigate to the "Add Employee" page to manually add employees with:
- Full Name
- Email Address
- Phone Number
- Home Address
- Employee ID
- Job Title
- Department
- Manager
- Office Location
- Start Date

All data is saved to localStorage and immediately available in the directory.

## 🔧 Features

### Search & Filter
- **Name search**: Matches first, last, or full name
- **Office filter**: Find employees by location
- **Manager filter**: See team structures
- **Department categories**: Quick filtering by department

### Animations
- **Scroll reveal**: Cards animate in on scroll
- **Hover effects**: Smooth elevation changes
- **Transitions**: All interactions use easing functions

### Data Persistence
- Uses browser localStorage
- Automatically loads saved employees
- Merge with default data
- Auto-incrementing employee IDs

## 🌐 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## 📱 Responsive Design

- **Desktop**: Multi-column grid layout
- **Tablet**: 2-column grid
- **Mobile**: Single-column stacked layout
- **Navigation**: Responsive with mobile menu

## 🎯 Future Enhancements

- [ ] Backend API integration
- [ ] CSV import/export
- [ ] Photo uploads
- [ ] Advanced filtering
- [ ] Email notifications
- [ ] Department hierarchy view
- [ ] Calendar integration

---

Built with ❤️ using TypeScript, modern CSS, and ES6 modules