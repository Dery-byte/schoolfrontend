# 🎓 ExamFront - Online Quiz & Course Management System

[![Angular](https://img.shields.io/badge/Angular-16.2.8-DD0031.svg?style=for-the-badge&logo=angular)](https://angular.io/)
[![Material UI](https://img.shields.io/badge/Material--UI-15.2.1-0081CB.svg?style=for-the-badge&logo=angular-material)](https://material.angular.io/)
[![CKEditor](https://img.shields.io/badge/CKEditor-5-0287D0.svg?style=for-the-badge&logo=ckeditor)](https://ckeditor.com/)

**ExamFront** is a comprehensive, multi-role web application designed to streamline the process of online education, course registration, and automated examinations. It provides a robust platform for administrators, lecturers, and students to interact in a seamless digital learning environment.

---

## 🌟 Multi-Role Features

### 👨‍💼 Administrator Portal
*   **System Oversight**: Comprehensive dashboard for monitoring user activity and system health.
*   **Course Management**: Create and manage academic categories and courses.
*   **User Management**: Oversee student and lecturer profiles, including role assignment and status toggling.
*   **Global Quiz Control**: Manage all quizzes and questions across the platform.

### 🧑‍🏫 Lecturer Portal
*   **Content Creation**: Manage personal courses and design specialized quizzes.
*   **Question Bank**: Add and edit quiz questions using a rich text editor (CKEditor) for complex formatting (math, code, etc.).
*   **Performance Tracking**: View student enrollment in courses and analyze quiz results.

### 🎓 Student / User Portal
*   **Course Registration**: Browse available courses and register for academic programs.
*   **Interactive Exams**: Take timed quizzes with clear instructions and immediate feedback.
*   **Progress Tracking**: View registered courses and historical quiz performance.
*   **Quiz Printing**: Export quizzes or results to physical formats for record-keeping.

---

## 🛠️ Technology Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | [Angular 16](https://angular.io/) |
| **UI Components** | [Angular Material](https://material.angular.io/), [PrimeNG](https://www.primefaces.org/primeng/) |
| **Rich Text Editing** | [CKEditor 5](https://ckeditor.com/ckeditor-5/) |
| **Data Visualization** | [CanvasJS](https://canvasjs.com/) |
| **Loading States** | [ngx-ui-loader](https://github.com/tusharghoshbd/ngx-ui-loader) |
| **Tables & Export** | [Angular DataTables](https://l-lin.github.io/angular-datatables/), mat-table-exporter |
| **Styling** | Bootstrap Grid & Owl Carousel (ngx-owl-carousel-o) |

---

## 📂 Project Structure

```text
src/app/
├── components/     # Shared UI components (Navbar, Sidebar, Footer)
├── pages/          # Role-based feature modules
│   ├── admin/      # Administrative dashboards and management views
│   ├── lecturer/   # Content creation and lecturer-specific tools
│   ├── user/       # Student course registration and exam interface
│   ├── layouts/    # Master templates for different user roles
│   └── login/      # Authentication and account management
├── services/       # API integration, guards (AdminGuard, NormalGuard), and state management
└── custom-pipes/   # Formatting utilities for templates
```

---

## 🚀 Getting Started

### Prerequisites
*   **Node.js**: v16.x or higher
*   **Angular CLI**: v16.2.x
*   **npm**: v8.x or higher

### Installation
1.  **Clone the repository**:
    ```bash
    git clone [repository-url]
    cd examfront_Angular
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```

### Development
Run the local development server:
```bash
# Serves on port 80 by default (as configured in package.json)
npm start
```
Navigate to `http://localhost:80/`. The application will automatically reload if you change any source files.

### Production Build
Generate an optimized production bundle:
```bash
npm run build
```
The output will be stored in the `dist/` directory.

---

## 📄 License

This project is proprietary. Unauthorized use, modification, or distribution is prohibited.

---
<p align="center">
  Empowering Digital Education through Seamless Examination Management
</p>
