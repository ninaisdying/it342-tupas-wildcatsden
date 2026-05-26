# WildcatsDEN — IT342 Tupas 

**IT342-G5 | Systems Integration and Architecture 1**

WildcatsDEN is a web and mobile-based venue booking and management system designed for CIT-U students, faculty, and event organizers. The platform allows users to browse venues, check availability, and manage reservations efficiently while giving administrators and custodians complete venue and booking management tools.

---

## Overview

WildcatsDEN consists of:

* A Spring Boot REST API backend
* A React-based web frontend
* An Android mobile application
* PostgreSQL database integration
* JWT authentication and authorization

The system supports venue management, booking workflows, file uploads, and user profile management.

---

## Features

### User Features

* Secure registration and login
* Browse and search available venues
* View venue details and availability
* Book venues
* View booking history
* Cancel bookings
* Upload and update profile photos
* Secure logout

### Admin Features

* Add, update, view, and delete venues
* Add, update, view, and delete users
* Manage bookings
* Approve or decline booking requests

### Custodian Features

* View assigned venues
* Manage booking requests
* Access profile information

---

## Tech Stack

### Backend

* Java 17
* Spring Boot
* Spring Web
* Spring Data JPA
* PostgreSQL
* JWT Authentication

### Frontend

* React
* JavaScript
* Create React App

### Mobile

* Android Studio
* Gradle
* Kotlin / Java

### Storage

* PostgreSQL Database
* Local File Upload Storage

---

## Project Structure

```text
WildcatsDEN/
│
├── backend/wildcatsden/     # Spring Boot backend
├── web/wildcats-den/        # React frontend
├── mobile/                  # Android application
├── uploads/                 # Runtime uploaded files
│
└── README.md
```

---

## System Architecture

```text
Frontend (React / Android)
            │
            ▼
     Spring Boot REST API
            │
            ▼
       PostgreSQL Database
```

---

## Prerequisites

Before running the project, make sure the following are installed:

* Java 17+
* Maven
* Node.js 16+
* npm
* PostgreSQL
* Android Studio 

---

# Installation

## Clone the Repository

```bash
git clone https://github.com/NinaIsDying/IT342-Tupas-WildcatsDEN.git
cd IT342-Tupas-WildcatsDEN
```

---

## Backend Setup

Navigate to the backend directory:

```bash
cd backend/wildcatsden
```

### Configure the Database

Edit:

```text
src/main/resources/application.properties
```

Update your PostgreSQL configuration and upload directory settings.

Example:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/wildcatsden
spring.datasource.username=postgres
spring.datasource.password=your_password

file.upload-dir=uploads
```

---

## Run the Backend

### Using Maven Wrapper

#### Windows

```powershell
.\mvnw.cmd spring-boot:run
```

#### Linux / macOS

```bash
./mvnw spring-boot:run
```

### Build and Run JAR

```bash
./mvnw clean package -DskipTests
java -jar target/*.jar
```

---

## Frontend Setup

Navigate to the frontend directory:

```bash
cd web/wildcats-den
```

Install dependencies:

```bash
npm install
```

Run the frontend:

```bash
npm start
```

---

## Mobile Application Setup

Open the `mobile/` directory using Android Studio.

Configure:

* `local.properties`
* SDK paths
* Build configurations

Then sync the Gradle project and run the application.

---

## Environment Variables

### Frontend

File:

```text
web/wildcats-den/.env
```

Variable:

```env
REACT_APP_API_URL=http://localhost:8080/api
```

---

## Important Backend Files

### Application Configuration

```text
backend/wildcatsden/src/main/resources/application.properties
```
---

# API Endpoints

## Authentication

### Sign In

```http
POST /api/auth/signin
```

Request Body:

```json
{
  "email": "user@email.com",
  "password": "password"
}
```

### Sign Up

```http
POST /api/auth/signup
```

---

## Users

### Get User

```http
GET /api/users/{id}
```

### Update User

```http
PUT /api/users/{id}
```

### Upload Profile Photo

```http
PUT /api/users/{id}/profile-photo
```

Content-Type:

```text
multipart/form-data
```

Field:

```text
photo
```

---

## Files

### Upload File

```http
POST /api/files/upload
```

### Get Uploaded File

```http
GET /api/files/uploads/{fileName}
```

---

## Venues

### Get All Venues

```http
GET /api/venues
```

### Update Venue

```http
PUT /api/venues/{id}
```

---

## Bookings

Booking-related endpoints are available under:

```http
/api/bookings
```

---

# Example Requests

## Upload Profile Photo

```bash
curl -X PUT \
  -F "photo=@/path/to/photo.jpg" \
  "http://localhost:8080/api/users/123/profile-photo"
```

---

## Fetch Uploaded File

```bash
curl "http://localhost:8080/api/files/uploads/sample.jpg"
```

---

# File Upload Flow

1. Frontend sends a `multipart/form-data` request to:

```http
PUT /api/users/{id}/profile-photo
```

2. The backend receives the uploaded file using `MultipartFile`.

3. The file is stored in the configured upload directory.

4. The backend generates a public file URL.

5. The user's `profilePhoto` field is updated and saved.

6. The frontend refreshes the user state and displays the updated profile photo.

---

# Deployment Notes

## Frontend

The frontend is deployed in: 

* Render
``
https://it342-tupas-wildcatsden.onrender.com
``

## Backend

The backend is deployed in: 

* Render
``
https://it342-tupas-wildcatsden-1.onrender.com
``
---

# Contributing

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/feature-name
```

3. Commit changes

```bash
git commit -m "feat: add new feature"
```

4. Push to your branch

```bash
git push origin feature/feature-name
```

5. Open a Pull Request

---

# Commit Convention

This project follows the Conventional Commits specification.

Format:

```text
<type>[optional scope]: <description>
```

Examples:

```text
feat(auth): add JWT authentication
fix(booking): resolve duplicate booking issue
docs(readme): update installation guide
```

---

# License

This project is developed for academic purposes under the IT342 course at Cebu Institute of Technology - University.
