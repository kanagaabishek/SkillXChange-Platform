'use client';

import { useState, useEffect } from 'react';
import { useSkillAnalysisContext } from '../hooks/useSkillAnalysis';
import { aiSkillAssistant } from '../utils/aiSkillAssistant';

interface SkillDashboardProps {
  className?: string;
}

export default function SkillDashboard({ className = '' }: SkillDashboardProps) {
  const {
    userProfile,
    skillAnalysis,
    recommendations,
    loading,
    analyzeSkills,
    getRecommendations,
    updateProfile
  } = useSkillAnalysisContext();

  const [quickTip, setQuickTip] = useState<string>('');
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileForm, setProfileForm] = useState({
    learningGoals: '',
    currentLevel: 'beginner' as 'beginner' | 'intermediate' | 'advanced'
  });

  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        learningGoals: userProfile.learningGoals || '',
        currentLevel: userProfile.currentLevel || 'beginner'
      });
    }
  }, [userProfile]);

  useEffect(() => {
    if (userProfile?.skills && userProfile.skills.length > 0) {
      aiSkillAssistant.generateQuickTip(userProfile.skills)
        .then(setQuickTip)
        .catch(() => setQuickTip('Keep practicing consistently!'));
    }
  }, [userProfile?.skills]);

  const handleProfileUpdate = async () => {
    if (!userProfile) return;
    
    try {
      await updateProfile(profileForm);
      setShowProfileForm(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!userProfile) {
    return (
      <div className={`bg-gray-100 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <div className="text-gray-500">Connect your wallet to see your skill dashboard</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Skill Dashboard</h2>
          <p className="text-sm text-gray-500">
            Track your learning progress and get personalized insights
          </p>
        </div>
        <button
          onClick={() => setShowProfileForm(!showProfileForm)}
          className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
        >
          Settings
        </button>
      </div>

      {/* Profile Settings Form */}
      {showProfileForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-3">Update Learning Profile</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Learning Goals
              </label>
              <textarea
                value={profileForm.learningGoals}
                onChange={(e) => setProfileForm(prev => ({ ...prev, learningGoals: e.target.value }))}
                placeholder="What do you want to achieve? (e.g., become a full-stack developer, learn blockchain, etc.)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Level
              </label>
              <select
                value={profileForm.currentLevel}
                onChange={(e) => setProfileForm(prev => ({ ...prev, currentLevel: e.target.value as 'beginner' | 'intermediate' | 'advanced' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleProfileUpdate}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
              >
                Save
              </button>
              <button
                onClick={() => setShowProfileForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {userProfile.enrolledCourses.length}
          </div>
          <div className="text-sm text-blue-800">Courses Enrolled</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {userProfile.completedCourses.length}
          </div>
          <div className="text-sm text-green-800">Courses Completed</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {userProfile.skills.length}
          </div>
          <div className="text-sm text-purple-800">Skills Identified</div>
        </div>
      </div>

      {/* Quick Tip */}
      {quickTip && (
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
          <div className="flex items-start">
            <div className="text-yellow-400 mr-2">💡</div>
            <div>
              <div className="text-sm font-medium text-yellow-800">Quick Tip</div>
              <div className="text-sm text-yellow-700 mt-1">{quickTip}</div>
            </div>
          </div>
        </div>
      )}

      {/* Current Skills */}
      {userProfile.skills.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Your Skills</h3>
          <div className="flex flex-wrap gap-2">
            {userProfile.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Learning Progress */}
      {userProfile.enrolledCourses.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Current Courses</h3>
          <div className="space-y-2">
            {userProfile.enrolledCourses.slice(0, 3).map((course) => (
              <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">{course.title}</div>
                  <div className="text-xs text-gray-500">by {course.instructor}</div>
                </div>
                <div className="text-xs text-gray-500">
                  {course.price} BDAG
                </div>
              </div>
            ))}
            {userProfile.enrolledCourses.length > 3 && (
              <div className="text-xs text-gray-500 text-center pt-2">
                +{userProfile.enrolledCourses.length - 3} more courses
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={analyzeSkills}
          disabled={loading || userProfile.enrolledCourses.length === 0}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {loading ? 'Analyzing...' : 'Analyze Skills'}
        </button>
        <button
          onClick={() => getRecommendations()}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {loading ? 'Loading...' : 'Get Recommendations'}
        </button>
      </div>

      {/* Recent Analysis */}
      {skillAnalysis && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Latest Analysis</h3>
          
          {skillAnalysis.nextSteps.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Recommended Next Steps</div>
              <ul className="text-sm text-gray-600 space-y-1">
                {skillAnalysis.nextSteps.slice(0, 3).map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {skillAnalysis.skillGaps.length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Skill Gaps to Address</div>
              <div className="flex flex-wrap gap-2">
                {skillAnalysis.skillGaps.slice(0, 5).map((gap, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs"
                  >
                    {gap}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Recommendations */}
      {recommendations.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Recommended for You</h3>
          <div className="space-y-2">
            {recommendations.slice(0, 2).map((rec) => (
              <div key={rec.courseId} className="p-3 bg-white rounded-lg border">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{rec.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{rec.reason}</div>
                    <div className="flex items-center mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {rec.priority} priority
                      </span>
                      <span className="text-xs text-gray-500 ml-2">{rec.price} BDAG</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}