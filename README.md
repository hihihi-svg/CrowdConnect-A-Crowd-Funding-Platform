CrowdConnect – Crowdfunding Platform

CrowdConnect is a full-featured crowdfunding platform built using vanilla JavaScript, Node.js + Express, and MongoDB.
It includes user authentication, project publishing, fundraising, contributions, dashboards, and leaderboards.

1. Project Structure
crowdconnect/
├── login.html
├── dashboard.html
├── config.js
├── database.js
├── api.js
├── auth.js
├── app.js
├── styles.css
├── server.js
├── package.json
├── scripts/
│   └── seed.js
├── data/
│   └── projects.seed.json
└── README.md

2. Features
Authentication

Login/Signup with MongoDB

Secure password hashing (bcrypt)

JWT-based authentication

Automatic session handling

Dashboard

User dashboard with stats

About and mission sections

Publish and donate quick-access buttons

Featured projects

User profile and analytics

Project Publishing

Detailed project creation form

Fields include: title, description, target funds, motivation, problem statement, solution, thesis

Projects saved in MongoDB

Celebration screen after successful publishing

Donations

View all available projects

Automatic project summary generation

Contribution workflow:

Open project

Enter donation amount

Confirm

Success screen

Additional

Dark/Light mode

Responsive UI

Smooth animations

Project progress tracking

Leaderboards

Profile metrics (funds raised, contributions made)

3. Setup Instructions
Prerequisites

Node.js (v14+)

MongoDB (local or Atlas)

npm or yarn

Step 1: Install Dependencies
npm install

Step 2: MongoDB Setup
Option A — Local MongoDB

Connection string:

mongodb://localhost:27017/crowdconnect

Option B — MongoDB Atlas

Create cluster

Create DB user

Whitelist your IP

Get connection string

Detailed guide in MONGODB_SETUP.md

Step 3: Create Environment File

Create .env:

MONGODB_URI=mongodb://localhost:27017/crowdconnect
PORT=3000
JWT_SECRET=your-very-secure-key

Step 4: Start Backend
npm start


or for auto reload:

npm run dev


Backend URL:

http://localhost:3000

Step 5: Frontend Configuration

config.js uses same-origin setup by default:

const API_CONFIG = {
  getApiBaseUrl: () => '/api',
};


Update only if backend runs elsewhere.

Step 6: Access the App
Page	URL
Login Page	/login
Dashboard	/dashboard

Useful parameters:

Parameter	Use
?force=1	Force open login page
?logout=1	Clear token
?auth=1	Open login tab
?signup=1	Open signup tab

Navbar/footer never appear on login page.

4. Seeding Data (Optional)
npm run seed


Environment overrides:

API_BASE=http://localhost:3000/api
SEED_NAME=Seed User
SEED_EMAIL=seed@example.com
SEED_PASSWORD=SeedPass123!

5. API Endpoints
Authentication

POST /api/auth/register

POST /api/auth/login

GET /api/auth/me

Projects

GET /api/projects

GET /api/projects/:id

POST /api/projects (auth required)

GET /api/projects/user/:userId

PUT /api/projects/:id (auth required)

Contributions

POST /api/contributions (auth required)

GET /api/contributions/project/:projectId

GET /api/contributions/user/:userId

Leaderboards

GET /api/leaderboard/contributions?limit=10

GET /api/leaderboard/publishes?limit=10

Misc

GET /api/health

6. Database Schema
Users
{
  _id,
  name,
  email,
  password,
  createdAt
}

Projects
{
  _id,
  title,
  description,
  targetFund,
  raised,
  motivation,
  problemStatement,
  solution,
  thesis,
  creatorId,
  creator,
  image,
  createdAt
}

Contributions
{
  _id,
  projectId,
  contributorId,
  contributorName,
  amount,
  createdAt
}

7. Security

Bcrypt password hashing

JWT authentication

CORS enabled

Input validation

Secure token storage

8. Development Tips

Start server with auto reload:

npm run dev


Test API:

curl http://localhost:3000/api/health

9. Deployment Guide
Backend

Use MongoDB Atlas

Set strong JWT secret

Deploy using Heroku / Railway / Render

Enable HTTPS

Frontend

Update API config for production

Deploy using Netlify / Vercel / GitHub Pages

10. License

Open-source. Free to modify.

11. Notes

This project is created for learning, academic submission, and practical demonstration of full-stack development.