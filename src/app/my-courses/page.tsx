'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useContract, useWallet } from '../../hooks/useBlockchain';
import { Course } from '../../types';
import CourseCard from '../../components/CourseCard';
import toast from 'react-hot-toast';

export default function MyCoursesPage() {
  const { isConnected, address } = useWallet();
  const { getStudentCourses, getInstructorCourses, getCourseInfo } = useContract();
  const [purchasedCourses, setPurchasedCourses] = useState<Course[]>([]);
  const [createdCourses, setCreatedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'purchased' | 'created'>('purchased');

  useEffect(() => {
    const loadCourses = async () => {
      if (!isConnected || !address) {
        setLoading(false);
        return;
      }

      try {
        // Load purchased courses
        const purchasedIds = await getStudentCourses(address);
        const purchasedPromises = purchasedIds.map(id => getCourseInfo(id));
        const purchasedData = await Promise.all(purchasedPromises);
        setPurchasedCourses(purchasedData);

        // Load created courses
        const createdIds = await getInstructorCourses(address);
        const createdPromises = createdIds.map(id => getCourseInfo(id));
        const createdData = await Promise.all(createdPromises);
        setCreatedCourses(createdData);
      } catch (error) {
        console.error('Failed to load courses:', error);
        toast.error('Failed to load your courses');
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [isConnected, address, getStudentCourses, getInstructorCourses, getCourseInfo]);

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-100">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">
            Connect your wallet to view your purchased and created courses
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
        <p className="text-gray-600">
          Manage your purchased courses and track your teaching progress
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('purchased')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'purchased'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Purchased Courses ({purchasedCourses.length})
          </button>
          <button
            onClick={() => setActiveTab('created')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'created'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Created Courses ({createdCourses.length})
          </button>
        </nav>
      </div>

      {/* Course Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse border border-gray-100">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-16 bg-gray-200 rounded mb-4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {activeTab === 'purchased' && (
            <div>
              {purchasedCourses.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Purchased Courses</h3>
                  <p className="text-gray-600 mb-6">
                    You haven&apos;t purchased any courses yet. Explore the marketplace to get started!
                  </p>
                  <Link
                    href="/marketplace"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-medium shadow-lg shadow-orange-200"
                  >
                    Browse Marketplace
                    <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              ) : (
                <div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">
                          Access Your Courses
                        </h3>
                        <div className="mt-1 text-sm text-green-700">
                          <p>Click &ldquo;Join Zoom Session&rdquo; to access your purchased courses instantly.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {purchasedCourses.map((course) => (
                      <CourseCard 
                        key={course.id} 
                        course={course} 
                        showPurchaseButton={false}
                        showAccessButton={true}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'created' && (
            <div>
              {createdCourses.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M12 6V4a2 2 0 00-2-2H6a2 2 0 00-2 2v2H2a1 1 0 000 2h1v10a2 2 0 002 2h10a2 2 0 002-2V8h1a1 1 0 100-2h-2zM6 6V4h4v2H6z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Created Courses</h3>
                  <p className="text-gray-600 mb-6">
                    You haven&apos;t created any courses yet. Share your expertise and start earning!
                  </p>
                  <Link
                    href="/create-course"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-medium shadow-lg shadow-orange-200"
                  >
                    Create Your First Course
                    <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              ) : (
                <div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-orange-800">
                          Your Teaching Dashboard
                        </h3>
                        <div className="mt-1 text-sm text-orange-700">
                          <p>These are the courses you&apos;ve created. Payments are sent directly to your wallet.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {createdCourses.map((course) => (
                      <CourseCard 
                        key={course.id} 
                        course={course} 
                        showPurchaseButton={false}
                        showAccessButton={true}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Stats Section */}
      {!loading && (purchasedCourses.length > 0 || createdCourses.length > 0) && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Activity Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-100">
              <div className="text-2xl font-bold text-orange-600">{purchasedCourses.length}</div>
              <div className="text-sm text-orange-800">Courses Purchased</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="text-2xl font-bold text-green-600">{createdCourses.length}</div>
              <div className="text-sm text-green-800">Courses Created</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="text-2xl font-bold text-blue-600">
                {createdCourses.reduce((sum, course) => sum + parseFloat(course.price), 0).toFixed(3)}
              </div>
              <div className="text-sm text-blue-800">Total Course Value (BDAG)</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
              <div className="text-2xl font-bold text-purple-600">
                {purchasedCourses.reduce((sum, course) => sum + parseFloat(course.price), 0).toFixed(3)}
              </div>
              <div className="text-sm text-purple-800">Total Spent (BDAG)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}