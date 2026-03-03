import { useQuery } from '@tanstack/react-query';
import { API_ENDPOINTS, buildApiUrl, getDefaultHeaders } from '../config/api.config';
import type { PaginatedResponse } from '../types/core.types';
import { useAuth } from './useAuth';

export interface AssignedClass {
  assignment_id: number;
  program_id: number;
  program_name: string;
  program_short_name: string;
  class_id: number;
  class_name: string;
  semester: number;
  section_id: number;
  section_name: string;
  subject_id: number;
  subject_name: string;
}

export interface UserProfile {
  id: number;
  college: number;
  college_name: string;
  user: string;
  user_name: string;
  department: number;
  department_name: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
  blood_group: string;
  nationality: string;
  religion: string;
  caste: string;
  profile_data: string;
  linkedin_url: string;
  website_url: string;
  bio: string;
  is_active: boolean;
  created_by_name: string;
  updated_by_name: string;
  created_at: string;
  updated_at: string;
  assigned_classes?: AssignedClass[];
  teacher_profile?: {
    assigned_classes: AssignedClass[];
  };
  student_profile?: {
    id: number;
    admission_number: string;
    program_id: number;
    program_name: string;
    program_short_name: string;
    class_id: number;
    class_name: string;
    semester: number;
    section_id: number;
    section_name: string;
  };
}

const fetchApi = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const token = localStorage.getItem('access_token');
  const headers = new Headers(getDefaultHeaders());

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      message: (typeof errorData.detail === 'string' ? errorData.detail : typeof errorData.message === 'string' ? errorData.message : typeof errorData.error === 'string' ? errorData.error : 'Request failed'),
      status: response.status,
      errors: errorData,
    };
  }

  return response.json();
};

export const useUserProfile = () => {
  const { user } = useAuth();
  // Safe cast since runtime user likely has ID, but types are disconnected
  const userId = (user as any)?.id;

  return useQuery({
    queryKey: ['userProfile', 'me', userId],
    queryFn: async () => {
      try {
        // Try the 'me' endpoint first
        return await fetchApi<UserProfile>(buildApiUrl(API_ENDPOINTS.userProfiles.me));
      } catch (error: any) {
        // If 404 Not Found and we have a user ID, try filtering the list by user ID
        // This is a common fallback if the 'me' action isn't explicitly defined
        if (error.status === 404 && userId) {
          const response = await fetchApi<PaginatedResponse<UserProfile>>(
            buildApiUrl(`${API_ENDPOINTS.userProfiles.list}?user=${userId}`)
          );
          if (response.results && response.results.length > 0) {
            return response.results[0];
          }
        }
        // If fallback fails or is not applicable, re-throw the original error
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!userId || !!localStorage.getItem('access_token'), // Run query if we have a user or a token in storage
    retry: 1,
  });
};
