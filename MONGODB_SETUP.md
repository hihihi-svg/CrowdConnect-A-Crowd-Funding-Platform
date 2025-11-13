# MongoDB Setup Guide for CrowdConnect

## Option 1: Local MongoDB Installation

### Windows
1. Download MongoDB from https://www.mongodb.com/try/download/community
2. Install MongoDB Community Server
3. MongoDB will run as a service automatically
4. Default connection: `mongodb://localhost:27017/crowdconnect`

### macOS
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

## Option 2: MongoDB Atlas (Cloud - Recommended)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (free tier available)
4. Create a database user:
   - Database Access > Add New User
   - Choose username and password
5. Whitelist your IP:
   - Network Access > Add IP Address
   - Add `0.0.0.0/0` for development (or your specific IP)
6. Get connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/crowdconnect`

## Backend Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB connection string:
```env
MONGODB_URI=mongodb://localhost:27017/crowdconnect
# OR for Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/crowdconnect

PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

4. Start the server:
```bash
npm start
# OR for development with auto-reload:
npm run dev
```

5. Verify it's running:
   - Open http://localhost:3000/api/health
   - Should see: `{"status":"OK","message":"CrowdConnect API is running"}`

## Frontend Setup

1. Update `config.js` if your backend is on a different port:
```javascript
const API_CONFIG = {
  API_BASE_URL: "http://localhost:3000/api",
  // ...
};
```

2. Open `index.html` in your browser

## Testing the Setup

1. **Test Backend Health:**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Test Registration:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"test123"}'
   ```

3. **Test Login:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'
   ```

## Database Schema

The following collections will be created automatically:

### Users
- `_id`: ObjectId
- `name`: String
- `email`: String (unique)
- `password`: String (hashed)
- `createdAt`: Date

### Projects
- `_id`: ObjectId
- `title`: String
- `description`: String
- `targetFund`: Number
- `raised`: Number
- `motivation`: String
- `problemStatement`: String
- `solution`: String
- `thesis`: String
- `creatorId`: ObjectId (references User)
- `creator`: String
- `image`: String
- `createdAt`: Date

### Contributions
- `_id`: ObjectId
- `projectId`: ObjectId (references Project)
- `contributorId`: ObjectId (references User)
- `contributorName`: String
- `amount`: Number
- `createdAt`: Date

## Troubleshooting

### Connection Issues
- Check MongoDB is running: `mongosh` (or `mongo` for older versions)
- Verify connection string in `.env`
- Check firewall settings for Atlas

### Port Already in Use
- Change `PORT` in `.env` to a different port (e.g., 3001)
- Update `config.js` in frontend to match

### CORS Errors
- Backend already has CORS enabled
- If issues persist, check browser console for specific errors

## Production Deployment

1. Use MongoDB Atlas (cloud)
2. Set strong `JWT_SECRET` in environment variables
3. Use environment variables for all sensitive data
4. Enable HTTPS
5. Set up proper CORS for your domain
6. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name crowdconnect
   ```

