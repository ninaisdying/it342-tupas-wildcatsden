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
