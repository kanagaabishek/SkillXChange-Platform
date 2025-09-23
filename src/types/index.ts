import { ethers } from 'ethers';

export interface Course {
  id: number;
  title: string;
  description: string;
  price: string; // in BDAG as string
  instructor: string;
  isActive: boolean;
  createdAt: number;
  zoomLink?: string; // Only available after purchase
}

export interface CourseFormData {
  title: string;
  description: string;
  price: string;
  zoomLink: string;
}

export interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  balance: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  signer: ethers.Signer | null;
}

export interface ContractContextType {
  contract: ethers.Contract | null;
  createCourse: (courseData: CourseFormData) => Promise<number>;
  purchaseCourse: (courseId: number, price: string) => Promise<void>;
  getCourseInfo: (courseId: number) => Promise<Course>;
  getCourseZoomLink: (courseId: number) => Promise<string>;
  getAllActiveCourses: () => Promise<number[]>;
  getStudentCourses: (address: string) => Promise<number[]>;
  getInstructorCourses: (address: string) => Promise<number[]>;
  isEnrolled: (courseId: number, address: string) => Promise<boolean>;
}