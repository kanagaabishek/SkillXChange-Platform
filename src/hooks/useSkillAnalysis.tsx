'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet, useContract } from './useBlockchain';
import { aiSkillAssistant, UserProfile, SkillAnalysis, CourseRecommendation } from '../utils/aiSkillAssistant';
import { Course } from '../types';

export interface UserSkillProfile extends UserProfile {
  lastAnalyzed?: Date;
  analysisHistory: SkillAnalysis[];
}

export function useSkillAnalysis() {
  const walletContext = useWallet();
  const contractContext = useContract();
  const [userProfile, setUserProfile] = useState<UserSkillProfile | null>(null);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [skillAnalysis, setSkillAnalysis] = useState<SkillAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<CourseRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user's courses and create profile
  const loadUserProfile = useCallback(async () => {
    if (!walletContext?.address || !contractContext) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get user's enrolled courses
      const enrolledCourseIds = await contractContext.getStudentCourses(walletContext.address);
      const enrolledCourses: Course[] = [];
      
      for (const courseId of enrolledCourseIds) {
        try {
          const course = await contractContext.getCourseInfo(courseId);
          enrolledCourses.push(course);
        } catch (err) {
          console.error(`Error loading course ${courseId}:`, err);
        }
      }

      // For now, we'll consider all enrolled courses as "completed" since we don't have completion tracking
      // In a real app, you'd track completion status separately
      const completedCourses = enrolledCourses; // This would be filtered based on completion status

      // Extract skills from course titles and descriptions
      const skills = extractSkillsFromCourses(enrolledCourses);

      // Get stored profile data from localStorage (learning goals, level)
      const storedProfile = localStorage.getItem(`skillProfile_${walletContext.address}`);
      const profileData = storedProfile ? JSON.parse(storedProfile) : {};

      const profile: UserSkillProfile = {
        address: walletContext.address,
        enrolledCourses,
        completedCourses,
        skills,
        learningGoals: profileData.learningGoals,
        currentLevel: profileData.currentLevel || 'beginner',
        lastAnalyzed: profileData.lastAnalyzed ? new Date(profileData.lastAnalyzed) : undefined,
        analysisHistory: profileData.analysisHistory || []
      };

      setUserProfile(profile);
    } catch (err) {
      console.error('Error loading user profile:', err);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  }, [walletContext?.address, contractContext]);

  // Load available courses
  const loadAvailableCourses = useCallback(async () => {
    if (!contractContext) return;

    try {
      const activeCourseIds = await contractContext.getAllActiveCourses();
      const courses: Course[] = [];
      
      for (const courseId of activeCourseIds) {
        try {
          const course = await contractContext.getCourseInfo(courseId);
          courses.push(course);
        } catch (err) {
          console.error(`Error loading course ${courseId}:`, err);
        }
      }
      
      setAvailableCourses(courses);
    } catch (err) {
      console.error('Error loading available courses:', err);
      setError('Failed to load available courses');
    }
  }, [contractContext]);

  // Analyze user skills
  const analyzeSkills = useCallback(async () => {
    if (!userProfile || availableCourses.length === 0) {
      setError('User profile or available courses not loaded');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const analysis = await aiSkillAssistant.analyzeUserSkills(userProfile);
      setSkillAnalysis(analysis);

      // Update user profile with new analysis
      const updatedProfile = {
        ...userProfile,
        lastAnalyzed: new Date(),
        analysisHistory: [...userProfile.analysisHistory, analysis]
      };
      setUserProfile(updatedProfile);

      // Save to localStorage
      localStorage.setItem(`skillProfile_${userProfile.address}`, JSON.stringify({
        learningGoals: updatedProfile.learningGoals,
        currentLevel: updatedProfile.currentLevel,
        lastAnalyzed: updatedProfile.lastAnalyzed,
        analysisHistory: updatedProfile.analysisHistory
      }));

    } catch (err) {
      console.error('Error analyzing skills:', err);
      setError('Failed to analyze skills');
    } finally {
      setLoading(false);
    }
  }, [userProfile, availableCourses]);

  // Get course recommendations
  const getRecommendations = useCallback(async (context?: string) => {
    if (!userProfile || availableCourses.length === 0) {
      setError('User profile or available courses not loaded');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const recs = await aiSkillAssistant.getCourseRecommendations(userProfile, availableCourses, context);
      setRecommendations(recs);
    } catch (err) {
      console.error('Error getting recommendations:', err);
      setError('Failed to get course recommendations');
    } finally {
      setLoading(false);
    }
  }, [userProfile, availableCourses]);

  // Update user profile data
  const updateProfile = useCallback(async (updates: Partial<Pick<UserProfile, 'learningGoals' | 'currentLevel'>>) => {
    if (!userProfile) return;

    const updatedProfile = { ...userProfile, ...updates };
    setUserProfile(updatedProfile);

    // Save to localStorage
    localStorage.setItem(`skillProfile_${userProfile.address}`, JSON.stringify({
      learningGoals: updatedProfile.learningGoals,
      currentLevel: updatedProfile.currentLevel,
      lastAnalyzed: updatedProfile.lastAnalyzed,
      analysisHistory: updatedProfile.analysisHistory
    }));
  }, [userProfile]);

  // Initialize when wallet connects
  useEffect(() => {
    if (walletContext?.address && contractContext) {
      loadUserProfile();
      loadAvailableCourses();
    }
  }, [walletContext?.address, contractContext, loadUserProfile, loadAvailableCourses]);

  return {
    userProfile,
    availableCourses,
    skillAnalysis,
    recommendations,
    loading,
    error,
    analyzeSkills,
    getRecommendations,
    updateProfile,
    refreshProfile: loadUserProfile,
    refreshCourses: loadAvailableCourses
  };
}

