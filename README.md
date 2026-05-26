# WildcatsDEN — IT342 Tupas Project

> Full-stack booking and venue management application used for the IT342 course.

---

**Project summary**: WildcatsDEN is a Java Spring Boot backend with a React frontend (and an Android mobile module). It provides authentication, user profiles (including photo upload), venue listing and booking management.

**Tech stack**
- **Backend**: Java, Spring Boot, Spring Web, Spring Data JPA, PostgreSQL
- **Frontend**: React (create-react-app), JavaScript
- **Mobile**: Android (Gradle / Kotlin or Java; module at `mobile/app`)
- **Storage**: Local file uploads (served from `uploads/`), PostgreSQL (configured in `application.properties`)

---

**Repository layout (top-level)**
- `backend/wildcatsden/` — Spring Boot backend
- `web/wildcats-den/` — React frontend
- `mobile/` — Android mobile application
- `uploads/` — runtime uploaded files (created at runtime)

---

**Quick start — prerequisites**
- Java 17+ and Maven (for backend)
- Node 16+ and npm (for frontend)
- Android Studio for mobile (optional)

**Run backend locally**
1. Open terminal in `backend/wildcatsden`
2. Build and run using the included wrapper:

```powershell
cd backend/wildcatsden
.\\mvnw.cmd spring-boot:run
```

or build then run:

```powershell
.\\mvnw.cmd -DskipTests package
java -jar target/*.jar
```

Configuration: edit `backend/wildcatsden/src/main/resources/application.properties` for the database and upload dir (`file.upload-dir`).

**Run frontend locally**
1. Open terminal in `web/wildcats-den`
2. Install and start:

```bash
cd web/wildcats-den
npm install
npm start
```

Environment: set `REACT_APP_API_URL` in `web/wildcats-den/.env` to point to your backend root (example: `http://localhost:8080/api` or deployed backend `https://it342-tupas-wildcatsden-1.onrender.com/api`).

**Mobile (Android)**
- See `mobile/` for the Android project. Open in Android Studio and configure `local.properties` / build flags as needed.

---

**Environment variables & important files**
- Frontend `.env`: `web/wildcats-den/.env` — `REACT_APP_API_URL` (must include protocol and `/api` suffix if used by the client)
- Backend config: `backend/wildcatsden/src/main/resources/application.properties`
- File serving: `backend/wildcatsden/src/main/java/edu/cit/tupas/file/FileController.java` (serves `/api/files/uploads/{fileName}`)
- User API: `backend/wildcatsden/src/main/java/edu/cit/tupas/user/UserController.java` (endpoints for users and profile photo uploads)

---

**Key API endpoints (examples)**

- Auth
  - POST `/api/auth/signin` — sign in (JSON body: `{ "email":"...","password":"..." }`)
  - POST `/api/auth/signup` — register

- Users
  - GET `/api/users/{id}` — fetch a user
  - PUT `/api/users/{id}` — update user JSON
  - PUT `/api/users/{id}/profile-photo` — upload profile photo (multipart/form-data with `photo` field)

- Files
  - GET `/api/files/uploads/{fileName}` — serve uploaded file
  - POST `/api/files/upload` — generic file upload (returns `fileUrl` and `fileName`)

- Venues & Bookings
  - GET `/api/venues` — list venues
  - PUT `/api/venues/{id}` — update venue (multipart support available in controller)
  - Bookings endpoints live under `/api/bookings` (see code for details)

Examples (curl)

Upload profile photo:

```bash
curl -X PUT \
  -F "photo=@/path/to/photo.jpg" \
  "$REACT_APP_API_URL/users/123/profile-photo"
```

Fetch an uploaded file:

```bash
curl "http://localhost:8080/api/files/uploads/2026-05-25-...jpg"
```

---

