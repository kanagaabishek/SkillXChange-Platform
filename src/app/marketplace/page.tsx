'use client';

import { useState, useEffect } from 'react';
import { useContract, useWallet } from '../../hooks/useBlockchain';
import { Course } from '../../types';
import CourseCard from '../../components/CourseCard';
import toast from 'react-hot-toast';

export default function MarketplacePage() {
  const { isConnected } = useWallet();
  const { getAllActiveCourses, getCourseInfo } = useContract();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest');
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const courseIds = await getAllActiveCourses();
        console.log('Course IDs:', courseIds);
        
        if (courseIds.length === 0) {
          console.log('No courses found');
          setCourses([]);
          return;
        }
        
        // Get course info for each ID, filtering out failures
        const coursePromises = courseIds.map(async (id) => {
          try {
            return await getCourseInfo(id);
          } catch (error) {
            console.error(`Failed to load course ${id}:`, error);
            return null;
          }
        });
        
        const coursesData = await Promise.all(coursePromises);
        const validCourses = coursesData.filter(course => course !== null) as Course[];
        
        console.log('Valid courses loaded:', validCourses);
        setCourses(validCourses);
      } catch (error) {
        console.error('Failed to load courses:', error);
        toast.error('Failed to load courses. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [getAllActiveCourses, getCourseInfo]);

  useEffect(() => {
    let filtered = courses.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort courses
    switch (sortBy) {
      case 'newest':
        filtered = filtered.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case 'price-low':
        filtered = filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-high':
        filtered = filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
    }

    setFilteredCourses(filtered);
  }, [courses, searchTerm, sortBy]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as 'newest' | 'price-low' | 'price-high');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Course Marketplace</h1>
        <p className="text-xl text-gray-600">
          Discover amazing courses from expert instructors
        </p>
        {!isConnected && (
          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-orange-700 text-sm">
              💡 Connect your wallet to purchase courses and access exclusive content
            </p>
          </div>
        )}
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Sort */}
          <div className="sm:w-48">
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          {loading ? (
            'Loading courses...'
          ) : (
            `Showing ${filteredCourses.length} of ${courses.length} courses`
          )}
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse border border-gray-100">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-16 bg-gray-200 rounded mb-4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          {searchTerm ? (
            <>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h3>
              <p className="text-gray-600 mb-4">
                No courses match your search &ldquo;{searchTerm}&rdquo;. Try different keywords.
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Clear Search
              </button>
            </>
          ) : (
            <>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Courses Available</h3>
              <p className="text-gray-600 mb-4">
                No courses have been created yet. Be the first to share your knowledge!
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} showPurchaseButton={true} />
          ))}
        </div>
      )}

      {/* Call to Action
      {!loading && courses.length > 0 && (
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-8 text-center text-white shadow-lg shadow-orange-200">
          <h3 className="text-2xl font-bold mb-2">Want to Teach?</h3>
          <p className="text-orange-100 mb-6">
            Share your expertise and earn BDAG tokens by creating your own course
          </p>
          <a
            href="/create-course"
            className="inline-flex items-center px-6 py-3 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-medium shadow-sm hover:shadow-md"
          >
            Create Your Course
            <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      )} */}
    </div>
  );
}