// Helper function to extract skills from course data
function extractSkillsFromCourses(courses: Course[]): string[] {
  const skillKeywords = new Set<string>();
  
  courses.forEach(course => {
    // Extract skills from title and description
    const text = `${course.title} ${course.description}`.toLowerCase();
    
    // Common skill patterns
    const skillPatterns = [
      /\b(javascript|js|typescript|ts|python|java|c\+\+|c#|go|rust|php|ruby)\b/g,
      /\b(react|vue|angular|node|express|django|flask|spring|laravel)\b/g,
      /\b(html|css|sass|scss|bootstrap|tailwind)\b/g,
      /\b(sql|mysql|postgresql|mongodb|redis|elasticsearch)\b/g,
      /\b(aws|azure|gcp|docker|kubernetes|terraform)\b/g,
      /\b(blockchain|solidity|ethereum|web3|defi|nft)\b/g,
      /\b(machine learning|ai|data science|analytics|statistics)\b/g,
      /\b(design|ui|ux|figma|photoshop|illustrator)\b/g,
      /\b(marketing|seo|content|social media|advertising)\b/g,
      /\b(project management|agile|scrum|leadership)\b/g
    ];

    skillPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => skillKeywords.add(match));
      }
    });

    // Extract skills from common phrases
    if (text.includes('web development')) skillKeywords.add('web development');
    if (text.includes('mobile development')) skillKeywords.add('mobile development');
    if (text.includes('data analysis')) skillKeywords.add('data analysis');
    if (text.includes('digital marketing')) skillKeywords.add('digital marketing');
    if (text.includes('graphic design')) skillKeywords.add('graphic design');
  });

  return Array.from(skillKeywords);
}

// Context provider for skill analysis
import { createContext, useContext } from 'react';

interface SkillAnalysisContextType {
  userProfile: UserSkillProfile | null;
  availableCourses: Course[];
  skillAnalysis: SkillAnalysis | null;
  recommendations: CourseRecommendation[];
  loading: boolean;
  error: string | null;
  analyzeSkills: () => Promise<void>;
  getRecommendations: (context?: string) => Promise<void>;
  updateProfile: (updates: Partial<Pick<UserProfile, 'learningGoals' | 'currentLevel'>>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshCourses: () => Promise<void>;
}

const SkillAnalysisContext = createContext<SkillAnalysisContextType | null>(null);

export function SkillAnalysisProvider({ children }: { children: React.ReactNode }) {
  const skillAnalysisData = useSkillAnalysis();

  return (
    <SkillAnalysisContext.Provider value={skillAnalysisData}>
      {children}
    </SkillAnalysisContext.Provider>
  );
}

export function useSkillAnalysisContext() {
  const context = useContext(SkillAnalysisContext);
  if (!context) {
    throw new Error('useSkillAnalysisContext must be used within a SkillAnalysisProvider');
  }
  return context;
}