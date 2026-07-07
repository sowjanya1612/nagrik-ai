export interface Scheme {
  id: string;
  name: string;
  ministry: string;
  category: string;
  description: string;
  benefits: string[];
  eligibilitySummary: string;
  requiredDocs: string[];
  officialLink: string;
  matchScore?: number;
  matchReason?: string;
}

export interface Complaint {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  status: 'Reported' | 'Acknowledged' | 'In Progress' | 'Resolved';
  statusText: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  affectedCount: number;
  updates: Array<{
    date: string;
    text: string;
    status: 'Reported' | 'Acknowledged' | 'In Progress' | 'Resolved';
  }>;
}

export interface DocumentChecklistItem {
  id: string;
  name: string;
  description: string;
  required: boolean;
  uploaded?: boolean;
  fileName?: string;
  status?: 'pending' | 'checking' | 'verified' | 'unclear';
  feedback?: string;
}

export interface DocumentService {
  id: string;
  name: string;
  description: string;
  category: string;
  checklist: DocumentChecklistItem[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'sathi';
  text: string;
  timestamp: string;
  citations?: string[];
  jargon?: Array<{ term: string; explanation: string }>;
  isVoice?: boolean;
}

export interface UserProfile {
  nagrikId: string;
  fullName: string;
  age: number;
  state: string;
  income: number; // annual in INR
  occupation: string;
  category: string; // e.g., General, OBC, SC, ST, EWS
  gender: string;
  isFarmer: boolean;
  isStudent: boolean;
}
