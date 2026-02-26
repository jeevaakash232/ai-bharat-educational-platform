/**
 * Notes Storage Service
 * Manages notes in localStorage (can be replaced with API calls)
 */

const STORAGE_KEY = 'edulearn_notes';

/**
 * Get all notes for a student
 */
export const getStudentNotes = (studentId) => {
  try {
    const allNotes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return allNotes[studentId] || [];
  } catch (error) {
    console.error('Error reading notes:', error);
    return [];
  }
};

/**
 * Save a note
 */
export const saveNote = (studentId, note) => {
  try {
    const allNotes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    
    if (!allNotes[studentId]) {
      allNotes[studentId] = [];
    }
    
    // Check if note exists (update) or create new
    const existingIndex = allNotes[studentId].findIndex(
      n => n.id === note.id
    );
    
    if (existingIndex !== -1) {
      allNotes[studentId][existingIndex] = {
        ...note,
        updatedAt: new Date().toISOString()
      };
    } else {
      allNotes[studentId].push({
        ...note,
        id: note.id || Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allNotes));
    return true;
  } catch (error) {
    console.error('Error saving note:', error);
    return false;
  }
};

/**
 * Get a specific note
 */
export const getNote = (studentId, noteId) => {
  const notes = getStudentNotes(studentId);
  return notes.find(n => n.id === noteId);
};

/**
 * Get notes by source (book or ai-chat)
 */
export const getNotesBySource = (studentId, sourceType, sourceId) => {
  const notes = getStudentNotes(studentId);
  return notes.filter(
    n => n.sourceType === sourceType && n.sourceId === sourceId
  );
};

/**
 * Delete a note
 */
export const deleteNote = (studentId, noteId) => {
  try {
    const allNotes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    
    if (allNotes[studentId]) {
      allNotes[studentId] = allNotes[studentId].filter(n => n.id !== noteId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allNotes));
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting note:', error);
    return false;
  }
};

/**
 * Get notes by subject
 */
export const getNotesBySubject = (studentId, subject) => {
  const notes = getStudentNotes(studentId);
  return notes.filter(n => n.subject === subject);
};

/**
 * Search notes
 */
export const searchNotes = (studentId, searchTerm) => {
  const notes = getStudentNotes(studentId);
  const term = searchTerm.toLowerCase();
  
  return notes.filter(note => 
    note.title?.toLowerCase().includes(term) ||
    note.content?.toLowerCase().includes(term) ||
    note.subject?.toLowerCase().includes(term)
  );
};

export default {
  getStudentNotes,
  saveNote,
  getNote,
  getNotesBySource,
  deleteNote,
  getNotesBySubject,
  searchNotes
};
