/**
 * Database Seeding Script - Night Watcher Forum
 * 
 * Generates AI-simulated sample data for all collections
 * Based on Dragon Raja / Cassell College universe
 * 
 * Author: Steven Huo
 * Course: APAN 5490 - Assignment 4
 * Date: December 5, 2025
 * 
 * Collections Seeded:
 * - articles: 100 documents (35 latest, 35 hot, 30 featured)
 * - fanworks: 50 documents (35 artwork, 10 fiction, 5 cosplay)
 * - departments: 5 documents (fixed Cassell College departments)
 * - questionnaire_submissions: 30 documents
 * - contact_submissions: 20 documents
 * 
 * Total: 205 documents
 * 
 * Usage: npm run seed
 */

const { connectToDatabase, closeDatabaseConnection } = require('./connection');

// ===== DATA POOLS =====

const AUTHORS = [
  'DragonMaster', 'CassellChronicler', 'LionheartWarrior', 'SilverBlade',
  'NormaSeeker', 'HybridHunter', 'RavenWatcher', 'FlameBringer',
  'IcePhoenix', 'StormRider', 'ShadowDancer', 'CrimsonKnight',
  'MoonlightScribe', 'ThunderFist', 'MysticSage', 'BloodlineGuardian',
  'CrystalDreamer', 'NightSentinel', 'GoldenDragon', 'SapphireMage'
];

const ARTICLE_TITLES = {
  latest: [
    'The Dragon Blood Awakening: A Complete Guide',
    'Understanding Your Dragon Lineage',
    'Cassell College Admission Tips for New Students',
    'The Four Great Dragon Kings: History and Legacy',
    'Spirit Speech: Mastering Your Dragon Abilities',
    'Campus Life at Cassell: A Freshman\'s Perspective',
    'The Lionheart Society: Honor Code Explained',
    'Equipment Division\'s Latest Dragon-Slaying Weapons',
    'Intelligence Report: Recent Dragon Activity',
    'Student Council Elections: Meet the Candidates',
    'Hybrid Theory: Understanding Mixed Bloodlines',
    'The Secret Party: Myths and Reality',
    'Dragon Bloodline Awakening Symptoms',
    'Alchemy Division\'s New Research Findings',
    'Campus Security Protocols During Dragon Threats',
    'The History of Cassell College: 150 Years',
    'Executive Department Mission Protocols',
    'Understanding Your Blood Ratio',
    'The Norton Pavilion: Cassell\'s Greatest Treasure',
    'Student Guide to Dragon Blood Testing',
    'Word Spirit Categories and Classifications',
    'The Four Monarchs: Ancient Dragon Hierarchy',
    'Campus Clubs and Organizations Guide',
    'Night Watchman Forum Community Guidelines',
    'Freshman Orientation Week Schedule',
    'The Lionheart vs. Student Council Rivalry',
    'Equipment Maintenance for Dragon Hunters',
    'Bloodline Instability: Warning Signs',
    'Cassell\'s Underground Facilities Explored',
    'The Principal\'s Office: Mysteries and Legends',
    'Dragon Biology 101: Essential Knowledge',
    'Student Exchange Programs with Other Branches',
    'The Library\'s Restricted Section Access',
    'Combat Training Requirements for All Students',
    'Understanding Dragonslayer Ranks and Promotions'
  ],
  hot: [
    'BREAKING: New Dragon Sighting Near Campus',
    'Debate: Who Should Lead the Next Mission?',
    'Poll: Best Department at Cassell College',
    'Controversial: Should Hybrids Have Full Rights?',
    'The Great Cafeteria Food Debate',
    'Lionheart Society vs Student Council: The Rivalry',
    'Leaked: Upcoming Execution Department Mission',
    'Theory: Is the Principal Actually a Dragon?',
    'Student Protest: Campus Curfew Too Strict',
    'Rumor Mill: New Professor\'s Secret Identity',
    'Hot Take: Traditional Training Methods Are Outdated',
    'Equipment Division Budget Controversy',
    'The Missing Students Case: What Really Happened?',
    'Debate: Best Dragon-Slaying Weapon Type',
    'Campus Romance Drama: Who\'s Dating Whom?',
    'Conspiracy Theory: Secret Underground Experiments',
    'Poll: Hardest Course at Cassell College',
    'Controversial Opinion: Dragons Aren\'t All Evil',
    'The Halloween Party Incident Discussion',
    'Debate: Should Students Access Restricted Archives?',
    'Breaking News: Equipment Malfunction During Training',
    'Hot Topic: New Campus Rules Too Restrictive',
    'Theory: Connection Between Weather and Dragons',
    'Student Council Scandal: Leaked Documents',
    'Debate: Best Strategy Against Dragon Lords',
    'The Mysterious Transfer Student Theories',
    'Poll: Most Useful Word Spirit Ability',
    'Controversy: Favoritism in Mission Assignments',
    'Breaking: Unauthorized Entry to Restricted Zone',
    'Hot Discussion: Professor Evaluation Results',
    'Theory: Ancient Dragon Prophecy Interpretation',
    'Campus Legend: The Ghost of Old Library',
    'Debate: Traditional vs Modern Dragon Hunting',
    'Poll: Most Dangerous Dragon Species',
    'Breaking News: Equipment Division New Prototype'
  ],
  featured: [
    'Epic Tale: The First Dragonslayer\'s Journey',
    'Art Feature: Dragon Raja Fan Illustrations',
    'Interview: A Day with Lionheart Society Leader',
    'Photo Essay: Cassell College Through the Seasons',
    'Featured Story: My First Dragon Encounter',
    'Community Spotlight: Top Contributors This Month',
    'Video Feature: Campus Tour for Prospective Students',
    'Artist Showcase: Dragon-Themed Digital Art',
    'Featured Guide: Surviving Your First Year',
    'Community Event: Annual Dragon Boat Festival',
    'Special Report: Equipment Division Innovation',
    'Featured Cosplay: Best Cassell College Uniforms',
    'Spotlight: Rising Stars in Combat Training',
    'Community Project: Campus History Archive',
    'Featured Fiction: Dragon Hunter Chronicles',
    'Art Gallery: Student Works Exhibition',
    'Special Interview: Alumnus Success Stories',
    'Featured Video: Epic Training Montage',
    'Community Initiative: Environmental Dragon Research',
    'Spotlight: News Club\'s Best Articles of 2024',
    'Featured Photography: Aurora Dragon Phenomenon',
    'Special Event: Cassell College Anniversary Celebration',
    'Community Awards: Member of the Month',
    'Featured Guide: Advanced Word Spirit Techniques',
    'Art Showcase: Traditional Dragon Paintings',
    'Special Feature: Behind the Scenes of Missions',
    'Community Collab: Cross-Department Project',
    'Featured Story: Legendary Mission Retold',
    'Spotlight: Student Council Achievements',
    'Special Report: Dragon Ecology Research'
  ]
};

