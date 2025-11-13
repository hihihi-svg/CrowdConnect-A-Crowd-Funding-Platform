# Quick Setup Guide - MongoDB Edition

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: MongoDB Setup

### Option A: Local MongoDB
1. Install MongoDB from https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. Connection string: `mongodb://localhost:27017/crowdconnect`

### Option B: MongoDB Atlas (Cloud - Recommended)
1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Create database user
4. Whitelist your IP (0.0.0.0/0 for development)
5. Get connection string
6. See `MONGODB_SETUP.md` for detailed instructions

## Step 3: Configure Environment

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/crowdconnect
# OR for Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/crowdconnect

PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## Step 4: Start Backend Server

```bash
npm start
```

Server runs on `http://localhost:3000`

## Step 5: Open Frontend

Simply open `index.html` in your web browser!

The frontend will automatically connect to the backend API.

## That's It! 🎉

Your MongoDB-powered crowdfunding platform is ready!

## File Structure

```
├── server.js          # Backend API server
├── package.json       # Dependencies
├── .env              # Environment config (create from .env.example)
├── index.html        # Frontend application
├── config.js         # API configuration
├── database.js       # MongoDB API client
├── auth.js           # Authentication
├── app.js            # Main app logic
└── styles.css        # Styles
```

## Testing

1. **Backend Health:**
   - Open http://localhost:3000/api/health
   - Should see: `{"status":"OK","message":"CrowdConnect API is running"}`

2. **Register User:**
   - Open the app in browser
   - Click "Get Started"
   - Fill in registration form
   - You're in!

## Troubleshooting

- **Can't connect to MongoDB?**
  - Check MongoDB is running (local) or connection string (Atlas)
  - Verify `.env` file exists and has correct `MONGODB_URI`

- **Port already in use?**
  - Change `PORT` in `.env` to different port (e.g., 3001)
  - Update `config.js` in frontend to match

- **CORS errors?**
  - Backend has CORS enabled
  - Check browser console for specific errors

## Next Steps

- See `README.md` for full documentation
- See `MONGODB_SETUP.md` for detailed MongoDB setup
- Customize `JWT_SECRET` for production use
