# Live & Recorded Classes Feature - Implementation Guide

## 📋 Overview

Add live streaming and recorded video classes to EduLearn platform with features like:
- Live video classes with teacher-student interaction
- Screen sharing and whiteboard
- Chat and Q&A during live sessions
- Recording and playback of classes
- Class scheduling and notifications
- Attendance tracking

---

## 🎯 Feature Requirements

### For Teachers:
- Schedule live classes
- Start/stop live streaming
- Share screen and whiteboard
- Manage participants (mute/unmute)
- Record classes automatically
- Upload pre-recorded videos
- View attendance reports

### For Students:
- View class schedule
- Join live classes
- Participate in chat/Q&A
- Raise hand for questions
- Watch recorded classes
- Download class materials
- Take notes during class

---

## 🛠️ Technology Stack Options

### Option 1: WebRTC + Socket.io (Self-hosted)
**Pros:**
- Full control over infrastructure
- No per-minute charges
- Privacy and data control
- Customizable features

**Cons:**
- Complex implementation
- Requires powerful server
- Need to handle scaling
- More maintenance

**Tech Stack:**
- WebRTC for video/audio
- Socket.io for real-time communication
- MediaRecorder API for recording
- Node.js backend with Express
- MongoDB for storing class data

### Option 2: Third-Party Services (Recommended for MVP)

#### A. Agora.io
**Best for:** High-quality video with good Indian server support
- Free tier: 10,000 minutes/month
- Low latency
- Good documentation
- React SDK available
- Recording API included

#### B. Daily.co
**Best for:** Easy integration
- Free tier: 10 rooms, unlimited participants
- Simple API
- Built-in recording
- Screen sharing included

#### C. Zoom SDK
**Best for:** Familiar interface
- Zoom-like experience
- Reliable infrastructure
- Recording included
- Requires Zoom account

#### D. Jitsi Meet (Open Source)
**Best for:** Free and self-hosted
- Completely free
- Open source
- Can self-host or use meet.jit.si
- Good for small classes

---

## 📁 Recommended Architecture

### Frontend Components:
```
src/
├── components/
│   ├── LiveClasses/
│   │   ├── ClassSchedule.jsx          # View upcoming classes
│   │   ├── LiveClassRoom.jsx          # Main live class interface
│   │   ├── VideoPlayer.jsx            # Video display component
│   │   ├── ChatPanel.jsx              # Live chat during class
│   │   ├── ParticipantsList.jsx      # Show all participants
│   │   ├── Whiteboard.jsx             # Interactive whiteboard
│   │   ├── ScreenShare.jsx            # Screen sharing component
│   │   └── ClassControls.jsx          # Mute, camera, hand raise
│   ├── RecordedClasses/
│   │   ├── RecordedClassList.jsx     # List of recordings
│   │   ├── VideoPlayer.jsx            # Playback component
│   │   ├── ClassNotes.jsx             # Notes during playback
│   │   └── ClassMaterials.jsx         # Download materials
│   └── TeacherDashboard/
│       ├── CreateClass.jsx            # Schedule new class
│       ├── ManageClasses.jsx          # Edit/delete classes
│       ├── UploadRecording.jsx        # Upload pre-recorded
│       └── AttendanceReport.jsx       # View attendance
├── services/
│   ├── videoService.js                # Video streaming logic
│   ├── recordingService.js            # Recording management
│   ├── chatService.js                 # Real-time chat
│   └── classScheduleService.js        # Class scheduling
└── contexts/
    └── LiveClassContext.jsx           # Global state for live class
```

### Backend API Endpoints:
```
backend/
├── routes/
│   ├── classes.js                     # Class CRUD operations
│   ├── liveSession.js                 # Live session management
│   ├── recordings.js                  # Recording management
│   └── attendance.js                  # Attendance tracking
├── controllers/
│   ├── classController.js
│   ├── liveSessionController.js
│   ├── recordingController.js
│   └── attendanceController.js
├── models/
│   ├── Class.js                       # Class schema
│   ├── LiveSession.js                 # Live session data
│   ├── Recording.js                   # Recording metadata
│   └── Attendance.js                  # Attendance records
└── services/
    ├── videoStreamService.js          # Video streaming logic
    ├── recordingService.js            # Recording storage
    └── notificationService.js         # Class notifications
```

---

## 🚀 Quick Start Implementation (Using Agora.io)

### Step 1: Install Dependencies

```bash
npm install agora-rtc-react agora-rtc-sdk-ng socket.io-client
```

### Step 2: Get Agora Credentials

1. Sign up at https://www.agora.io/
2. Create a project
3. Get App ID and App Certificate
4. Add to `.env`:
```env
VITE_AGORA_APP_ID=your_app_id_here
AGORA_APP_CERTIFICATE=your_certificate_here
```

### Step 3: Database Schema

