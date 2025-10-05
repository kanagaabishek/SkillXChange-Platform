'use client';

import { useState, useRef, useEffect } from 'react';
import { useSkillAnalysisContext } from '../hooks/useSkillAnalysis';
import { aiSkillAssistant, ChatMessage, AIAssistantResponse } from '../utils/aiSkillAssistant';
import CourseCard from './CourseCard';

interface AIAssistantProps {
  className?: string;
}

export function AIAssistant({ className = '' }: AIAssistantProps) {
  const {
    userProfile,
    availableCourses,
    skillAnalysis,
    recommendations,
    loading: profileLoading,
    analyzeSkills,
    getRecommendations
  } = useSkillAnalysisContext();

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'analysis' | 'recommendations'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Initialize with welcome message
  useEffect(() => {
    if (userProfile && chatMessages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `Hello! I'm SkillBot, your AI learning assistant. I can help you understand your skills, recommend courses, and guide your learning journey on SkillXChange. ${
          userProfile.enrolledCourses.length > 0 
            ? `I see you're enrolled in ${userProfile.enrolledCourses.length} course${userProfile.enrolledCourses.length > 1 ? 's' : ''}. Would you like me to analyze your skills or recommend new courses?`
            : "You haven't enrolled in any courses yet. Would you like me to recommend some courses to get started?"
        }`,
        timestamp: new Date(),
        type: 'text'
      };
      setChatMessages([welcomeMessage]);
    }
  }, [userProfile, chatMessages.length]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !userProfile) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response: AIAssistantResponse = await aiSkillAssistant.chatWithAssistant(
        inputMessage,
        userProfile,
        availableCourses
      );

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        type: response.type,
        metadata: {
          recommendations: response.recommendations,
          skillAnalysis: response.skillAnalysis
        }
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error processing your message. Please try again.",
        timestamp: new Date(),
        type: 'text'
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = async (action: string) => {
    setIsLoading(true);
    try {
      switch (action) {
        case 'analyze':
          await analyzeSkills();
          setActiveTab('analysis');
          break;
        case 'recommend':
          await getRecommendations();
          setActiveTab('recommendations');
          break;
        case 'help':
          const helpMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content: "I can help you with:\n\n• **Skill Analysis** - Analyze your current skills based on enrolled courses\n• **Course Recommendations** - Suggest new courses to enhance your skills\n• **Learning Path** - Create a personalized learning roadmap\n• **Career Guidance** - Provide advice based on your goals\n\nJust ask me anything about your learning journey!",
            timestamp: new Date(),
            type: 'text'
          };
          setChatMessages(prev => [...prev, helpMessage]);
          break;
      }
    } catch (error) {
      console.error('Error with quick action:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === 'user';
    
    return (
      <div
        key={message.id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`max-w-[80%] p-3 rounded-lg ${
            isUser
              ? 'bg-blue-500 text-white rounded-br-none'
              : 'bg-gray-100 text-gray-800 rounded-bl-none'
          }`}
        >
          <div className="whitespace-pre-wrap text-sm">
            {message.content}
          </div>
          <div className="text-xs mt-1 opacity-70">
            {message.timestamp.toLocaleTimeString()}
          </div>
          
          {/* Render recommendations if present */}
          {message.metadata?.recommendations && message.metadata.recommendations.length > 0 && (
            <div className="mt-3 space-y-2">
              <div className="text-xs font-semibold">Recommended Courses:</div>
              {message.metadata.recommendations.slice(0, 3).map((rec) => (
                <div key={rec.courseId} className="bg-white bg-opacity-20 p-2 rounded text-xs">
                  <div className="font-semibold">{rec.title}</div>
                  <div className="text-xs opacity-80">{rec.reason}</div>
                  <div className="text-xs mt-1">
                    Priority: {rec.priority} • {rec.price} BDAG
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">🤖</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">SkillBot</h2>
              <p className="text-xs text-gray-500">AI Learning Assistant</p>
            </div>
          </div>
          
          {userProfile && (
            <div className="text-xs text-gray-500">
              {userProfile.enrolledCourses.length} courses enrolled
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex mt-3 space-x-1">
          {(['chat', 'analysis', 'recommendations'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                activeTab === tab
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="h-96 overflow-hidden">
        {activeTab === 'chat' && (
          <div className="flex flex-col h-full">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {chatMessages.map(renderMessage)}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-gray-100 p-3 rounded-lg rounded-bl-none">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {chatMessages.length <= 1 && (
              <div className="p-4 border-t border-gray-100">
                <div className="text-xs text-gray-500 mb-2">Quick actions:</div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleQuickAction('analyze')}
                    disabled={isLoading || !userProfile?.enrolledCourses.length}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 disabled:opacity-50"
                  >
                    Analyze My Skills
                  </button>
                  <button
                    onClick={() => handleQuickAction('recommend')}
                    disabled={isLoading}
                    className="px-3 py-1 text-xs bg-green-100 text-green-600 rounded-full hover:bg-green-200 disabled:opacity-50"
                  >
                    Recommend Courses
                  </button>
                  <button
                    onClick={() => handleQuickAction('help')}
                    disabled={isLoading}
                    className="px-3 py-1 text-xs bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 disabled:opacity-50"
                  >
                    Help
                  </button>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about your skills, courses, or career..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  disabled={isLoading || !userProfile}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading || !userProfile}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="p-4 h-full overflow-y-auto">
            {skillAnalysis ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Current Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {skillAnalysis.currentSkills.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Strength Areas</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {skillAnalysis.strengthAreas.map((area, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Areas for Improvement</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {skillAnalysis.improvementAreas.map((area, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-orange-500 mr-2">→</span>
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Next Steps</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {skillAnalysis.nextSteps.map((step, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-purple-500 mr-2">•</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">No skill analysis available</div>
                <button
                  onClick={analyzeSkills}
                  disabled={profileLoading || !userProfile?.enrolledCourses.length}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {profileLoading ? 'Loading...' : 'Analyze My Skills'}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="p-4 h-full overflow-y-auto">
            {recommendations.length > 0 ? (
              <div className="space-y-4">
                {recommendations.map((rec) => {
                  const course = availableCourses.find(c => c.id === rec.courseId);
                  return course ? (
                    <CourseCard key={rec.courseId} course={course} />
                  ) : null;
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">No recommendations available</div>
                <button
                  onClick={() => getRecommendations()}
                  disabled={profileLoading}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  {profileLoading ? 'Loading...' : 'Get Recommendations'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}