const FANWORK_TITLES = {
  artwork: [
    'Lionheart Society Emblem Redesign',
    'Cassell College at Sunset',
    'Dragon Blood Awakening Concept Art',
    'Student Council Official Portrait',
    'Epic Dragon Battle Scene',
    'Campus Cherry Blossoms in Spring',
    'Norton Pavilion Digital Painting',
    'Character Design: My Original Hybrid',
    'Equipment Division Workshop Illustration',
    'Night Watch Tower Under Moonlight',
    'Dragon King Portrait Series',
    'Cassell College Uniform Variations',
    'Word Spirit Activation Visual Effect',
    'Execution Department Mission Poster',
    'Autumn Leaves on Campus Grounds',
    'Dragon Egg Hatching Sequence',
    'Student Life Comic Strip',
    'Cassell Library Interior Architecture',
    'Dragon Hunter Equipment Designs',
    'Campus Map Illustrated Guide',
    'Bloodline Awakening Transformation Art',
    'Winter Festival at Cassell',
    'Character Portrait: My OC Student',
    'Dragon Species Comparison Chart',
    'Campus Clock Tower at Night',
    'Spirit Speech Symbols Collection',
    'Training Ground Action Scene',
    'Dragon Raja Logo Reinterpretation',
    'Student Dorm Room Illustration',
    'Hybrid Identity Concept Artwork',
    'Campus Cafeteria Daily Life',
    'Ancient Dragon Ruins Exploration',
    'Equipment Division Blueprints',
    'Cassell College Aerial View',
    'Dragon Scale Pattern Studies'
  ],
  fiction: [
    'The Freshman\'s First Mission',
    'Lionheart Honor: A Short Story',
    'Secret of the Restricted Archives',
    'My Roommate is a Dragon Hybrid',
    'The Night Watch Chronicles: Chapter 1',
    'Love Letter to a Dragon Hunter',
    'Execution Department Case Files',
    'The Professor\'s Secret Past',
    'Campus Ghost Story Collection',
    'Dragon Blood Diaries: Volume 1'
  ],
  cosplay: [
    'Cassell College Uniform Cosplay',
    'Lionheart Society Commander Outfit',
    'Executive Department Combat Gear',
    'Student Council President Costume',
    'Dragon Hunter Equipment Build'
  ]
};

