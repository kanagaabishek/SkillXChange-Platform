'use client';

import Link from 'next/link';
import { useWallet } from '../hooks/useBlockchain';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { address, isConnected, balance, connect, disconnect } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    if (isConnected) {
      disconnect();
      toast.success('Wallet disconnected');
    } else {
      setIsLoading(true);
      try {
        await connect();
        toast.success('Wallet connected successfully');
      } catch (error) {
        console.error('Connection error:', error);
        toast.error('Failed to connect wallet');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatBalance = (bal: string) => {
    return `${parseFloat(bal).toFixed(4)} BDAG`;
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              {/* <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">S</span>
              </div> */}
              <span className="text-xl font-bold text-gray-900">SkillXChange</span>
            </Link>
          </div>

          {/* Navigation links */}
          <div className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-8">
              <Link 
                href="/" 
                className="text-gray-600 hover:text-orange-600 transition-colors font-medium"
              >
                Home
              </Link>
              <Link 
                href="/marketplace" 
                className="text-gray-600 hover:text-orange-600 transition-colors font-medium"
              >
                Marketplace
              </Link>
              <Link 
                href="/create-course" 
                className="text-gray-600 hover:text-orange-600 transition-colors font-medium"
              >
                Teach
              </Link>
              {isConnected && (
                <Link 
                  href="/my-courses" 
                  className="text-gray-600 hover:text-orange-600 transition-colors font-medium"
                >
                  Profile
                </Link>
              )}
            </div>
          </div>

          {/* Wallet connection */}
          <div className="flex items-center justify-end space-x-4 flex-shrink-0">
            {isConnected && (
              <div className="hidden sm:flex flex-col items-end text-right text-sm">
                <span className="text-gray-600 font-medium">{formatAddress(address!)}</span>
                <span className="text-orange-600 font-semibold">{formatBalance(balance)}</span>
              </div>
            )}
            
            <button
              onClick={handleConnect}
              disabled={isLoading}
              className={`px-6 py-2 rounded-lg font-medium transition-all shadow-sm whitespace-nowrap ${
                isConnected
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-red-200'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-orange-200'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
            >
              {isLoading ? (
                <span className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Connecting...</span>
                </span>
              ) : isConnected ? (
                'Disconnect'
              ) : (
                'Connect Wallet'
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden pb-4">
          <div className="flex flex-col space-y-2">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-orange-600 transition-colors py-2 font-medium"
            >
              Home
            </Link>
            <Link 
              href="/marketplace" 
              className="text-gray-600 hover:text-orange-600 transition-colors py-2 font-medium"
            >
              Marketplace
            </Link>
            <Link 
              href="/create-course" 
              className="text-gray-600 hover:text-orange-600 transition-colors py-2 font-medium"
            >
              Create Course
            </Link>
            {isConnected && (
              <Link 
                href="/my-courses" 
                className="text-gray-600 hover:text-orange-600 transition-colors py-2 font-medium"
              >
                My Courses
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}