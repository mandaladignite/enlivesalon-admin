export interface Enquiry {
  _id: string;
  enquiryNumber: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  enquiryType: EnquiryType;
  priority: Priority;
  status: EnquiryStatus;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  userId?: {
    _id: string;
    name: string;
    email: string;
  };
  response?: {
    message: string;
    respondedBy?: {
      _id: string;
      name: string;
      email: string;
    };
    respondedAt?: string;
    responseMethod: ResponseMethod;
  };
  followUp?: {
    scheduledAt?: string;
    notes?: string;
    completed: boolean;
  };
  tags: string[];
  source: EnquirySource;
  isActive: boolean;
  resolvedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
  formattedCreatedAt?: string;
  daysSinceCreation?: number;
}

export type EnquiryType = 
  | "general" 
  | "appointment" 
  | "service" 
  | "product" 
  | "membership" 
  | "complaint" 
  | "feedback" 
  | "other";

export type Priority = "low" | "medium" | "high" | "urgent";

export type EnquiryStatus = 
  | "new" 
  | "in_progress" 
  | "responded" 
  | "resolved" 
  | "closed";

export type ResponseMethod = "email" | "phone" | "whatsapp" | "in_person";

export type EnquirySource = 
  | "website" 
  | "phone" 
  | "email" 
  | "walk_in" 
  | "social_media" 
  | "referral" 
  | "other";

export interface CreateEnquiryRequest {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  enquiryType?: EnquiryType;
  priority?: Priority;
  source?: EnquirySource;
  tags?: string[];
}

export interface UpdateEnquiryRequest {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  enquiryType?: EnquiryType;
  priority?: Priority;
  status?: EnquiryStatus;
  assignedTo?: string;
  tags?: string[];
}

export interface RespondToEnquiryRequest {
  message: string;
  responseMethod?: ResponseMethod;
}

export interface AssignEnquiryRequest {
  assignedTo: string;
}

export interface UpdateEnquiryStatusRequest {
  status: EnquiryStatus;
}

export interface BulkUpdateEnquiriesRequest {
  enquiryIds: string[];
  updateData: Partial<UpdateEnquiryRequest>;
}

export interface EnquiryFilters {
  page?: number;
  limit?: number;
  status?: EnquiryStatus;
  enquiryType?: EnquiryType;
  priority?: Priority;
  assignedTo?: string;
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "priority" | "status" | "name" | "subject";
  sortOrder?: "asc" | "desc";
}

export interface EnquiryStats {
  total: number;
  new: number;
  inProgress: number;
  responded: number;
  resolved: number;
  closed: number;
  urgent: number;
  high: number;
  medium: number;
  low: number;
}

export interface EnquiryByType {
  _id: EnquiryType;
  count: number;
  avgResponseTime?: number;
}

export interface EnquiryStatsResponse {
  stats: EnquiryStats;
  enquiriesByType: EnquiryByType[];
}

export interface EnquiryPaginationResponse {
  docs: Enquiry[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

export interface EnquiryFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  enquiryType: EnquiryType;
  priority: Priority;
  source: EnquirySource;
  tags: string[];
}

export interface EnquiryFormErrors {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  enquiryType?: string;
  priority?: string;
  source?: string;
  tags?: string;
}

export const ENQUIRY_TYPES: { value: EnquiryType; label: string }[] = [
  { value: "general", label: "General Inquiry" },
  { value: "appointment", label: "Appointment Booking" },
  { value: "service", label: "Service Information" },
  { value: "product", label: "Product Inquiry" },
  { value: "membership", label: "Membership Package" },
  { value: "complaint", label: "Complaint" },
  { value: "feedback", label: "Feedback" },
  { value: "other", label: "Other" }
];

export const PRIORITY_LEVELS: { value: Priority; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "green" },
  { value: "medium", label: "Medium", color: "yellow" },
  { value: "high", label: "High", color: "orange" },
  { value: "urgent", label: "Urgent", color: "red" }
];

export const ENQUIRY_STATUSES: { value: EnquiryStatus; label: string; color: string }[] = [
  { value: "new", label: "New", color: "blue" },
  { value: "in_progress", label: "In Progress", color: "yellow" },
  { value: "responded", label: "Responded", color: "green" },
  { value: "resolved", label: "Resolved", color: "green" },
  { value: "closed", label: "Closed", color: "gray" }
];

export const RESPONSE_METHODS: { value: ResponseMethod; label: string }[] = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone Call" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "in_person", label: "In Person" }
];

export const ENQUIRY_SOURCES: { value: EnquirySource; label: string }[] = [
  { value: "website", label: "Website" },
  { value: "phone", label: "Phone" },
  { value: "email", label: "Email" },
  { value: "walk_in", label: "Walk-in" },
  { value: "social_media", label: "Social Media" },
  { value: "referral", label: "Referral" },
  { value: "other", label: "Other" }
];
