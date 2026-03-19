/**
 * addPatient4.ts
 *
 * Seeds reference data (hospitals, doctors, record types) if missing,
 * then adds 12 realistic medical records, 1 active access, 2 consent requests,
 * and 4 notifications for patient MLPR-20260004 (Vishal M).
 *
 * Safe to run multiple times — skips sections that already have data.
 * Run: npx tsx prisma/addPatient4.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─── Helper: upsert a record type ───────────────────────────────
async function upsertRecordType(name: string, description: string, icon: string) {
  const existing = await prisma.medicalRecordType.findFirst({ where: { name } });
  if (existing) return existing;
  return prisma.medicalRecordType.create({ data: { name, description, icon } });
}

async function main() {
  console.log('🔍 Looking up patient MLPR-20260004...');

  const patient = await prisma.patient.findFirst({
    where: { patientCode: 'MLPR-20260004' },
    select: { id: true, patientCode: true, name: true },
  });

  if (!patient) {
    console.error('❌ Patient MLPR-20260004 not found in the database.');
    return;
  }

  console.log(`✅ Found patient: ${patient.name} (${patient.patientCode})`);

  // ─── 1. Ensure Record Types exist ──────────────────────────────
  console.log('\n📋 Ensuring record types...');
  const labReport       = await upsertRecordType('Lab Report',        'Laboratory test results',       'flask');
  const prescription    = await upsertRecordType('Prescription',      'Prescribed medications',        'pill');
  const imaging         = await upsertRecordType('Imaging',           'X-rays, MRI, CT scans',         'scan');
  const clinicalNote    = await upsertRecordType('Clinical Note',     'Doctor consultation notes',     'file-text');
  const bill            = await upsertRecordType('Bill',              'Medical bills and receipts',    'receipt');
  const vaccination     = await upsertRecordType('Vaccination',       'Vaccination records',           'syringe');
  const dischargeSummary = await upsertRecordType('Discharge Summary','Hospital discharge documents',  'file-check');
  console.log('✅ Record types ready');

  // ─── 2. Ensure Hospitals exist ─────────────────────────────────────────
  console.log('\n🏥 Ensuring hospitals...');

  // Hospitals need a User + hospitalCode + regNumber etc.
  const year = new Date().getFullYear();

  async function upsertHospital(code: string, name: string, address: string, phone: string, reg: string, facilityType: string) {
    const existing = await prisma.hospital.findFirst({ where: { hospitalCode: code } });
    if (existing) return existing;

    const passwordHash = await bcrypt.hash('hospital123', 10);
    const user = await prisma.user.create({
      data: {
        phone: `+91${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
        passwordHash,
        role: 'HOSPITAL_ADMIN',
      },
    });

    return prisma.hospital.create({
      data: {
        hospitalCode: code,
        userId: user.id,
        name,
        address,
        phone,
        facilityType,
        ownershipType: 'Private',
        managerName: 'Hospital Admin',
        regNumber: reg,
        verified: true,
      },
    });
  }

  const apollo    = await upsertHospital(`MLHP-${year}0001`, 'Apollo Hospital',    '21, Greams Lane, Chennai',        '+91 44 2829 2222', 'REG-APOLLO-001',  'Multi-Specialty');
  const fortis    = await upsertHospital(`MLHP-${year}0002`, 'Fortis Healthcare',  'No. 23, 45th Cross Road, Chennai', '+91 44 4722 2222', 'REG-FORTIS-001',  'Multi-Specialty');
  const miot      = await upsertHospital(`MLHP-${year}0003`, 'MIOT Hospitals',     '1, Mount Road, Chennai',           '+91 44 4200 4200', 'REG-MIOT-001',    'Multi-Specialty');
  console.log(`✅ Hospitals: Apollo, Fortis, MIOT`);

  // ─── 3. Ensure Doctors exist ───────────────────────────────────────────
  console.log('\n👨‍⚕️ Ensuring doctors...');

  async function upsertDoctor(code: string, name: string, specialty: string, licenseNo: string, hospitalId: string) {
    const existing = await prisma.doctor.findFirst({ where: { doctorCode: code } });
    if (existing) return existing;

    const passwordHash = await bcrypt.hash('doctor123', 10);
    const user = await prisma.user.create({
      data: {
        phone: `+91${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
        passwordHash,
        role: 'DOCTOR',
      },
    });

    return prisma.doctor.create({
      data: {
        doctorCode: code,
        userId: user.id,
        hospitalId,
        name,
        specialty,
        systemOfMedicine: 'Allopathy',
        stateMedicalCouncil: 'Tamil Nadu Medical Council',
        registrationYear: 2010,
        licenseNo,
      },
    });
  }

  const drArun  = await upsertDoctor(`MLDR-${year}0001`, 'Dr. Arun Sharma',    'Cardiology',        `LIC-CARD-${year}01`, apollo.id);
  const drMeena = await upsertDoctor(`MLDR-${year}0002`, 'Dr. Meena Krishnan', 'General Medicine',  `LIC-GENM-${year}02`, fortis.id);
  const drVijay = await upsertDoctor(`MLDR-${year}0003`, 'Dr. Vijay Natarajan','Neurology',         `LIC-NEUR-${year}03`, miot.id);
  console.log('✅ Doctors: Dr. Arun Sharma, Dr. Meena Krishnan, Dr. Vijay Natarajan');

  // ─── 4. Create Patient Records ─────────────────────────────────────────
  const existingRecords = await prisma.patientRecord.count({ where: { patientId: patient.id } });

  if (existingRecords > 0) {
    console.log(`\n⚠️  Patient already has ${existingRecords} records. Skipping record creation.`);
  } else {
    console.log('\n📝 Creating 12 medical records...');

    const records = [
      // Lab Reports (3)
      {
        patientId: patient.id, recordTypeId: labReport.id,
        title: 'Complete Blood Count (CBC)',
        description: 'Hemoglobin: 14.2 g/dL, WBC: 7,200/cumm, Platelets: 2.4 lakhs/cumm — All values within normal range.',
        fileUrl: 'https://placehold.co/800x600/e8f5e9/1b5e20?text=CBC+Report',
        date: new Date('2025-08-10'), hospitalId: apollo.id, doctorId: drArun.id,
      },
      {
        patientId: patient.id, recordTypeId: labReport.id,
        title: 'Lipid Profile',
        description: 'Total Cholesterol: 192 mg/dL, LDL: 108 mg/dL, HDL: 47 mg/dL, Triglycerides: 145 mg/dL.',
        fileUrl: 'https://placehold.co/800x600/e8f5e9/1b5e20?text=Lipid+Profile',
        date: new Date('2025-10-05'), hospitalId: fortis.id, doctorId: drMeena.id,
      },
      {
        patientId: patient.id, recordTypeId: labReport.id,
        title: 'Blood Sugar Fasting',
        description: 'Fasting Blood Sugar: 98 mg/dL (Normal). Post-prandial: 138 mg/dL. HbA1c: 5.8%.',
        fileUrl: 'https://placehold.co/800x600/e8f5e9/1b5e20?text=Blood+Sugar',
        date: new Date('2025-12-01'), hospitalId: apollo.id, doctorId: drArun.id,
      },
      // Prescriptions (2)
      {
        patientId: patient.id, recordTypeId: prescription.id,
        title: 'Antibiotic Course',
        description: 'Tab. Amoxicillin 500mg — Thrice daily for 5 days. For upper respiratory tract infection.',
        fileUrl: 'https://placehold.co/800x600/fff3e0/e65100?text=Prescription',
        date: new Date('2025-09-14'), hospitalId: apollo.id, doctorId: drArun.id,
      },
      {
        patientId: patient.id, recordTypeId: prescription.id,
        title: 'Antihistamine Prescription',
        description: 'Tab. Cetirizine 10mg — Once daily at night for 15 days. For seasonal allergy.',
        fileUrl: 'https://placehold.co/800x600/fff3e0/e65100?text=Antihistamine',
        date: new Date('2025-11-20'), hospitalId: fortis.id, doctorId: drMeena.id,
      },
      // Imaging (2)
      {
        patientId: patient.id, recordTypeId: imaging.id,
        title: 'Chest X-Ray PA View',
        description: 'Clear lung fields bilaterally. Normal cardiac silhouette. No active pulmonary lesion detected.',
        fileUrl: 'https://placehold.co/800x600/e3f2fd/1565c0?text=Chest+X-Ray',
        date: new Date('2025-09-14'), hospitalId: fortis.id, doctorId: drMeena.id,
      },
      {
        patientId: patient.id, recordTypeId: imaging.id,
        title: 'Ultrasound Abdomen',
        description: 'Liver, spleen, kidneys appear normal in size and echogenicity. No ascites. Gallbladder clear.',
        fileUrl: 'https://placehold.co/800x600/e3f2fd/1565c0?text=Ultrasound',
        date: new Date('2025-11-02'), hospitalId: apollo.id, doctorId: drArun.id,
      },
      // Clinical Notes (2)
      {
        patientId: patient.id, recordTypeId: clinicalNote.id,
        title: 'General Medicine Consultation',
        description: 'Patient presented with fatigue and mild fever. Chest auscultation clear. Advised rest, fluids, and CBC. BP: 118/76 mmHg.',
        fileUrl: 'https://placehold.co/800x600/f3e5f5/7b1fa2?text=Clinical+Note',
        date: new Date('2025-08-28'), hospitalId: apollo.id, doctorId: drArun.id,
      },
      {
        patientId: patient.id, recordTypeId: clinicalNote.id,
        title: 'Neurology Follow-up',
        description: 'Patient recovering well post infection. All lab values improved. Continue current medications. Review in 1 month.',
        fileUrl: 'https://placehold.co/800x600/f3e5f5/7b1fa2?text=Follow+Up',
        date: new Date('2025-12-15'), hospitalId: miot.id, doctorId: drVijay.id,
      },
      // Bill (1)
      {
        patientId: patient.id, recordTypeId: bill.id,
        title: 'Consultation & Lab Test Invoice',
        description: 'Consultation: ₹500. CBC: ₹350. Lipid Profile: ₹700. Total: ₹1,550.',
        fileUrl: 'https://placehold.co/800x600/fff8e1/ff8f00?text=Invoice',
        date: new Date('2025-10-05'), hospitalId: fortis.id,
      },
      // Vaccination (1)
      {
        patientId: patient.id, recordTypeId: vaccination.id,
        title: 'Influenza Vaccine 2025',
        description: 'Quadrivalent inactivated influenza vaccine administered. No adverse reactions observed. Next due: 2026.',
        fileUrl: 'https://placehold.co/800x600/e8f5e9/2e7d32?text=Flu+Vaccine',
        date: new Date('2025-07-15'), hospitalId: apollo.id, doctorId: drArun.id,
      },
      // Discharge Summary (1)
      {
        patientId: patient.id, recordTypeId: dischargeSummary.id,
        title: 'Discharge Summary — Day Procedure',
        description: 'Admitted for minor elective procedure. Surgery uneventful. Discharged stable. Wound care and follow-up in 1 week advised.',
        fileUrl: 'https://placehold.co/800x600/fce4ec/880e4f?text=Discharge+Summary',
        date: new Date('2026-01-08'), hospitalId: miot.id, doctorId: drVijay.id,
      },
    ];

    for (const record of records) {
      await prisma.patientRecord.create({ data: record });
      process.stdout.write('.');
    }
    console.log(`\n✅ Created ${records.length} records`);
  }

  // ─── 5. Active Access Record ────────────────────────────────────────────
  const existingAccess = await prisma.accessRecord.count({ where: { patientId: patient.id, status: 'ACTIVE' } });
  if (existingAccess === 0) {
    await prisma.accessRecord.create({
      data: {
        patientId: patient.id,
        doctorId: drArun.id,
        hospitalId: apollo.id,
        accessStartTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        accessExpiryTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
        recordsViewed: JSON.stringify(['Lab Reports', 'Prescriptions', 'Clinical Notes']),
        status: 'ACTIVE',
      },
    });
    console.log('✅ Created 1 active access record (expires in 6h)');
  } else {
    console.log(`⚠️  Already has ${existingAccess} active access record(s). Skipping.`);
  }

  // ─── 6. Consent Requests ───────────────────────────────────────────────
  const existingConsent = await prisma.consentRequest.count({ where: { patientId: patient.id, status: 'PENDING' } });
  if (existingConsent === 0) {
    await prisma.consentRequest.createMany({
      data: [
        {
          patientId: patient.id, doctorId: drMeena.id, hospitalId: fortis.id,
          requestTime: new Date(Date.now() - 20 * 60 * 1000),
          duration: 24,
          recordsRequested: JSON.stringify(['Lab Reports', 'Prescriptions']),
          status: 'PENDING',
        },
        {
          patientId: patient.id, doctorId: drVijay.id, hospitalId: miot.id,
          requestTime: new Date(Date.now() - 55 * 60 * 1000),
          duration: 8,
          recordsRequested: JSON.stringify(['Clinical Notes', 'Imaging']),
          status: 'PENDING',
        },
      ],
    });
    console.log('✅ Created 2 pending consent requests');
  } else {
    console.log(`⚠️  Already has ${existingConsent} pending consent request(s). Skipping.`);
  }

  // ─── 7. Notifications ────────────────────────────────────────────────
  const existingNotifs = await prisma.notification.count({ where: { patientId: patient.id } });
  if (existingNotifs === 0) {
    await prisma.notification.createMany({
      data: [
        {
          patientId: patient.id, type: 'CONSENT_REQUEST', title: 'New Access Request',
          message: `Dr. Meena Krishnan from Fortis Healthcare is requesting access to your records.`,
          doctorName: 'Dr. Meena Krishnan', hospitalName: 'Fortis Healthcare', read: false,
        },
        {
          patientId: patient.id, type: 'CONSENT_REQUEST', title: 'New Access Request',
          message: `Dr. Vijay Natarajan from MIOT Hospitals is requesting access to your records.`,
          doctorName: 'Dr. Vijay Natarajan', hospitalName: 'MIOT Hospitals', read: false,
        },
        {
          patientId: patient.id, type: 'ACCESS_GRANTED', title: 'Access Granted',
          message: `Dr. Arun Sharma from Apollo Hospital has been granted access to your records.`,
          doctorName: 'Dr. Arun Sharma', hospitalName: 'Apollo Hospital', read: false,
        },
        {
          patientId: patient.id, type: 'ACCESS_EXPIRED', title: 'Access Expired',
          message: `Access from a previous session has expired.`,
          doctorName: 'Dr. Meena Krishnan', hospitalName: 'Fortis Healthcare', read: true,
        },
      ],
    });
    console.log('✅ Created 4 notifications (3 unread, 1 read)');
  } else {
    console.log(`⚠️  Already has ${existingNotifs} notification(s). Skipping.`);
  }

  console.log('\n🎉 Done! Patient MLPR-20260004 (Vishal M) is fully set up.');
  console.log('   Dashboard → Records: 12  |  Access: 1  |  Pending: 2  |  Alerts: 3');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
