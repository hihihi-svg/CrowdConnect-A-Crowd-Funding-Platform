# Quick Start - Fix "Database Not Connected" Error

## Option 1: Use MongoDB Atlas (Cloud - Easiest) ⭐ Recommended

### Step 1: Create Free MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for free account
3. Create a free cluster (M0 - Free tier)

### Step 2: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with `crowdconnect`

Example:
```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/crowdconnect
```

### Step 3: Whitelist Your IP
1. Go to "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development) or add your IP
4. Click "Confirm"

### Step 4: Create Database User
1. Go to "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter username and password (remember this!)
5. Set privileges to "Read and write to any database"
6. Click "Add User"

### Step 5: Create .env File
Create a file named `.env` in your project root:

```env
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/crowdconnect
PORT=3000
JWT_SECRET=your-random-secret-key-here
```

### Step 6: Restart Server
```bash
npm start
```

You should see: `✅ Connected to MongoDB successfully!`

---

## Option 2: Install Local MongoDB

### Windows:
1. Download: https://www.mongodb.com/try/download/community
2. Install MongoDB Community Server
3. MongoDB will run as a Windows service automatically
4. Create `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/crowdconnect
PORT=3000
JWT_SECRET=your-random-secret-key-here
```

### macOS:
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Create .env file
echo "MONGODB_URI=mongodb://localhost:27017/crowdconnect" > .env
echo "PORT=3000" >> .env
echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")" >> .env
```

### Linux (Ubuntu/Debian):
```bash
# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Create .env file
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/crowdconnect
PORT=3000
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
EOF
```

### Verify MongoDB is Running:
```bash
# Test connection
mongosh mongodb://localhost:27017/crowdconnect
# Or for older versions:
mongo mongodb://localhost:27017/crowdconnect
```

If it connects, MongoDB is running! Type `exit` to leave.

---

## Create .env File Manually

If you don't have a `.env` file, create one:

1. **Create new file** named `.env` (no extension, just `.env`)
2. **Add these lines:**
```env
MONGODB_URI=mongodb://localhost:27017/crowdconnect
PORT=3000
JWT_SECRET=change-this-to-a-random-string
```

3. **For MongoDB Atlas**, replace `MONGODB_URI` with your Atlas connection string

4. **Generate a secure JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and use it as your `JWT_SECRET`

---

## After Setup

1. **Restart your server:**
```bash
npm start
```

2. **Look for this message:**
```
✅ Connected to MongoDB successfully!
```

3. **If you still see errors:**
   - Check the error message in terminal
   - Verify `.env` file exists and has correct values
   - Make sure MongoDB is running (for local) or connection string is correct (for Atlas)

---

## Still Having Issues?

1. **Check server terminal** - it will show specific error messages
2. **Verify .env file** - make sure it's in the project root (same folder as server.js)
3. **Test MongoDB connection** - try connecting with mongosh/mongo
4. **Check firewall** - make sure port 27017 is open (for local MongoDB)

See `MONGODB_SETUP.md` for more detailed instructions.

