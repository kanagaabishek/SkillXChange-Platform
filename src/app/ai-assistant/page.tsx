'use client';

import { SkillAnalysisProvider } from '../../hooks/useSkillAnalysis';
import { AIAssistant } from '../../components/AIAssistant';
import SkillDashboard from '../../components/SkillDashboard';

export default function AIAssistantPage() {
  return (
    <SkillAnalysisProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              AI Learning Assistant
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get personalized skill analysis, course recommendations, and learning guidance 
              powered by AI. Let SkillBot help you achieve your learning goals.
            </p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Skill Dashboard */}
            <div className="space-y-6">
              <SkillDashboard />
            </div>

            {/* AI Assistant Chat */}
            <div className="space-y-6">
              <AIAssistant />
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              What SkillBot Can Help You With
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 text-xl">🔍</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Skill Analysis</h3>
                <p className="text-sm text-gray-600">
                  Analyze your current skills based on enrolled courses and identify areas for growth.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 text-xl">📚</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Course Recommendations</h3>
                <p className="text-sm text-gray-600">
                  Get personalized course suggestions to complement your learning journey.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 text-xl">🎯</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Learning Path</h3>
                <p className="text-sm text-gray-600">
                  Create a structured roadmap to achieve your specific learning goals.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-orange-600 text-xl">💼</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Career Guidance</h3>
                <p className="text-sm text-gray-600">
                  Receive advice on career paths and skills needed for your target roles.
                </p>
              </div>
            </div>
          </div>

          {/* Getting Started Guide */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Getting Started</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Enroll in Courses</h3>
                  <p className="text-sm text-gray-600">
                    Browse the marketplace and enroll in courses that interest you to build your skill profile.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Set Learning Goals</h3>
                  <p className="text-sm text-gray-600">
                    Update your profile with your learning goals and current skill level for better recommendations.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Chat with SkillBot</h3>
                  <p className="text-sm text-gray-600">
                    Ask questions about your skills, career paths, or request course recommendations.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Follow Recommendations</h3>
                  <p className="text-sm text-gray-600">
                    Enroll in recommended courses and track your progress as you develop new skills.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SkillAnalysisProvider>
  );
}