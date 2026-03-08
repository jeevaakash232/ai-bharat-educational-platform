import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { predictStudyScore, getRiskSubjects, simulateImprovement } from '../services/studyTwinApi';
import { getStudentProfile, getStats } from '../utils/studentDataCollector';
import { TrendingUp, AlertTriangle, Target, Award, BookOpen, Clock, ArrowLeft, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import FocusTrackerWidget from '../components/FocusTrackerWidget';

const StudentDashboard = () => {
  const { user, predictions, predictionsLoading, refreshPredictions } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Get stats
    const studentStats = getStats();
    setStats(studentStats);

    // Use predictions from context if available
    if (predictions) {
      console.log('✅ Using predictions from context');
    } else if (!predictionsLoading) {
      // If no predictions and not loading, try to refresh
      console.log('⚡ No predictions available, refreshing...');
      handleRefresh();
    }
  }, [user, navigate, predictions, predictionsLoading]);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    setRetryCount(prev => prev + 1);
    
    try {
      await refreshPredictions();
    } catch (err) {
      console.error('Refresh error:', err);
      setError('general');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence?.toLowerCase()) {
      case 'high': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-blue-600 bg-blue-50';
      case 'low': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getErrorContent = () => {
    if (!hasPredictions && !error) {
      return {
        icon: <BookOpen className="h-16 w-16 text-blue-500 mx-auto mb-4" />,
        title: 'No Data Yet',
        message: 'Start your learning journey to see personalized insights! Complete some study sessions and we\'ll show you amazing predictions about your performance.',
        action: 'Go to Dashboard',
        actionFn: () => navigate('/dashboard'),
        showRetry: false,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      };
    }

    switch (error) {
      case 'no_data':
        return {
          icon: <BookOpen className="h-16 w-16 text-blue-500 mx-auto mb-4" />,
          title: 'No Data Yet',
          message: 'Start your learning journey to see personalized insights! Complete some study sessions and we\'ll show you amazing predictions about your performance.',
          action: 'Go to Dashboard',
          actionFn: () => navigate('/dashboard'),
          showRetry: false,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'connection':
        return {
          icon: <WifiOff className="h-16 w-16 text-orange-500 mx-auto mb-4" />,
          title: 'Connection Issue',
          message: 'We\'re having trouble connecting to our AI service. Please check your internet connection and try again.',
          action: 'Try Again',
          actionFn: handleRefresh,
          showRetry: true,
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        };
      default:
        return {
          icon: <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />,
          title: 'Something Went Wrong',
          message: 'We couldn\'t load your performance insights right now. Don\'t worry, your data is safe. Please try again in a moment.',
          action: 'Try Again',
          actionFn: handleRefresh,
          showRetry: true,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
    }
  };

  if (loading || predictionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="relative">
            <RefreshCw className="h-16 w-16 text-indigo-600 animate-spin mx-auto mb-6" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-12 w-12 bg-indigo-100 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Analyzing Your Performance
          </h2>
          <p className="text-gray-600 mb-4">{loadingStage || 'Loading predictions...'}</p>
          <div className="flex justify-center space-x-2">
            <div className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            Our AI is working hard to generate personalized insights for you
          </p>
        </div>
      </div>
    );
  }

  // Check if we have predictions
  const hasPredictions = predictions && predictions.prediction;
  const prediction = predictions?.prediction;
  const riskSubjects = predictions?.riskSubjects || [];
  const simulation = predictions?.simulation;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">📊 Performance Insights</h1>
                <p className="text-sm text-gray-600">🤖 AI-powered study analytics</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                className="p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Refresh"
                disabled={loading || predictionsLoading}
              >
                <RefreshCw className={`h-5 w-5 text-indigo-600 ${(loading || predictionsLoading) ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        {error || !hasPredictions ? (
          <div className="max-w-2xl mx-auto">
            <div className={`${getErrorContent().bgColor} border ${getErrorContent().borderColor} rounded-lg p-8 text-center shadow-sm`}>
              {getErrorContent().icon}
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                {getErrorContent().title}
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                {getErrorContent().message}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={getErrorContent().actionFn}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm hover:shadow-md"
                  disabled={loading || predictionsLoading}
                >
                  {getErrorContent().action}
                </button>
                {getErrorContent().showRetry && retryCount > 0 && (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Back to Dashboard
                  </button>
                )}
              </div>
              {getErrorContent().showRetry && retryCount > 0 && (
                <p className="text-sm text-gray-500 mt-4">
                  Retry attempt {retryCount}
                </p>
              )}
            </div>
            
            {/* Help Section */}
            <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Wifi className="h-5 w-5 mr-2 text-indigo-600" />
                Need Help?
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  <span>Make sure you're connected to the internet</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  <span>Check if the backend server is running</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  <span>Try refreshing the page</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  <span>If the problem persists, contact support</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Focus Tracker Widget */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <FocusTrackerWidget />
              </div>
              
              {/* Study Stats */}
              {stats && (
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-500 p-2 rounded-lg">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-700 font-medium">⏰ Total Study Time</p>
                        <p className="text-2xl font-bold text-blue-900">{stats.total_study_hours}h</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-500 p-2 rounded-lg">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-green-700 font-medium">📚 Subjects</p>
                        <p className="text-2xl font-bold text-green-900">{stats.subjects_tracked}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm border border-purple-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-500 p-2 rounded-lg">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-purple-700 font-medium">🎯 Study Sessions</p>
                        <p className="text-2xl font-bold text-purple-900">{stats.total_study_sessions}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-sm border border-orange-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="bg-orange-500 p-2 rounded-lg">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-orange-700 font-medium">🏆 Focus Time</p>
                        <p className="text-2xl font-bold text-orange-900">{stats.total_focus_minutes}m</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Predicted Score */}
            {prediction && (
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 md:p-8 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-6 w-6" />
                      <h2 className="text-xl md:text-2xl font-bold">🎯 Predicted Exam Score</h2>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-4xl">📈</span>
                        <span className="text-5xl md:text-6xl font-bold">{prediction.predicted_score}%</span>
                      </div>
                      <div className="flex items-center space-x-4 text-indigo-100 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(prediction.confidence)} text-indigo-700`}>
                          ✨ {prediction.confidence} confidence
                        </span>
                        {prediction.prediction_range && (
                          <span className="text-sm">
                            Range: {prediction.prediction_range.min}% - {prediction.prediction_range.max}%
                          </span>
                        )}
                      </div>
                    </div>
                    {prediction.reasoning && (
                      <p className="mt-4 text-indigo-100 text-sm md:text-base">
                        {prediction.reasoning}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Risk Subjects */}
            {riskSubjects.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                  <h2 className="text-xl font-bold text-gray-800">⚠️ Subjects Needing Attention</h2>
                </div>
                <div className="space-y-4">
                  {riskSubjects.map((subject, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 ${getRiskColor(subject.risk_level)}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-lg capitalize">{subject.subject}</h3>
                          <p className="text-sm opacity-90">Current Score: {subject.current_score}%</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase">
                          {subject.risk_level} Risk
                        </span>
                      </div>
                      {subject.weak_areas && subject.weak_areas.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium mb-1">Weak Areas:</p>
                          <div className="flex flex-wrap gap-2">
                            {subject.weak_areas.map((area, i) => (
                              <span key={i} className="px-2 py-1 bg-white bg-opacity-50 rounded text-xs">
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {subject.recommended_action && (
                        <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                          <p className="text-sm font-medium">💡 Recommendation:</p>
                          <p className="text-sm mt-1">{subject.recommended_action}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Improvement Simulation */}
            {simulation && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Target className="h-6 w-6 text-green-600" />
                  <h2 className="text-xl font-bold text-gray-800">🚀 What If You Study More?</h2>
                </div>
                <p className="text-gray-600 mb-4">
                  If you increase your study time by 50%, here's what could happen:
                </p>
                
                {simulation.projected_scores && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {Object.entries(simulation.projected_scores).map(([subject, score]) => (
                      <div key={subject} className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-300 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <p className="text-sm text-gray-700 capitalize font-medium">📖 {subject}</p>
                        <div className="flex items-baseline space-x-2 mt-1">
                          <span className="text-2xl font-bold text-green-700">✨ {score}%</span>
                          {simulation.improvement_percent && simulation.improvement_percent[subject] && (
                            <span className="text-sm text-green-600 font-semibold">
                              ⬆️ +{simulation.improvement_percent[subject]}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {simulation.timeline && (
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <p className="text-sm text-blue-700 font-medium">⏱️ Timeline</p>
                      <p className="text-lg font-bold text-blue-800">{simulation.timeline}</p>
                    </div>
                  )}
                  {simulation.success_probability && (
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-300 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <p className="text-sm text-purple-700 font-medium">🎯 Success Probability</p>
                      <p className="text-lg font-bold text-purple-800 capitalize">⭐ {simulation.success_probability}</p>
                    </div>
                  )}
                </div>

                {simulation.key_factors && simulation.key_factors.length > 0 && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg">
                    <p className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <span>🔑</span>
                      <span>Key Success Factors:</span>
                    </p>
                    <ul className="space-y-2">
                      {simulation.key_factors.map((factor, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start bg-white bg-opacity-50 p-2 rounded">
                          <span className="text-green-600 mr-2 text-lg">✅</span>
                          <span className="flex-1">{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