const DEPARTMENTS = [
  {
    name: 'Student Council',
    description: 'The governing body of Cassell College students, responsible for campus affairs, event organization, and student welfare. Led by the Student President, the council maintains order and represents student interests.',
    memberCount: 1247,
    icon: '📋',
    color: '#1C3D35'
  },
  {
    name: 'Lionheart Society',
    description: 'Elite warriors dedicated to dragon slaying and upholding the ancient traditions of dragonslayers. Known for their strict honor code and exceptional combat prowess. The most prestigious combat organization at Cassell.',
    memberCount: 892,
    icon: '🦁',
    color: '#D4AF37'
  },
  {
    name: 'Execution Department',
    description: 'Front-line combat specialists who handle the most dangerous dragon hunting missions. The enforcement arm of Cassell College against dragon threats worldwide. Only the strongest students qualify.',
    memberCount: 1056,
    icon: '⚔️',
    color: '#8B0000'
  },
  {
    name: 'News Club',
    description: 'Cassell\'s information network and media hub. Responsible for campus news, intelligence gathering, and maintaining the college\'s public relations. They keep the community informed and connected.',
    memberCount: 634,
    icon: '📰',
    color: '#4169E1'
  },
  {
    name: 'Equipment Division',
    description: 'Weaponry and technology development specialists. They design, forge, and maintain the advanced equipment used in dragon hunting operations. Home to Cassell\'s best engineers and alchemists.',
    memberCount: 723,
    icon: '🔧',
    color: '#708090'
  }
];

const CONTACT_TOPICS = [
  'General Inquiry',
  'Technical Support',
  'Partnership',
  'Content Report',
  'Feedback',
  'Other'
];

// ===== HELPER FUNCTIONS =====

/**
 * Generate random integer between min and max (inclusive)
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get random element from array
 */
function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate random date within last N days
 */
function randomDate(daysAgo) {
  const now = new Date();
  const past = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
  const randomTime = past.getTime() + Math.random() * (now.getTime() - past.getTime());
  return new Date(randomTime);
}

/**
 * Generate article content preview
 */
function generateArticleContent(title, category) {
  const intros = [
    'Discover the secrets and insights about',
    'A comprehensive guide to understanding',
    'Everything you need to know about',
    'Exploring the fascinating world of',
    'An in-depth analysis of',
    'The ultimate resource for learning about',
    'Uncover the mysteries behind',
    'Essential information regarding',
    'A detailed examination of',
    'The complete breakdown of'
  ];
  
  const endings = [
    'Join the discussion and share your thoughts!',
    'What are your experiences? Comment below!',
    'Let us know your perspective in the comments!',
    'Share your story with the community!',
    'We want to hear from you!',
    'Tell us what you think!',
    'Join the conversation!',
    'Your feedback matters!',
    'Discuss with fellow community members!',
    'Share your insights!'
  ];
  
  return `${randomElement(intros)} ${title.toLowerCase()}. ${randomElement(endings)}`;
}

/**
 * Generate full article content
 */
function generateFullContent(title, category) {
  const sections = [
    'This comprehensive guide covers everything from the basics to advanced concepts.',
    'Our community has contributed valuable insights and experiences to create this resource.',
    'Whether you\'re a newcomer or a veteran, there\'s something here for everyone.',
    'Based on extensive research and firsthand accounts from Cassell College students.',
    'The information presented here reflects the latest understanding and practices.',
    'This has been carefully compiled with input from experts and experienced members.',
    'Understanding this topic is crucial for anyone serious about dragon hunting and Cassell life.',
    'The knowledge shared here comes from years of accumulated wisdom and practical experience.'
  ];
  
  return sections.slice(0, randomInt(3, 5)).join(' ');
}

/**
 * Generate article tags
 */
function generateTags(category) {
  const tagPools = {
    latest: ['guide', 'tutorial', 'news', 'announcement', 'education', 'training', 'bloodline', 'campus'],
    hot: ['discussion', 'debate', 'poll', 'controversy', 'breaking', 'theory', 'rumor', 'opinion'],
    featured: ['showcase', 'interview', 'spotlight', 'event', 'community', 'art', 'story', 'special']
  };
  
  const pool = tagPools[category] || tagPools.latest;
  const numTags = randomInt(2, 4);
  const tags = [];
  
  for (let i = 0; i < numTags; i++) {
    const tag = randomElement(pool);
    if (!tags.includes(tag)) {
      tags.push(tag);
    }
  }
  
  return tags;
}

/**
 * Generate fanwork description
 */
function generateFanworkDescription(title, category) {
  const descriptions = {
    artwork: [
      'Digital illustration created with Procreate and Photoshop.',
      'Hand-drawn concept art inspired by Dragon Raja universe.',
      'Vector art design showcasing Cassell College aesthetic.',
      'Original character design with detailed backstory.',
      'Fan art tribute to the amazing Dragon Raja series.',
      'Experimental digital painting exploring dragon themes.',
      'Detailed illustration featuring iconic Cassell locations.',
      'Character portrait with emphasis on bloodline features.'
    ],
    fiction: [
      'Original short story set in Cassell College universe.',
      'Fan fiction exploring alternative storylines and characters.',
      'Creative writing piece inspired by Dragon Raja lore.',
      'Narrative exploring the daily life of Cassell students.',
      'Story chapter featuring original characters and dragons.',
      'Fan-created tale expanding on official Dragon Raja canon.'
    ],
    cosplay: [
      'Handmade costume with attention to detail and accuracy.',
      'Cosplay featuring custom props and accessories.',
      'Full costume build documenting the creation process.',
      'Convention photoshoot showcasing character interpretation.',
      'Detailed costume recreation with weathering effects.'
    ]
  };
  
  return randomElement(descriptions[category] || descriptions.artwork);
}

