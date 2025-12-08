/**
 * Authentication & Blood Rank Calculation Module
 * 
 * Handles user authentication and Dragon Blood Lineage ranking system
 * 
 * Author: Steven Huo
 * Course: APAN 5490 - Assignment 4
 * Date: December 5, 2025
 * 
 * Blood Rank Scoring:
 * - Multiple Choice (Q1-Q6): Fantasy-oriented = high score
 * - Text Length (Q7-Q10): Longer = higher score
 * - Total Score: 0-100 points
 * - Ranks: S (90-100), A (80-89), B (70-79), C (60-69), D (50-59), F (0-49)
 */

/**
 * Calculate blood rank score based on questionnaire answers
 * 
 * @param {Object} answers - Questionnaire answers object
 * @returns {Object} { score: Number, rank: String, breakdown: Object }
 */
function calculateBloodRank(answers) {
  let mcScore = 0; // Multiple choice score (max 60 points)
  let textScore = 0; // Text question score (max 40 points)
  
  // ===== MULTIPLE CHOICE QUESTIONS (Q1-Q6) =====
  // Fantasy/loneliness-oriented answers get higher scores
  
  const mcScoring = {
    q1: {
      // Do you believe alien civilizations existed on Earth?
      'yes': 10,      // Fantasy-oriented: believes in aliens
      'maybe': 5,     // Neutral
      'no': 0         // Realistic: skeptical
    },
    q2: {
      // Would you change the world or yourself to adapt?
      'world': 10,    // Fantasy: wants to change world (idealistic)
      'both': 5,      // Neutral
      'myself': 0     // Realistic: practical adaptation
    },
    q3: {
      // Do you believe in fate or free will?
      'fate': 10,     // Fantasy: believes in destiny
      'both': 5,      // Neutral
      'freewill': 0   // Realistic: self-determination
    },
    q4: {
      // How do you handle difficult situations?
      'fight': 10,    // Fantasy: confrontational (lonely warrior)
      'balance': 5,   // Neutral
      'avoid': 0      // Realistic: pragmatic avoidance
    },
    q5: {
      // What matters most to you?
      'honor': 10,    // Fantasy: honor code (lonely hero)
      'balance': 5,   // Neutral
      'happiness': 0  // Realistic: practical happiness
    },
    q6: {
      // Your approach to life?
      'idealistic': 10,  // Fantasy: dreams and ideals
      'balance': 5,      // Neutral
      'pragmatic': 0     // Realistic: practical approach
    }
  };
  
  // Calculate MC score
  for (let i = 1; i <= 6; i++) {
    const questionKey = `q${i}`;
    const answer = answers[questionKey];
    if (mcScoring[questionKey] && mcScoring[questionKey][answer] !== undefined) {
      mcScore += mcScoring[questionKey][answer];
    }
  }
  
  // ===== TEXT QUESTIONS (Q7-Q10) =====
  // Longer responses indicate deeper introspection (fantasy trait)
  
  const textQuestions = ['q7', 'q8', 'q9', 'q10'];
  let totalWords = 0;
  let textQuestionCount = 0;
  
  textQuestions.forEach(q => {
    if (answers[q]) {
      const wordCount = countWords(answers[q]);
      totalWords += wordCount;
      textQuestionCount++;
      
      // Score per question based on word count
      let questionScore = 0;
      if (wordCount >= 800) {
        questionScore = 10; // Max score: very detailed (S-rank level)
      } else if (wordCount >= 500) {
        questionScore = 8;  // B-rank level
      } else if (wordCount >= 200) {
        questionScore = 6;  // C-rank level
      } else if (wordCount >= 50) {
        questionScore = 4;  // D-rank level
      } else {
        questionScore = 0;  // F-rank: too brief
      }
      
      textScore += questionScore;
    }
  });
  
  // ===== CALCULATE FINAL SCORE =====
  // Weighted: MC 40%, Text 60% (text shows introspection/fantasy thinking)
  const finalScore = Math.round((mcScore * 0.4) + (textScore * 0.6));
  
  // Determine rank
  const rank = getRankFromScore(finalScore);
  
  // Average word count for breakdown
  const avgWordCount = textQuestionCount > 0 ? Math.round(totalWords / textQuestionCount) : 0;
  
  return {
    score: finalScore,
    rank: rank,
    breakdown: {
      mcScore: mcScore,
      mcMaxScore: 60,
      textScore: textScore,
      textMaxScore: 40,
      avgWordCount: avgWordCount,
      totalWords: totalWords
    }
  };
}

