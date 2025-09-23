'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { walletService } from '../web3/wallet';
import { contractService } from '../web3/contract';
import { WalletContextType, ContractContextType, CourseFormData } from '../types';

const WalletContext = createContext<WalletContextType | null>(null);
const ContractContext = createContext<ContractContextType | null>(null);

interface ProvidersProps {
  children: ReactNode;
}

export function WalletProvider({ children }: ProvidersProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  const connect = async () => {
    try {
      const { address: walletAddress, signer: walletSigner } = await walletService.connectWallet();
      await walletService.switchToBlockDAGNetwork();
      
      setAddress(walletAddress);
      setSigner(walletSigner);
      
      const walletBalance = await walletService.getBalance(walletAddress);
      setBalance(walletBalance);
      
      // Initialize contract with signer
      contractService.initializeContract(walletSigner);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const disconnect = () => {
    setAddress(null);
    setBalance('0');
    setSigner(null);
  };

  // Check if wallet is already connected on page load
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && Array.isArray(accounts) && accounts.length > 0) {
            await connect();
          }
        } catch (error) {
          console.error('Failed to check wallet connection:', error);
        }
      }
    };

    checkConnection();
  }, []);

  const value: WalletContextType = {
    address,
    isConnected: !!address,
    balance,
    connect,
    disconnect,
    signer,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function ContractProvider({ children }: ProvidersProps) {
  const { signer } = useWallet();

  const createCourse = async (courseData: CourseFormData): Promise<number> => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }
    return await contractService.createCourse(courseData);
  };

  const purchaseCourse = async (courseId: number, price: string): Promise<void> => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }
    return await contractService.purchaseCourse(courseId, price);
  };

  const getCourseInfo = async (courseId: number) => {
    return await contractService.getCourseInfo(courseId);
  };

  const getCourseZoomLink = async (courseId: number): Promise<string> => {
    return await contractService.getCourseZoomLink(courseId);
  };

  const getAllActiveCourses = async (): Promise<number[]> => {
    return await contractService.getAllActiveCourses();
  };

  const getStudentCourses = async (address: string): Promise<number[]> => {
    return await contractService.getStudentCourses(address);
  };

  const getInstructorCourses = async (address: string): Promise<number[]> => {
    return await contractService.getInstructorCourses(address);
  };

  const isEnrolled = async (courseId: number, address: string): Promise<boolean> => {
    return await contractService.isEnrolled(courseId, address);
  };

  const value: ContractContextType = {
    contract: contractService.getContract(),
    createCourse,
    purchaseCourse,
    getCourseInfo,
    getCourseZoomLink,
    getAllActiveCourses,
    getStudentCourses,
    getInstructorCourses,
    isEnrolled,
  };

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
}

export function AppProviders({ children }: ProvidersProps) {
  return (
    <WalletProvider>
      <ContractProvider>
        {children}
      </ContractProvider>
    </WalletProvider>
  );
}

export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

export function useContract(): ContractContextType {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error('useContract must be used within a ContractProvider');
  }
  return context;
}