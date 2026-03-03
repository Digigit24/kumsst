/**
 * HR Module API Service
 * All API calls for HR entities
 */

import { buildApiUrl, getDefaultHeaders } from '../config/api.config';
import { DROPDOWN_PAGE_SIZE } from '../config/app.config';
import type { PaginatedResponse } from '../types/core.types';
import type {
  Deduction,
  DeductionCreateInput,
  DeductionUpdateInput,
  DeductionFilters,
  LeaveType,
  LeaveTypeCreateInput,
  LeaveTypeUpdateInput,
  LeaveTypeFilters,
  LeaveApplication,
  LeaveApplicationCreateInput,
  LeaveApplicationUpdateInput,
  LeaveApplicationFilters,
  LeaveApproval,
  LeaveApprovalCreateInput,
  LeaveApprovalUpdateInput,
  LeaveApprovalFilters,
  LeaveBalance,
  LeaveBalanceCreateInput,
  LeaveBalanceUpdateInput,
  LeaveBalanceFilters,
  SalaryStructure,
  SalaryStructureCreateInput,
  SalaryStructureUpdateInput,
  SalaryStructureFilters,
  SalaryComponent,
  SalaryComponentCreateInput,
  SalaryComponentUpdateInput,
  SalaryComponentFilters,
  Payroll,
  PayrollCreateInput,
  PayrollUpdateInput,
  PayrollFilters,
  PayrollItem,
  PayrollItemCreateInput,
  PayrollItemUpdateInput,
  PayrollItemFilters,
  Payslip,
  PayslipCreateInput,
  PayslipUpdateInput,
  PayslipFilters,
} from '../types/hr.types';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const buildQueryString = (params: Record<string, any>): string => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });
  const qs = queryParams.toString();
  return qs ? `?${qs}` : '';
};

const fetchApi = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const token = localStorage.getItem('access_token');

  const headers = new Headers();
  const defaultHeaders = getDefaultHeaders();
  Object.entries(defaultHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  if (options?.headers) {
    const customHeaders = options.headers;
    if (customHeaders instanceof Headers) {
      customHeaders.forEach((value, key) => headers.set(key, value));
    } else if (Array.isArray(customHeaders)) {
      customHeaders.forEach(([key, value]) => headers.set(key, value));
    } else {
      Object.entries(customHeaders as Record<string, string>).forEach(([key, value]) => {
        headers.set(key, value);
      });
    }
  }

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

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
};

// ============================================================================
// TEACHERS API (for dropdowns)
// ============================================================================

export const teachersApi = {
  list: async (filters?: any): Promise<PaginatedResponse<any>> => {
    const queryString = buildQueryString({ user_type: 'teacher', page_size: DROPDOWN_PAGE_SIZE, ...filters });
    return fetchApi<PaginatedResponse<any>>(
      buildApiUrl(`/api/v1/accounts/users/${queryString}`)
    );
  },
};

// ============================================================================
// DEDUCTIONS API
// ============================================================================