/**
 * Count words in a text string
 * @param {String} text - Text to count words
 * @returns {Number} Word count
 */
function countWords(text) {
  if (!text || typeof text !== 'string') return 0;
  
  // Remove extra whitespace and split by spaces
  const words = text.trim().split(/\s+/);
  
  // Filter out empty strings
  return words.filter(word => word.length > 0).length;
}

/**
 * Determine rank letter from numerical score
 * @param {Number} score - Score from 0-100
 * @returns {String} Rank letter (S, A, B, C, D, F)
 */
function getRankFromScore(score) {
  if (score >= 90) return 'S';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

/**
 * Get rank description and color
 * @param {String} rank - Rank letter
 * @returns {Object} { description, color, badge }
 */
function getRankInfo(rank) {
  const rankData = {
    'S': {
      description: 'Supreme Dragon Blood - Elite among elites. Your lineage is exceptionally pure.',
      color: '#D4AF37', // Gold
      badge: '👑',
      title: 'Dragon Lord Candidate'
    },
    'A': {
      description: 'Superior Dragon Blood - Outstanding potential. You possess remarkable abilities.',
      color: '#C0C0C0', // Silver
      badge: '⭐',
      title: 'Elite Agent'
    },
    'B': {
      description: 'Above Average Dragon Blood - Strong capabilities. Your bloodline is commendable.',
      color: '#8B4513', // Bronze
      badge: '🔱',
      title: 'Skilled Agent'
    },
    'C': {
      description: 'Competent Dragon Blood - Solid foundation. You have good potential for growth.',
      color: '#4169E1', // Blue
      badge: '⚔️',
      title: 'Agent'
    },
    'D': {
      description: 'Developing Dragon Blood - Awakening stage. Training will enhance your abilities.',
      color: '#32CD32', // Green
      badge: '🌱',
      title: 'Initiate Agent'
    },
    'F': {
      description: 'Dormant Dragon Blood - Latent potential. Your bloodline requires awakening.',
      color: '#808080', // Gray
      badge: '🔮',
      title: 'Candidate'
    }
  };
  
  return rankData[rank] || rankData['F'];
}

/**
 * Validate user signup data
 * @param {Object} data - User data { name, email, answers }
 * @returns {Object} { valid: Boolean, errors: Array }
 */
function validateSignupData(data) {
  const errors = [];
  
  // Validate name
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  
  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push('Valid email address is required');
  }
  
  // Validate answers
  if (!data.answers || typeof data.answers !== 'object') {
    errors.push('Questionnaire answers are required');
  } else {
    // Check for at least 10 questions answered
    const answerCount = Object.keys(data.answers).length;
    if (answerCount < 10) {
      errors.push(`Please answer all questions (${answerCount}/10 answered)`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Create user object for database
 * @param {Object} data - { name, email, answers }
 * @returns {Object} User document for MongoDB
 */
function createUserDocument(data) {
  const { score, rank, breakdown } = calculateBloodRank(data.answers);
  
  return {
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    bloodRank: rank,
    bloodRankScore: score,
    bloodRankBreakdown: breakdown,
    affiliatedDepartment: null, // No department initially
    createdAt: new Date(),
    lastLogin: new Date()
  };
}

/**
 * Generate welcome message for new user
 * @param {String} name - User name
 * @param {String} rank - Blood rank
 * @returns {String} Welcome message
 */
function generateWelcomeMessage(name, rank) {
  const rankInfo = getRankInfo(rank);
  
  return `Welcome, Agent ${name}! 
  
Your blood rank has been determined: ${rank}-Rank ${rankInfo.badge}

${rankInfo.description}

You have been accepted into Cassell College as a ${rankInfo.title}.

Your journey as a dragon hunter begins now. Join a department in the Forum to start your missions!`;
}

module.exports = {
  calculateBloodRank,
  getRankFromScore,
  getRankInfo,
  countWords,
  validateSignupData,
  createUserDocument,
  generateWelcomeMessage
};

