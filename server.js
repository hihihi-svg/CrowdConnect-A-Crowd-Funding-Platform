// Backend Server for CrowdConnect
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crowdconnect';

// Improved MongoDB connection with retry logic
const connectDB = async () => {
  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log('📍 Connection string:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    
    
    
    console.log('✅ Connected to MongoDB successfully!');
    console.log('📊 Database:', mongoose.connection.name);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected!');
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed!');
    console.error('Error details:', error.message);
    console.error('\n📝 Troubleshooting steps:');
    console.error('1. Check if MongoDB is running (local) or connection string is correct (Atlas)');
    console.error('2. Verify MONGODB_URI in .env file');
    console.error('3. For local MongoDB: Start the service');
    console.error('4. For MongoDB Atlas: Check connection string and IP whitelist');
    console.error('\n💡 See MONGODB_SETUP.md for detailed instructions\n');
    
    // Don't exit - let the server start but show warnings
    // In production, you might want to exit: process.exit(1);
  }
};

// Connect to database
connectDB();

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Project Schema
const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  targetFund: { type: Number, required: true },
  raised: { type: Number, default: 0 },
  motivation: { type: String, required: true },
  problemStatement: { type: String, required: true },
  solution: { type: String, required: true },
  thesis: { type: String, default: '' },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  creator: { type: String, required: true },
  image: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Project = mongoose.model('Project', projectSchema);

// Emoji generation helper based on project content
function generateProjectEmoji({ title = '', description = '', motivation = '', problemStatement = '', solution = '', thesis = '' } = {}) {
  const text = [title, description, motivation, problemStatement, solution, thesis]
    .filter(Boolean)
    .join(' ') 
    .toLowerCase();

  const rules = [
    // Finance / funding / crypto
    [/\b(blockchain|crypto|web3|defi|nft|token)\b/, '🧱'],
    [/\b(finance|fintech|bank|payment|loan|invest|fund)\b/, '💰'],

    // Health / biotech
    [/\b(health|medical|medicine|hospital|doctor|nurse|biotech|vaccine)\b/, '🏥'],

    // Education / learning
    [/\b(education|edtech|learn|student|teacher|course|class|school)\b/, '🎓'],

    // Environment / climate / energy
    [/\b(climate|environment|green|sustainab|recycle|solar|wind|energy)\b/, '🌱'],

    // Social / community
    [/\b(community|social|nonprofit|ngo|donat|charity|volunteer)\b/, '🤝'],

    // AI / data / ML
    [/\b(ai|machine learning|ml|neural|model|dataset|data|analytics)\b/, '🤖'],

    // Developer tools / software
    [/\b(app|platform|api|sdk|developer|open source|opensource|library|framework)\b/, '🧩'],

    // E-commerce / marketplace
    [/\b(e\-?commerce|marketplace|shop|store|seller|buyer|cart)\b/, '🛍️'],

    // Agriculture / food
    [/\b(agri|farm|crop|food|nutrition|hunger)\b/, '🌾'],

    // Transport / mobility
    [/\b(transport|logistics|delivery|ride|mobility|vehicle|drone)\b/, '🚚'],

    // Security / privacy
    [/\b(secur|privacy|encrypt|auth|fraud|threat)\b/, '🛡️'],

    // Art / creative
    [/\b(art|music|design|creative|creator|video|photo)\b/, '🎨'],

    // Science / research
    [/\b(research|science|lab|experiment|thesis)\b/, '🔬'],

    // Gaming
    [/\b(game|gaming|esports|play)\b/, '🎮'],

    // Real estate / housing
    [/\b(housing|real\s?estate|rent|mortgage|home|property)\b/, '🏠'],
  ];

  for (const [regex, emoji] of rules) {
    if (regex.test(text)) return emoji;
  }
  // Fallback based on tone
  if (/\b(launch|start|new|innov|build|create)\b/.test(text)) return '✨';
  return '✨';
}

// Contribution Schema
const contributionSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  contributorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contributorName: { type: String, required: true },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Contribution = mongoose.model('Contribution', contributionSchema);

// JWT Secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Validate JWT_SECRET
if (!JWT_SECRET || JWT_SECRET === 'your-secret-key-change-in-production') {
  console.warn('⚠️  WARNING: Using default JWT_SECRET. Change this in production!');
}

