# TransitOps

## 🚍 Project Overview

TransitOps is a centralised, role-based transport operations platform designed to reduce manual transport-management processes by providing tools for vehicle dispatch, driver management, trip tracking, maintenance, expenses, reporting and fleet operations.

The project contains a React frontend and a Node.js/Express backend with MongoDB as the database.

## ✨ Features

- Role-based authentication
- User login
- Protected frontend routes
- Transport operations dashboard
- Vehicle management
- Driver management
- Trip management
- Route management
- Passenger management
- Ticket management
- GPS page
- Maintenance tracking
- Expense management
- Fleet reports
- Dashboard statistics
- API-based frontend/backend communication

## 🏗️ Architecture

The project is divided into two main applications:

### Frontend

A React application built with Vite.

The frontend contains pages and components for:

- Login
- Dashboard
- Vehicles
- Drivers
- Trips
- Routes
- Passengers
- Tickets
- GPS

### Backend

A Node.js and Express REST API.

The backend contains:

- Controllers
- Models
- Routes
- Authentication middleware
- Database configuration
- Seeder utilities

## 🛠️ Technologies Used

### Frontend

- React
- Vite
- Axios
- React Router
- Recharts
- GSAP
- Lucide React
- Fuse.js
- ESLint

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcryptjs
- CORS
- dotenv
- Morgan
- Validator

## 📁 Project Structure

```text
TransitOps/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── package.json
├── package-lock.json
├── README.md
└── .gitignore
```

## 🔐 Authentication

The application includes authentication functionality using:

- JWT
- bcryptjs
- Protected routes
- Authentication middleware

The frontend includes protected routing so authenticated users can access the relevant application pages.

## 🗄️ Database

The backend uses **MongoDB** through Mongoose.

The project contains models for areas including:

- Users
- Vehicles
- Drivers
- Trips
- Expenses
- Maintenance

## 🔌 Backend API

The backend is organized into separate route and controller modules for:

- Authentication
- Vehicles
- Drivers
- Trips
- Expenses
- Dashboard
- Reports
- Maintenance

This structure separates application logic into manageable modules.

## ▶️ How to Run Locally

### Requirements

- Node.js
- npm
- MongoDB
- A web browser

### 1. Backend Setup

Open a terminal in the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file using `backend/.env.example` as a reference and provide your own configuration values.

Then start the backend:

```bash
npm run dev
```

For normal execution:

```bash
npm start
```

### 2. Frontend Setup

Open another terminal in the frontend directory:

```bash
cd frontend
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The terminal will provide the local URL for the frontend.

## ⚙️ Environment Variables

The repository includes:

```text
backend/.env.example
```

Do not commit real database passwords, JWT secrets, API keys or other private credentials.

Create your own `.env` file locally based on the example configuration.

## 📊 Main Application Areas

The frontend includes dedicated pages for:

- Dashboard
- Vehicles
- Drivers
- Routes
- Trips
- Passengers
- Tickets
- GPS

The backend provides corresponding controllers, models and routes for major transport-management operations.

## 🧪 Development

The frontend provides scripts for:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

The backend provides:

```bash
npm run dev
npm start
```

## 📌 Project Type

**Full Stack Development | React | Node.js | Express | MongoDB | Transport Management**

## 💡 Skills Demonstrated

- Full-stack web development
- React frontend development
- REST API development
- Node.js and Express
- MongoDB and Mongoose
- JWT authentication
- Protected routes
- CRUD operations
- Database modelling
- Dashboard development
- API integration using Axios
- Modular frontend/backend architecture
