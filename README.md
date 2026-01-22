
## 📄 `backend/README.md`

````
# Backend - Transport Management System

This is the backend service for the Transport Management System. It provides RESTful APIs for managing users, vehicles, trips, and bookings, along with role-based authentication and email notifications.

## Features
- User management (Admin, Driver, Customer roles)
- Vehicle, Trip, and Booking APIs
- Trip assignment and booking workflow
- Dashboard API with real-time stats (trips, bookings, revenue)
- Email notifications for bookings and trip updates
- Validation and error handling

## Project Structure
- `controllers/` – Handle API logic
- `models/` – Mongoose models for MongoDB
- `services/` – Business logic
- `routes/` – API endpoints
- `utils/` – Helper functions (email, auth, etc.)

## Getting Started
1. Clone the repository
2. Navigate to backend folder:
   ```bash
   cd backend
````

3. Install dependencies:

   ```bash
   npm install
   ```
4. Create a `.env` file with:

   ```
   MONGO_URI=your_mongodb_url
   JWT_SECRET=your_secret
   EMAIL_USER=your_email
   EMAIL_PASS=your_password
   ```
5. Run development server:

   ```bash
   npm run dev
   ```

The backend will start on **[http://localhost:5000](http://localhost:8000)** by default.
