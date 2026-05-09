# School Management & Eligibility System (Frontend)

A modern, responsive web application built with Angular 16, designed for managing educational institutions, courses, and student eligibility. The platform provides a seamless experience for administrators to manage data and for students to verify their academic eligibility for various programs.

## 🚀 Key Features

### 👨‍💼 Administrator Portal
- **Dashboard**: Real-time overview of system statistics and user activities.
- **University & College Management**: Add, edit, and manage educational institutions.
- **Program & Course Management**: Comprehensive tools for managing academic offerings.
- **Bulk Operations**: Upload student or institutional data via CSV/Excel.
- **User Management**: Control user access, roles, and view detailed user reports.
- **Package Management**: Handle subscription or access packages for the system.
- **System Settings**: Configure global application parameters and biodata.

### 🎓 Student / User Portal
- **Eligibility Engine**: Interactive form to enter grades and check eligibility for specific programs.
- **Results Tracking**: View and export eligibility results.
- **Personalized Dashboard**: Quick access to home and previous checks.

### 🌐 Guest Features
- **Guest Check**: Limited eligibility verification for non-registered users.
- **Blog & Information**: Publicly accessible academic resources and updates.

### 🛠️ Technical Features
- **Interactive Charts**: Visual data representation using Chart.js.
- **Document Export**: Generate PDF and Excel reports for eligibility results.
- **Secure Authentication**: JWT-based authentication flow with role-based access control (RBAC).
- **Automated API Client**: OpenAPI integration for type-safe backend communication.

## 💻 Tech Stack

- **Framework**: [Angular 16](https://angular.io/)
- **UI Components**: [Angular Material](https://material.angular.io/) & [NG Bootstrap](https://ng-bootstrap.github.io/)
- **Styling**: Bootstrap 5 & Custom CSS
- **Data Visualization**: [Chart.js](https://www.chartjs.org/) with [ng2-charts](https://valor-software.com/ng2-charts/)
- **Animations**: [Lottie Animations](https://lottiefiles.com/)
- **State Management**: RxJS
- **Reports**: jsPDF & XLSX
- **Authentication**: @auth0/angular-jwt

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.x or higher)
- [Angular CLI](https://angular.io/cli) (v16.x)

### Installation
1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd SchoolFrontEnd/schoolFrontEnd
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Development Server
Run the development server:
```bash
npm start
```
The application will be available at `http://localhost:4200/`.

### Building for Production
Create an optimized production build:
```bash
npm run build
```
Build artifacts will be stored in the `dist/` directory.

### API Client Generation
This project uses OpenAPI to generate the service layer. If the backend API changes, update the `src/openapi/openapi.json` file and run:
```bash
npm run api-gen
```

## 📂 Project Structure

```text
src/app/
├── auth/           # Authentication guards and interceptors
├── customModels/   # Shared interfaces and types
├── pages/          # Feature-based components (Admin, User, Guest)
│   ├── admin/      # Administrator-specific views
│   ├── user/       # Student-specific views
│   ├── guest/      # Public views
│   └── layouts/    # Master layouts for different roles
├── services/       # API services (generated & manual)
├── shared/         # Reusable UI components
└── Utilities/      # Helper functions and exporters
```

## 📄 License

This project is proprietary and confidential.
