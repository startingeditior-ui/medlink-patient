import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import { emitToPatient } from '../services/socket';
import { createAuditLog } from '../services/auditLog';
import { sendOTP } from '../services/sms';
import { sendWelcomeEmail } from '../services/email';

const router = Router();
const prisma = new PrismaClient();

const initializeFirebase = () => {
  const admin = require('firebase-admin');
  if (!admin.apps.length) {
    const serviceAccount = require('../../medlink-notification-firebase-adminsdk-fbsvc-4659b1ab2c.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  return admin;
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Build all possible phone formats to match any registration format
const buildPhoneVariants = (phone: string): string[] => {
  const digits = phone.replace(/\D/g, ''); // strip all non-digits
  const last10 = digits.slice(-10);         // raw 10 digits (most common stored format)

  const variants = new Set<string>();
  variants.add(phone.trim());                                         // whatever was sent as-is
  variants.add(last10);                                               // "9876543210"
  variants.add(`+91${last10}`);                                       // "+919876543210"
  variants.add(`+91 ${last10.slice(0, 5)} ${last10.slice(5)}`);      // "+91 98765 43210"
  variants.add(`91${last10}`);                                        // "919876543210"
  return Array.from(variants);
};

router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { phone, patientId } = req.body;

    let patient: any = null;
    let loginIdentifier = '';

    if (phone) {
      const phoneVariants = buildPhoneVariants(phone);
      loginIdentifier = phone.replace(/\D/g, '').slice(-10); // store raw 10 digits as identifier

      patient = await prisma.patient.findFirst({
        where: {
          user: {
            phone: { in: phoneVariants }
          }
        },
        include: { user: true }
      });

      if (!patient) {
        return res.status(404).json({ error: 'Patient not found with this phone number' });
      }
    } else if (patientId) {
      loginIdentifier = patientId.toUpperCase().trim();
      patient = await prisma.patient.findUnique({
        where: { patientCode: loginIdentifier },
        include: { user: true }
      });
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found with this Patient ID' });
      }
    } else {
      return res.status(400).json({ error: 'Please provide phone number or Patient ID' });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const otpHash = await bcrypt.hash(otp, 10);

    await prisma.verificationOTP.create({
      data: {
        patientId: patient.id,
        target: patient.user.phone,
        type: 'PHONE',
        otpHash,
        expiresAt
      }
    });

    console.log(`\n🔐 OTP for ${loginIdentifier} (${patient.name}): ${otp}\n`);

    const normalizedPhone = patient.user.phone.replace(/\s/g, '');
    await sendOTP(normalizedPhone, otp);

    res.json({ message: 'OTP sent successfully', expiresIn: 300 });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

router.post('/verify-otp', async (req: AuthRequest, res: Response) => {
  try {
    const { phone, patientId, otp } = req.body;

    if (!otp || otp.length !== 6) {
      return res.status(400).json({ error: 'Please provide a valid 6-digit OTP' });
    }

    let patient: any = null;

    if (phone) {
      const phoneVariants = buildPhoneVariants(phone);
      patient = await prisma.patient.findFirst({
        where: {
          user: {
            phone: { in: phoneVariants }
          }
        },
        include: { user: true }
      });
    } else if (patientId) {
      patient = await prisma.patient.findUnique({
        where: { patientCode: patientId.toUpperCase().trim() },
        include: { user: true }
      });
    }

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const pendingOTPs = await prisma.verificationOTP.findMany({
      where: {
        patientId: patient.id,
        verified: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    let validOTP: any = null;
    for (const record of pendingOTPs) {
      const match = await bcrypt.compare(otp, record.otpHash);
      if (match) {
        validOTP = record;
        break;
      }
    }

    if (!validOTP) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    await prisma.verificationOTP.update({
      where: { id: validOTP.id },
      data: { verified: true }
    });

    const token = jwt.sign(
      { patientId: patient.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    await createAuditLog({
      patientId: patient.id,
      action: 'OTP_VERIFIED',
      description: 'User logged in successfully'
    });

    await sendWelcomeEmail(patient.user.email, patient.name, patient.patientCode);

    res.json({ 
      token, 
      patient: {
        id: patient.id,
        patientCode: patient.patientCode,
        name: patient.name,
        phone: patient.user.phone
      }
    });
  } catch (error) {
    console.error('Error in verify-otp:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

router.post('/logout', authMiddleware, async (req: AuthRequest, res: Response) => {
  res.json({ message: 'Logged out successfully' });
});

router.post('/fcm-token', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { fcmToken } = req.body;
    const patientId = req.patientId!;
    
    if (!fcmToken) {
      return res.status(400).json({ error: 'FCM token is required' });
    }
    
    await prisma.patient.update({
      where: { id: patientId },
      data: { fcmToken }
    });
    
    res.json({ message: 'FCM token saved successfully' });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    res.status(500).json({ error: 'Failed to save FCM token' });
  }
});

router.post('/login-notification', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.patientId!;
    
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const message = `You have successfully logged in to your patient portal. Verify it is you.`;
    
    if (patient.fcmToken) {
      try {
        const admin = initializeFirebase();
        
        const notification = {
          notification: {
            title: 'MedLinkID Login',
            body: message
          },
          token: patient.fcmToken
        };
        
        await admin.messaging().send(notification);
        console.log(`Push notification sent to ${patient.name}`);
      } catch (fcmError) {
        console.error('Error sending FCM notification:', fcmError);
      }
    }
    
    console.log(`Login notification for ${patient.name} (FCM token: ${patient.fcmToken ? 'present' : 'missing'})`);

    res.json({ message: 'Login notification sent successfully' });
  } catch (error) {
    console.error('Error sending login notification:', error);
    res.status(500).json({ error: 'Failed to send login notification' });
  }
});

router.post('/refresh-token', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.patientId!;
    
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const token = jwt.sign(
      { patientId: patient.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

router.get('/debug-otp/:patientCode', async (req: AuthRequest, res: Response) => {
  try {
    const { patientCode } = req.params;
    
    const patient = await prisma.patient.findUnique({
      where: { patientCode: patientCode.toUpperCase() },
      include: { user: true }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const latestOTP = await prisma.verificationOTP.findFirst({
      where: { patientId: patient.id },
      orderBy: { createdAt: 'desc' }
    });

    if (!latestOTP) {
      return res.json({ message: 'No OTP found for this patient' });
    }

    const isValid = latestOTP.expiresAt > new Date() && !latestOTP.verified;

    res.json({
      patientCode: patient.patientCode,
      name: patient.name,
      phone: patient.user.phone,
      otpTarget: latestOTP.target,
      expiresAt: latestOTP.expiresAt,
      verified: latestOTP.verified,
      isValid
    });
  } catch (error) {
    console.error('Error fetching debug OTP:', error);
    res.status(500).json({ error: 'Failed to fetch OTP' });
  }
});

export default router;