// ===== SEEDING FUNCTIONS =====

/**
 * Clear all existing data from database
 */
async function clearDatabase(db) {
  console.log('\n🗑️  Clearing existing data...');
  
  await db.collection('articles').deleteMany({});
  await db.collection('fanworks').deleteMany({});
  await db.collection('departments').deleteMany({});
  await db.collection('forum_posts').deleteMany({});
  await db.collection('post_replies').deleteMany({});
  await db.collection('user_bookmarks').deleteMany({});
  await db.collection('users').deleteMany({});
  await db.collection('questionnaire_submissions').deleteMany({});
  await db.collection('contact_submissions').deleteMany({});
  
  console.log('   ✅ All collections cleared');
}

/**
 * Seed departments collection (5 fixed departments)
 */
async function seedDepartments(db) {
  console.log('\n📋 Seeding departments...');
  
  const result = await db.collection('departments').insertMany(DEPARTMENTS);
  
  console.log(`   ✅ Inserted ${result.insertedCount} departments`);
  return result.insertedCount;
}

/**
 * Seed articles collection (100 articles)
 */
async function seedArticles(db) {
  console.log('\n📰 Seeding articles...');
  
  const articles = [];
  const categories = [
    { name: 'latest', count: 35 },
    { name: 'hot', count: 35 },
    { name: 'featured', count: 30 }
  ];
  
  for (const { name: category, count } of categories) {
    const titles = ARTICLE_TITLES[category];
    
    for (let i = 0; i < count; i++) {
      const title = titles[i % titles.length] + (i >= titles.length ? ` (Part ${Math.floor(i / titles.length) + 1})` : '');
      const author = randomElement(AUTHORS);
      const content = generateArticleContent(title, category);
      const fullContent = generateFullContent(title, category);
      
      // 80% recent (last 30 days), 20% older (30-90 days ago)
      const daysAgo = Math.random() < 0.8 ? randomInt(1, 30) : randomInt(30, 90);
      
      articles.push({
        title,
        author,
        content,
        fullContent,
        category,
        comments: randomInt(5, 200),
        likes: randomInt(10, 500),
        views: randomInt(100, 5000),
        timestamp: randomDate(daysAgo),
        tags: generateTags(category)
      });
    }
  }
  
  const result = await db.collection('articles').insertMany(articles);
  console.log(`   ✅ Inserted ${result.insertedCount} articles`);
  console.log(`      - Latest: 35 | Hot: 35 | Featured: 30`);
  
  return result.insertedCount;
}

/**
 * Seed fanworks collection (50 fan works)
 */
async function seedFanWorks(db) {
  console.log('\n🎨 Seeding fan works...');
  
  const fanworks = [];
  const categories = [
    { name: 'artwork', count: 35 },
    { name: 'fiction', count: 10 },
    { name: 'cosplay', count: 5 }
  ];
  
  for (const { name: category, count } of categories) {
    const titles = FANWORK_TITLES[category];
    
    for (let i = 0; i < count; i++) {
      const title = titles[i % titles.length];
      const artist = randomElement(AUTHORS);
      const description = generateFanworkDescription(title, category);
      const daysAgo = Math.random() < 0.8 ? randomInt(1, 30) : randomInt(30, 90);
      
      fanworks.push({
        title,
        artist,
        imageUrl: `/images/fanworks/${category}/${i + 1}.jpg`,
        description,
        likes: randomInt(10, 300),
        comments: randomInt(2, 50),
        rating: randomInt(3, 5) + Math.random(), // 3.0 to 5.0
        uploadDate: randomDate(daysAgo),
        category,
        featured: Math.random() < 0.2 // 20% chance to be featured
      });
    }
  }
  
  const result = await db.collection('fanworks').insertMany(fanworks);
  console.log(`   ✅ Inserted ${result.insertedCount} fan works`);
  console.log(`      - Artwork: 35 | Fiction: 10 | Cosplay: 5`);
  
  return result.insertedCount;
}

/**
 * Seed questionnaire submissions (30 submissions)
 */
