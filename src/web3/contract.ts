import { ethers } from 'ethers';
import { Course, CourseFormData } from '../types';

export class ContractService {
  private contract: ethers.Contract | null = null;
  private contractAddress: string = '';
  private contractABI: unknown[] = [];

  constructor() {
    this.loadContractInfo();
    // Initialize contract for read-only operations
    this.initializeReadOnlyContract();
  }

  private loadContractInfo() {
    try {
      // This will be populated after deployment
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const contractInfo = require('../constants/contract.json');
      this.contractAddress = contractInfo.address;
      this.contractABI = contractInfo.abi;
    } catch {
      console.warn('Contract info not found. Deploy the contract first.');
    }
  }

  private initializeReadOnlyContract(): void {
    if (this.contractAddress && this.contractABI.length) {
      try {
        const provider = new ethers.JsonRpcProvider('https://rpc.primordial.bdagscan.com');
        this.contract = new ethers.Contract(this.contractAddress, this.contractABI as ethers.InterfaceAbi, provider);
      } catch (error) {
        console.warn('Failed to initialize read-only contract:', error);
      }
    }
  }

  initializeContract(signer?: ethers.Signer): void {
    if (!this.contractAddress || !this.contractABI.length) {
      throw new Error('Contract address or ABI not found. Deploy the contract first.');
    }

    // Create provider for read-only operations if no signer provided
    if (!signer) {
      const provider = new ethers.JsonRpcProvider('https://rpc.primordial.bdagscan.com');
      this.contract = new ethers.Contract(this.contractAddress, this.contractABI as ethers.InterfaceAbi, provider);
    } else {
      this.contract = new ethers.Contract(this.contractAddress, this.contractABI as ethers.InterfaceAbi, signer);
    }
  }

  async createCourse(courseData: CourseFormData): Promise<number> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const priceInWei = ethers.parseEther(courseData.price);
      const tx = await this.contract.createCourse(
        courseData.title,
        courseData.description,
        priceInWei,
        courseData.zoomLink
      );

      const receipt = await tx.wait();
      
      // Get the course ID from the event
      const event = receipt?.logs.find((log: ethers.Log) => {
        try {
          const parsedLog = this.contract!.interface.parseLog({
            topics: log.topics,
            data: log.data
          });
          return parsedLog?.name === 'CourseCreated';
        } catch {
          return false;
        }
      });

      if (event) {
        const parsedEvent = this.contract.interface.parseLog({
          topics: event.topics,
          data: event.data
        });
        if (parsedEvent && parsedEvent.args) {
          return Number(parsedEvent.args.courseId);
        }
      }

      throw new Error('CourseCreated event not found');
    } catch (error) {
      console.error('Failed to create course:', error);
      throw error;
    }
  }

  async purchaseCourse(courseId: number, price: string): Promise<void> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const priceInWei = ethers.parseEther(price);
      const tx = await this.contract.purchaseCourse(courseId, { value: priceInWei });
      await tx.wait();
    } catch (error) {
      console.error('Failed to purchase course:', error);
      throw error;
    }
  }

  async getCourseInfo(courseId: number): Promise<Course> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const courseInfo = await this.contract.getCourseInfo(courseId);
      
      // Check if course exists (price being null/0 indicates non-existent course)
      if (!courseInfo || courseInfo[3] === null || courseInfo[3] === undefined) {
        throw new Error(`Course with ID ${courseId} does not exist`);
      }

      // The contract returns: [id, title, description, price, instructor, isActive, createdAt]
      return {
        id: Number(courseInfo[0]),
        title: courseInfo[1],
        description: courseInfo[2],
        price: ethers.formatEther(courseInfo[3]),
        instructor: courseInfo[4],
        isActive: courseInfo[5],
        createdAt: Number(courseInfo[6]),
      };
    } catch (error) {
      console.error(`Failed to get course info for course ID ${courseId}:`, error);
      throw error;
    }
  }

  async getCourseZoomLink(courseId: number): Promise<string> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      return await this.contract.getCourseZoomLink(courseId);
    } catch (error) {
      console.error('Failed to get zoom link:', error);
      throw error;
    }
  }

  async getAllActiveCourses(): Promise<number[]> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const courseIds = await this.contract.getAllActiveCourses();
      console.log('Raw course IDs from contract:', courseIds);
      
      const convertedIds = courseIds.map((id: bigint) => Number(id));
      console.log('Converted course IDs:', convertedIds);
      
      return convertedIds;
    } catch (error) {
      console.error('Failed to get active courses:', error);
      throw error;
    }
  }

  async getStudentCourses(address: string): Promise<number[]> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const courseIds = await this.contract.getStudentCourses(address);
      return courseIds.map((id: bigint) => Number(id));
    } catch (error) {
      console.error('Failed to get student courses:', error);
      throw error;
    }
  }

  async getInstructorCourses(address: string): Promise<number[]> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const courseIds = await this.contract.getInstructorCourses(address);
      return courseIds.map((id: bigint) => Number(id));
    } catch (error) {
      console.error('Failed to get instructor courses:', error);
      throw error;
    }
  }

  async isEnrolled(courseId: number, address: string): Promise<boolean> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      return await this.contract.isEnrolled(courseId, address);
    } catch (error) {
      console.error('Failed to check enrollment:', error);
      throw error;
    }
  }

  getContract(): ethers.Contract | null {
    return this.contract;
  }

  getContractAddress(): string {
    return this.contractAddress;
  }
}

export const contractService = new ContractService();