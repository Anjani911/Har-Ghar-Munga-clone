// API Configuration
const API_BASE_URL = 'https://grx6djfl-5000.inc1.devtunnels.ms'; // Change this to your actual backend URL

// API Response Types
export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    id?: string;
    username?: string;
    role?: 'admin' | 'anganwadi' | 'family' | string;
    name?: string;
    centerCode?: string;
    centerName?: string;
    district?: string;
    block?: string;
  };
  token?: string;
  [key: string]: any; // Allow additional properties
}

export interface FamilyRegistrationData {
  // Child Information
  childName: string;
  gender: 'लड़का' | 'लड़की';
  dateOfBirth: string;
  age: string;
  weight: string;
  height: string;
  
  // Parent Information
  motherName: string;
  fatherName: string;
  mobileNumber: string;
  village: string;
  ward: string;
  panchayat: string;
  district: string;
  
  // Plant Information
  distributionDate: string;
  
  // Center Information
  anganwadiCenterName: string;
  anganwadiCode: string;
  workerName: string;
  workerCode: string;
  block: string;
  registrationDate: string;
  
  // Photos
  plantPhoto: string | null;
  pledgePhoto: string | null;
}

export interface FamilyData {
  id: string;
  childName: string;
  parentName: string;
  mobileNumber: string;
  village: string;
  registrationDate: string;
  plantDistributed: boolean;
  centerCode: string;
  centerName: string;
  workerName: string;
  status: 'active' | 'inactive';
  totalImagesYet?: number;
  plant_photo?: string | null;
  pledge_photo?: string | null;
  motherName?: string;
  fatherName?: string;
  anganwadiCode?: string;
}

export interface ProgressReportData {
  period: 'week' | 'month' | 'year';
  totalFamilies: number;
  distributedPlants: number;
  successRate: number;
  newAdded: number;
  activities: Array<{
    date: string;
    activity: string;
    type: 'registration' | 'distribution' | 'photo_upload' | 'progress_update';
  }>;
}

export interface PhotoUploadData {
  familyId: string;
  plantStage: string;
  description?: string;
  photoUri: string;
}

