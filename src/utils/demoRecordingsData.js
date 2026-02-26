/**
 * Demo recorded classes data for testing the video system
 */

export const demoRecordings = [
  {
    id: '1',
    title: 'Introduction to Algebra - Basic Equations',
    description: 'Learn the fundamentals of algebraic equations, including solving for x, balancing equations, and understanding variables. This comprehensive lesson covers linear equations and their real-world applications.',
    subject: 'Mathematics',
    class: 9,
    tags: ['algebra', 'equations', 'variables', 'linear equations'],
    teacherId: 'teacher1',
    teacherName: 'Dr. Priya Sharma',
    videoUrl: 'https://edulearn-videos.s3.ap-south-1.amazonaws.com/demo/videos/algebra_basics.mp4',
    thumbnail: 'https://edulearn-videos.s3.ap-south-1.amazonaws.com/demo/thumbnails/algebra_thumb.jpg',
    duration: 1800, // 30 minutes
    uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    views: 245,
    fileSize: 125 * 1024 * 1024, // 125MB
    format: 'video/mp4',
    s3Key: 'videos/algebra_basics.mp4'
  },
  {
    id: '2',
    title: 'Photosynthesis Process Explained',
    description: 'Detailed explanation of photosynthesis in plants, including light and dark reactions, chlorophyll function, and the importance of this process in the ecosystem.',
    subject: 'Science',
    class: 10,
    tags: ['photosynthesis', 'biology', 'plants', 'chlorophyll'],
    teacherId: 'teacher2',
    teacherName: 'Prof. Rajesh Kumar',
    videoUrl: 'https://edulearn-videos.s3.ap-south-1.amazonaws.com/demo/videos/photosynthesis.mp4',
    thumbnail: 'https://edulearn-videos.s3.ap-south-1.amazonaws.com/demo/thumbnails/photosynthesis_thumb.jpg',
    duration: 2100, // 35 minutes
    uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    views: 189,
    fileSize: 156 * 1024 * 1024, // 156MB
    format: 'video/mp4',
    s3Key: 'videos/photosynthesis.mp4'
  },
  {
    id: '3',
    title: 'English Grammar - Tenses Made Easy',
    description: 'Master English tenses with practical examples and exercises. Covers present, past, and future tenses with their perfect and continuous forms.',
    subject: 'English',
    class: 8,
    tags: ['grammar', 'tenses', 'english', 'language'],
    teacherId: 'teacher3',
    teacherName: 'Ms. Anita Verma',
    videoUrl: 'https://edulearn-videos.s3.ap-south-1.amazonaws.com/demo/videos/english_tenses.mp4',
    thumbnail: 'https://edulearn-videos.s3.ap-south-1.amazonaws.com/demo/thumbnails/english_thumb.jpg',
    duration: 1500, // 25 minutes
    uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    views: 312,
    fileSize: 98 * 1024 * 1024, // 98MB
    format: 'video/mp4',
    s3Key: 'videos/english_tenses.mp4'
  },
  {
    id: '4',
    title: 'Newton\'s Laws of Motion',
    description: 'Comprehensive study of Newton\'s three laws of motion with real-world examples, experiments, and problem-solving techniques.',
    subject: 'Physics',
    class: 11,
    tags: ['physics', 'newton', 'motion', 'laws', 'mechanics'],
    teacherId: 'teacher4',
    teacherName: 'Dr. Suresh Patel',
    videoUrl: 'https://edulearn-videos.s3.ap-south-1.amazonaws.com/demo/videos/newton_laws.mp4',
    thumbnail: 'https://edulearn-videos.s3.ap-south-1.amazonaws.com/demo/thumbnails/physics_thumb.jpg',
    duration: 2400, // 40 minutes
    uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
    views: 156,
    fileSize: 187 * 1024 * 1024, // 187MB
    format: 'video/mp4',
    s3Key: 'videos/newton_laws.mp4'
  },
  {
    id: '5',
    title: 'Chemical Bonding and Molecular Structure',
    description: 'Understanding ionic, covalent, and metallic bonds. Learn about VSEPR theory, hybridization, and molecular geometry.',
    subject: 'Chemistry',
    class: 12,
    tags: ['chemistry', 'bonding', 'molecules', 'ionic', 'covalent'],
    teacherId: 'teacher5',
    teacherName: 'Dr. Meera Joshi',
    videoUrl: 'https://edulearn-videos.s3.ap-south-1.amazonaws.com/demo/videos/chemical_bonding.mp4',
    thumbnail: 'https://edulearn-videos.s3.ap-south-1.amazonaws.com/demo/thumbnails/chemistry_thumb.jpg',
    duration: 2700, // 45 minutes
    uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    views: 98,
    fileSize: 201 * 1024 * 1024, // 201MB
    format: 'video/mp4',
    s3Key: 'videos/chemical_bonding.mp4'
  },
  {
    id: '6',
    title: 'Indian History - Freedom Struggle',
    description: 'Detailed account of India\'s freedom struggle, key leaders, major movements, and the path to independence in 1947.',
    subject: 'Social Studies',
    class: 10,
    tags: ['history', 'freedom struggle', 'independence', 'gandhi'],
    teacherId: 'teacher6',
    teacherName: 'Prof. Vikram Singh',
    videoUrl: 'https://edulearn-videos.s3.ap-south-1.amazonaws.com/demo/videos/freedom_struggle.mp4',
    thumbnail: 'https://edulearn-videos.s3.ap-south-1.amazonaws.com/demo/thumbnails/history_thumb.jpg',
    duration: 3000, // 50 minutes
    uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    views: 278,
    fileSize: 234 * 1024 * 1024, // 234MB
    format: 'video/mp4',
    s3Key: 'videos/freedom_struggle.mp4'
  }
]

/**
 * Initialize demo recordings in localStorage if none exist
 */
export const initializeDemoRecordings = () => {
  const existingRecordings = localStorage.getItem('recordedClasses')
  
  if (!existingRecordings || JSON.parse(existingRecordings).length === 0) {
    localStorage.setItem('recordedClasses', JSON.stringify(demoRecordings))
    console.log('Demo recordings initialized')
    return true
  }
  
  return false
}

/**
 * Add a single demo recording (useful for testing)
 */
export const addDemoRecording = (recording) => {
  const existingRecordings = JSON.parse(localStorage.getItem('recordedClasses') || '[]')
  existingRecordings.push(recording)
  localStorage.setItem('recordedClasses', JSON.stringify(existingRecordings))
}

/**
 * Clear all recordings (for testing)
 */
export const clearAllRecordings = () => {
  localStorage.removeItem('recordedClasses')
  console.log('All recordings cleared')
}

/**
 * Get recordings by subject
 */
export const getRecordingsBySubject = (subject) => {
  const recordings = JSON.parse(localStorage.getItem('recordedClasses') || '[]')
  return recordings.filter(recording => recording.subject === subject)
}

/**
 * Get recordings by class
 */
export const getRecordingsByClass = (classNumber) => {
  const recordings = JSON.parse(localStorage.getItem('recordedClasses') || '[]')
  return recordings.filter(recording => recording.class === classNumber)
}

/**
 * Get popular recordings (by views)
 */
export const getPopularRecordings = (limit = 5) => {
  const recordings = JSON.parse(localStorage.getItem('recordedClasses') || '[]')
  return recordings
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, limit)
}

/**
 * Get recent recordings
 */
export const getRecentRecordings = (limit = 5) => {
  const recordings = JSON.parse(localStorage.getItem('recordedClasses') || '[]')
  return recordings
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
    .slice(0, limit)
}