# Troubleshooting Guide

## "Server error during login" Fix

### Step 1: Check Server Console
Look at your terminal where `npm start` is running. You should see:
- ✅ `Connected to MongoDB` - MongoDB is connected
- ❌ `MongoDB connection error` - MongoDB is NOT connected

### Step 2: Check MongoDB Connection

**If MongoDB is not connected:**

1. **Local MongoDB:**
   ```bash
   # Check if MongoDB is running
   # Windows: Check Services
   # Mac/Linux: 
   brew services list  # or
   sudo systemctl status mongodb
   ```

2. **MongoDB Atlas (Cloud):**
   - Check your connection string in `.env`
   - Make sure your IP is whitelisted
   - Verify username/password are correct

3. **Test MongoDB Connection:**
   ```bash
   # Try connecting manually
   mongosh mongodb://localhost:27017/crowdconnect
   # Or for Atlas:
   mongosh "your-connection-string"
   ```

### Step 3: Check .env File

Make sure you have a `.env` file in the project root:

```env
MONGODB_URI=mongodb://localhost:27017/crowdconnect
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Important:** 
- If using MongoDB Atlas, use the full connection string
- Make sure there are no extra spaces or quotes

### Step 4: Check Dependencies

Make sure all packages are installed:
```bash
npm install
```

### Step 5: Check Server Logs

When you try to login, check the server console for:
- `Login error details:` - This will show the actual error
- `Error stack:` - This shows where the error occurred

### Common Errors and Solutions

#### Error: "Database connection error"
**Solution:** MongoDB is not running or connection string is wrong
- Start MongoDB service
- Check `.env` file has correct `MONGODB_URI`

#### Error: "JWT_SECRET is not defined"
**Solution:** Add JWT_SECRET to `.env` file
```env
JWT_SECRET=your-random-secret-key-here
```

#### Error: "bcrypt" or "jwt" module errors
**Solution:** Reinstall dependencies
```bash
npm install bcryptjs jsonwebtoken
```

#### Error: "User data error"
**Solution:** Database schema issue - try clearing the database or recreating the user

### Step 6: Test API Directly

Test the login endpoint directly:

```bash
# Using curl
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

Or use Postman/Thunder Client to test the API.

### Step 7: Check Browser Console

Open browser Developer Tools (F12) and check:
- **Console tab:** For JavaScript errors
- **Network tab:** 
  - Look for the `/api/auth/login` request
  - Check the response status and error message
  - Check if request is being sent

### Quick Fix Checklist

- [ ] MongoDB is running (local) or connection string is correct (Atlas)
- [ ] `.env` file exists and has correct values
- [ ] Server shows "✅ Connected to MongoDB"
- [ ] All npm packages are installed (`npm install`)
- [ ] Server is restarted after changes
- [ ] Browser cache is cleared (Ctrl+Shift+R)

### Still Not Working?

1. **Check server terminal for detailed error messages**
2. **Share the error message from server console**
3. **Check if you can access:** `http://localhost:3000/api/health`

If health check works but login doesn't, the issue is likely:
- MongoDB connection
- User doesn't exist (try registering first)
- Password hashing issue