// API Service Class
class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // Set authentication token
  setToken(token: string) {
    this.token = token;
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
  }

  // Get headers for API requests
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic API request method
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: this.getHeaders(),
    };

    console.log('Making API request to:', url);
    console.log('Request config:', config);

    try {
      const response = await fetch(url, config);
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error text:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      return data;}
      catch (error: any) {
      console.error(`API request to ${url} failed.`);
      if (error?.message) {
      console.error('Error message:', error.message);
  }
      if (typeof error === 'object') {
    console.error('Full error object:', JSON.stringify(error));
  }
    throw error;
}

  }

  // Test connection
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(this.baseURL);
      console.log('Test connection response:', response.status);
      return { success: response.ok, message: `Server responded with status: ${response.status}` };
    } catch (error) {
      console.error('Test connection failed:', error);
      return { success: false, message: `Connection failed: ${error}` };
    }
  }

  // Authentication APIs
  async login(username: string, password: string): Promise<LoginResponse> {
    return this.makeRequest<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>('/logout', {
      method: 'POST',
    });
  }

  async register(userData: any): Promise<{ success: boolean; message: string; userId?: string }> {
    return this.makeRequest<{ success: boolean; message: string; userId?: string }>('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getDetails(): Promise<any> {
    return this.makeRequest<any>('/details', {
      method: 'GET',
    });
  }

  // Family Registration APIs
  async registerFamily(familyData: FamilyRegistrationData): Promise<{
    success: boolean;
    message: string;
    familyId: string;
  }> {
    return this.makeRequest<{
      success: boolean;
      message: string;
      familyId: string;
    }>('/families/register', {
      method: 'POST',
      body: JSON.stringify(familyData),
    });
  }

  async getFamilies(centerCode?: string): Promise<FamilyData[]> {
    const endpoint = centerCode ? `/families?centerCode=${centerCode}` : '/families';
    return this.makeRequest<FamilyData[]>(endpoint, {
      method: 'GET',
    });
  }

  async searchFamilies(query: string, centerCode?: string): Promise<FamilyData[]> {
    const endpoint = centerCode 
      ? `/families/search?q=${encodeURIComponent(query)}&centerCode=${centerCode}`
      : `/families/search?q=${encodeURIComponent(query)}`;
    return this.makeRequest<FamilyData[]>(endpoint, {
      method: 'GET',
    });
  }

  async getFamilyDetails(familyId: string): Promise<FamilyData> {
    return this.makeRequest<FamilyData>(`/families/${familyId}`, {
      method: 'GET',
    });
  }

  async getFamilyByUserId(userId: string): Promise<FamilyData> {
    return this.makeRequest<FamilyData>(`/families/user/${userId}`, {
      method: 'GET',
    });
  }

  async updateFamily(familyId: string, updateData: Partial<FamilyData>): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.makeRequest<{ success: boolean; message: string }>(`/families/${familyId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // Photo Upload APIs
  async uploadPhoto(photoData: PhotoUploadData): Promise<{
    success: boolean;
    message: string;
    photoId: string;
  }> {
    return this.makeRequest<{
      success: boolean;
      message: string;
      photoId: string;
    }>('/photos/upload', {
      method: 'POST',
      body: JSON.stringify(photoData),
    });
  }

  async getFamilyPhotos(familyId: string): Promise<Array<{
    id: string;
    photoUri: string;
    plantStage: string;
    description?: string;
    uploadDate: string;
  }>> {
    return this.makeRequest<Array<{
      id: string;
      photoUri: string;
      plantStage: string;
      description?: string;
      uploadDate: string;
    }>>(`/photos/family/${familyId}`, {
      method: 'GET',
    });
  }

  // Progress Report APIs
  async getProgressReport(period: 'week' | 'month' | 'year', centerCode?: string): Promise<ProgressReportData> {
    const endpoint = centerCode 
      ? `/reports/progress?period=${period}&centerCode=${centerCode}`
      : `/reports/progress?period=${period}`;
    return this.makeRequest<ProgressReportData>(endpoint, {
      method: 'GET',
    });
  }

  async exportReport(period: 'week' | 'month' | 'year', centerCode?: string): Promise<{
    success: boolean;
    message: string;
    downloadUrl: string;
  }> {
    const endpoint = centerCode 
      ? `/reports/export?period=${period}&centerCode=${centerCode}`
      : `/reports/export?period=${period}`;
    return this.makeRequest<{
      success: boolean;
      message: string;
      downloadUrl: string;
    }>(endpoint, {
      method: 'GET',
    });
  }

  // Dashboard Statistics APIs
  async getDashboardStats(centerCode?: string): Promise<{
    totalFamilies: number;
    distributedPlants: number;
    activeFamilies: number;
    successRate: number;
    recentActivities: Array<{
      date: string;
      activity: string;
      type: string;
    }>;
  }> {
    const endpoint = centerCode ? `/dashboard/stats?centerCode=${centerCode}` : '/dashboard/stats';
    return this.makeRequest<{
      totalFamilies: number;
      distributedPlants: number;
      activeFamilies: number;
      successRate: number;
      recentActivities: Array<{
        date: string;
        activity: string;
        type: string;
      }>;
    }>(endpoint, {
      method: 'GET',
    });
  }

  // Plant Options APIs
  async getPlantOptions(): Promise<Array<{
    id: number;
    name: string;
    hindiName: string;
    emoji: string;
    description: string;
  }>> {
    return this.makeRequest<Array<{
      id: number;
      name: string;
      hindiName: string;
      emoji: string;
      description: string;
    }>>('/plants/options', {
      method: 'GET',
    });
  }

  // File Upload Helper
  async uploadFile(fileUri: string, type: 'photo' | 'document'): Promise<{
    success: boolean;
    message: string;
    fileUrl: string;
  }> {
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    } as any);
    formData.append('type', type);

    const url = `${this.baseURL}/upload/file`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  // Get total images uploaded (global)
  async getTotalImages(): Promise<{ totalImages: number }> {
    return this.makeRequest<{ totalImages: number }>('/photos/total', {
      method: 'GET',
    });
  }
}

// Create and export API service instance
export const apiService = new ApiService(API_BASE_URL); 