# 🏢 Apartment Management System (AMS)

A full-stack **Apartment Management System** developed as a DBMS project to simplify apartment administration and owner services. The application provides dedicated dashboards for **Admin**, **Staff**, and **owners** with secure authentication and real-time database operations.

## 🚀 Live Demo


🔗 **https://ams-frontend-git-main-pavankumar060905-8109s-projects.vercel.app/**
## 📌 Features

### 👨‍💼 Admin
- Secure Login
- Dashboard Overview
- Manage Apartments
- Manage Flats
- Manage Owners
- Manage Staff
- Manage Parking Slots
- Assign Staff
- View and Manage Service Requests

### 👷 Staff
- Secure Login
- Staff Dashboard
- View Assigned Requests
- Update Request Status
- View Personal Profile

### 🏠 owner
- Secure Login
- owner Dashboard
- View Flat Information
- View Parking Details
- Create Service Requests
- Track Request Status

---

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript (ES6)

### Backend
- Node.js
- Express.js

### Database
- MongoDB

### Deployment
- Frontend & Backend: Vercel
- Database: MongoDB Atlas (or any MongoDB host)

---

## 📂 Project Structure

```text
SECOND AMS
│
├── backend
│   ├── routes
│   ├── db.js
│   ├── server.js
│
├── frontend
│   ├── css
│   ├── js
│   ├── images
│   ├── *.html
│
├── package.json
├── vercel.json
└── README.md
```

---

## 🗄️ Database

The project uses MongoDB, with collections mirroring the old MySQL tables:

- apartment
- flat
- owner
- staff
- parking_slot
- service_request
- users
- counters (internal — keeps the auto-increment style numeric ids used throughout the app, e.g. `flat_id`, `owner_id`)

Relationships that used to be Foreign Keys (e.g. `flat.apartment_id`, `owner.flat_id`, `service_request.owner_id`) are now just plain numeric fields joined at query time using MongoDB's `$lookup` aggregation stage. This keeps every id the API returns to the frontend exactly the same shape as before (plain numbers), so no frontend code needed to change.

---

## ⚙️ Installation

### Clone the Repository

```bash
git clone <repository-url>
cd SECOND-AMS
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file.

```env
MONGO_URI=mongodb+srv://<username>:<password>@<your-cluster-url>/?retryWrites=true&w=majority
DB_NAME=ams_db1
PORT=5000
```

`MONGO_URI` can point to a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster, or any MongoDB instance you have access to — no more Railway/MySQL database needed.

### Seed the database (first run only)

Creates the required collections plus a default `admin` login (`admin` / `Admin@123`):

```bash
node backend/scripts/seed.js
```

### Run the Project

```bash
npm start
```

Open:

```
http://localhost:5000
```

---

## 📸 Modules

- Authentication
- Admin Dashboard
- Staff Dashboard
- owner Dashboard
- Flat Management
- Owner Management
- Staff Management
- Parking Management
- Service Request Management

---

## 🎯 Learning Outcomes

This project demonstrates practical implementation of:

- Database Management Systems (DBMS)
- CRUD Operations
- RESTful APIs
- Relational Database Design
- Authentication
- Client–Server Architecture
- Frontend–Backend Integration
- Cloud Deployment using Vercel and Railway

---

## 👨‍💻 Developed By

**Pavan Kumar R**

Information Science & Engineering (ISE)

University Visvesvaraya College of Engineering (UVCE)

---

## 📄 License

This project is developed for educational and academic purposes.
