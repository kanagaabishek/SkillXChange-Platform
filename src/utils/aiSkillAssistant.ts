import { GoogleGenerativeAI } from '@google/generative-ai';
import { Course } from '../types';

// Initialize Gemini API with the provided key
const genAI = new GoogleGenerativeAI('AIzaSyBKP4TuyJBcQmoY7FuYnZ-0alIrrVJcYUM');

export interface UserProfile {
  address: string;
  enrolledCourses: Course[];
  completedCourses: Course[];
  skills: string[];
  learningGoals?: string;
  currentLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'course_recommendation' | 'skill_analysis';
  metadata?: {
    recommendations?: CourseRecommendation[];
    skillAnalysis?: SkillAnalysis;
  };
}

export interface AIAssistantResponse {
  message: string;
  type: 'text' | 'course_recommendation' | 'skill_analysis';
  recommendations?: CourseRecommendation[];
  skillAnalysis?: SkillAnalysis;
}

export interface CourseRecommendation {
  courseId: number;
  title: string;
  description: string;
  instructor: string;
  price: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  skillsToGain: string[];
  prerequisites?: string[];
  estimatedDuration?: string;
}

export interface SkillAnalysis {
  currentSkills: string[];
  skillGaps: string[];
  strengthAreas: string[];
  improvementAreas: string[];
  nextSteps: string[];
  careerSuggestions: string[];
  learningPath: {
    phase: string;
    skills: string[];
    courses: number[];
    duration: string;
  }[];
}

