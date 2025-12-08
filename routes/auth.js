/**
 * Authentication API Routes
 * 
 * Handles user signup, login, profile management, and department affiliation
 * 
 * Author: Steven Huo
 * Course: APAN 5490 - Assignment 4
 * Date: December 5, 2025
 * 
 * Endpoints:
 * - POST /api/auth/signup - Sign up with questionnaire
 * - POST /api/auth/login - Login with email
 * - GET /api/auth/profile/:userId - Get user profile
 * - PUT /api/auth/department - Join a department
 * - GET /api/auth/check-email - Check if email exists
 */

const express = require('express');
const router = express.Router();
const { getDatabase } = require('../db/connection');
const { ObjectId } = require('mongodb');
const {
  validateSignupData,
  createUserDocument,
  generateWelcomeMessage,
  getRankInfo
} = require('../db/auth');

// ===== UTILITY FUNCTIONS =====

function sendSuccess(res, data, message = null, statusCode = 200) {
  const response = {
    success: true,
    ...(message && { message }),
    ...(data && { data })
  };
  res.status(statusCode).json(response);
}

function sendError(res, error, statusCode = 500) {
  console.error('Auth API Error:', error);
  res.status(statusCode).json({
    success: false,
    error: error.message || 'An error occurred'
  });
}

// ===== AUTHENTICATION ENDPOINTS =====

/**
 * POST /api/auth/signup
 * Sign up new user with questionnaire answers
 * Body: { name, email, answers }
 */
router.post('/signup', async (req, res) => {
  try {
    const db = getDatabase();
    const { name, email, answers } = req.body;
    
    // Validate input
    const validation = validateSignupData({ name, email, answers });
    if (!validation.valid) {
      return sendError(res, new Error(validation.errors.join(', ')), 400);
    }
    
    // Check if email already exists
    const existingUser = await db.collection('users')
      .findOne({ email: email.trim().toLowerCase() });
    
    if (existingUser) {
      return sendError(res, new Error('Email already registered'), 409);
    }
    
    // Create user document with blood rank calculation
    const userDoc = createUserDocument({ name, email, answers });
    
    // Insert into database
    const result = await db.collection('users').insertOne(userDoc);
    
    // Get the created user
    const newUser = await db.collection('users')
      .findOne({ _id: result.insertedId });
    
    // Generate welcome message
    const welcomeMsg = generateWelcomeMessage(newUser.name, newUser.bloodRank);
    
    // Return user data (without sensitive info)
    sendSuccess(res, {
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        bloodRank: newUser.bloodRank,
        bloodRankScore: newUser.bloodRankScore,
        affiliatedDepartment: newUser.affiliatedDepartment,
        createdAt: newUser.createdAt
      },
      welcomeMessage: welcomeMsg,
      rankInfo: getRankInfo(newUser.bloodRank)
    }, 'User registered successfully', 201);
    
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * POST /api/auth/login
 * Login user by email
 * Body: { email }
 */
router.post('/login', async (req, res) => {
  try {
    const db = getDatabase();
    const { email } = req.body;
    
    if (!email) {
      return sendError(res, new Error('Email is required'), 400);
    }
    
    // Find user by email
    const user = await db.collection('users')
      .findOne({ email: email.trim().toLowerCase() });
    
    if (!user) {
      return sendError(res, new Error('User not found. Please sign up first.'), 404);
    }
    
    // Update last login
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );
    
    // Return user data
    sendSuccess(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bloodRank: user.bloodRank,
        bloodRankScore: user.bloodRankScore,
        affiliatedDepartment: user.affiliatedDepartment,
        createdAt: user.createdAt
      },
      rankInfo: getRankInfo(user.bloodRank)
    }, 'Login successful');
    
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * GET /api/auth/profile/:userId
 * Get user profile by ID
 */
router.get('/profile/:userId', async (req, res) => {
  try {
    const db = getDatabase();
    const { userId } = req.params;
    
    // Validate ObjectId
    if (!ObjectId.isValid(userId)) {
      return sendError(res, new Error('Invalid user ID'), 400);
    }
    
    // Find user
    const user = await db.collection('users')
      .findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return sendError(res, new Error('User not found'), 404);
    }
    
    // Return user profile
    sendSuccess(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bloodRank: user.bloodRank,
        bloodRankScore: user.bloodRankScore,
        bloodRankBreakdown: user.bloodRankBreakdown,
        affiliatedDepartment: user.affiliatedDepartment,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      },
      rankInfo: getRankInfo(user.bloodRank)
    });
    
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * PUT /api/auth/department
 * Join a department (users can only join one)
 * Body: { userId, departmentName }
 */
router.put('/department', async (req, res) => {
  try {
    const db = getDatabase();
    const { userId, departmentName } = req.body;
    
    // Validate input
    if (!userId || !departmentName) {
      return sendError(res, new Error('User ID and department name are required'), 400);
    }
    
    if (!ObjectId.isValid(userId)) {
      return sendError(res, new Error('Invalid user ID'), 400);
    }
    
    // Validate department exists
    const validDepartments = [
      'Student Council',
      'Lionheart Society',
      'Execution Department',
      'News Club',
      'Equipment Division'
    ];
    
    if (!validDepartments.includes(departmentName)) {
      return sendError(res, new Error('Invalid department name'), 400);
    }
    
    // Check if user exists
    const user = await db.collection('users')
      .findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return sendError(res, new Error('User not found'), 404);
    }
    
    // Check if user already affiliated
    if (user.affiliatedDepartment) {
      return sendError(res, new Error(`You are already a member of ${user.affiliatedDepartment}. You can only join one department.`), 409);
    }
    
    // Update user's department
    await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: { affiliatedDepartment: departmentName } }
    );
    
    // Increment department member count
    await db.collection('departments').updateOne(
      { name: departmentName },
      { $inc: { memberCount: 1 } }
    );
    
    sendSuccess(res, {
      affiliatedDepartment: departmentName
    }, `Successfully joined ${departmentName}!`);
    
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * GET /api/auth/check-email
 * Check if email already exists
 * Query: ?email=user@example.com
 */
router.get('/check-email', async (req, res) => {
  try {
    const db = getDatabase();
    const { email } = req.query;
    
    if (!email) {
      return sendError(res, new Error('Email is required'), 400);
    }
    
    const user = await db.collection('users')
      .findOne({ email: email.trim().toLowerCase() });
    
    sendSuccess(res, {
      exists: !!user,
      email: email
    });
    
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * GET /api/auth/leaderboard
 * Get top users by blood rank score
 * Query: ?limit=10
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const db = getDatabase();
    const limit = parseInt(req.query.limit) || 10;
    
    const topUsers = await db.collection('users')
      .find({})
      .sort({ bloodRankScore: -1 })
      .limit(limit)
      .toArray();
    
    const leaderboard = topUsers.map(user => ({
      name: user.name,
      bloodRank: user.bloodRank,
      bloodRankScore: user.bloodRankScore,
      affiliatedDepartment: user.affiliatedDepartment,
      createdAt: user.createdAt
    }));
    
    sendSuccess(res, { leaderboard });
    
  } catch (error) {
    sendError(res, error);
  }
});

module.exports = router;

