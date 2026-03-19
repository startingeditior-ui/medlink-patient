import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type AuditAction =
  | 'CONSENT_REQUESTED'
  | 'CONSENT_APPROVED'
  | 'CONSENT_REJECTED'
  | 'ACCESS_GRANTED'
  | 'ACCESS_REVOKED'
  | 'ACCESS_EXTENDED'
  | 'PROFILE_UPDATED'
  | 'HOSPITAL_BLOCKED'
  | 'HOSPITAL_UNBLOCKED'
  | 'OTP_VERIFIED'
  | 'NOTIFICATION_SENT'
  | 'WELCOME_EMAIL_SENT'
  | 'RECORD_ADDED'
  | 'RECORD_UPDATED'
  | 'RECORD_DELETED';

export interface AuditLogData {
  // The primary actor — use patientId if available, else doctorId
  patientId?: string;
  doctorId?: string;
  hospitalId?: string;
  action: AuditAction;
  description: string;
  metadata?: any;
  ipAddress?: string;
}

export const createAuditLog = async (data: AuditLogData) => {
  try {
    // Cloud audit_logs uses actorId — resolve actor from patientId/doctorId
    let actorId: string | null = null;
    let actorRole: 'PATIENT' | 'DOCTOR' | 'HOSPITAL_ADMIN' | 'SYSTEM_ADMIN' | 'NURSE' = 'PATIENT';

    if (data.patientId) {
      // Look up the patient's userId as actorId
      const patient = await prisma.patient.findUnique({
        where: { id: data.patientId },
        select: { userId: true }
      });
      actorId = patient?.userId ?? data.patientId;
      actorRole = 'PATIENT';
    } else if (data.doctorId) {
      const doctor = await prisma.doctor.findUnique({
        where: { id: data.doctorId },
        select: { userId: true }
      });
      actorId = doctor?.userId ?? data.doctorId;
      actorRole = 'DOCTOR';
    } else if (data.hospitalId) {
      const hospital = await prisma.hospital.findUnique({
        where: { id: data.hospitalId },
        select: { userId: true }
      });
      actorId = hospital?.userId ?? data.hospitalId;
      actorRole = 'HOSPITAL_ADMIN';
    }

    if (!actorId) return;

    const enrichedMetadata = {
      ...(data.metadata ?? {}),
      ...(data.patientId ? { patientId: data.patientId } : {}),
      ...(data.doctorId ? { doctorId: data.doctorId } : {}),
      ...(data.hospitalId ? { hospitalId: data.hospitalId } : {}),
    };

    const log = await prisma.auditLog.create({
      data: {
        actorId,
        actorRole,
        action: data.action,
        description: data.description,
        metadata: Object.keys(enrichedMetadata).length > 0 ? enrichedMetadata : null,
        ipAddress: data.ipAddress ?? null,
        userAgent: null
      }
    });
    return log;
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

export const getAuditLogs = async (actorId?: string, limit = 50) => {
  return await prisma.auditLog.findMany({
    where: actorId ? { actorId } : undefined,
    orderBy: { createdAt: 'desc' },
    take: limit
  });
};

export default prisma;
