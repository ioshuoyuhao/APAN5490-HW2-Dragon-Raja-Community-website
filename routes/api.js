/**
 * API Routes - Night Watcher Forum
 * 
 * RESTful API endpoints for database operations
 * Handles data retrieval and submission for Dragon Raja fan community
 * 
 * Author: Steven Huo
 * Course: APAN 5490 - Assignment 4
 * 
 * Endpoints:
 * - GET    /api/articles          - Get all articles (with optional category filter)
 * - GET    /api/articles/:id      - Get single article by ID
 * - GET    /api/fanworks          - Get fan works (with optional sort)
 * - GET    /api/departments       - Get Cassell College departments
 * - POST   /api/questionnaire/submit  - Submit questionnaire
 * - POST   /api/contact/submit    - Submit contact form
 */

const express = require('express');
const router = express.Router();
const { getDatabase } = require('../db/connection');
const { ObjectId } = require('mongodb');

// ===== UTILITY FUNCTIONS =====

/**
 * Validate ObjectId string
 */
function isValidObjectId(id) {
  return ObjectId.isValid(id) && String(new ObjectId(id)) === id;
}

/**
 * Send success response
 */
function sendSuccess(res, data, message = null, statusCode = 200) {
  const response = {
    success: true,
    ...(message && { message }),
    ...(data && { data }),
    ...(Array.isArray(data) && { count: data.length })
  };
  res.status(statusCode).json(response);
}

/**
 * Send error response
 */
function sendError(res, error, statusCode = 500) {
  console.error('API Error:', error);
  res.status(statusCode).json({
    success: false,
    error: error.message || 'An error occurred'
  });
}

// ===== ARTICLES ENDPOINTS =====

/**
 * GET /api/articles
 * Get all articles, optionally filtered by category
 * Query params: category (optional) - "latest" | "hot" | "featured"
 */
router.get('/articles', async (req, res) => {
  try {
    const db = getDatabase();
    const { category } = req.query;

    // Build query
    let query = {};
    if (category) {
      // Validate category
      const validCategories = ['latest', 'hot', 'featured'];
      if (!validCategories.includes(category)) {
        return sendError(res, new Error('Invalid category. Must be: latest, hot, or featured'), 400);
      }
      query.category = category;
    }

    // Fetch articles from database
    const articles = await db.collection('articles')
      .find(query)
      .sort({ timestamp: -1 })  // Most recent first
      .limit(50)                 // Limit to 50 articles
      .toArray();

    sendSuccess(res, articles);

  } catch (error) {
    sendError(res, error);
  }
});

/**
 * GET /api/articles/:id
 * Get single article by ID
 */
router.get('/articles/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return sendError(res, new Error('Invalid article ID'), 400);
    }

    // Fetch article
    const article = await db.collection('articles')
      .findOne({ _id: new ObjectId(id) });

    if (!article) {
      return sendError(res, new Error('Article not found'), 404);
    }

    // Optionally increment view count
    await db.collection('articles').updateOne(
      { _id: new ObjectId(id) },
      { $inc: { views: 1 } }
    );

    sendSuccess(res, article);

  } catch (error) {
    sendError(res, error);
  }
});

// ===== FAN WORKS ENDPOINTS =====

/**
 * GET /api/fanworks
 * Get fan works gallery items
 * Query params: sort (optional) - "popular" | "liked", limit (default 12)
 */
router.get('/fanworks', async (req, res) => {
  try {
    const db = getDatabase();
    const { sort, limit } = req.query;
    
    const maxLimit = parseInt(limit) || 12; // Default to 12 for gallery display

    // Determine sort order
    let sortOptions = { likes: -1 }; // Default: most liked
    
    if (sort === 'popular') {
      // Most Popular = sort by comments descending
      sortOptions = { comments: -1 };
    } else if (sort === 'liked') {
      // Most Liked = sort by likes descending
      sortOptions = { likes: -1 };
    }

    // Fetch fan works
    const fanworks = await db.collection('fanworks')
      .find({})
      .sort(sortOptions)
      .limit(maxLimit)
      .toArray();

    sendSuccess(res, fanworks);

  } catch (error) {
    sendError(res, error);
  }
});

/**
 * GET /api/fanworks/:id
 * Get single fan work by ID
 */
router.get('/fanworks/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return sendError(res, new Error('Invalid fan work ID'), 400);
    }

    const fanwork = await db.collection('fanworks')
      .findOne({ _id: new ObjectId(id) });

    if (!fanwork) {
      return sendError(res, new Error('Fan work not found'), 404);
    }

    sendSuccess(res, fanwork);

  } catch (error) {
    sendError(res, error);
  }
});

