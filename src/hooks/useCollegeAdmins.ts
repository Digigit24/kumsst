/**
 * Hook to fetch college admin users
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { buildApiUrl, getDefaultHeaders } from '../config/api.config';

export interface CollegeAdmin {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  college: number;
}

interface CollegeAdminsResponse {
  count: number;
  results: CollegeAdmin[];
}

const fetchCollegeAdmins = async (collegeId?: number): Promise<CollegeAdmin[]> => {
  const url = collegeId
    ? buildApiUrl(`/api/v1/accounts/users/by-type/college_admin/?college=${collegeId}`)
    : buildApiUrl('/api/v1/accounts/users/by-type/college_admin/');
  
  const headers = new Headers();
  const defaultHeaders = getDefaultHeaders();
  Object.entries(defaultHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  const response = await fetch(url, {
    headers,
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch college admins');
  }
  
  const data: CollegeAdminsResponse = await response.json();
  return data.results || [];
};

/**
 * Fetch college admin users for approver selection
 */
export const useCollegeAdmins = (collegeId?: number): UseQueryResult<CollegeAdmin[], Error> => {
  return useQuery({
    queryKey: ['college-admins', collegeId],
    queryFn: () => fetchCollegeAdmins(collegeId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!collegeId, // Only fetch if collegeId is provided
  });
};
