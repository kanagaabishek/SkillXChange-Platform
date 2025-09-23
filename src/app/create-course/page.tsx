'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet, useContract } from '../../hooks/useBlockchain';
import { CourseFormData } from '../../types';
import toast from 'react-hot-toast';

export default function CreateCoursePage() {
  const router = useRouter();
  const { isConnected, address } = useWallet();
  const { createCourse } = useContract();
  
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    price: '',
    zoomLink: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<CourseFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<CourseFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Course title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Course description is required';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!formData.zoomLink.trim()) {
      newErrors.zoomLink = 'Zoom link is required';
    } else if (!isValidUrl(formData.zoomLink)) {
      newErrors.zoomLink = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof CourseFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setLoading(true);
    try {
      // Inform user about currency before transaction
      toast('MetaMask may show ETH, but you are using BDAG tokens', {
        icon: '💡',
        duration: 3000,
      });
      
      const courseId = await createCourse(formData);
      toast.success(`Course created successfully! ID: ${courseId}`);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        price: '',
        zoomLink: '',
      });
      
      // Redirect to marketplace after success
      setTimeout(() => {
        router.push('/marketplace');
      }, 2000);
      
    } catch (error: unknown) {
      console.error('Failed to create course:', error);
      if (error instanceof Error) {
        toast.error(`Failed to create course: ${error.message}`);
      } else {
        toast.error('Failed to create course. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-100">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Wallet Connection Required</h2>
          <p className="text-gray-600 mb-6">
            Please connect your wallet to create courses on SkillXChange
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Course</h1>
        <p className="text-gray-600">
          Share your expertise with the world. Create a course and earn BDAG tokens.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Course Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Web3 Development Fundamentals"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Course Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Course Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Describe what students will learn in this course..."
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-colors ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Course Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              Course Price (BDAG) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              min="0"
              step="0.001"
              placeholder="0.1"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.price && (
              <p className="text-red-600 text-sm mt-1">{errors.price}</p>
            )}
            {/* <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-orange-800 text-sm">
                <strong>💡 Important:</strong> Prices are set in BDAG tokens. MetaMask may show &ldquo;ETH&rdquo; in transaction confirmations, but you&apos;re actually using BDAG on the BlockDAG network.
              </p>
            </div> */}
          </div>

          {/* Zoom Link */}
          <div>
            <label htmlFor="zoomLink" className="block text-sm font-medium text-gray-700 mb-2">
              Zoom Meeting Link *
            </label>
            <input
              type="url"
              id="zoomLink"
              name="zoomLink"
              value={formData.zoomLink}
              onChange={handleInputChange}
              placeholder="https://zoom.us/j/1234567890"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                errors.zoomLink ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.zoomLink && (
              <p className="text-red-600 text-sm mt-1">{errors.zoomLink}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              This link will be revealed to students after they purchase the course
            </p>
          </div>

          {/* Instructor Info */}
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
            <h3 className="text-sm font-medium text-orange-900 mb-2">Instructor Information</h3>
            <p className="text-sm text-orange-800">
              <span className="font-medium">Wallet Address:</span> {address}
            </p>
            <p className="text-sm text-orange-700 mt-1">
              Course payments will be sent directly to this address
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all shadow-sm ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-orange-200 hover:shadow-md'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Course...</span>
                </span>
              ) : (
                'Create Course'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Tips Section */}
      <div className="mt-8 bg-orange-50 rounded-lg p-6 border border-orange-100">
        <h3 className="text-lg font-semibold text-orange-900 mb-3">💡 Tips for Success</h3>
        <ul className="space-y-2 text-orange-800 text-sm">
          <li>• Write a clear, descriptive title that explains what students will learn</li>
          <li>• Include detailed course outcomes in your description</li>
          <li>• Price your course competitively based on the value you provide</li>
          <li>• Test your Zoom link before creating the course</li>
          <li>• Consider offering a course preview or free introduction session</li>
          <li>• <strong>Note:</strong> MetaMask may display &ldquo;ETH&rdquo; in confirmations, but you&apos;re using BDAG tokens</li>
        </ul>
      </div>
    </div>
  );
}