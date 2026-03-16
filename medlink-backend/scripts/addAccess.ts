import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addAccess() {
  const patient = await prisma.patient.findFirst({ where: { name: 'Rajesh Kumar' } });
  if (!patient) { console.log('Patient not found'); return; }
  
  const hospitals = await prisma.hospital.findMany();
  const doctors = await prisma.doctor.findMany();
  
  console.log('Patient:', patient.name);
  console.log('Hospitals:', hospitals.map((h: any) => h.name));
  console.log('Doctors:', doctors.map((d: any) => d.name));
  
  if (hospitals.length > 0 && doctors.length > 0) {
    await prisma.accessRecord.create({
      data: {
        patientId: patient.id,
        doctorId: doctors[0].id,
        hospitalId: hospitals[0].id,
        accessStartTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        accessExpiryTime: new Date(Date.now() + 22 * 60 * 60 * 1000),
        recordsViewed: JSON.stringify(['Medical History', 'Lab Reports', 'Prescriptions']),
        status: 'ACTIVE',
      }
    });
    console.log('Access record 1 created');
  }
  
  if (doctors.length > 1 && hospitals.length > 0) {
    await prisma.accessRecord.create({
      data: {
        patientId: patient.id,
        doctorId: doctors[1].id,
        hospitalId: hospitals[0].id,
        accessStartTime: new Date(Date.now() - 30 * 60 * 1000),
        accessExpiryTime: new Date(Date.now() + 23 * 60 * 60 * 1000),
        recordsViewed: JSON.stringify(['Medical History']),
        status: 'ACTIVE',
      }
    });
    console.log('Access record 2 created');
  }
}

addAccess().then(() => process.exit());