async function seedQuestionnaireSubmissions(db) {
  console.log('\n📝 Seeding questionnaire submissions...');
  
  const submissions = [];
  
  for (let i = 1; i <= 30; i++) {
    const email = `student${i}@cassell.edu`;
    const daysAgo = randomInt(1, 60);
    
    submissions.push({
      email,
      answers: {
        q1: randomElement(['A', 'B', 'C', 'D']),
        q2: randomElement(['A', 'B', 'C', 'D']),
        q3: randomElement(['A', 'B', 'C', 'D']),
        q4: 'I discovered my dragon blood abilities during a critical moment...',
        q5: randomElement(['A', 'B', 'C', 'D']),
        q6: randomElement(['A', 'B', 'C', 'D']),
        q7: 'My greatest strength is determination and courage...',
        q8: randomElement(['A', 'B', 'C', 'D']),
        q9: randomElement(['A', 'B', 'C', 'D']),
        q10: 'I hope to become a legendary dragon slayer and protect humanity...'
      },
      submittedAt: randomDate(daysAgo),
      ipAddress: `192.168.${randomInt(1, 255)}.${randomInt(1, 255)}`
    });
  }
  
  const result = await db.collection('questionnaire_submissions').insertMany(submissions);
  console.log(`   ✅ Inserted ${result.insertedCount} questionnaire submissions`);
  
  return result.insertedCount;
}

/**
 * Seed forum posts collection (25 discussion posts)
 */