```javascript
// Class Schema
{
  id: String,
  title: String,
  description: String,
  teacherId: String,
  teacherName: String,
  subject: String,
  class: Number,
  scheduledAt: Date,
  duration: Number, // in minutes
  status: 'scheduled' | 'live' | 'completed' | 'cancelled',
  maxParticipants: Number,
  isRecorded: Boolean,
  recordingUrl: String,
  materials: [{ name: String, url: String }],
  createdAt: Date,
  updatedAt: Date
}

// Attendance Schema
{
  classId: String,
  studentId: String,
  studentName: String,
  joinedAt: Date,
  leftAt: Date,
  duration: Number, // in minutes
  participated: Boolean
}

// Recording Schema
{
  classId: String,
  title: String,
  recordingUrl: String,
  thumbnailUrl: String,
  duration: Number,
  size: Number,
  uploadedAt: Date,
  views: Number
}
```

---

## 💻 Sample Code Structure

### 1. Class Schedule Component

```jsx
// src/components/LiveClasses/ClassSchedule.jsx
import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Users, Video } from 'lucide-react'

const ClassSchedule = () => {
  const [classes, setClasses] = useState([])
  const [filter, setFilter] = useState('upcoming') // upcoming, live, past

  useEffect(() => {
    loadClasses()
  }, [filter])

  const loadClasses = async () => {
    // Fetch from API
    const response = await fetch(`/api/classes?status=${filter}`)
    const data = await response.json()
    setClasses(data)
  }

  const joinClass = (classId) => {
    // Navigate to live classroom
    window.location.href = `/live-class/${classId}`
  }

  return (
    <div className="class-schedule">
      <h2>Class Schedule</h2>
      
      {/* Filter tabs */}
      <div className="filters">
        <button onClick={() => setFilter('upcoming')}>Upcoming</button>
        <button onClick={() => setFilter('live')}>Live Now</button>
        <button onClick={() => setFilter('past')}>Past Classes</button>
      </div>

      {/* Class list */}
      <div className="class-list">
        {classes.map(cls => (
          <div key={cls.id} className="class-card">
            <h3>{cls.title}</h3>
            <p>{cls.description}</p>
            <div className="class-info">
              <span><Clock /> {cls.scheduledAt}</span>
              <span><Users /> {cls.maxParticipants} students</span>
            </div>
            {cls.status === 'live' && (
              <button onClick={() => joinClass(cls.id)}>
                <Video /> Join Now
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ClassSchedule
```

### 2. Live Classroom Component (Agora)

```jsx
// src/components/LiveClasses/LiveClassRoom.jsx
import React, { useState, useEffect } from 'react'
import AgoraRTC from 'agora-rtc-sdk-ng'
import { useParams } from 'react-router-dom'
import { Mic, MicOff, Video, VideoOff, PhoneOff, Hand } from 'lucide-react'

const LiveClassRoom = () => {
  const { classId } = useParams()
  const [client, setClient] = useState(null)
  const [localTracks, setLocalTracks] = useState({ audio: null, video: null })
  const [remoteUsers, setRemoteUsers] = useState([])
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)

  useEffect(() => {
    initAgora()
    return () => {
      leaveClass()
    }
  }, [])

  const initAgora = async () => {
    const agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
    setClient(agoraClient)

    // Get token from backend
    const response = await fetch(`/api/live-session/token/${classId}`)
    const { token, channel } = await response.json()

    // Join channel
    await agoraClient.join(
      import.meta.env.VITE_AGORA_APP_ID,
      channel,
      token,
      null
    )

    // Create local tracks
    const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks()
    setLocalTracks({ audio: audioTrack, video: videoTrack })

    // Publish tracks
    await agoraClient.publish([audioTrack, videoTrack])

    // Play local video
    videoTrack.play('local-player')

    // Handle remote users
    agoraClient.on('user-published', async (user, mediaType) => {
      await agoraClient.subscribe(user, mediaType)
      
      if (mediaType === 'video') {
        user.videoTrack.play(`remote-${user.uid}`)
      }
      if (mediaType === 'audio') {
        user.audioTrack.play()
      }

      setRemoteUsers(prev => [...prev, user])
    })

    agoraClient.on('user-unpublished', (user) => {
      setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid))
    })
  }

  const toggleMute = () => {
    if (localTracks.audio) {
      localTracks.audio.setEnabled(isMuted)
      setIsMuted(!isMuted)
    }
  }

  const toggleVideo = () => {
    if (localTracks.video) {
      localTracks.video.setEnabled(isVideoOff)
      setIsVideoOff(!isVideoOff)
    }
  }

  const leaveClass = async () => {
    if (localTracks.audio) localTracks.audio.close()
    if (localTracks.video) localTracks.video.close()
    if (client) await client.leave()
  }

  return (
    <div className="live-classroom">
      {/* Video grid */}
      <div className="video-grid">
        {/* Local video */}
        <div className="video-container">
          <div id="local-player" className="video-player"></div>
          <span>You</span>
        </div>

        {/* Remote videos */}
        {remoteUsers.map(user => (
          <div key={user.uid} className="video-container">
            <div id={`remote-${user.uid}`} className="video-player"></div>
            <span>Student {user.uid}</span>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="controls">
        <button onClick={toggleMute}>
          {isMuted ? <MicOff /> : <Mic />}
        </button>
        <button onClick={toggleVideo}>
          {isVideoOff ? <VideoOff /> : <Video />}
        </button>
        <button onClick={leaveClass} className="leave-btn">
          <PhoneOff /> Leave
        </button>
      </div>
    </div>
  )
}

export default LiveClassRoom
```