**File upload & profile-photo flow (summary)**
1. Frontend sends `multipart/form-data` `PUT` to `/api/users/{id}/profile-photo` with form field `photo`.
2. Backend `UserController.uploadProfilePhoto(...)` receives a `MultipartFile` and calls `fileStorageService.storeFile(...)`.
3. File is saved to the configured upload directory; backend constructs a public file URL using the current request context and stores that URL on the user record (`user.setProfilePhoto(photoUrl)`), then persists the user.
4. Backend returns `{ message, photoUrl, user }` and frontend updates the cached user state so the new photo displays immediately.

---

**CORS & deployed frontend on Render**
- If your frontend is deployed on Render (example: `https://it342-tupas-wildcatsden.onrender.com`) you must:
  - Set `REACT_APP_API_URL` to your deployed backend (example: `https://it342-tupas-wildcatsden-1.onrender.com/api`) in the Render environment variables for the frontend service.
  - Ensure backend controllers allow that origin in their `@CrossOrigin` annotation or configure global CORS.

Common CORS error:

```
Access to fetch at 'http://localhost:8080/api/auth/signin' from origin 'https://it342-tupas-wildcatsden.onrender.com' has been blocked by CORS policy
```

This typically means the frontend is calling `localhost` while running on Render (wrong API URL) or the backend hasn't allowed the deployed origin.

---

**Troubleshooting**
- CORS: verify `REACT_APP_API_URL` and backend `@CrossOrigin` values. Restart backend after changing CORS settings.
- File not found after upload: check `uploads/` directory exists and that `FileController.serveFile` can access it. Verify `spring.web.resources.static-locations` includes `file:./uploads/` in `application.properties`.
- Cached images: browsers sometimes cache an old image — do a hard reload/clear cache or add a query string to the image URL.
- Server logs: check backend console for upload logs (controllers print successful upload lines).

---

**Deployment notes**
- Backend on Render (example)
  - Create a Render Web Service, point to `backend/wildcatsden` as the root (use the packaged jar or let Render run `./mvnw.cmd`), expose port 8080.
  - Set required environment variables (database connection, etc.).

- Frontend on Render
  - Create a Static Site or Web Service from `web/wildcats-den`.
  - Add environment variable `REACT_APP_API_URL=https://<your-backend>/api` in Render dashboard before deploy.

---

**Development tips & notes**
- Keep `REACT_APP_API_URL` out of final client-side commits that point to localhost when deploying — use the Render dashboard env vars.
- For local testing, prefer `http://localhost:8080/api`.

---

**Contributing**
- Fork the repo, create a feature branch, and open a pull request. Describe the change and reference issues.

**License**
- Add your preferred license file (`LICENSE`) at repo root. If none is present, the project is not licensed for public use.

---

If you want, I can also:
- add CI scripts for building and deploying to Render
- add a short `docker-compose` to run backend + database locally
- create a short CONTRIBUTING.md and CODE_OF_CONDUCT
#  Wildcat’s DEN

**IT342-G5 | Systems Integration and Architecture 1**

Wildcat’s DEN is a web and mobile-based venue booking and management system designed for CIT-U students, faculty, and event organizers. It allows users to browse venues, check availability, and book spaces efficiently while providing administrators and custodians tools to manage venues and bookings.

---

##  Features

###  User Features
- Register and login securely
- Browse and search available venues
- View venue details (capacity, description, availability)
- Book venues
- View booking history
- Cancel bookings
- Logout securely

###  Admin Features
- Manage venues (add, update, delete)
- Manage bookings
- Approve or decline booking requests
- Monitor system usage

###  Custodian Features
- View assigned venue
- View booking requests
- Respond to inquiries
- Access profile information

---

##  System Architecture

- **Frontend:** React (Web)
- **Backend:** Spring Boot (REST API)
- **Database:** PostgreSQL
- **Authentication:** JWT-based security

---


## ⚙️ Installation

```bash
# Clone repository
git clone [https://github.com/your-username/wildcats-den.git](https://github.com/NinaIsDying/IT342-Tupas-WildcatsDEN]

# IMPORTANT! 
# Go to /backend/wildcatsden/src/main/java/edu/cit/tupas and run WildcatsdenApplication.java

# Navigate to project
cd web
cd wildcats-den

# Install dependencies (frontend)
npm install

# Run frontend
npm start
