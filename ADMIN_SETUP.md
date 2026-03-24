# Admin User Creation Guide

## 📋 Overview
When you reset/change your database, you need a way to add an initial admin user. I've implemented **3 solutions** for you:

---

## ✅ Solution 1: Using the Seeding Script (RECOMMENDED)

### What it does:
- Creates a default admin user in MongoDB
- Prevents duplicate admins from being created
- Safe and idempotent (can run multiple times)

### How to use:

```bash
npm run seed:admin
```

### Output:
```
🌱 Starting admin user seeding...
✅ Connected to database
✅ Admin user created successfully!

📊 Admin User Details:
──────────────────────────────────────
📧 Email:    admin@transportmanagement.com
🔐 Password: Admin@123456
📱 Contact:  +94700000000
👤 Name:     Admin User
──────────────────────────────────────

⚠️  IMPORTANT: Change this password immediately after first login!
💾 Store these credentials securely.
```

### Credentials:
- **Email:** `admin@transportmanagement.com`
- **Password:** `Admin@123456`

### ✏️ To customize:
Edit `/src/seed/seed-admin.ts` and change the `DEFAULT_ADMIN` object:

```typescript
const DEFAULT_ADMIN = {
    name: 'Your Admin Name',
    email: 'your-email@example.com',
    password: 'YourStrongPassword', // Must be at least 8 chars
    role: 'admin',
    contactNumber: '+94xxxxxxxxx',
    isApproved: true,
    walletBalance: 0,
};
```

---

## 🚨 Solution 2: Emergency Admin Creation Endpoint

### What it does:
- REST API endpoint to create an admin user
- Only works when NO admin exists (for safety)
- Can be accessed via Postman, cURL, or your frontend

### How to use:

**Endpoint:** `POST /api/auth/create-emergency-admin`

**Request Body:**
```json
{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "SecurePassword123",
    "contactNumber": "+94700000000"
}
```

**Response (Success):**
```json
{
    "message": "Admin user created successfully",
    "user": {
        "id": "507f1f77bcf86cd799439011",
        "name": "Admin User",
        "email": "admin@example.com",
        "role": "admin"
    }
}
```

**Response (Error - Admin exists):**
```json
{
    "error": "Admin user already exists. This endpoint can only be used when no admin exists."
}
```

### Using cURL:
```bash
curl -X POST http://localhost:3000/api/auth/create-emergency-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "SecurePassword123",
    "contactNumber": "+94700000000"
  }'
```

### Using Postman:
1. Create new request
2. Method: `POST`
3. URL: `http://localhost:3000/api/auth/create-emergency-admin`
4. Body → raw → JSON:
```json
{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "SecurePassword123",
    "contactNumber": "+94700000000"
}
```

---

## 🔄 Solution 3: Database Direct Insertion

### What it does:
- Create admin user directly in MongoDB using Mongoose
- Most direct approach

### Steps:

1. **Connect to your MongoDB database** using MongoDB Compass or VS Code MongoDB extension

2. **Insert document into users collection:**

```json
{
    "_id": ObjectId(),
    "name": "Admin User",
    "email": "admin@transportmanagement.com",
    "password": "$2a$10$...", // bcrypt hashed password
    "role": "admin",
    "contactNumber": "+94700000000",
    "dateOfBirth": "",
    "gender": "Male",
    "profileImage": "",
    "averageRating": 0,
    "totalRatings": 0,
    "experience": 0,
    "provincesVisited": [],
    "isAvailable": true,
    "location": { "lat": 0, "lng": 0, "address": "" },
    "isApproved": true,
    "blockedDrivers": [],
    "walletBalance": 0
}
```

**⚠️ Note:** You need to generate a bcrypt hash for the password. Use this Node.js snippet:

```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('Admin@123456', 10))"
```

---

## 🔐 Security Recommendations

1. **After Creating Admin:**
   - ✅ Change the default password immediately
   - ✅ Use a strong, unique password
   - ✅ Store credentials securely

2. **Disable Emergency Endpoint (Optional):**
   - After initial setup, you can comment out the emergency endpoint in:
   - `src/routes/auth.routes.ts` line with `createEmergencyAdmin`

3. **Password Requirements:**
   - Minimum 8 characters
   - Mix of uppercase and lowercase
   - Include numbers and special characters

---

## 📊 Comparison Table

| Solution | Ease | Security | Best For |
|----------|------|----------|----------|
| **Seeding Script** | ⭐⭐⭐ | ⭐⭐⭐ | Production deployments |
| **Emergency Endpoint** | ⭐⭐⭐⭐ | ⭐⭐ | Manual setup / Testing |
| **Direct DB Insert** | ⭐⭐ | ⭐⭐⭐ | Advanced users |

---

## 🧪 Testing Your Admin Account

### 1. Login with admin credentials:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@transportmanagement.com",
    "password": "Admin@123456"
  }'
```

### 2. Expected response:
```json
{
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": "507f1f77bcf86cd799439011",
        "name": "Admin User",
        "email": "admin@transportmanagement.com",
        "role": "admin"
    }
}
```

---

## ❓ Troubleshooting

### Problem: "Admin user already exists"
**Solution:** Delete the admin user from the database and try again.

### Problem: Seed script fails to connect
**Solution:** Ensure MongoDB is running and `.env` has correct `MONGODB_URL`.

### Problem: Can't create admin via endpoint
**Solution:** Check if an admin already exists. The endpoint only works when NO admin exists.

### Problem: Password validation error
**Solution:** Ensure password is at least 8 characters long with mixed case.

---

## 📁 Files Created/Modified

| File | Action | Purpose |
|------|--------|---------|
| `src/seed/seed-admin.ts` | ✅ Created | Seed script for admin creation |
| `src/controllers/auth.controller.ts` | ✏️ Modified | Added `createEmergencyAdmin` function |
| `src/routes/auth.routes.ts` | ✏️ Modified | Added emergency admin endpoint |
| `package.json` | ✏️ Modified | Added `npm run seed:admin` script |

---

## 🚀 Quick Start

```bash
# Step 1: Install dependencies
npm install

# Step 2: Create admin user
npm run seed:admin

# Step 3: Start development server
npm run dev

# Step 4: Login with admin credentials
# Email: admin@transportmanagement.com
# Password: Admin@123456
```

---

**Need help?** Check the comments in the source files or review the security section above.

