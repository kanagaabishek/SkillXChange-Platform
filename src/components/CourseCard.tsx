'use client';

import { useState, useEffect } from 'react';
import { Course } from '../types';
import { useWallet, useContract } from '../hooks/useBlockchain';
import toast from 'react-hot-toast';

interface CourseCardProps {
  course: Course;
  showPurchaseButton?: boolean;
  showAccessButton?: boolean;
}

export default function CourseCard({ 
  course, 
  showPurchaseButton = true, 
  showAccessButton = false 
}: CourseCardProps) {
  const { address, isConnected } = useWallet();
  const { purchaseCourse, getCourseZoomLink, isEnrolled } = useContract();
  const [loading, setLoading] = useState(false);
  const [enrolled, setEnrolled] = useState<boolean | null>(null);
  const [zoomLink, setZoomLink] = useState<string>('');

  // Check enrollment status
  useEffect(() => {
    const checkEnrollment = async () => {
      if (address && isConnected) {
        try {
          const isUserEnrolled = await isEnrolled(course.id, address);
          setEnrolled(isUserEnrolled);
        } catch (error) {
          console.error('Failed to check enrollment:', error);
        }
      }
    };

    checkEnrollment();
  }, [address, isConnected, course.id, isEnrolled]);

  const handlePurchase = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (course.instructor === address) {
      toast.error('You cannot buy your own course');
      return;
    }

    setLoading(true);
    try {
      // Inform user about currency before purchase
      toast('MetaMask may show ETH, but you are paying with BDAG tokens', {
        icon: '💡',
        duration: 3000,
      });
      
      await purchaseCourse(course.id, course.price);
      toast.success('Course purchased successfully!');
      setEnrolled(true);
    } catch (error: unknown) {
      console.error('Purchase failed:', error);
      if (error instanceof Error) {
        toast.error(`Purchase failed: ${error.message}`);
      } else {
        toast.error('Purchase failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAccessCourse = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      const link = await getCourseZoomLink(course.id);
      setZoomLink(link);
      
      // Open zoom link in new tab
      window.open(link, '_blank');
      toast.success('Opening Zoom link...');
    } catch (error: unknown) {
      console.error('Failed to get zoom link:', error);
      if (error instanceof Error) {
        toast.error(`Access denied: ${error.message}`);
      } else {
        toast.error('Failed to access course. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const isOwnCourse = address === course.instructor;
  const canPurchase = isConnected && !isOwnCourse && !enrolled;
  const canAccess = isConnected && (enrolled || isOwnCourse);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100 hover:border-orange-200">
      <div className="p-6">
        {/* Course header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
              {course.title}
            </h3>
            <p className="text-gray-600 text-sm mb-2">
              by {formatAddress(course.instructor)}
            </p>
          </div>
          <div className="text-right block mt-8">
            <div className="font-bold text-orange-600">
              {course.price} BDAG
            </div>
          </div>
        </div>

        {/* Course description */}
        <p className="text-gray-700 mb-4 text-sm line-clamp-3">
          {course.description}
        </p>

        {/* Course metadata */}
        <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
          <span>Created {formatDate(course.createdAt)}</span>
          <span className={`px-2 py-1 rounded-full ${
            course.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {course.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Enrollment status */}
        {isConnected && (
          <div className="mb-4">
            {isOwnCourse && (
              <div className="text-sm text-orange-600 font-medium">
                ✓ Your Course
              </div>
            )}
            {enrolled && !isOwnCourse && (
              <div className="text-sm text-green-600 font-medium">
                ✓ Enrolled
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-2">
          {showPurchaseButton && canPurchase && (
            <button
              onClick={handlePurchase}
              disabled={loading}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-all shadow-sm ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-orange-200 hover:shadow-md'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Purchasing...</span>
                </span>
              ) : (
                `Buy Course (${course.price} BDAG)`
              )}
            </button>
          )}

          {(showAccessButton || canAccess) && (
            <button
              onClick={handleAccessCourse}
              disabled={loading || !canAccess}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-all shadow-sm ${
                !canAccess
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-green-200 hover:shadow-md'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </span>
              ) : !canAccess ? (
                'Purchase to Access'
              ) : (
                'Join Zoom Session'
              )}
            </button>
          )}

          {!isConnected && (
            <div className="text-center text-sm text-gray-500 py-2">
              Connect wallet to interact
            </div>
          )}
        </div>

        {/* Show zoom link if available */}
        {zoomLink && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-700 font-medium mb-1">Zoom Link:</p>
            <a
              href={zoomLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-orange-600 hover:text-orange-700 hover:underline break-all"
            >
              {zoomLink}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}