export class AISkillAssistant {
  private model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
  });

  private chatHistory: ChatMessage[] = [];

  async analyzeUserSkills(
    userProfile: UserProfile,
    _availableCourses: Course[]
  ): Promise<SkillAnalysis> {
    try {
      const prompt = this.buildSkillAnalysisPrompt(userProfile);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseSkillAnalysis(text);
    } catch (error) {
      console.error('Error analyzing user skills:', error);
      // Return a fallback analysis if API fails
      return {
        currentSkills: userProfile.skills || ['General skills from your courses'],
        skillGaps: ['Advanced techniques', 'Industry best practices'],
        strengthAreas: userProfile.enrolledCourses.map(course => course.title.split(' ')[0]) || ['Your enrolled subjects'],
        improvementAreas: ['Practical application', 'Advanced concepts'],
        nextSteps: [
          'Continue with your current courses',
          'Practice hands-on projects',
          'Join community discussions'
        ],
        careerSuggestions: ['Explore related fields', 'Build a portfolio'],
        learningPath: [{
          phase: 'Current Focus',
          skills: userProfile.skills || ['Course-based skills'], 
          courses: userProfile.enrolledCourses.map(c => c.id) || [],
          duration: '2-3 months'
        }]
      };
    }
  }

  async getCourseRecommendations(
    userProfile: UserProfile,
    availableCourses: Course[],
    context?: string
  ): Promise<CourseRecommendation[]> {
    try {
      const prompt = this.buildRecommendationPrompt(userProfile, availableCourses, context);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseRecommendations(text, availableCourses);
    } catch (error) {
      console.error('Error getting course recommendations:', error);
      // Return fallback recommendations if API fails
      const enrolledIds = userProfile.enrolledCourses.map(c => c.id);
      const unenrolledCourses = availableCourses.filter(course => !enrolledIds.includes(course.id));
      
      return unenrolledCourses.slice(0, 3).map(course => ({
        courseId: course.id,
        title: course.title,
        description: course.description,
        instructor: course.instructor,
        price: course.price,
        reason: 'Recommended based on platform availability and your profile',
        priority: 'medium' as const,
        skillsToGain: ['New skills from this course'],
        prerequisites: [],
        estimatedDuration: '4-6 weeks'
      }));
    }
  }

  async chatWithAssistant(
    message: string,
    userProfile: UserProfile,
    availableCourses: Course[]
  ): Promise<AIAssistantResponse> {
    try {
      // Add user message to history
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date(),
        type: 'text'
      };
      this.chatHistory.push(userMessage);

      const prompt = this.buildChatPrompt(message, userProfile, availableCourses);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const assistantResponse = await this.parseAssistantResponse(text, userProfile, availableCourses);
      
      // Add assistant response to history
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantResponse.message,
        timestamp: new Date(),
        type: assistantResponse.type,
        metadata: {
          recommendations: assistantResponse.recommendations,
          skillAnalysis: assistantResponse.skillAnalysis
        }
      };
      this.chatHistory.push(assistantMessage);

      return assistantResponse;
    } catch (error) {
      console.error('Error in chat with assistant:', error);
      // Return fallback response if API fails
      const fallbackResponse: AIAssistantResponse = {
        message: `I'm having trouble connecting to the AI service right now, but I can still help! Based on your question about "${message.substring(0, 50)}", I'd suggest exploring the available courses on the platform. ${
          userProfile.enrolledCourses.length > 0 
            ? `You're currently enrolled in ${userProfile.enrolledCourses.length} course${userProfile.enrolledCourses.length > 1 ? 's' : ''}, which is great progress!` 
            : 'Consider enrolling in some courses to start building your skill profile.'
        }`,
        type: 'text'
      };
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallbackResponse.message,
        timestamp: new Date(),
        type: fallbackResponse.type
      };
      this.chatHistory.push(assistantMessage);

      return fallbackResponse;
    }
  }

  private buildSkillAnalysisPrompt(userProfile: UserProfile): string {
    const enrolledCoursesText = userProfile.enrolledCourses
      .map(course => `- ${course.title}: ${course.description}`)
      .join('\n') || 'No courses enrolled';

    const completedCoursesText = userProfile.completedCourses
      .map(course => `- ${course.title}: ${course.description}`)
      .join('\n') || 'No courses completed';

    return `
You are an expert career counselor and skill development coach analyzing a student's profile on SkillXChange.

STUDENT PROFILE:
- Current Level: ${userProfile.currentLevel || 'Not specified'}
- Learning Goals: ${userProfile.learningGoals || 'Not specified'}

ENROLLED COURSES:
${enrolledCoursesText}

COMPLETED COURSES:
${completedCoursesText}

Provide a skill analysis in this exact format:

CURRENT SKILLS: List 3-5 skills they have developed
STRENGTH AREAS: List 2-3 areas where they excel
IMPROVEMENT AREAS: List 2-3 areas that need work
SKILL GAPS: List 2-3 missing skills for their goals
NEXT STEPS: List 3 specific actionable steps
CAREER SUGGESTIONS: List 2 career paths they could pursue

Be specific, actionable, and encouraging in your analysis.
    `;
  }

  private buildRecommendationPrompt(
    userProfile: UserProfile,
    availableCourses: Course[],
    context?: string
  ): string {
    const coursesText = availableCourses
      .map(course => `- ID: ${course.id}, Title: ${course.title}, Description: ${course.description}, Instructor: ${course.instructor}, Price: ${course.price} BDAG`)
      .join('\n');

    const enrolledCoursesText = userProfile.enrolledCourses
      .map(course => `- ${course.title}`)
      .join('\n') || 'None';

    return `
You are an expert course recommendation system for SkillXChange platform.

USER CONTEXT: ${context || 'General recommendation request'}
ENROLLED COURSES: ${enrolledCoursesText}
USER GOALS: ${userProfile.learningGoals || 'Not specified'}
CURRENT LEVEL: ${userProfile.currentLevel || 'Beginner'}

AVAILABLE COURSES:
${coursesText}

Recommend the top 3 most relevant courses using this format for each:

RECOMMENDATION 1:
Course ID: [ID]
Title: [Title]
Reason: [Why recommended]
Priority: [high/medium/low]
Skills to gain: [List skills]

RECOMMENDATION 2:
[Same format]

RECOMMENDATION 3:
[Same format]

Focus on courses that complement their current skills and help achieve their goals.
    `;
  }

  private buildChatPrompt(
    message: string,
    userProfile: UserProfile,
    availableCourses: Course[]
  ): string {
    const recentHistory = this.chatHistory.slice(-4).map(msg => 
      `${msg.role}: ${msg.content}`
    ).join('\n');

    const enrolledCoursesText = userProfile.enrolledCourses
      .map(course => `- ${course.title}: ${course.description}`)
      .join('\n') || 'No courses enrolled';

    return `
You are SkillBot, an AI learning assistant for SkillXChange, a decentralized education platform. You help users understand their skills, provide career advice, and recommend courses.

USER PROFILE:
- Learning Goals: ${userProfile.learningGoals || 'Not specified'}
- Current Level: ${userProfile.currentLevel || 'Beginner'}
- Enrolled Courses: 
${enrolledCoursesText}

RECENT CONVERSATION:
${recentHistory}

USER MESSAGE: ${message}

AVAILABLE COURSES: ${availableCourses.length} courses available on the platform.

Respond as a helpful, encouraging, and knowledgeable learning assistant. If the user asks about:
1. Skill assessment - analyze their current skills
2. Course recommendations - suggest specific courses
3. Career advice - provide guidance based on their profile
4. General questions - answer helpfully and relate back to learning

Keep responses conversational, encouraging, and actionable. If recommending courses, be specific about why they're beneficial.
    `;
  }

  private parseSkillAnalysis(text: string): SkillAnalysis {
    try {
      const currentSkills = this.extractSection(text, 'CURRENT SKILLS:', ['STRENGTH AREAS:', 'IMPROVEMENT AREAS:']);
      const strengthAreas = this.extractSection(text, 'STRENGTH AREAS:', ['IMPROVEMENT AREAS:', 'SKILL GAPS:']);
      const improvementAreas = this.extractSection(text, 'IMPROVEMENT AREAS:', ['SKILL GAPS:', 'NEXT STEPS:']);
      const skillGaps = this.extractSection(text, 'SKILL GAPS:', ['NEXT STEPS:', 'CAREER SUGGESTIONS:']);
      const nextSteps = this.extractSection(text, 'NEXT STEPS:', ['CAREER SUGGESTIONS:']);
      const careerSuggestions = this.extractSection(text, 'CAREER SUGGESTIONS:', []);

      return {
        currentSkills: currentSkills.length > 0 ? currentSkills : ['General skills from your courses'],
        skillGaps: skillGaps.length > 0 ? skillGaps : ['Advanced techniques', 'Industry best practices'],
        strengthAreas: strengthAreas.length > 0 ? strengthAreas : ['Your enrolled subjects'],
        improvementAreas: improvementAreas.length > 0 ? improvementAreas : ['Practical application', 'Advanced concepts'],
        nextSteps: nextSteps.length > 0 ? nextSteps : ['Continue with current courses', 'Practice hands-on projects', 'Join community discussions'],
        careerSuggestions: careerSuggestions.length > 0 ? careerSuggestions : ['Explore related fields', 'Build a portfolio'],
        learningPath: [{
          phase: 'Current Focus',
          skills: currentSkills.length > 0 ? currentSkills.slice(0, 3) : ['Course-based skills'],
          courses: [],
          duration: '2-3 months'
        }]
      };
    } catch (error) {
      console.error('Error parsing skill analysis:', error);
      return {
        currentSkills: ['General skills from your courses'],
        skillGaps: ['Advanced techniques', 'Industry best practices'],
        strengthAreas: ['Your enrolled subjects'],
        improvementAreas: ['Practical application', 'Advanced concepts'],
        nextSteps: ['Continue with current courses', 'Practice hands-on projects', 'Join community discussions'],
        careerSuggestions: ['Explore related fields', 'Build a portfolio'],
        learningPath: []
      };
    }
  }

  private parseRecommendations(text: string, availableCourses: Course[]): CourseRecommendation[] {
    try {
      const recommendations: CourseRecommendation[] = [];
      const recSections = text.split(/RECOMMENDATION \d+:/).slice(1);
      
      for (const section of recSections.slice(0, 3)) {
        const courseId = this.extractValue(section, 'Course ID:');
        const reason = this.extractValue(section, 'Reason:');
        const priority = this.extractValue(section, 'Priority:') as 'high' | 'medium' | 'low';
        const skillsText = this.extractValue(section, 'Skills to gain:');
        
        const courseIdNum = parseInt(courseId);
        const course = availableCourses.find(c => c.id === courseIdNum);
        
        if (course) {
          recommendations.push({
            courseId: courseIdNum,
            title: course.title,
            description: course.description,
            instructor: course.instructor,
            price: course.price,
            reason: reason || 'Recommended for your learning goals',
            priority: ['high', 'medium', 'low'].includes(priority) ? priority : 'medium',
            skillsToGain: skillsText ? skillsText.split(',').map(s => s.trim()) : ['New skills'],
            prerequisites: [],
            estimatedDuration: '4-6 weeks'
          });
        }
      }
      
      // Fallback if no valid recommendations found
      if (recommendations.length === 0) {
        const enrolledIds = new Set(availableCourses.map(c => c.id));
        return availableCourses.filter(course => !enrolledIds.has(course.id)).slice(0, 2).map(course => ({
          courseId: course.id,
          title: course.title,
          description: course.description,
          instructor: course.instructor,
          price: course.price,
          reason: 'Popular course on the platform',
          priority: 'medium' as const,
          skillsToGain: ['Course-specific skills'],
          prerequisites: [],
          estimatedDuration: '4-6 weeks'
        }));
      }
      
      return recommendations;
    } catch (error) {
      console.error('Error parsing recommendations:', error);
      return availableCourses.slice(0, 2).map(course => ({
        courseId: course.id,
        title: course.title,
        description: course.description,
        instructor: course.instructor,
        price: course.price,
        reason: 'General recommendation for skill development',
        priority: 'medium' as const,
        skillsToGain: ['Various skills'],
        prerequisites: [],
        estimatedDuration: '4-6 weeks'
      }));
    }
  }

  private async parseAssistantResponse(
    text: string,
    userProfile: UserProfile,
    availableCourses: Course[]
  ): Promise<AIAssistantResponse> {
    const response: AIAssistantResponse = {
      message: text,
      type: 'text'
    };

    // Simple text-based detection for recommendations
    const lowerText = text.toLowerCase();
    if (lowerText.includes('recommend') || lowerText.includes('suggest') || lowerText.includes('course')) {
      // Generate simple recommendations based on available courses
      const enrolledIds = userProfile.enrolledCourses.map(c => c.id);
      const unenrolledCourses = availableCourses.filter(course => !enrolledIds.includes(course.id));
      
      if (unenrolledCourses.length > 0) {
        response.type = 'course_recommendation';
        response.recommendations = unenrolledCourses.slice(0, 2).map(course => ({
          courseId: course.id,
          title: course.title,
          description: course.description,
          instructor: course.instructor,
          price: course.price,
          reason: 'Based on your interest and available courses',
          priority: 'medium' as const,
          skillsToGain: ['Course-specific skills'],
          prerequisites: [],
          estimatedDuration: '4-6 weeks'
        }));
      }
    }

    return response;
  }

  getChatHistory(): ChatMessage[] {
    return [...this.chatHistory];
  }

  clearChatHistory(): void {
    this.chatHistory = [];
  }

  private extractSection(text: string, startMarker: string, endMarkers: string[]): string[] {
    const startIndex = text.indexOf(startMarker);
    if (startIndex === -1) return [];
    
    let endIndex = text.length;
    for (const endMarker of endMarkers) {
      const markerIndex = text.indexOf(endMarker, startIndex + startMarker.length);
      if (markerIndex !== -1 && markerIndex < endIndex) {
        endIndex = markerIndex;
      }
    }
    
    const section = text.substring(startIndex + startMarker.length, endIndex).trim();
    return section.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('-'))
      .map(line => line.replace(/^[-•*]\s*/, '').trim())
      .filter(line => line.length > 0)
      .slice(0, 5); // Limit to 5 items max
  }

  private extractValue(text: string, marker: string): string {
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.includes(marker)) {
        return line.split(marker)[1]?.trim() || '';
      }
    }
    return '';
  }

  async generateQuickTip(skills: string[]): Promise<string> {
    try {
      const prompt = `
As a skill development coach, provide a quick, actionable tip for someone learning: ${skills.join(', ')}.
Keep it under 100 words, make it practical and encouraging.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating quick tip:', error);
      return 'Keep practicing consistently and don\'t be afraid to ask questions during live sessions!';
    }
  }
}

export const aiSkillAssistant = new AISkillAssistant();