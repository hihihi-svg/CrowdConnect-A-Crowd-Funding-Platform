# 🌟 CrowdConnect – Crowdfunding Platform

CrowdConnect is a **modern crowdfunding platform** built using **vanilla JavaScript**, **Node.js + Express**, and **MongoDB**.
It lets users **publish projects, raise funds, donate, track progress**, and explore a community-driven ecosystem.

Perfect for academic submission, portfolio, or real-world extension. 🚀

---

## 📂 1. Project Structure

Here’s the overall structure so you know what’s where:

```
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
```

---

## ⚙️ 2. Features (Quick Overview)

### 🔐 Authentication

* Login / Signup with MongoDB
* Password hashing (bcrypt)
* JWT-based sessions
* Auto login redirection

### 📊 Dashboard

* Overview cards
* Mission/About sections
* Publish & Donate shortcuts
* Featured projects
* User stats + Profile

### 📝 Project Publishing

Includes:

* Title
* Description
* Target funds
* Motivation
* Problem statement
* Solution
* Thesis
* 🎉 Animated success screen

### 💸 Donations

* List all active projects
* Auto summary generation
* Smooth contribution flow
* Confirmation & success view

### 🌈 Additional

* Dark/Light theme toggle
* Fully responsive
* Leaderboards
* Profile metrics

---

## 🛠️ 3. Setup Instructions

### 📌 Requirements

* Node.js (v14+)
* MongoDB (Local or Atlas)
* npm / yarn

---

### 👉 Step 1: Install Dependencies

```bash
npm install
```

---

### 👉 Step 2: MongoDB Setup

#### **Option A — Local MongoDB**

Use this if you installed MongoDB locally:

```
mongodb://localhost:27017/crowdconnect
```

#### **Option B — MongoDB Atlas (Cloud)**

1. Create a cluster
2. Create DB user
3. Whitelist your IP
4. Copy connection string

Full guide in `MONGODB_SETUP.md`.

---

### 👉 Step 3: Create `.env` file

```
MONGODB_URI=mongodb://localhost:27017/crowdconnect
PORT=3000
JWT_SECRET=your-very-secure-key
```

---

### 👉 Step 4: Start Backend

```bash
npm start
```

For auto reload during development:

```bash
npm run dev
```

Backend runs on:

```
http://localhost:3000
```

---

### 👉 Step 5: Frontend Config (`config.js`)

Uses same-origin by default:

```js
getApiBaseUrl: () => '/api'
```

Change only if backend runs elsewhere.

---

### 👉 Step 6: Access the App

| Page      | URL          |
| --------- | ------------ |
| Login     | `/login`     |
| Dashboard | `/dashboard` |

Useful login parameters:

| Parameter   | Use              |
| ----------- | ---------------- |
| `?force=1`  | Force login page |
| `?logout=1` | Clear token      |
| `?auth=1`   | Open Login tab   |
| `?signup=1` | Open Signup tab  |

✨ Login page does NOT show navbar/footer.

---

## 🌱 4. Seeding Data (Optional)

```bash
npm run seed
```

Custom values:

```
API_BASE=http://localhost:3000/api
SEED_NAME=Seed User
SEED_EMAIL=seed@example.com
SEED_PASSWORD=SeedPass123!
```

---

## 🔌 5. API Endpoints

### Authentication

* `POST /api/auth/register`
* `POST /api/auth/login`
* `GET /api/auth/me`

### Projects

* `GET /api/projects`
* `GET /api/projects/:id`
* `POST /api/projects`
* `GET /api/projects/user/:userId`
* `PUT /api/projects/:id`

### Contributions

* `POST /api/contributions`
* `GET /api/contributions/project/:projectId`
* `GET /api/contributions/user/:userId`

### Leaderboards

* `GET /api/leaderboard/contributions?limit=10`
* `GET /api/leaderboard/publishes?limit=10`

### Misc

* `GET /api/health`

---

## 🗄️ 6. Database Schema

### Users

```
{
  _id,
  name,
  email,
  password,
  createdAt
}
```

### Projects

```
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
```

### Contributions

```
{
  _id,
  projectId,
  contributorId,
  contributorName,
  amount,
  createdAt
}
```

---

## 🔒 7. Security Practices

* Password hashing with bcrypt
* JWT auth
* CORS enabled
* Input validation
* Tokens stored securely

---

## 👨‍💻 8. Development Tips

Start dev server:

```bash
npm run dev
```

Test API:

```bash
curl http://localhost:3000/api/health
```

---

## 🚀 9. Deployment Guide

### Backend

* Use MongoDB Atlas
* Use strong JWT secret
* Deploy using Heroku / Railway / Render
* Enable HTTPS

### Frontend

* Deploy using Netlify / Vercel / GitHub Pages
* Update `config.js` for production

---

## 📜 10. License

Open-source — feel free to use, modify, or improve.

---

## 💡 11. Final Notes

CrowdConnect is built for **learning, academic submission, and showcasing full-stack skills**.
Clean architecture, full CRUD flows, authentication, and a polished UI make it perfect as a final-year or portfolio project.

