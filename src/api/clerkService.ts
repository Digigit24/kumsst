import { API_ENDPOINTS, API_BASE_URL } from "@/config/api.config";
import apiClient from "./apiClient";
import type { Student, StudentCreateInput, StudentUpdateInput, StudentFilters } from "@/types/students.types";
import type { FeeCollection, FeeCollectionCreateInput, FeeCollectionFilters } from "@/types/fees.types";
import type { PrintTemplate, PrintTemplateCreateInput, PrintTemplateUpdateInput, PrintTemplateFilters, PrintDocument, PrintDocumentCreateInput, PrintDocumentFilters, TemplateVariable } from "@/types/print.types";
import type { Notice, NoticeCreateInput, NoticeFilters } from "@/types/communication.types";
import type { College } from "@/types/core.types";
import type { PaginatedResponse } from "@/types/core.types";

// Students
export const getStudents = async (params?: StudentFilters): Promise<PaginatedResponse<Student>> => {
  const r = await apiClient.get(API_ENDPOINTS.students.list, { params });
  return r.data;
};
export const createStudent = async (data: StudentCreateInput): Promise<Student> => {
  const r = await apiClient.post(API_ENDPOINTS.students.create, data);
  return r.data;
};
export const updateStudent = async (id: number, data: StudentUpdateInput): Promise<Student> => {
  const r = await apiClient.put(API_ENDPOINTS.students.update(id), data);
  return r.data;
};

// Fees
export const getFeeCollections = async (params?: FeeCollectionFilters): Promise<PaginatedResponse<FeeCollection>> => {
  const r = await apiClient.get(API_ENDPOINTS.fees.feeCollections.list, { params });
  return r.data;
};
export const createFeeCollection = async (data: FeeCollectionCreateInput): Promise<FeeCollection> => {
  const r = await apiClient.post(API_ENDPOINTS.fees.feeCollections.list, data);
  return r.data;
};

// Print Templates
export const getPrintTemplates = async (params?: PrintTemplateFilters): Promise<PaginatedResponse<PrintTemplate>> => {
  const r = await apiClient.get(API_ENDPOINTS.print.templates.list, { params });
  return r.data;
};
export const createPrintTemplate = async (data: PrintTemplateCreateInput): Promise<PrintTemplate> => {
  const r = await apiClient.post(API_ENDPOINTS.print.templates.create, data);
  return r.data;
};
export const updatePrintTemplate = async (id: number, data: PrintTemplateUpdateInput): Promise<PrintTemplate> => {
  const r = await apiClient.put(API_ENDPOINTS.print.templates.detail(id), data);
  return r.data;
};
export const getTemplateVariables = async (id: number): Promise<TemplateVariable[]> => {
  const r = await apiClient.get(API_ENDPOINTS.print.templates.variables(id));
  return r.data;
};

// Print Documents
export const getPrintDocuments = async (params?: PrintDocumentFilters): Promise<PaginatedResponse<PrintDocument>> => {
  const r = await apiClient.get(API_ENDPOINTS.print.documents.list, { params });
  return r.data;
};
export const createPrintDocument = async (data: PrintDocumentCreateInput): Promise<PrintDocument> => {
  const r = await apiClient.post(API_ENDPOINTS.print.documents.create, data);
  return r.data;
};
export const updatePrintDocument = async (id: number, data: Partial<PrintDocument>): Promise<PrintDocument> => {
  const r = await apiClient.patch(API_ENDPOINTS.print.documents.patch(id), data);
  return r.data;
};
export const getPrintDocumentPdf = (id: number): string => {
  return `${API_BASE_URL}${API_ENDPOINTS.print.documents.pdf(id)}`;
};

// Notices (Communication)
const NOTICES_BASE = "/api/v1/communication/notices/";
export const getNotices = async (params?: NoticeFilters): Promise<PaginatedResponse<Notice>> => {
  const r = await apiClient.get(NOTICES_BASE, { params });
  return r.data;
};
export const createNotice = async (data: NoticeCreateInput): Promise<Notice> => {
  const r = await apiClient.post(NOTICES_BASE, data);
  return r.data;
};

// Colleges
export const getColleges = async (): Promise<College[]> => {
  const r = await apiClient.get(API_ENDPOINTS.colleges.list);
  return r.data.results || r.data;
};
