import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import LandingPage from './components/LandingPage'
import Login from './components/Login'
import Register from './components/Register'
import StateSelection from './components/StateSelection'
import MediumSelection from './components/MediumSelection'
import ProfileSetup from './components/ProfileSetup'
import Dashboard from './components/Dashboard'
import AIAssistant from './components/AIAssistant'
import SubjectPage from './components/SubjectPage'
import Quiz from './components/Quiz'
import GuideBooks from './components/GuideBooks'
import ClassSchedule from './components/LiveClasses/ClassSchedule'
import UploadRecording from './components/LiveClasses/UploadRecording'
import VideoPlayer from './components/LiveClasses/VideoPlayer'
import UploadBooks from './components/UploadBooks'
import ManageBooks from './components/ManageBooks'
import AdminPanel from './components/AdminPanel'
import MathCalculator from './components/MathCalculator'
import VisualizationHub from './components/VisualizationHub'
import SimplePDFViewer from './components/SimplePDFViewer'
import Settings from './components/Settings'
import VoiceEnabledChatbot from './components/VoiceEnabledChatbot'
import VoiceChatDemo from './pages/VoiceChatDemo'
import VersionChecker from './components/VersionChecker'

function App() {
  return (
    <AuthProvider>
      <Router>
        <VersionChecker />
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/state-selection" element={<StateSelection />} />
            <Route path="/medium-selection" element={<MediumSelection />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/subject/:subjectName" element={<SubjectPage />} />
            <Route path="/quiz/:subjectName" element={<Quiz />} />
            <Route path="/guide-books" element={<GuideBooks />} />
            <Route path="/live-classes" element={<ClassSchedule />} />
            <Route path="/upload-recording" element={<UploadRecording />} />
            <Route path="/watch-recording/:recordingId" element={<VideoPlayer />} />
            <Route path="/book-viewer/:bookId" element={<SimplePDFViewer />} />
            <Route path="/upload-books" element={<UploadBooks />} />
            <Route path="/manage-books" element={<ManageBooks />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/math-calculator" element={<MathCalculator />} />
            <Route path="/visualizations" element={<VisualizationHub />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/voice-chat" element={<VoiceChatDemo />} />
            <Route path="/voice-assistant" element={<VoiceEnabledChatbot />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App