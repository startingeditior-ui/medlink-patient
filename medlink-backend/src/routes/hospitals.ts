import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/hospitals — list hospitals with optional filters
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { facilityType, ownershipType, search, limit = 50, offset = 0 } = req.query;

    const where: any = {};

    if (facilityType) {
      where.facilityType = { contains: facilityType as string, mode: 'insensitive' };
    }
    if (ownershipType) {
      where.ownershipType = { contains: ownershipType as string, mode: 'insensitive' };
    }
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { address: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const hospitals = await prisma.hospital.findMany({
      where,
      include: {
        _count: {
          select: { doctors: true },
        },
      },
      orderBy: { name: 'asc' },
      take: Number(limit),
      skip: Number(offset),
    });

    const total = await prisma.hospital.count({ where });

    res.json({
      hospitals: hospitals.map(h => ({
        id: h.id,
        name: h.name,
        address: h.address,
        facilityType: h.facilityType,
        ownershipType: h.ownershipType,
        verified: h.verified,
        doctorCount: h._count.doctors,
      })),
      total,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    res.status(500).json({ error: 'Failed to fetch hospitals' });
  }
});

// GET /api/hospitals/types — distinct facility types
router.get('/types', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const types = await prisma.hospital.findMany({
      select: { facilityType: true },
      distinct: ['facilityType'],
      orderBy: { facilityType: 'asc' },
    });

    res.json({
      facilityTypes: types.map(h => h.facilityType).filter(Boolean),
    });
  } catch (error) {
    console.error('Error fetching facility types:', error);
    res.status(500).json({ error: 'Failed to fetch facility types' });
  }
});

// GET /api/hospitals/:id — single hospital with its doctors
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const hospital = await prisma.hospital.findUnique({
      where: { id },
      include: {
        doctors: {
          select: { id: true, name: true, specialty: true },
        },
      },
    });

    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    res.json({
      hospital: {
        id: hospital.id,
        name: hospital.name,
        address: hospital.address,
        facilityType: hospital.facilityType,
        ownershipType: hospital.ownershipType,
        managerName: hospital.managerName,
        verified: hospital.verified,
        doctors: hospital.doctors.map(d => ({
          id: d.id,
          name: d.name,
          specialty: d.specialty,
        })),
      }
    });
  } catch (error) {
    console.error('Error fetching hospital:', error);
    res.status(500).json({ error: 'Failed to fetch hospital' });
  }
});

export default router;