async function seedForumPosts(db) {
  console.log('\n💬 Seeding forum posts...');
  
  const posts = [
    {
      title: 'Welcome to Cassell College!',
      content: 'Welcome, new agents! Cassell College is ready to guide you through your journey of discovery. Remember, every ordinary heart contains the courage of dragons. Feel free to introduce yourself and share your aspirations!',
      author: 'Principal Anjou',
      authorId: null,
      department: 'Student Council',
      replies: 45,
      views: 892,
      createdAt: randomDate(1),
      lastReplyAt: randomDate(0.5)
    },
    {
      title: 'Dragon Sighting Reports - Multiple Regions',
      content: 'We\'ve received multiple confirmed dragon sightings across different regions. All agents are advised to report any unusual activity and maintain operational security. Stay vigilant and prepared.',
      author: 'Field Agent Chen',
      authorId: null,
      department: 'Execution Department',
      replies: 67,
      views: 1243,
      createdAt: randomDate(2),
      lastReplyAt: randomDate(1)
    },
    {
      title: 'Lionheart Society Training Schedule',
      content: 'Advanced combat training sessions will begin next week. All Lionheart members are required to attend. New techniques for dragon blood enhancement will be demonstrated.',
      author: 'Caesar Gattuso',
      authorId: null,
      department: 'Lionheart Society',
      replies: 23,
      views: 567,
      createdAt: randomDate(3),
      lastReplyAt: randomDate(2)
    },
    {
      title: 'Equipment Division: New Technology Updates',
      content: 'Latest technological advancements in dragon detection equipment are now available. All field agents will receive updated gear in the coming weeks. Training sessions mandatory.',
      author: 'Tech Specialist Wong',
      authorId: null,
      department: 'Equipment Division',
      replies: 34,
      views: 723,
      createdAt: randomDate(3),
      lastReplyAt: randomDate(1.5)
    },
    {
      title: 'News Club: Campus Events This Week',
      content: 'Don\'t miss the upcoming campus events! Dragon blood research symposium, combat demonstrations, and the annual harvest festival. Check the schedule for details.',
      author: 'News Reporter Li',
      authorId: null,
      department: 'News Club',
      replies: 12,
      views: 445,
      createdAt: randomDate(4),
      lastReplyAt: randomDate(3)
    },
    {
      title: 'Blood Awakening Experiences - Share Your Story',
      content: 'For those who have experienced blood awakening, please share your story! What triggered it? How did you handle it? Your experiences can help newcomers.',
      author: 'DragonMaster',
      authorId: null,
      department: 'Student Council',
      replies: 89,
      views: 1567,
      createdAt: randomDate(5),
      lastReplyAt: randomDate(0.2)
    },
    {
      title: 'Debate: Best Dragon-Slaying Strategy',
      content: 'What\'s the most effective strategy for taking down a dragon? Brute force? Strategic planning? Team coordination? Let\'s discuss!',
      author: 'Johann Chu',
      authorId: null,
      department: 'Lionheart Society',
      replies: 134,
      views: 2341,
      createdAt: randomDate(6),
      lastReplyAt: randomDate(0.1)
    },
    {
      title: 'Campus Mystery: The Restricted Library Section',
      content: 'Has anyone managed to access the restricted section of the library? There are rumors of ancient dragon texts. Discuss!',
      author: 'CuriousScholar',
      authorId: null,
      department: 'Student Council',
      replies: 78,
      views: 1890,
      createdAt: randomDate(7),
      lastReplyAt: randomDate(2)
    },
    {
      title: 'Equipment Maintenance Tips for Dragon Hunters',
      content: 'Proper equipment care is crucial for survival. Here are essential maintenance tips for your dragon-slaying gear. Share your own tips too!',
      author: 'Equipment Master Zhang',
      authorId: null,
      department: 'Equipment Division',
      replies: 45,
      views: 892,
      createdAt: randomDate(8),
      lastReplyAt: randomDate(5)
    },
    {
      title: 'Execution Department Mission Debrief',
      content: 'Last week\'s mission was a success. Casualties were minimal and the target was neutralized. All participating agents receive commendations.',
      author: 'Mission Commander Anderson',
      authorId: null,
      department: 'Execution Department',
      replies: 56,
      views: 1123,
      createdAt: randomDate(9),
      lastReplyAt: randomDate(6)
    },
    {
      title: 'Word Spirit Abilities Discussion',
      content: 'What Word Spirit abilities do you possess? Share your experiences and techniques. Let\'s learn from each other!',
      author: 'SpiritMaster',
      authorId: null,
      department: 'Student Council',
      replies: 112,
      views: 2034,
      createdAt: randomDate(10),
      lastReplyAt: randomDate(1)
    },
    {
      title: 'Student Council Elections - Vote Now!',
      content: 'It\'s time for the annual Student Council elections. Review the candidates and cast your vote. Democracy in action at Cassell!',
      author: 'Election Committee',
      authorId: null,
      department: 'Student Council',
      replies: 67,
      views: 1456,
      createdAt: randomDate(11),
      lastReplyAt: randomDate(8)
    },
    {
      title: 'News Club Seeking Contributors',
      content: 'We\'re looking for talented writers and reporters! If you have a passion for journalism and Cassell College news, join the News Club team.',
      author: 'Editor in Chief',
      authorId: null,
      department: 'News Club',
      replies: 34,
      views: 678,
      createdAt: randomDate(12),
      lastReplyAt: randomDate(10)
    },
    {
      title: 'Dragon Biology Research Findings',
      content: 'Latest research reveals fascinating insights into dragon genetics and evolution. The connection to human DNA is more complex than we thought.',
      author: 'Professor Smith',
      authorId: null,
      department: 'Student Council',
      replies: 91,
      views: 1789,
      createdAt: randomDate(13),
      lastReplyAt: randomDate(11)
    },
    {
      title: 'Combat Training: Beginner Tips',
      content: 'New to combat training? Here are essential tips for beginners. Start with basics, build endurance, and always respect your training partners.',
      author: 'Training Instructor',
      authorId: null,
      department: 'Lionheart Society',
      replies: 56,
      views: 1234,
      createdAt: randomDate(14),
      lastReplyAt: randomDate(12)
    },
    {
      title: 'Equipment Division Lab Tour Photos',
      content: 'Check out these amazing photos from our recent lab tour! See where the magic happens - cutting-edge dragon-hunting technology in development.',
      author: 'Lab Assistant',
      authorId: null,
      department: 'Equipment Division',
      replies: 23,
      views: 567,
      createdAt: randomDate(15),
      lastReplyAt: randomDate(13)
    },
    {
      title: 'Lionheart vs Student Council: Friendly Rivalry',
      content: 'The friendly rivalry between Lionheart Society and Student Council continues! Who will win the upcoming inter-department competition?',
      author: 'Sports Coordinator',
      authorId: null,
      department: 'Student Council',
      replies: 145,
      views: 2567,
      createdAt: randomDate(16),
      lastReplyAt: randomDate(14)
    },
    {
      title: 'Dragon King Legends and Mythology',
      content: 'Let\'s discuss the four Dragon Kings - their history, powers, and the prophecies surrounding them. Ancient lore meets modern research.',
      author: 'Mythologist',
      authorId: null,
      department: 'Student Council',
      replies: 89,
      views: 1678,
      createdAt: randomDate(17),
      lastReplyAt: randomDate(15)
    },
    {
      title: 'News Club: Interview with Alumnus',
      content: 'Exclusive interview with a legendary Cassell alumnus! Read about their experiences, missions, and advice for current students.',
      author: 'Finger Von Frings',
      authorId: null,
      department: 'News Club',
      replies: 67,
      views: 1345,
      createdAt: randomDate(18),
      lastReplyAt: randomDate(16)
    },
    {
      title: 'Execution Department Recruitment',
      content: 'The Execution Department is seeking skilled agents for high-risk missions. Requirements: B-rank or higher, combat certification, psychological evaluation.',
      author: 'Recruitment Officer',
      authorId: null,
      department: 'Execution Department',
      replies: 78,
      views: 1789,
      createdAt: randomDate(19),
      lastReplyAt: randomDate(17)
    },
    {
      title: 'Campus Life: Best Hangout Spots',
      content: 'Where do you like to hang out on campus? Share your favorite spots - cafeteria, library, training grounds, or secret hideouts!',
      author: 'Luminous Lu',
      authorId: null,
      department: 'Student Council',
      replies: 56,
      views: 1123,
      createdAt: randomDate(20),
      lastReplyAt: randomDate(18)
    },
    {
      title: 'Blood Ratio Testing - New Protocols',
      content: 'Updated protocols for blood ratio testing are now in effect. All students must undergo annual testing. Schedule your appointment early!',
      author: 'Medical Department',
      authorId: null,
      department: 'Student Council',
      replies: 43,
      views: 934,
      createdAt: randomDate(21),
      lastReplyAt: randomDate(19)
    },
    {
      title: 'Equipment Division Budget Discussion',
      content: 'The Equipment Division budget allocation for next year is under review. We need better funding for R&D. What do you think?',
      author: 'Budget Committee',
      authorId: null,
      department: 'Equipment Division',
      replies: 67,
      views: 1234,
      createdAt: randomDate(22),
      lastReplyAt: randomDate(20)
    },
    {
      title: 'Freshman Orientation Guide',
      content: 'Comprehensive guide for new students! Everything you need to know about Cassell College - departments, courses, campus life, and survival tips.',
      author: 'Student Mentor',
      authorId: null,
      department: 'Student Council',
      replies: 98,
      views: 2134,
      createdAt: randomDate(23),
      lastReplyAt: randomDate(21)
    },
    {
      title: 'Dragon Hunting Safety Protocols',
      content: 'CRITICAL: Review the updated safety protocols for dragon hunting missions. Your life depends on following these guidelines. No exceptions.',
      author: 'Safety Officer',
      authorId: null,
      department: 'Execution Department',
      replies: 34,
      views: 1567,
      createdAt: randomDate(24),
      lastReplyAt: randomDate(22)
    }
  ];
  
  const result = await db.collection('forum_posts').insertMany(posts);
  console.log(`   ✅ Inserted ${result.insertedCount} forum posts`);
  
  return result.insertedCount;
}