// ===== DEPARTMENTS ENDPOINT =====

/**
 * GET /api/departments
 * Get all Cassell College departments
 */
router.get('/departments', async (req, res) => {
  try {
    const db = getDatabase();

    const departments = await db.collection('departments')
      .find({})
      .sort({ memberCount: -1 })  // Sort by member count descending
      .toArray();

    sendSuccess(res, departments);

  } catch (error) {
    sendError(res, error);
  }
});

// ===== QUESTIONNAIRE SUBMISSION =====

/**
 * POST /api/questionnaire/submit
 * Submit First Blood Lineage Investigation questionnaire
 * Body: { email: string, answers: object }
 */
router.post('/questionnaire/submit', async (req, res) => {
  try {
    const db = getDatabase();
    const { email, answers } = req.body;

    // Validate input
    if (!email || !answers) {
      return sendError(res, new Error('Email and answers are required'), 400);
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, new Error('Invalid email address'), 400);
    }

    // Create submission document
    const submission = {
      email,
      answers,
      submittedAt: new Date(),
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown'
    };

    // Insert into database
    const result = await db.collection('questionnaire_submissions')
      .insertOne(submission);

    sendSuccess(
      res,
      { submissionId: result.insertedId },
      'Questionnaire submitted successfully. Welcome to Cassell College!',
      201
    );

  } catch (error) {
    sendError(res, error);
  }
});

/**
 * GET /api/questionnaire/submissions
 * Get all questionnaire submissions (admin endpoint)
 */
router.get('/questionnaire/submissions', async (req, res) => {
  try {
    const db = getDatabase();

    const submissions = await db.collection('questionnaire_submissions')
      .find({})
      .sort({ submittedAt: -1 })
      .limit(100)
      .toArray();

    sendSuccess(res, submissions);

  } catch (error) {
    sendError(res, error);
  }
});

// ===== CONTACT FORM SUBMISSION =====

/**
 * POST /api/contact/submit
 * Submit contact form
 * Body: { name: string, email: string, topic: string, message: string, subscribeNewsletter: boolean }
 */
router.post('/contact/submit', async (req, res) => {
  try {
    const db = getDatabase();
    const { name, email, topic, message, subscribeNewsletter } = req.body;

    console.log('📬 Contact form submission received:', { name, email, topic, message: message?.substring(0, 50) + '...' });

    // Validate required fields
    if (!name || !email || !topic || !message) {
      console.error('❌ Missing required fields:', { name: !!name, email: !!email, topic: !!topic, message: !!message });
      return sendError(res, new Error('Name, email, topic, and message are required'), 400);
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendError(res, new Error('Invalid email address'), 400);
    }

    // Validate topic
    const validTopics = [
      'General Inquiry',
      'Technical Support',
      'Partnership',
      'Content Report',
      'Feedback',
      'Other'
    ];
    if (!validTopics.includes(topic)) {
      return sendError(res, new Error('Invalid topic'), 400);
    }

    // Create submission document
    const submission = {
      name,
      email,
      topic,
      message,
      subscribeNewsletter: !!subscribeNewsletter,
      submittedAt: new Date(),
      status: 'new',  // For future admin panel: new, in-progress, resolved
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown'
    };

    // Insert into database
    const result = await db.collection('contact_submissions')
      .insertOne(submission);

    sendSuccess(
      res,
      { submissionId: result.insertedId },
      'Thank you for contacting us! We will respond within 24 hours.',
      201
    );

  } catch (error) {
    sendError(res, error);
  }
});

/**
 * GET /api/contact/submissions
 * Get all contact form submissions (admin endpoint)
 */
router.get('/contact/submissions', async (req, res) => {
  try {
    const db = getDatabase();

    const submissions = await db.collection('contact_submissions')
      .find({})
      .sort({ submittedAt: -1 })
      .limit(100)
      .toArray();

    sendSuccess(res, submissions);

  } catch (error) {
    sendError(res, error);
  }
});

// ===== STATISTICS ENDPOINT =====

/**
 * GET /api/stats
 * Get community statistics for homepage
 */
