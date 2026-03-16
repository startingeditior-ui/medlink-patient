export interface Patient {
  id: string;
  patientId: string;
  name: string;
  phone: string;
  email?: string;
  bloodGroup?: string;
  allergies?: string[];
  chronicDiseases?: string[];
  emergencyContact?: string;
  profilePhoto?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  guardianName?: string;
  guardianMobile?: string;
  guardianLocation?: string;
  createdAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  hospitalName: string;
  specialization: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
}

export interface AccessRecord {
  id: string;
  patientId: string;
  doctorId: string;
  hospitalId: string;
  doctorName: string;
  hospitalName: string;
  specialization?: string;
  accessStartTime: string;
  accessExpiryTime: string;
  recordsViewed: string[];
  status: 'active' | 'expired' | 'revoked';
}

export interface Notification {
  id: string;
  patientId: string;
  type: 'access_granted' | 'access_revoked' | 'access_expired' | 'emergency_access';
  title: string;
  message: string;
  doctorName?: string;
  hospitalName?: string;
  accessTime?: string;
  createdAt: string;
  read: boolean;
}

export interface ConsentRequest {
  id: string;
  doctorId: string;
  doctorName: string;
  hospitalName: string;
  specialization: string;
  requestTime: string;
  recordsRequested: string[];
  status: 'pending' | 'approved' | 'rejected' | 'expired';
}

export interface EmergencyData {
  bloodGroup: string;
  allergies: string[];
  chronicDiseases: string[];
  emergencyContact: string;
}

export type AccessDuration = 6 | 12 | 24 | 48;

export interface BlockedHospital {
  id: string;
  hospitalId: string;
  hospitalName: string;
  blockedAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  description: string;
  doctorName?: string;
  hospitalName?: string;
  metadata?: any;
  createdAt: string;
}