export const deductionsApi = {
  list: async (filters?: DeductionFilters): Promise<PaginatedResponse<Deduction>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<Deduction>>(
      buildApiUrl(`/api/v1/hr/deductions/${queryString}`)
    );
  },

  get: async (id: number): Promise<Deduction> => {
    return fetchApi<Deduction>(buildApiUrl(`/api/v1/hr/deductions/${id}/`));
  },

  create: async (data: DeductionCreateInput): Promise<Deduction> => {
    return fetchApi<Deduction>(buildApiUrl('/api/v1/hr/deductions/'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: DeductionUpdateInput): Promise<Deduction> => {
    return fetchApi<Deduction>(buildApiUrl(`/api/v1/hr/deductions/${id}/`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<DeductionUpdateInput>): Promise<Deduction> => {
    return fetchApi<Deduction>(buildApiUrl(`/api/v1/hr/deductions/${id}/`), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(`/api/v1/hr/deductions/${id}/`), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// LEAVE TYPES API
// ============================================================================

export const leaveTypesApi = {
  list: async (filters?: LeaveTypeFilters): Promise<PaginatedResponse<LeaveType>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<LeaveType>>(
      buildApiUrl(`/api/v1/hr/leave-types/${queryString}`)
    );
  },

  get: async (id: number): Promise<LeaveType> => {
    return fetchApi<LeaveType>(buildApiUrl(`/api/v1/hr/leave-types/${id}/`));
  },

  create: async (data: LeaveTypeCreateInput): Promise<LeaveType> => {
    return fetchApi<LeaveType>(buildApiUrl('/api/v1/hr/leave-types/'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: LeaveTypeUpdateInput): Promise<LeaveType> => {
    return fetchApi<LeaveType>(buildApiUrl(`/api/v1/hr/leave-types/${id}/`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<LeaveTypeUpdateInput>): Promise<LeaveType> => {
    return fetchApi<LeaveType>(buildApiUrl(`/api/v1/hr/leave-types/${id}/`), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(`/api/v1/hr/leave-types/${id}/`), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// LEAVE APPLICATIONS API
// ============================================================================

export const leaveApplicationsApi = {
  list: async (filters?: LeaveApplicationFilters): Promise<PaginatedResponse<LeaveApplication>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<LeaveApplication>>(
      buildApiUrl(`/api/v1/hr/leave-applications/${queryString}`)
    );
  },

  get: async (id: number): Promise<LeaveApplication> => {
    return fetchApi<LeaveApplication>(buildApiUrl(`/api/v1/hr/leave-applications/${id}/`));
  },

  create: async (data: LeaveApplicationCreateInput): Promise<LeaveApplication> => {
    return fetchApi<LeaveApplication>(buildApiUrl('/api/v1/hr/leave-applications/'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: LeaveApplicationUpdateInput): Promise<LeaveApplication> => {
    return fetchApi<LeaveApplication>(buildApiUrl(`/api/v1/hr/leave-applications/${id}/`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<LeaveApplicationUpdateInput>): Promise<LeaveApplication> => {
    return fetchApi<LeaveApplication>(buildApiUrl(`/api/v1/hr/leave-applications/${id}/`), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(`/api/v1/hr/leave-applications/${id}/`), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// LEAVE APPROVALS API
// ============================================================================

export const leaveApprovalsApi = {
  list: async (filters?: LeaveApprovalFilters): Promise<PaginatedResponse<LeaveApproval>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<LeaveApproval>>(
      buildApiUrl(`/api/v1/hr/leave-approvals/${queryString}`)
    );
  },

  get: async (id: number): Promise<LeaveApproval> => {
    return fetchApi<LeaveApproval>(buildApiUrl(`/api/v1/hr/leave-approvals/${id}/`));
  },

  create: async (data: LeaveApprovalCreateInput): Promise<LeaveApproval> => {
    return fetchApi<LeaveApproval>(buildApiUrl('/api/v1/hr/leave-approvals/'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: LeaveApprovalUpdateInput): Promise<LeaveApproval> => {
    return fetchApi<LeaveApproval>(buildApiUrl(`/api/v1/hr/leave-approvals/${id}/`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<LeaveApprovalUpdateInput>): Promise<LeaveApproval> => {
    return fetchApi<LeaveApproval>(buildApiUrl(`/api/v1/hr/leave-approvals/${id}/`), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(`/api/v1/hr/leave-approvals/${id}/`), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// LEAVE BALANCES API
// ============================================================================

export const leaveBalancesApi = {
  list: async (filters?: LeaveBalanceFilters): Promise<PaginatedResponse<LeaveBalance>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<LeaveBalance>>(
      buildApiUrl(`/api/v1/hr/leave-balances/${queryString}`)
    );
  },

  get: async (id: number): Promise<LeaveBalance> => {
    return fetchApi<LeaveBalance>(buildApiUrl(`/api/v1/hr/leave-balances/${id}/`));
  },

  create: async (data: LeaveBalanceCreateInput): Promise<LeaveBalance> => {
    return fetchApi<LeaveBalance>(buildApiUrl('/api/v1/hr/leave-balances/'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: LeaveBalanceUpdateInput): Promise<LeaveBalance> => {
    return fetchApi<LeaveBalance>(buildApiUrl(`/api/v1/hr/leave-balances/${id}/`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<LeaveBalanceUpdateInput>): Promise<LeaveBalance> => {
    return fetchApi<LeaveBalance>(buildApiUrl(`/api/v1/hr/leave-balances/${id}/`), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(`/api/v1/hr/leave-balances/${id}/`), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// SALARY STRUCTURES API
// ============================================================================

export const salaryStructuresApi = {
  list: async (filters?: SalaryStructureFilters): Promise<PaginatedResponse<SalaryStructure>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<SalaryStructure>>(
      buildApiUrl(`/api/v1/hr/salary-structures/${queryString}`)
    );
  },

  get: async (id: number): Promise<SalaryStructure> => {
    return fetchApi<SalaryStructure>(buildApiUrl(`/api/v1/hr/salary-structures/${id}/`));
  },

  create: async (data: SalaryStructureCreateInput): Promise<SalaryStructure> => {
    return fetchApi<SalaryStructure>(buildApiUrl('/api/v1/hr/salary-structures/'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: SalaryStructureUpdateInput): Promise<SalaryStructure> => {
    return fetchApi<SalaryStructure>(buildApiUrl(`/api/v1/hr/salary-structures/${id}/`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<SalaryStructureUpdateInput>): Promise<SalaryStructure> => {
    return fetchApi<SalaryStructure>(buildApiUrl(`/api/v1/hr/salary-structures/${id}/`), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(`/api/v1/hr/salary-structures/${id}/`), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// SALARY COMPONENTS API
// ============================================================================

export const salaryComponentsApi = {
  list: async (filters?: SalaryComponentFilters): Promise<PaginatedResponse<SalaryComponent>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<SalaryComponent>>(
      buildApiUrl(`/api/v1/hr/salary-components/${queryString}`)
    );
  },

  get: async (id: number): Promise<SalaryComponent> => {
    return fetchApi<SalaryComponent>(buildApiUrl(`/api/v1/hr/salary-components/${id}/`));
  },

  create: async (data: SalaryComponentCreateInput): Promise<SalaryComponent> => {
    return fetchApi<SalaryComponent>(buildApiUrl('/api/v1/hr/salary-components/'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: SalaryComponentUpdateInput): Promise<SalaryComponent> => {
    return fetchApi<SalaryComponent>(buildApiUrl(`/api/v1/hr/salary-components/${id}/`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<SalaryComponentUpdateInput>): Promise<SalaryComponent> => {
    return fetchApi<SalaryComponent>(buildApiUrl(`/api/v1/hr/salary-components/${id}/`), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(`/api/v1/hr/salary-components/${id}/`), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// PAYROLLS API
// ============================================================================

export const payrollsApi = {
  list: async (filters?: PayrollFilters): Promise<PaginatedResponse<Payroll>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<Payroll>>(
      buildApiUrl(`/api/v1/hr/payrolls/${queryString}`)
    );
  },

  get: async (id: number): Promise<Payroll> => {
    return fetchApi<Payroll>(buildApiUrl(`/api/v1/hr/payrolls/${id}/`));
  },

  create: async (data: PayrollCreateInput): Promise<Payroll> => {
    return fetchApi<Payroll>(buildApiUrl('/api/v1/hr/payrolls/'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: PayrollUpdateInput): Promise<Payroll> => {
    return fetchApi<Payroll>(buildApiUrl(`/api/v1/hr/payrolls/${id}/`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<PayrollUpdateInput>): Promise<Payroll> => {
    return fetchApi<Payroll>(buildApiUrl(`/api/v1/hr/payrolls/${id}/`), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(`/api/v1/hr/payrolls/${id}/`), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// PAYROLL ITEMS API
// ============================================================================

export const payrollItemsApi = {
  list: async (filters?: PayrollItemFilters): Promise<PaginatedResponse<PayrollItem>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<PayrollItem>>(
      buildApiUrl(`/api/v1/hr/payroll-items/${queryString}`)
    );
  },

  get: async (id: number): Promise<PayrollItem> => {
    return fetchApi<PayrollItem>(buildApiUrl(`/api/v1/hr/payroll-items/${id}/`));
  },

  create: async (data: PayrollItemCreateInput): Promise<PayrollItem> => {
    return fetchApi<PayrollItem>(buildApiUrl('/api/v1/hr/payroll-items/'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: PayrollItemUpdateInput): Promise<PayrollItem> => {
    return fetchApi<PayrollItem>(buildApiUrl(`/api/v1/hr/payroll-items/${id}/`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<PayrollItemUpdateInput>): Promise<PayrollItem> => {
    return fetchApi<PayrollItem>(buildApiUrl(`/api/v1/hr/payroll-items/${id}/`), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(`/api/v1/hr/payroll-items/${id}/`), {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// PAYSLIPS API
// ============================================================================

export const payslipsApi = {
  list: async (filters?: PayslipFilters): Promise<PaginatedResponse<Payslip>> => {
    const queryString = buildQueryString(filters || {});
    return fetchApi<PaginatedResponse<Payslip>>(
      buildApiUrl(`/api/v1/hr/payslips/${queryString}`)
    );
  },

  get: async (id: number): Promise<Payslip> => {
    return fetchApi<Payslip>(buildApiUrl(`/api/v1/hr/payslips/${id}/`));
  },

  create: async (data: PayslipCreateInput): Promise<Payslip> => {
    return fetchApi<Payslip>(buildApiUrl('/api/v1/hr/payslips/'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: PayslipUpdateInput): Promise<Payslip> => {
    return fetchApi<Payslip>(buildApiUrl(`/api/v1/hr/payslips/${id}/`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: number, data: Partial<PayslipUpdateInput>): Promise<Payslip> => {
    return fetchApi<Payslip>(buildApiUrl(`/api/v1/hr/payslips/${id}/`), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchApi<void>(buildApiUrl(`/api/v1/hr/payslips/${id}/`), {
      method: 'DELETE',
    });
  },
};
