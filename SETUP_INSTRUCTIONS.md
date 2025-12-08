# 🚀 Quick Setup Guide - HW4

## What's New in Assignment 4

This project has been upgraded from a static front-end (HW3) to a full-stack Node.js application with MongoDB database integration.

## Prerequisites

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community)

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This will install:
- express (web server)
- mongodb (database driver)
- dotenv (environment variables)
- cors (cross-origin support)
- nodemon (development tool)

### 2. Start MongoDB

**macOS:**
```bash
brew services start mongodb-community
```

**Windows:**
- Start MongoDB service from Services app
- Or run `mongod` in terminal

**Linux:**
```bash
sudo systemctl start mongod
```

Verify MongoDB is running:
```bash
mongosh
# Should connect successfully
```

### 3. Configure Environment

The `.env` file is already created with default settings:
```
PORT=3002
MONGODB_URI=mongodb://localhost:27017
DB_NAME=nightwatcher_forum
```

No changes needed for local development!

### 4. Start the Server

**Development mode (auto-restart on changes):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

### 5. Access the Application

Open your browser and navigate to:
- **Main Site:** http://localhost:3002
- **API Endpoints:** http://localhost:3002/api
- **Health Check:** http://localhost:3002/health

## Testing the Application

### 1. Test API Endpoints

```bash
# Get all articles
curl http://localhost:3002/api/articles

# Get latest articles only
curl http://localhost:3002/api/articles?category=latest

# Test health endpoint
curl http://localhost:3002/health
```

### 2. Test Homepage

1. Open http://localhost:3002
2. Check browser console (F12 → Console tab)
3. You should see: "✅ Homepage content loaded successfully"
4. Check Network tab to see API calls

### 3. Test Form Submissions

1. Go to http://localhost:3002/questionnaire.html
2. Fill out the form
3. Submit - data will be saved to MongoDB
4. Check browser console for success messages

## Seeding Sample Data

The database starts empty. To add sample data, you can:

**Option 1: Use MongoDB Compass**
1. Download [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Connect to `mongodb://localhost:27017`
3. Create database: `nightwatcher_forum`
4. Create collections: `articles`, `fanworks`, `departments`
5. Insert sample documents manually

**Option 2: Use mongosh**
```bash
mongosh
use nightwatcher_forum

db.articles.insertMany([
  {
    title: "The Dragon Blood Awakening: A Complete Guide",
    author: "DragonMaster",
    content: "Discover the secrets of dragon blood lineage...",
    fullContent: "This comprehensive guide covers everything...",
    category: "latest",
    comments: 23,
    likes: 145,
    views: 1203,
    timestamp: new Date(),
    tags: ["bloodline", "guide"]
  },
  // Add more articles...
])
```

## Troubleshooting

### Port 3002 already in use
```bash
# Find process using port 3002
lsof -ti:3002

# Kill the process
lsof -ti:3002 | xargs kill
```

### Cannot connect to MongoDB
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB manually
mongod --config /usr/local/etc/mongod.conf
```

### Module not found errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Project Structure

```
HW4/
├── public/              # Static files (HTML, CSS, JS)
├── db/                  # Database connection module
├── routes/              # API route handlers
├── app.js               # Express server
├── package.json         # Dependencies
├── .env                 # Environment variables
└── README.md            # Full documentation
```

## Key Features

✅ Node.js Express server on port 3002
✅ MongoDB database for data persistence
✅ RESTful API endpoints
✅ Dynamic content loading from database
✅ Form submissions saved to database
✅ Graceful error handling
✅ All existing UI features preserved

## Next Steps

1. Start the server: `npm run dev`
2. Open http://localhost:3002
3. Seed sample data (optional)
4. Test all features
5. Capture screenshots for assignment submission

## Support

If you encounter issues:
1. Check MongoDB is running
2. Verify port 3002 is available
3. Check `.env` configuration
4. Review browser console for errors
5. Check server console for error messages

---

**Ready to start?** Run `npm run dev` and visit http://localhost:3002! 🐉