### 3. Recorded Classes Component

```jsx
// src/components/RecordedClasses/RecordedClassList.jsx
import React, { useState, useEffect } from 'react'
import { Play, Download, Clock } from 'lucide-react'

const RecordedClassList = () => {
  const [recordings, setRecordings] = useState([])

  useEffect(() => {
    loadRecordings()
  }, [])

  const loadRecordings = async () => {
    const response = await fetch('/api/recordings')
    const data = await response.json()
    setRecordings(data)
  }

  const playRecording = (recordingId) => {
    window.location.href = `/recorded-class/${recordingId}`
  }

  return (
    <div className="recorded-classes">
      <h2>Recorded Classes</h2>
      
      <div className="recordings-grid">
        {recordings.map(rec => (
          <div key={rec.id} className="recording-card">
            <img src={rec.thumbnailUrl} alt={rec.title} />
            <h3>{rec.title}</h3>
            <div className="recording-info">
              <span><Clock /> {rec.duration} min</span>
              <span>{rec.views} views</span>
            </div>
            <div className="actions">
              <button onClick={() => playRecording(rec.id)}>
                <Play /> Watch
              </button>
              <button>
                <Download /> Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecordedClassList
```

---

## 🎨 UI/UX Considerations

### Live Class Interface:
- Large video area for teacher
- Grid of student thumbnails
- Chat panel on the side
- Controls at the bottom
- Whiteboard overlay option
- Screen share mode

### Class Schedule:
- Calendar view
- List view with filters
- Live indicator for ongoing classes
- Countdown timer for upcoming classes
- Quick join button

### Recorded Classes:
- Grid layout with thumbnails
- Search and filter options
- Progress tracking
- Playback speed control
- Notes integration

---

## 📊 Database Requirements

### Tables/Collections Needed:
1. **classes** - Class information
2. **live_sessions** - Active session data
3. **recordings** - Recording metadata
4. **attendance** - Student attendance
5. **class_materials** - PDFs, slides, etc.
6. **chat_messages** - Chat history

---

## 🔐 Security Considerations

1. **Token-based authentication** for video sessions
2. **Role-based access** (teacher vs student permissions)
3. **Encrypted video streams**
4. **Recording consent** from participants
5. **Data privacy** compliance (GDPR, etc.)
6. **Rate limiting** to prevent abuse

---

## 💰 Cost Estimation (Agora.io)

### Free Tier:
- 10,000 minutes/month free
- ~166 hours of video
- Good for testing and small scale

### Paid Plans:
- $0.99 per 1000 minutes for HD video
- $0.49 per 1000 minutes for audio only
- Recording: $1.49 per 1000 minutes

### Example:
- 100 students
- 1 hour class daily
- 30 days/month
= 3,000 minutes/month = ~$3/month

---

## 🚀 Implementation Phases

### Phase 1: MVP (2-3 weeks)
- [ ] Basic live video (teacher + students)
- [ ] Simple chat
- [ ] Join/leave functionality
- [ ] Class scheduling
- [ ] Basic recording

### Phase 2: Enhanced Features (2-3 weeks)
- [ ] Screen sharing
- [ ] Whiteboard
- [ ] Hand raise
- [ ] Attendance tracking
- [ ] Recording playback

### Phase 3: Advanced Features (3-4 weeks)
- [ ] Breakout rooms
- [ ] Polls and quizzes
- [ ] Advanced analytics
- [ ] Mobile app support
- [ ] AI-powered features

---

## 📱 Mobile Support

- Use Agora React Native SDK
- Capacitor plugins for native features
- Responsive web design for mobile browsers
- Push notifications for class reminders

---

## 🎯 Next Steps

1. **Choose technology stack** (Recommended: Agora.io for MVP)
2. **Set up Agora account** and get credentials
3. **Create database schema**
4. **Build basic components** (schedule, classroom, recordings)
5. **Implement backend APIs**
6. **Test with small group**
7. **Add advanced features**
8. **Deploy and scale**

---

## 📚 Resources

- Agora.io Docs: https://docs.agora.io/
- WebRTC Guide: https://webrtc.org/getting-started/overview
- Socket.io Docs: https://socket.io/docs/
- React Video Player: https://www.npmjs.com/package/react-player

---

**Would you like me to start implementing the basic structure for live classes?**
