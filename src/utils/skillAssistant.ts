import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API with environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export interface SkillAnalysisRequest {
  userCourses: Array<{
    title: string;
    description: string;
    completedAt?: string;
  }>;
  availableCourses: Array<{
    id: number;
    title: string;
    description: string;
    instructor: string;
  }>;
  userGoals?: string;
  currentSkillLevel?: string;
}

export interface SkillRecommendation {
  nextSteps: string[];
  recommendedCourses: Array<{
    courseId: number;
    title: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  skillGaps: string[];
  learningPath: string[];
  estimatedTimeToNextLevel: string;
}

export class SkillAssistantService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro-latest' });

  async analyzeSkillsAndRecommend(request: SkillAnalysisRequest): Promise<SkillRecommendation> {
    try {
      const prompt = this.buildPrompt(request);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseResponse(text, request.availableCourses);
    } catch (error) {
      console.error('Error analyzing skills:', error);
      throw new Error('Failed to analyze skills and generate recommendations');
    }
  }

  private buildPrompt(request: SkillAnalysisRequest): string {
    const userCoursesText = request.userCourses
      .map(course => `- ${course.title}: ${course.description}`)
      .join('\n');

    const availableCoursesText = request.availableCourses
      .map(course => `- ID: ${course.id}, Title: ${course.title}, Description: ${course.description}`)
      .join('\n');

    return `
You are an expert skill development coach analyzing a student's learning journey on SkillXChange, a decentralized education platform.

STUDENT'S COMPLETED/ENROLLED COURSES:
${userCoursesText || 'No courses completed yet'}

AVAILABLE COURSES ON PLATFORM:
${availableCoursesText || 'No courses available'}

USER GOALS: ${request.userGoals || 'Not specified'}
CURRENT SKILL LEVEL: ${request.currentSkillLevel || 'Beginner'}

Please provide a comprehensive skill analysis and recommendations in the following JSON format:

{
  "nextSteps": ["specific action item 1", "specific action item 2", "specific action item 3"],
  "recommendedCourses": [
    {
      "courseId": number,
      "title": "course title",
      "reason": "why this course is recommended",
      "priority": "high|medium|low"
    }
  ],
  "skillGaps": ["skill gap 1", "skill gap 2"],
  "learningPath": ["step 1", "step 2", "step 3"],
  "estimatedTimeToNextLevel": "time estimate with explanation"
}

Focus on:
1. Identifying skill gaps based on completed courses
2. Recommending specific courses from the available list
3. Creating a logical learning progression
4. Providing actionable next steps
5. Estimating realistic timeframes

Be specific, practical, and encouraging in your recommendations.
    `;
  }

  private parseResponse(text: string, availableCourses: SkillAnalysisRequest['availableCourses']): SkillRecommendation {
    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]) as {
        nextSteps?: string[];
        recommendedCourses?: Array<{
          courseId: number;
          title: string;
          reason: string;
          priority: 'high' | 'medium' | 'low';
        }>;
        skillGaps?: string[];
        learningPath?: string[];
        estimatedTimeToNextLevel?: string;
      };
      
      // Validate and filter recommended courses to ensure they exist
      const validRecommendations = parsed.recommendedCourses?.filter((rec) => 
        availableCourses.some(course => course.id === rec.courseId)
      ) || [];

      return {
        nextSteps: parsed.nextSteps || [],
        recommendedCourses: validRecommendations,
        skillGaps: parsed.skillGaps || [],
        learningPath: parsed.learningPath || [],
        estimatedTimeToNextLevel: parsed.estimatedTimeToNextLevel || 'Unable to estimate'
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      
      // Fallback response if parsing fails
      return {
        nextSteps: [
          'Continue practicing with your current courses',
          'Set specific learning goals for the next month',
          'Join live sessions to get more interaction'
        ],
        recommendedCourses: availableCourses.slice(0, 3).map(course => ({
          courseId: course.id,
          title: course.title,
          reason: 'General recommendation for skill development',
          priority: 'medium' as const
        })),
        skillGaps: ['Unable to analyze specific gaps'],
        learningPath: ['Complete current courses', 'Practice regularly', 'Seek feedback'],
        estimatedTimeToNextLevel: '2-3 months with consistent practice'
      };
    }
  }

  async generateQuickTip(userSkills: string[]): Promise<string> {
    try {
      const prompt = `
As a skill development coach, provide a quick, actionable tip for someone learning: ${userSkills.join(', ')}.
Keep it under 100 words and make it practical and encouraging.
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

export const skillAssistant = new SkillAssistantService();