/**
 * Seed users collection (10 sample users with various blood ranks)
 */
async function seedUsers(db) {
  console.log('\n👥 Seeding users...');
  
  const users = [
    {
      name: 'Caesar Gattuso',
      email: 'caesar@cassell.edu',
      bloodRank: 'S',
      bloodRankScore: 95,
      bloodRankBreakdown: { mcScore: 60, textScore: 35, avgWordCount: 750 },
      affiliatedDepartment: 'Student Council',
      createdAt: randomDate(60),
      lastLogin: randomDate(1)
    },
    {
      name: 'Johann Chu',
      email: 'johann@cassell.edu',
      bloodRank: 'S',
      bloodRankScore: 92,
      bloodRankBreakdown: { mcScore: 55, textScore: 37, avgWordCount: 820 },
      affiliatedDepartment: 'Lionheart Society',
      createdAt: randomDate(58),
      lastLogin: randomDate(2)
    },
    {
      name: 'Luminous Lu',
      email: 'luminous@cassell.edu',
      bloodRank: 'A',
      bloodRankScore: 85,
      bloodRankBreakdown: { mcScore: 50, textScore: 35, avgWordCount: 600 },
      affiliatedDepartment: 'Student Council',
      createdAt: randomDate(55),
      lastLogin: randomDate(1)
    },
    {
      name: 'Chen Motong',
      email: 'nono@cassell.edu',
      bloodRank: 'A',
      bloodRankScore: 82,
      bloodRankBreakdown: { mcScore: 45, textScore: 37, avgWordCount: 650 },
      affiliatedDepartment: 'News Club',
      createdAt: randomDate(50),
      lastLogin: randomDate(3)
    },
    {
      name: 'Finger Von Frings',
      email: 'finger@cassell.edu',
      bloodRank: 'B',
      bloodRankScore: 75,
      bloodRankBreakdown: { mcScore: 40, textScore: 35, avgWordCount: 500 },
      affiliatedDepartment: 'News Club',
      createdAt: randomDate(48),
      lastLogin: randomDate(5)
    },
    {
      name: 'Susie',
      email: 'susie@cassell.edu',
      bloodRank: 'B',
      bloodRankScore: 72,
      bloodRankBreakdown: { mcScore: 35, textScore: 37, avgWordCount: 520 },
      affiliatedDepartment: 'Lionheart Society',
      createdAt: randomDate(45),
      lastLogin: randomDate(7)
    },
    {
      name: 'Zero',
      email: 'zero@cassell.edu',
      bloodRank: 'C',
      bloodRankScore: 65,
      bloodRankBreakdown: { mcScore: 30, textScore: 35, avgWordCount: 300 },
      affiliatedDepartment: 'Execution Department',
      createdAt: randomDate(40),
      lastLogin: randomDate(10)
    },
    {
      name: 'Erii Uesugi',
      email: 'erii@cassell.edu',
      bloodRank: 'S',
      bloodRankScore: 98,
      bloodRankBreakdown: { mcScore: 60, textScore: 38, avgWordCount: 900 },
      affiliatedDepartment: null,
      createdAt: randomDate(30),
      lastLogin: randomDate(15)
    },
    {
      name: 'Mingfei Lu',
      email: 'mingfei@cassell.edu',
      bloodRank: 'D',
      bloodRankScore: 55,
      bloodRankBreakdown: { mcScore: 25, textScore: 30, avgWordCount: 150 },
      affiliatedDepartment: 'Lionheart Society',
      createdAt: randomDate(25),
      lastLogin: randomDate(20)
    },
    {
      name: 'Ricardo M Lu',
      email: 'ricardo@cassell.edu',
      bloodRank: 'F',
      bloodRankScore: 45,
      bloodRankBreakdown: { mcScore: 20, textScore: 25, avgWordCount: 80 },
      affiliatedDepartment: null,
      createdAt: randomDate(20),
      lastLogin: randomDate(25)
    }
  ];
  
  const result = await db.collection('users').insertMany(users);
  console.log(`   ✅ Inserted ${result.insertedCount} users`);
  console.log(`      - Sample users with blood ranks: S(3), A(2), B(2), C(1), D(1), F(1)`);
  
  return result.insertedCount;
}

