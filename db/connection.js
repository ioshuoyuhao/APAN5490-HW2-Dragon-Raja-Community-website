/**
 * MongoDB Connection Module
 * 
 * Provides centralized database connection management with:
 * - Singleton connection pattern
 * - Connection pooling for performance
 * - Error handling and retry logic
 * - Graceful shutdown support
 * 
 * Author: Haoxiang Huo (Steven)
 * Course: APAN 5490 - Assignment 4
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

// Connection state
let db = null;
let client = null;

/**
 * Connect to MongoDB database
 * Uses singleton pattern - returns existing connection if already connected
 * 
 * @returns {Promise<Db>} MongoDB database instance
 * @throws {Error} If connection fails
 */
async function connectToDatabase() {
  // Return existing connection if already established
  if (db) {
    console.log('✅ Using existing MongoDB connection');
    return db;
  }

  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const dbName = process.env.DB_NAME || 'nightwatcher_forum';

    console.log('🔌 Connecting to MongoDB...');
    console.log(`   URI: ${uri}`);
    console.log(`   Database: ${dbName}`);

    // Create new MongoClient with connection pooling
    client = new MongoClient(uri, {
      maxPoolSize: 10,              // Maximum connections in pool
      minPoolSize: 2,               // Minimum connections to maintain
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      socketTimeoutMS: 45000,       // Socket timeout
      family: 4                     // Use IPv4, skip trying IPv6
    });

    // Connect to MongoDB
    await client.connect();
    
    // Verify connection with ping
    await client.db('admin').command({ ping: 1 });
    
    // Get database instance
    db = client.db(dbName);
    
    console.log('✅ Successfully connected to MongoDB');
    console.log(`   Database: ${dbName}`);
    console.log(`   Collections available: ${(await db.listCollections().toArray()).map(c => c.name).join(', ') || 'none yet'}`);

    return db;

  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('   Make sure MongoDB is running on:', process.env.MONGODB_URI);
    throw error;
  }
}

/**
 * Get existing database connection
 * Must call connectToDatabase() first
 * 
 * @returns {Db} MongoDB database instance
 * @throws {Error} If database not initialized
 */
function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call connectToDatabase() first.');
  }
  return db;
}

/**
 * Check if database is connected
 * 
 * @returns {boolean} True if connected
 */
function isConnected() {
  return db !== null && client !== null;
}

/**
 * Close database connection gracefully
 * Call this during server shutdown
 * 
 * @returns {Promise<void>}
 */
async function closeDatabaseConnection() {
  if (client) {
    console.log('🔌 Closing MongoDB connection...');
    await client.close();
    db = null;
    client = null;
    console.log('✅ MongoDB connection closed');
  }
}

/**
 * Test database connection
 * Useful for health checks
 * 
 * @returns {Promise<boolean>} True if connection is healthy
 */
async function testConnection() {
  try {
    if (!db) return false;
    await db.admin().ping();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error.message);
    return false;
  }
}

/**
 * Initialize database with collections if they don't exist
 * Creates indexes and sample data for first-time setup
 * 
 * @returns {Promise<void>}
 */
async function initializeDatabase() {
  try {
    const db = getDatabase();
    
    console.log('🔧 Initializing database...');

    // Create collections if they don't exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    const requiredCollections = [
      'articles',
      'fanworks',
      'departments',
      'users',
      'forum_posts',
      'post_replies',
      'user_bookmarks',
      'questionnaire_submissions',
      'contact_submissions'
    ];

    for (const collectionName of requiredCollections) {
      if (!collectionNames.includes(collectionName)) {
        await db.createCollection(collectionName);
        console.log(`   ✅ Created collection: ${collectionName}`);
      }
    }

    // Create indexes for better query performance
    await db.collection('articles').createIndex({ category: 1, timestamp: -1 });
    await db.collection('articles').createIndex({ timestamp: -1 });
    await db.collection('fanworks').createIndex({ uploadDate: -1 });
    await db.collection('fanworks').createIndex({ featured: 1 });
    await db.collection('fanworks').createIndex({ likes: -1 });
    await db.collection('fanworks').createIndex({ comments: -1 });
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ bloodRank: 1 });
    await db.collection('forum_posts').createIndex({ createdAt: -1 });
    await db.collection('forum_posts').createIndex({ author: 1 });
    await db.collection('post_replies').createIndex({ postId: 1 });
    await db.collection('user_bookmarks').createIndex({ userId: 1, postId: 1 }, { unique: true });
    await db.collection('questionnaire_submissions').createIndex({ submittedAt: -1 });
    await db.collection('contact_submissions').createIndex({ submittedAt: -1 });

    console.log('   ✅ Created indexes');

    // Check if database has data, if not, seed it
    const articlesCount = await db.collection('articles').countDocuments();
    if (articlesCount === 0) {
      console.log('   ℹ️  Database is empty. Consider seeding sample data.');
      // Optionally call seedDatabase() here
    } else {
      console.log(`   ✅ Database has ${articlesCount} articles`);
    }

    console.log('✅ Database initialization complete');

  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    throw error;
  }
}

// Export functions
module.exports = {
  connectToDatabase,
  getDatabase,
  closeDatabaseConnection,
  isConnected,
  testConnection,
  initializeDatabase
};