// Google authentication removed

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected. State:', mongoose.connection.readyState);
      return res.status(503).json({ error: 'Database connection error. Please try again later.' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    // Generate token
    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not defined');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error details:', error);
    console.error('Error stack:', error.stack);
    
    // Handle duplicate key error (MongoDB unique constraint)
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    res.status(500).json({ 
      error: 'Server error during registration',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Google authentication route removed

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected. State:', mongoose.connection.readyState);
      return res.status(503).json({ error: 'Database connection error. Please try again later.' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    if (!user.password) {
      console.error('User found but password field is missing');
      return res.status(500).json({ error: 'User data error. Please contact support.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not defined');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error details:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Server error during login',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== PROJECT ROUTES ====================

// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Server error fetching projects' });
  }
});

// Get single project
app.get('/api/projects/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Server error fetching project' });
  }
});

// Create project
app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      targetFund,
      motivation,
      problemStatement,
      solution,
      thesis
    } = req.body;

    if (!title || !description || !targetFund || !motivation || !problemStatement || !solution) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const project = new Project({
      title,
      description,
      targetFund,
      motivation,
      problemStatement,
      solution,
      thesis: thesis || description,
      creatorId: user._id,
      creator: user.name,
      raised: 0,
      image: generateProjectEmoji({ title, description, motivation, problemStatement, solution, thesis })
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Server error creating project' });
  }
});

// Get user's projects
app.get('/api/projects/user/:userId', async (req, res) => {
  try {
    const projects = await Project.find({ creatorId: req.params.userId }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    console.error('Get user projects error:', error);
    res.status(500).json({ error: 'Server error fetching user projects' });
  }
});

// ==================== CONTRIBUTION ROUTES ====================

// Create contribution
app.post('/api/contributions', authenticateToken, async (req, res) => {
  try {
    const { projectId, amount } = req.body;

    if (!projectId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid project ID and amount required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create contribution
    const contribution = new Contribution({
      projectId,
      contributorId: user._id,
      contributorName: user.name,
      amount
    });

    await contribution.save();

    // Update project raised amount
    project.raised = (project.raised || 0) + amount;
    await project.save();

    res.status(201).json(contribution);
  } catch (error) {
    console.error('Create contribution error:', error);
    res.status(500).json({ error: 'Server error creating contribution' });
  }
});

// Leaderboards
app.get('/api/leaderboard/contributions', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const results = await Contribution.aggregate([
      { $group: { _id: '$contributorId', count: { $sum: 1 }, totalAmount: { $sum: '$amount' }, name: { $first: '$contributorName' } } },
      { $sort: { count: -1, totalAmount: -1 } },
      { $limit: limit },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $addFields: { user: { $arrayElemAt: ['$user', 0] } } },
      { $project: { _id: 0, userId: '$_id', name: { $ifNull: ['$user.name', '$name'] }, count: 1, totalAmount: 1 } }
    ]);
    res.json(results);
  } catch (error) {
    console.error('Leaderboard contributions error:', error);
    res.status(500).json({ error: 'Server error generating contributions leaderboard' });
  }
});

app.get('/api/leaderboard/publishes', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const results = await Project.aggregate([
      { $group: { _id: '$creatorId', count: { $sum: 1 }, nameFromProject: { $first: '$creator' } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $addFields: { user: { $arrayElemAt: ['$user', 0] } } },
      { $project: { _id: 0, userId: '$_id', name: { $ifNull: ['$user.name', '$nameFromProject'] }, count: 1 } }
    ]);
    res.json(results);
  } catch (error) {
    console.error('Leaderboard publishes error:', error);
    res.status(500).json({ error: 'Server error generating publishes leaderboard' });
  }
});

// Get project contributions
app.get('/api/contributions/project/:projectId', async (req, res) => {
  try {
    const contributions = await Contribution.find({ projectId: req.params.projectId })
      .sort({ createdAt: -1 });
    res.json(contributions);
  } catch (error) {
    console.error('Get contributions error:', error);
    res.status(500).json({ error: 'Server error fetching contributions' });
  }
});

// Get user contributions
app.get('/api/contributions/user/:userId', async (req, res) => {
  try {
    const contributions = await Contribution.find({ contributorId: req.params.userId })
      .sort({ createdAt: -1 });
    res.json(contributions);
  } catch (error) {
    console.error('Get user contributions error:', error);
    res.status(500).json({ error: 'Server error fetching user contributions' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CrowdConnect API is running' });
});

// Serve static files (HTML, CSS, JS) - must be after API routes
app.use(express.static(path.join(__dirname)));

// Split-page routes
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Root -> redirect to login by default
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`🌐 Frontend available at http://localhost:${PORT}`);
});

