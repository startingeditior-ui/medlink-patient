import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.consentRequest.deleteMany();
  await prisma.accessRecord.deleteMany();
  await prisma.blockedHospital.deleteMany();
  await prisma.oTP.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.hospital.deleteMany();
  await prisma.patient.deleteMany();

  // Create hospitals
  const apollo = await prisma.hospital.create({
    data: {
      name: 'Apollo Hospital',
      address: '21, Greams Lane, Chennai',
      phone: '+91 44 2829 2222',
    },
  });

  const fortis = await prisma.hospital.create({
    data: {
      name: 'Fortis Healthcare',
      address: 'No. 23, 45th Cross Road, Chennai',
      phone: '+91 44 4722 2222',
    },
  });

  const miot = await prisma.hospital.create({
    data: {
      name: 'MIOT Hospitals',
      address: '1, Mount Road, Chennai',
      phone: '+91 44 4200 4200',
    },
  });

  // Create doctors
  const drSarah = await prisma.doctor.create({
    data: {
      name: 'Dr. Sarah Chen',
      specialization: 'Cardiologist',
      hospitalId: apollo.id,
    },
  });

  const drRajesh = await prisma.doctor.create({
    data: {
      name: 'Dr. Rajesh Kumar',
      specialization: 'General Physician',
      hospitalId: apollo.id,
    },
  });

  const drAmit = await prisma.doctor.create({
    data: {
      name: 'Dr. Amit Patel',
      specialization: 'Cardiologist',
      hospitalId: fortis.id,
    },
  });

  const drVenkatesh = await prisma.doctor.create({
    data: {
      name: 'Dr. Venkatesh',
      specialization: 'General Surgeon',
      hospitalId: miot.id,
    },
  });

  // Create patients
  const hashedPassword = await bcrypt.hash('password123', 10);

  const generatePatientId = (uniqueId: number): string => {
    const year = new Date().getFullYear();
    return `MLPR-${year}${String(uniqueId).padStart(4, '0')}`;
  };

  const patient1 = await prisma.patient.create({
    data: {
      patientId: generatePatientId(1),
      name: 'Rajesh Kumar',
      phone: '+91 98765 43210',
      email: 'rajesh.kumar@email.com',
      password: hashedPassword,
      bloodGroup: 'B+',
      allergies: JSON.stringify(['Penicillin', 'Peanuts']),
      chronicDiseases: JSON.stringify(['Type 2 Diabetes', 'Hypertension']),
      emergencyContact: '+91 98765 43211',
      guardianName: 'Suresh Kumar',
      guardianMobile: '+91 98765 43211',
      guardianLocation: '42, MG Road, Chennai',
      dateOfBirth: new Date('1985-06-15'),
      gender: 'Male',
      address: '42, MG Road, Chennai, Tamil Nadu 600001',
    },
  });

  const patient2 = await prisma.patient.create({
    data: {
      patientId: generatePatientId(2),
      name: 'Priya Sharma',
      phone: '+91 98765 43267',
      email: 'priya.sharma@email.com',
      password: hashedPassword,
      bloodGroup: 'A+',
      allergies: JSON.stringify([]),
      chronicDiseases: JSON.stringify([]),
      emergencyContact: '+91 98765 43212',
      dateOfBirth: new Date('1990-03-22'),
      gender: 'Female',
      address: '15, LB Road, Chennai, Tamil Nadu 600034',
    },
  });

  const patient3 = await prisma.patient.create({
    data: {
      patientId: generatePatientId(12),
      name: 'Test Patient',
      phone: '+91 93613 25794',
      email: 'test@patient.com',
      password: hashedPassword,
      bloodGroup: 'O+',
      allergies: JSON.stringify(['Dust', 'Pollution']),
      chronicDiseases: JSON.stringify(['Asthma']),
      emergencyContact: '+91 93613 25795',
      dateOfBirth: new Date('1995-08-10'),
      gender: 'Male',
      address: '123, Main Road, Chennai, Tamil Nadu 600001',
    },
  });

  // Create access records for patient3 (MLP-2024-001236)
  await prisma.accessRecord.create({
    data: {
      patientId: patient3.id,
      doctorId: drSarah.id,
      hospitalId: apollo.id,
      accessStartTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
      accessExpiryTime: new Date(Date.now() + 7 * 60 * 60 * 1000),
      recordsViewed: JSON.stringify(['Medical History', 'Lab Reports', 'Prescriptions', 'Vaccination Records']),
      status: 'ACTIVE',
    },
  });

  await prisma.accessRecord.create({
    data: {
      patientId: patient3.id,
      doctorId: drAmit.id,
      hospitalId: fortis.id,
      accessStartTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      accessExpiryTime: new Date(Date.now() - 12 * 60 * 60 * 1000),
      recordsViewed: JSON.stringify(['Medical History', 'Prescriptions']),
      status: 'EXPIRED',
    },
  });

  // Create pending consent requests for patient3
  await prisma.consentRequest.create({
    data: {
      patientId: patient3.id,
      doctorId: drRajesh.id,
      hospitalId: apollo.id,
      requestTime: new Date(Date.now() - 15 * 60 * 1000),
      duration: 24,
      recordsRequested: JSON.stringify(['Lab Reports', 'Prescriptions', 'Medical History']),
      status: 'PENDING',
    },
  });

  await prisma.consentRequest.create({
    data: {
      patientId: patient3.id,
      doctorId: drVenkatesh.id,
      hospitalId: miot.id,
      requestTime: new Date(Date.now() - 45 * 60 * 1000),
      duration: 12,
      recordsRequested: JSON.stringify(['Medical History']),
      status: 'PENDING',
    },
  });

  // Create notifications for patient3
  await prisma.notification.create({
    data: {
      patientId: patient3.id,
      type: 'ACCESS_GRANTED',
      title: 'Access Granted',
      message: 'Dr. Sarah Chen from Apollo Hospital has been granted access to your records.',
      doctorName: 'Dr. Sarah Chen',
      hospitalName: 'Apollo Hospital',
      read: false,
    },
  });

  await prisma.notification.create({
    data: {
      patientId: patient3.id,
      type: 'CONSENT_REQUEST',
      title: 'New Access Request',
      message: 'Dr. Rajesh Kumar from Apollo Hospital is requesting access to your records.',
      doctorName: 'Dr. Rajesh Kumar',
      hospitalName: 'Apollo Hospital',
      read: false,
    },
  });

  await prisma.notification.create({
    data: {
      patientId: patient3.id,
      type: 'CONSENT_REQUEST',
      title: 'New Access Request',
      message: 'Dr. Venkatesh from MIOT Hospitals is requesting access to your records.',
      doctorName: 'Dr. Venkatesh',
      hospitalName: 'MIOT Hospitals',
      read: false,
    },
  });

  await prisma.notification.create({
    data: {
      patientId: patient3.id,
      type: 'ACCESS_EXPIRED',
      title: 'Access Expired',
      message: 'Access granted to Dr. Amit Patel from Fortis Healthcare has expired.',
      doctorName: 'Dr. Amit Patel',
      hospitalName: 'Fortis Healthcare',
      read: true,
    },
  });

  // Create access records (with 8-hour expiry)
  await prisma.accessRecord.create({
    data: {
      patientId: patient1.id,
      doctorId: drSarah.id,
      hospitalId: apollo.id,
      accessStartTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      accessExpiryTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
      recordsViewed: JSON.stringify(['Medical History', 'Lab Reports', 'Prescriptions']),
      status: 'ACTIVE',
    },
  });

  await prisma.accessRecord.create({
    data: {
      patientId: patient1.id,
      doctorId: drRajesh.id,
      hospitalId: apollo.id,
      accessStartTime: new Date(Date.now() - 30 * 60 * 1000),
      accessExpiryTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
      recordsViewed: JSON.stringify(['Medical History']),
      status: 'ACTIVE',
    },
  });

  await prisma.accessRecord.create({
    data: {
      patientId: patient1.id,
      doctorId: drAmit.id,
      hospitalId: fortis.id,
      accessStartTime: new Date(Date.now() - 26 * 60 * 60 * 1000),
      accessExpiryTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      recordsViewed: JSON.stringify(['Medical History']),
      status: 'EXPIRED',
    },
  });

  await prisma.accessRecord.create({
    data: {
      patientId: patient1.id,
      doctorId: drVenkatesh.id,
      hospitalId: miot.id,
      accessStartTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      accessExpiryTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      recordsViewed: JSON.stringify(['Medical History', 'Prescriptions']),
      status: 'REVOKED',
    },
  });

  // Create pending consent requests
  await prisma.consentRequest.create({
    data: {
      patientId: patient1.id,
      doctorId: drSarah.id,
      hospitalId: apollo.id,
      requestTime: new Date(Date.now() - 10 * 60 * 1000),
      duration: 24,
      recordsRequested: JSON.stringify(['Lab Reports', 'Prescriptions']),
      status: 'PENDING',
    },
  });

  await prisma.consentRequest.create({
    data: {
      patientId: patient1.id,
      doctorId: drAmit.id,
      hospitalId: fortis.id,
      requestTime: new Date(Date.now() - 30 * 60 * 1000),
      duration: 24,
      recordsRequested: JSON.stringify(['Medical History']),
      status: 'PENDING',
    },
  });

  // Create notifications
  await prisma.notification.create({
    data: {
      patientId: patient1.id,
      type: 'ACCESS_GRANTED',
      title: 'Access Granted',
      message: 'Dr. Sarah Chen from Apollo Hospital has been granted access to your records.',
      doctorName: 'Dr. Sarah Chen',
      hospitalName: 'Apollo Hospital',
      read: false,
    },
  });

  await prisma.notification.create({
    data: {
      patientId: patient1.id,
      type: 'ACCESS_GRANTED',
      title: 'Access Granted',
      message: 'Dr. Rajesh Kumar from Apollo Hospital has been granted access to your records.',
      doctorName: 'Dr. Rajesh Kumar',
      hospitalName: 'Apollo Hospital',
      read: false,
    },
  });

  await prisma.notification.create({
    data: {
      patientId: patient1.id,
      type: 'CONSENT_REQUEST',
      title: 'New Access Request',
      message: 'Dr. Sarah Chen from Apollo Hospital is requesting access to your records.',
      doctorName: 'Dr. Sarah Chen',
      hospitalName: 'Apollo Hospital',
      read: false,
    },
  });

  await prisma.notification.create({
    data: {
      patientId: patient1.id,
      type: 'CONSENT_REQUEST',
      title: 'New Access Request',
      message: 'Dr. Amit Patel from Fortis Healthcare is requesting access to your records.',
      doctorName: 'Dr. Amit Patel',
      hospitalName: 'Fortis Healthcare',
      read: false,
    },
  });

  await prisma.notification.create({
    data: {
      patientId: patient1.id,
      type: 'ACCESS_EXPIRED',
      title: 'Access Expired',
      message: 'Access granted to Dr. Amit Patel has expired.',
      doctorName: 'Dr. Amit Patel',
      hospitalName: 'Fortis Healthcare',
      read: true,
    },
  });

  await prisma.notification.create({
    data: {
      patientId: patient1.id,
      type: 'ACCESS_REVOKED',
      title: 'Access Revoked',
      message: 'You have revoked access for Dr. Venkatesh from MIOT Hospitals.',
      doctorName: 'Dr. Venkatesh',
      hospitalName: 'MIOT Hospitals',
      read: true,
    },
  });

  console.log('Database seeded successfully!');
  console.log('\nTest Credentials:');
  console.log(`Patient 1: ${patient1.patientId}`);
  console.log(`Patient 2: ${patient2.patientId}`);
  console.log(`Patient 3: ${patient3.patientId}`);
  console.log('Password: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
