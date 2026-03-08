/**
 * Discipline Streak Tracker Service
 * Manages streaks, shields, and achievements
 */

const STORAGE_KEY = 'discipline_streaks';
const SHIELDS_PER_MONTH = 3;

export const getStreakData = async (userId) => {
  try {
    const allData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    
    if (!allData[userId]) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        shieldsRemaining: SHIELDS_PER_MONTH,
        shieldsResetDate: getNextMonthFirstDay(),
        totalShieldsUsed: 0,
        streakHistory: []
      };
    }
    
    // Check if shields need to be reset
    const data = allData[userId];
    const today = new Date();
    const resetDate = new Date(data.shieldsResetDate);
    
    if (today >= resetDate) {
      data.shieldsRemaining = SHIELDS_PER_MONTH;
      data.shieldsResetDate = getNextMonthFirstDay();
      allData[userId] = data;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
    }
    
    return data;
  } catch (error) {
    console.error('Error getting streak data:', error);
    return null;
  }
};

export const updateStreak = async (userId) => {
  try {
    const data = await getStreakData(userId);
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already updated today
    if (data.lastActivityDate === today) {
      return { success: true, message: 'Already updated today', data };
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // Check if streak continues
    if (data.lastActivityDate === yesterdayStr) {
      // Continue streak
      data.currentStreak += 1;
    } else if (data.lastActivityDate === null || data.lastActivityDate < yesterdayStr) {
      // Streak broken, start new
      data.currentStreak = 1;
    }
    
    // Update longest streak
    if (data.currentStreak > data.longestStreak) {
      data.longestStreak = data.currentStreak;
    }
    
    data.lastActivityDate = today;
    
    // Add to history
    if (!data.streakHistory) {
      data.streakHistory = [];
    }
    data.streakHistory.push({
      date: today,
      streak: data.currentStreak,
      shieldUsed: false
    });
    
    // Save
    const allData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    allData[userId] = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
    
    return { success: true, message: 'Streak updated', data };
  } catch (error) {
    console.error('Error updating streak:', error);
    return { success: false, message: 'Failed to update streak' };
  }
};

export const useShield = async (userId) => {
  try {
    const data = await getStreakData(userId);
    
    if (data.shieldsRemaining <= 0) {
      return { success: false, message: 'No shields remaining' };
    }
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // Check if streak is at risk
    if (data.lastActivityDate !== yesterdayStr && data.lastActivityDate !== today) {
      return { success: false, message: 'Streak not at risk' };
    }
    
    // Use shield
    data.shieldsRemaining -= 1;
    data.totalShieldsUsed += 1;
    data.lastActivityDate = today;
    
    // Add to history
    if (!data.streakHistory) {
      data.streakHistory = [];
    }
    data.streakHistory.push({
      date: today,
      streak: data.currentStreak,
      shieldUsed: true
    });
    
    // Save
    const allData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    allData[userId] = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
    
    return { success: true, message: 'Shield used successfully', data };
  } catch (error) {
    console.error('Error using shield:', error);
    return { success: false, message: 'Failed to use shield' };
  }
};

export const checkStreakStatus = async (userId) => {
  try {
    const data = await getStreakData(userId);
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (data.lastActivityDate === today) {
      return { status: 'safe', message: 'Streak is safe for today' };
    } else if (data.lastActivityDate === yesterdayStr) {
      return { status: 'at_risk', message: 'Update your streak today!' };
    } else {
      return { status: 'broken', message: 'Streak was broken' };
    }
  } catch (error) {
    console.error('Error checking streak status:', error);
    return { status: 'error', message: 'Failed to check status' };
  }
};

export const getStreakCalendar = async (userId, days = 7) => {
  try {
    const data = await getStreakData(userId);
    const calendar = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const historyEntry = data.streakHistory?.find(h => h.date === dateStr);
      
      calendar.push({
        date: dateStr,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        hasActivity: historyEntry ? true : false,
        shieldUsed: historyEntry?.shieldUsed || false,
        streak: historyEntry?.streak || 0
      });
    }
    
    return calendar;
  } catch (error) {
    console.error('Error getting streak calendar:', error);
    return [];
  }
};

function getNextMonthFirstDay() {
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  return nextMonth.toISOString().split('T')[0];
}