/**
 * Seed contact submissions (20 submissions)
 */
async function seedContactSubmissions(db) {
  console.log('\n📬 Seeding contact submissions...');
  
  const submissions = [];
  const names = [
    'John Smith', 'Emma Johnson', 'Michael Chen', 'Sarah Williams',
    'David Brown', 'Lisa Anderson', 'James Wilson', 'Mary Taylor',
    'Robert Martinez', 'Jennifer Davis', 'William Garcia', 'Patricia Rodriguez',
    'Richard Lee', 'Linda White', 'Thomas Harris', 'Barbara Clark',
    'Charles Lewis', 'Jessica Walker', 'Daniel Hall', 'Nancy Allen'
  ];
  
  for (let i = 0; i < 20; i++) {
    const name = names[i];
    const email = name.toLowerCase().replace(' ', '.') + '@email.com';
    const topic = randomElement(CONTACT_TOPICS);
    const daysAgo = randomInt(1, 45);
    
    const messages = [
      'I have a question about joining the community. Can you provide more information?',
      'I encountered a technical issue while submitting the questionnaire. Please help.',
      'I would like to discuss a partnership opportunity with your organization.',
      'I found some content that violates community guidelines and would like to report it.',
      'Great website! I have some suggestions for improving the user experience.',
      'I am interested in contributing articles to the community. How can I get started?',
      'Can you provide more details about the different departments at Cassell College?',
      'I am experiencing login issues. Please assist me with account recovery.',
      'I would like to feature your community in our publication. Let\'s collaborate!',
      'Is there a way to edit or delete my submitted questionnaire responses?'
    ];
    
    submissions.push({
      name,
      email,
      topic,
      message: messages[i % messages.length],
      subscribeNewsletter: Math.random() < 0.6, // 60% subscribe
      submittedAt: randomDate(daysAgo),
      status: randomElement(['new', 'in-progress', 'resolved']),
      ipAddress: `192.168.${randomInt(1, 255)}.${randomInt(1, 255)}`
    });
  }
  
  const result = await db.collection('contact_submissions').insertMany(submissions);
  console.log(`   ✅ Inserted ${result.insertedCount} contact submissions`);
  
  return result.insertedCount;
}

/**
 * Main seeding function
 */
async function runSeed() {
  try {
    console.log('🌱 Starting database seeding...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Connect to database
    const db = await connectToDatabase();
    
    // Clear existing data
    await clearDatabase(db);
    
    // Seed all collections
    const departmentsCount = await seedDepartments(db);
    const articlesCount = await seedArticles(db);
    const fanworksCount = await seedFanWorks(db);
    const forumPostsCount = await seedForumPosts(db);
    const usersCount = await seedUsers(db);
    const questionnaireCount = await seedQuestionnaireSubmissions(db);
    const contactCount = await seedContactSubmissions(db);
    
    // Summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Departments:              ${departmentsCount}`);
    console.log(`   • Articles:                 ${articlesCount}`);
    console.log(`   • Fan Works:                ${fanworksCount}`);
    console.log(`   • Forum Posts:              ${forumPostsCount}`);
    console.log(`   • Users:                    ${usersCount}`);
    console.log(`   • Questionnaire Submissions: ${questionnaireCount}`);
    console.log(`   • Contact Submissions:       ${contactCount}`);
    console.log(`   ─────────────────────────────────────`);
    console.log(`   📦 Total Documents:          ${departmentsCount + articlesCount + fanworksCount + forumPostsCount + usersCount + questionnaireCount + contactCount}`);
    console.log('\n🚀 Your database is ready! Start the server with: npm run dev');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await closeDatabaseConnection();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  runSeed();
}

module.exports = { runSeed };