router.get('/stats', async (req, res) => {
  try {
    const db = getDatabase();

    // Get counts from various collections
    const [articlesCount, fanworksCount, departmentsCount, submissionsCount] = await Promise.all([
      db.collection('articles').countDocuments(),
      db.collection('fanworks').countDocuments(),
      db.collection('departments').countDocuments(),
      db.collection('questionnaire_submissions').countDocuments()
    ]);

    // Calculate total members from departments
    const departments = await db.collection('departments').find({}).toArray();
    const totalMembers = departments.reduce((sum, dept) => sum + (dept.memberCount || 0), 0);

    const stats = {
      articles: articlesCount,
      fanWorks: fanworksCount,
      departments: departmentsCount,
      members: totalMembers,
      submissions: submissionsCount
    };

    sendSuccess(res, stats);

  } catch (error) {
    sendError(res, error);
  }
});

// ===== TEST/DEBUG ENDPOINT =====

/**
 * GET /api/test
 * Test endpoint to verify API is working
 */
router.get('/test', (req, res) => {
  sendSuccess(res, {
    message: 'API is working correctly',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ===== FORUM POSTS ENDPOINTS =====

/**
 * GET /api/forum/posts
 * Get forum posts with optional sorting and pagination
 * Query: ?sort=author|recent&page=1&limit=10
 */
router.get('/forum/posts', async (req, res) => {
  try {
    const db = getDatabase();
    const { sort, page, limit } = req.query;
    
    const currentPage = parseInt(page) || 1;
    const pageLimit = parseInt(limit) || 10;
    const skip = (currentPage - 1) * pageLimit;
    
    let sortOptions = { createdAt: -1 }; // Default: recent first
    
    if (sort === 'author') {
      // Sort by author name A-Z
      sortOptions = { author: 1 };
    } else if (sort === 'recent') {
      sortOptions = { createdAt: -1 };
    }
    
    // Get total count for pagination
    const totalPosts = await db.collection('forum_posts').countDocuments();
    const totalPages = Math.ceil(totalPosts / pageLimit);
    
    // Fetch posts with pagination
    const posts = await db.collection('forum_posts')
      .find({})
      .sort(sortOptions)
      .skip(skip)
      .limit(pageLimit)
      .toArray();
    
    res.json({
      success: true,
      data: posts,
      pagination: {
        currentPage,
        totalPages,
        totalPosts,
        limit: pageLimit,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1
      }
    });
    
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * POST /api/forum/create
 * Create new forum thread
 * Body: { title, content, userId }
 */
router.post('/forum/create', async (req, res) => {
  try {
    const db = getDatabase();
    const { title, content, userId } = req.body;
    
    // Validate input
    if (!title || !content || !userId) {
      return sendError(res, new Error('Title, content, and user ID are required'), 400);
    }
    
    if (!isValidObjectId(userId)) {
      return sendError(res, new Error('Invalid user ID'), 400);
    }
    
    // Validate word count (max 2000 words)
    const wordCount = content.trim().split(/\s+/).length;
    if (wordCount > 2000) {
      return sendError(res, new Error(`Content too long (${wordCount} words). Maximum 2000 words allowed.`), 400);
    }
    
    // Get user info for author and department
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return sendError(res, new Error('User not found'), 404);
    }
    
    // Create post document
    const post = {
      title: title.trim(),
      content: content.trim(),
      author: user.name,
      authorId: new ObjectId(userId),
      department: user.affiliatedDepartment || 'Student Council',
      replies: 0,
      views: 1,
      createdAt: new Date(),
      lastReplyAt: new Date()
    };
    
    // Insert post
    const result = await db.collection('forum_posts').insertOne(post);
    
    sendSuccess(res, { postId: result.insertedId }, 'Thread created successfully', 201);
    
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * GET /api/forum/posts/user/:userId
 * Get all posts by a specific user
 */
router.get('/forum/posts/user/:userId', async (req, res) => {
  try {
    const db = getDatabase();
    const { userId } = req.params;
    
    if (!isValidObjectId(userId)) {
      return sendError(res, new Error('Invalid user ID'), 400);
    }
    
    const posts = await db.collection('forum_posts')
      .find({ authorId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();
    
    sendSuccess(res, posts);
    
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * PUT /api/forum/view/:postId
 * Increment view count for a post
 */
router.put('/forum/view/:postId', async (req, res) => {
  try {
    const db = getDatabase();
    const { postId } = req.params;
    
    if (!isValidObjectId(postId)) {
      return sendError(res, new Error('Invalid post ID'), 400);
    }
    
    const result = await db.collection('forum_posts').updateOne(
      { _id: new ObjectId(postId) },
      { $inc: { views: 1 } }
    );
    
    if (result.matchedCount === 0) {
      return sendError(res, new Error('Post not found'), 404);
    }
    
    sendSuccess(res, null, 'View counted');
    
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * POST /api/forum/reply
 * Add reply to a forum post
 * Body: { postId, userId, content }
 */
router.post('/forum/reply', async (req, res) => {
  try {
    const db = getDatabase();
    const { postId, userId, content } = req.body;
    
    // Validate input
    if (!postId || !userId || !content) {
      return sendError(res, new Error('Post ID, User ID, and content are required'), 400);
    }
    
    if (!isValidObjectId(postId) || !isValidObjectId(userId)) {
      return sendError(res, new Error('Invalid ID format'), 400);
    }
    
    // Verify post exists
    const post = await db.collection('forum_posts')
      .findOne({ _id: new ObjectId(postId) });
    
    if (!post) {
      return sendError(res, new Error('Post not found'), 404);
    }
    
    // Create reply document
    const reply = {
      postId: new ObjectId(postId),
      userId: new ObjectId(userId),
      content: content.trim(),
      createdAt: new Date()
    };
    
    // Insert reply
    const result = await db.collection('post_replies').insertOne(reply);
    
    // Update post reply count and last reply time
    await db.collection('forum_posts').updateOne(
      { _id: new ObjectId(postId) },
      { 
        $inc: { replies: 1 },
        $set: { lastReplyAt: new Date() }
      }
    );
    
    sendSuccess(res, { replyId: result.insertedId }, 'Reply posted successfully', 201);
    
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * POST /api/forum/bookmark
 * Bookmark a forum post
 * Body: { postId, userId }
 */
router.post('/forum/bookmark', async (req, res) => {
  try {
    const db = getDatabase();
    const { postId, userId } = req.body;
    
    if (!postId || !userId) {
      return sendError(res, new Error('Post ID and User ID are required'), 400);
    }
    
    if (!isValidObjectId(postId) || !isValidObjectId(userId)) {
      return sendError(res, new Error('Invalid ID format'), 400);
    }
    
    // Check if already bookmarked
    const existing = await db.collection('user_bookmarks')
      .findOne({ 
        userId: new ObjectId(userId), 
        postId: new ObjectId(postId) 
      });
    
    if (existing) {
      return sendError(res, new Error('Post already bookmarked'), 409);
    }
    
    // Create bookmark
    const bookmark = {
      userId: new ObjectId(userId),
      postId: new ObjectId(postId),
      bookmarkedAt: new Date()
    };
    
    await db.collection('user_bookmarks').insertOne(bookmark);
    
    sendSuccess(res, null, 'Post bookmarked successfully', 201);
    
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * DELETE /api/forum/bookmark
 * Remove bookmark
 * Body: { postId, userId }
 */
router.delete('/forum/bookmark', async (req, res) => {
  try {
    const db = getDatabase();
    const { postId, userId } = req.body;
    
    if (!postId || !userId) {
      return sendError(res, new Error('Post ID and User ID are required'), 400);
    }
    
    const result = await db.collection('user_bookmarks').deleteOne({
      userId: new ObjectId(userId),
      postId: new ObjectId(postId)
    });
    
    if (result.deletedCount === 0) {
      return sendError(res, new Error('Bookmark not found'), 404);
    }
    
    sendSuccess(res, null, 'Bookmark removed');
    
  } catch (error) {
    sendError(res, error);
  }
});

/**
 * GET /api/forum/bookmarks/:userId
 * Get user's bookmarked posts
 */
router.get('/forum/bookmarks/:userId', async (req, res) => {
  try {
    const db = getDatabase();
    const { userId } = req.params;
    
    if (!isValidObjectId(userId)) {
      return sendError(res, new Error('Invalid user ID'), 400);
    }
    
    // Get bookmarks
    const bookmarks = await db.collection('user_bookmarks')
      .find({ userId: new ObjectId(userId) })
      .sort({ bookmarkedAt: -1 })
      .toArray();
    
    // Get post details for each bookmark
    const postIds = bookmarks.map(b => b.postId);
    const posts = await db.collection('forum_posts')
      .find({ _id: { $in: postIds } })
      .toArray();
    
    // Combine bookmark data with post data
    const bookmarkedPosts = bookmarks.map(bookmark => {
      const post = posts.find(p => p._id.toString() === bookmark.postId.toString());
      return {
        ...post,
        bookmarkedAt: bookmark.bookmarkedAt
      };
    });
    
    sendSuccess(res, bookmarkedPosts);
    
  } catch (error) {
    sendError(res, error);
  }
});

// Export router
module.exports = router;

