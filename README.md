# CrowdConnect 3.0 - Crowdfunding Platform (MongoDB Edition)

A modern, full-featured crowdfunding platform built with vanilla JavaScript, MongoDB, and Express.js backend.

## 📁 File Structure

```
crowdconnect 3.0/
├── index.html          # Main HTML file with all views
├── config.js          # API configuration
├── database.js        # MongoDB API client
├── api.js             # API utilities for summarization
├── auth.js            # MongoDB API Authentication handler
├── app.js             # Main application logic
├── styles.css         # Custom CSS styles and animations
├── server.js          # Express.js backend server
├── package.json       # Node.js dependencies
├── .env.example       # Environment variables template
├── MONGODB_SETUP.md   # MongoDB setup instructions
└── README.md          # This file
```

## 🚀 Features

### 1. Authentication
- **Login/Signup Page** with MongoDB backend
- Email/Password authentication
- JWT token-based session management
- Secure password hashing with bcrypt

### 2. Dashboard
- **Home Section**: Welcome message and quick stats
- **About Section**: Platform information
- **Mission Section**: Platform mission and values
- **Action Buttons**: Quick access to Publish or Donate
- **Stats Display**: Total funds raised, active projects, community members
- **Featured Projects**: Showcase of top projects

### 3. Project Publishing
- Comprehensive form with all required fields:
  - Project Title
  - Project Description
  - Target Fund Amount
  - Motivation
  - Problem Statement
  - Solution & Approach
  - Project Thesis (optional)
- **Other Projects Sidebar**: Learn from existing projects
- **Success Screen**: Animated balloons celebration
- Data stored in MongoDB

### 4. Donate Page
- **Project Listing**: All available projects
- **API Summarization**: Automatic project summaries
- **Contribution Flow**:
  1. Click "Contribute Now"
  2. Enter contribution amount
  3. Success screen with confirmation
  4. Return to home

### 5. Additional Features
- Dark/Light theme toggle
- Responsive design
- Smooth animations
- Project progress tracking
- User profile page

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas cloud)
- npm or yarn

### 1. Install Dependencies

```bash
npm install
```

### 2. MongoDB Setup

Choose one option:

**Option A: Local MongoDB**
- Install MongoDB locally
- Default connection: `mongodb://localhost:27017/crowdconnect`

**Option B: MongoDB Atlas (Cloud - Recommended)**
- Create free account at https://www.mongodb.com/cloud/atlas
- Create cluster and get connection string
- See `MONGODB_SETUP.md` for detailed instructions

### 3. Configure Environment

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your settings:
```env
MONGODB_URI=mongodb://localhost:27017/crowdconnect
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 4. Start Backend Server

```bash
npm start
# OR for development with auto-reload:
npm run dev
```

Server will run on `http://localhost:3000`

### 5. Configure Frontend

Update `config.js` if your backend is on a different port:
```javascript
const API_CONFIG = {
  API_BASE_URL: "http://localhost:3000/api",
  // ...
};
```

### 6. Open Frontend

Simply open `index.html` in your web browser!

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project (requires auth)
- `GET /api/projects/user/:userId` - Get user's projects

### Contributions
- `POST /api/contributions` - Create contribution (requires auth)
- `GET /api/contributions/project/:projectId` - Get project contributions
- `GET /api/contributions/user/:userId` - Get user contributions

## 🗄️ Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date
}
```

### Projects Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  targetFund: Number,
  raised: Number,
  motivation: String,
  problemStatement: String,
  solution: String,
  thesis: String,
  creatorId: ObjectId (references User),
  creator: String,
  image: String,
  createdAt: Date
}
```

### Contributions Collection
```javascript
{
  _id: ObjectId,
  projectId: ObjectId (references Project),
  contributorId: ObjectId (references User),
  contributorName: String,
  amount: Number,
  createdAt: Date
}
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- CORS enabled for API
- Input validation
- Secure token storage (localStorage)

## 🚧 Development

### Running in Development Mode
```bash
npm run dev
```
Uses nodemon for auto-reload on file changes.

### Testing API
```bash
# Health check
curl http://localhost:3000/api/health

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"test123"}'
```

## 📝 Usage Flow

1. **Start Backend**
   ```bash
   npm start
   ```

2. **Open Frontend**
   - Open `index.html` in browser
   - Or use a local server: `python -m http.server 8000`

3. **Register/Login**
   - Click "Get Started" or "Login"
   - Create account or sign in
   - Automatically redirected to dashboard

4. **Publish Project**
   - Click "Publish" in navbar
   - Fill in all required fields
   - Submit form
   - See success screen with balloons

5. **Donate**
   - Click "Donate" in navbar
   - Browse projects with summaries
   - Click "Contribute Now"
   - Enter amount and confirm

## 🚀 Production Deployment

1. **Backend:**
   - Use MongoDB Atlas (cloud)
   - Set strong `JWT_SECRET` in environment
   - Deploy to Heroku, Railway, or similar
   - Enable HTTPS

2. **Frontend:**
   - Update `config.js` with production API URL
   - Deploy to Netlify, Vercel, or similar
   - Or serve static files from backend

3. **Security:**
   - Change `JWT_SECRET` to random string
   - Set proper CORS origins
   - Use environment variables for all secrets
   - Enable HTTPS

## 🤝 Contributing

Feel free to fork, modify, and enhance this project!

## 📄 License

This project is open source and available for educational purposes.

---

**Made with ❤️ for empowering innovation**
