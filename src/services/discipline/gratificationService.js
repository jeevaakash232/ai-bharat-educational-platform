/**
 * Delayed Gratification Service
 * Manages points, rewards, and unlocks
 */

import { REWARDS, POINT_ACTIVITIES } from '../../data/disciplineData';

const POINTS_STORAGE_KEY = 'gratification_points';
const REWARDS_STORAGE_KEY = 'user_rewards';

export const getPointsData = async (userId) => {
  try {
    const allData = JSON.parse(localStorage.getItem(POINTS_STORAGE_KEY) || '{}');
    
    if (!allData[userId]) {
      return {
        totalPoints: 0,
        pointsEarnedToday: 0,
        lastPointDate: null,
        consecutiveDays: 0,
        pointsHistory: []
      };
    }
    
    return allData[userId];
  } catch (error) {
    console.error('Error getting points data:', error);
    return null;
  }
};

export const awardPoints = async (userId, activity, customPoints = null) => {
  try {
    const data = await getPointsData(userId);
    const today = new Date().toISOString().split('T')[0];
    
    // Get points for activity
    const points = customPoints || POINT_ACTIVITIES[activity]?.points || 0;
    
    // Check if it's a new day
    if (data.lastPointDate !== today) {
      // Check if consecutive
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (data.lastPointDate === yesterdayStr) {
        data.consecutiveDays += 1;
      } else {
        data.consecutiveDays = 1;
      }
      
      data.pointsEarnedToday = 0;
      data.lastPointDate = today;
    }
    
    // Award points
    data.totalPoints += points;
    data.pointsEarnedToday += points;
    
    // Add to history
    if (!data.pointsHistory) {
      data.pointsHistory = [];
    }
    data.pointsHistory.push({
      date: today,
      activity,
      points,
      timestamp: Date.now()
    });
    
    // Keep only last 100 entries
    if (data.pointsHistory.length > 100) {
      data.pointsHistory = data.pointsHistory.slice(-100);
    }
    
    // Save
    const allData = JSON.parse(localStorage.getItem(POINTS_STORAGE_KEY) || '{}');
    allData[userId] = data;
    localStorage.setItem(POINTS_STORAGE_KEY, JSON.stringify(allData));
    
    // Check for reward unlocks
    await checkRewardUnlocks(userId);
    
    return { success: true, points, totalPoints: data.totalPoints };
  } catch (error) {
    console.error('Error awarding points:', error);
    return { success: false };
  }
};

export const getUserRewards = async (userId) => {
  try {
    const allData = JSON.parse(localStorage.getItem(REWARDS_STORAGE_KEY) || '{}');
    
    if (!allData[userId]) {
      // Initialize with all rewards locked
      const userRewards = REWARDS.map(reward => ({
        ...reward,
        isUnlocked: false,
        unlockedAt: null,
        progress: 0
      }));
      
      allData[userId] = userRewards;
      localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(allData));
    }
    
    return allData[userId];
  } catch (error) {
    console.error('Error getting user rewards:', error);
    return [];
  }
};

export const checkRewardUnlocks = async (userId) => {
  try {
    const pointsData = await getPointsData(userId);
    const rewards = await getUserRewards(userId);
    const streakData = await getStreakData(userId);
    
    let unlocked = [];
    
    for (let i = 0; i < rewards.length; i++) {
      const reward = rewards[i];
      
      if (reward.isUnlocked) continue;
      
      // Check if requirements are met
      const pointsMet = pointsData.totalPoints >= reward.pointsRequired;
      const daysMet = streakData.currentStreak >= reward.daysRequired;
      
      if (pointsMet && daysMet) {
        reward.isUnlocked = true;
        reward.unlockedAt = new Date().toISOString();
        unlocked.push(reward);
      } else {
        // Calculate progress
        const pointsProgress = (pointsData.totalPoints / reward.pointsRequired) * 100;
        const daysProgress = (streakData.currentStreak / reward.daysRequired) * 100;
        reward.progress = Math.min(pointsProgress, daysProgress);
      }
    }
    
    // Save updated rewards
    const allData = JSON.parse(localStorage.getItem(REWARDS_STORAGE_KEY) || '{}');
    allData[userId] = rewards;
    localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(allData));
    
    return unlocked;
  } catch (error) {
    console.error('Error checking reward unlocks:', error);
    return [];
  }
};

export const unlockReward = async (userId, rewardId) => {
  try {
    const rewards = await getUserRewards(userId);
    const reward = rewards.find(r => r.id === rewardId);
    
    if (!reward) {
      return { success: false, message: 'Reward not found' };
    }
    
    if (reward.isUnlocked) {
      return { success: false, message: 'Reward already unlocked' };
    }
    
    reward.isUnlocked = true;
    reward.unlockedAt = new Date().toISOString();
    
    // Save
    const allData = JSON.parse(localStorage.getItem(REWARDS_STORAGE_KEY) || '{}');
    allData[userId] = rewards;
    localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(allData));
    
    return { success: true, reward };
  } catch (error) {
    console.error('Error unlocking reward:', error);
    return { success: false, message: 'Failed to unlock reward' };
  }
};

export const getPointsStats = async (userId) => {
  const data = await getPointsData(userId);
  
  if (!data || !data.pointsHistory) {
    return null;
  }
  
  const last7Days = data.pointsHistory.filter(entry => {
    const entryDate = new Date(entry.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return entryDate >= weekAgo;
  });
  
  const pointsThisWeek = last7Days.reduce((sum, entry) => sum + entry.points, 0);
  
  return {
    totalPoints: data.totalPoints,
    pointsToday: data.pointsEarnedToday,
    pointsThisWeek,
    consecutiveDays: data.consecutiveDays,
    totalActivities: data.pointsHistory.length
  };
};

// Helper function to get streak data (imported from streakTrackerService)
const getStreakData = async (userId) => {
  try {
    const allData = JSON.parse(localStorage.getItem('discipline_streaks') || '{}');
    return allData[userId] || { currentStreak: 0 };
  } catch (error) {
    return { currentStreak: 0 };
  }
};
