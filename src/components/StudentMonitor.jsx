import { useState } from 'react'
import { Search, User, BookOpen, TrendingUp, Award, Clock, AlertTriangle, CheckCircle, X } from 'lucide-react'
import { getRegisteredUsers } from '../utils/authStorage'

const StudentMonitor = ({ onClose }) => {
  const [query, setQuery] = useState('')
  const [student, setStudent] = useState(null)
  const [error, setError] = useState('')

  const handleSearch = () => {
    setError(''); setStudent(null)
    if (!query.trim()) { setError('Enter a student ID or email'); return }

    const users = getRegisteredUsers()
    // Search by email or numeric ID
    const found = users.find(u =>
      u.userType === 'student' && (
        u.email?.toLowerCase() === query.toLowerCase() ||
        String(u.id) === query.trim()
      )
    )

    if (!found) { setError('No student found with that ID or email'); return }
    setStudent(found)
  }

  const InfoRow = ({ label, value }) => value ? (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f4f5f7' }}>
      <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 13, color: '#1a1a2e', fontWeight: 700 }}>{value}</span>
    </div>
  ) : null

  return (
    <div className="edu-modal-overlay">
      <div className="edu-modal" style={{ maxWidth: 520, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>Monitor Student</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
          Enter the student's unique ID (number) or registered email address.
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Student ID or email..."
            className="edu-input"
            style={{ flex: 1 }}
          />
          <button onClick={handleSearch} className="edu-btn-submit" style={{ width: 'auto', padding: '0 20px' }}>
            <Search size={16} />
          </button>
        </div>

        {error && (
          <div style={{ background: '#fff1f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#991b1b' }}>
            <AlertTriangle size={15} /> {error}
          </div>
        )}

        {student && (
          <div>
            {/* Student header */}
            <div style={{ background: 'var(--edu-gradient)', borderRadius: 14, padding: '20px 24px', color: 'white', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800 }}>
                  {student.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{student.name || 'Unknown'}</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>{student.email}</div>
                  <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>ID: {student.id}</div>
                </div>
              </div>
            </div>

            {/* Academic info */}
            <div className="edu-card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <BookOpen size={16} color="#4f46e5" />
                <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>Academic Profile</span>
              </div>
              <InfoRow label="State" value={student.selectedState} />
              <InfoRow label="Board" value={student.board} />
              <InfoRow label="Class" value={student.class ? `Class ${student.class}` : null} />
              <InfoRow label="Medium" value={student.mediumName} />
              <InfoRow label="Stream" value={student.department} />
              <InfoRow label="Profile Complete" value={student.profileComplete ? '✅ Yes' : '⏳ Incomplete'} />
            </div>

            {/* Subjects */}
            {student.subjects?.length > 0 && (
              <div className="edu-card" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Award size={16} color="#059669" />
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>Subjects ({student.subjects.length})</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {student.subjects.map(s => (
                    <span key={s} style={{ padding: '4px 12px', borderRadius: 20, background: '#eef2ff', color: '#4f46e5', fontSize: 12, fontWeight: 600 }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Account info */}
            <div className="edu-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Clock size={16} color="#6b7280" />
                <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>Account Info</span>
              </div>
              <InfoRow label="Registered" value={student.registeredAt ? new Date(student.registeredAt).toLocaleDateString() : null} />
              <InfoRow label="Provider" value={student.provider === 'google' ? '🔵 Google' : '📧 Email'} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentMonitor
