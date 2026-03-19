import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/doctors — list doctors with optional filters
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { specialty, hospitalId, search, limit = 50, offset = 0 } = req.query;

    const where: any = {};

    if (specialty) {
      where.specialty = { contains: specialty as string, mode: 'insensitive' };
    }
    if (hospitalId) {
      where.hospitalId = hospitalId as string;
    }
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { specialty: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const doctors = await prisma.doctor.findMany({
      where,
      include: {
        hospital: { select: { id: true, name: true, address: true } },
      },
      orderBy: { name: 'asc' },
      take: Number(limit),
      skip: Number(offset),
    });

    const total = await prisma.doctor.count({ where });

    res.json({
      doctors: doctors.map(d => ({
        id: d.id,
        name: d.name,
        specialty: d.specialty,
        systemOfMedicine: d.systemOfMedicine,
        hospitalId: d.hospitalId,
        hospitalName: d.hospital?.name,
        hospitalAddress: d.hospital?.address,
      })),
      total,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// GET /api/doctors/specialties — list distinct specialties
router.get('/specialties', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const specialties = await prisma.doctor.findMany({
      select: { specialty: true },
      distinct: ['specialty'],
      orderBy: { specialty: 'asc' },
    });

    res.json({
      specialties: specialties.map(d => d.specialty).filter(Boolean),
    });
  } catch (error) {
    console.error('Error fetching specialties:', error);
    res.status(500).json({ error: 'Failed to fetch specialties' });
  }
});

// GET /api/doctors/:id — single doctor
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        hospital: true,
      },
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({
      doctor: {
        id: doctor.id,
        name: doctor.name,
        specialty: doctor.specialty,
        systemOfMedicine: doctor.systemOfMedicine,
        stateMedicalCouncil: doctor.stateMedicalCouncil,
        registrationYear: doctor.registrationYear,
        hospitalId: doctor.hospitalId,
        hospital: doctor.hospital,
      }
    });
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ error: 'Failed to fetch doctor' });
  }
});

export default router;
