'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Calendar, MapPin, Droplet, AlertTriangle, PhoneCall, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, Input } from '@/components/ui/Elements';
import { useAuth } from '@/hooks/useAuth';

export default function ProfilePage() {
  const router = useRouter();
  const { patient, logout } = useAuth();

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      router.push('/');
    }
  };

  if (!patient) return null;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl font-bold text-text-primary">Profile</h1>
        <p className="text-text-secondary text-sm">Your personal information</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-6"
      >
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <User className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-text-primary mt-4">{patient.name}</h2>
        <p className="text-text-secondary text-sm">{patient.patientId}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6">
          <h3 className="font-semibold text-text-primary mb-4">Personal Information</h3>

          <div className="space-y-4">
            <Input
              label="Full Name"
              value={patient.name || ''}
              disabled
              icon={<User className="w-5 h-5 text-text-outline" />}
            />

            <Input
              label="Email"
              type="email"
              value={patient.email || ''}
              disabled
              icon={<Mail className="w-5 h-5 text-text-outline" />}
            />

            <Input
              label="Phone Number"
              value={patient.phone || ''}
              disabled
              icon={<Phone className="w-5 h-5 text-text-outline" />}
            />

            <Input
              label="Date of Birth"
              value={patient.dateOfBirth || 'Not set'}
              disabled
              icon={<Calendar className="w-5 h-5 text-text-outline" />}
            />

            <Input
              label="Address"
              value={patient.address || 'Not set'}
              disabled
              icon={<MapPin className="w-5 h-5 text-text-outline" />}
            />
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6">
          <h3 className="font-semibold text-text-primary mb-4">Medical Information</h3>

          <div className="space-y-4">
            <Input
              label="Blood Group"
              value={patient.bloodGroup || 'Not set'}
              disabled
              icon={<Droplet className="w-5 h-5 text-text-outline" />}
            />

            <Input
              label="Allergies"
              value={patient.allergies?.length ? patient.allergies.join(', ') : 'None'}
              disabled
              icon={<AlertTriangle className="w-5 h-5 text-text-outline" />}
            />

            <Input
              label="Chronic Diseases"
              value={patient.chronicDiseases?.length ? patient.chronicDiseases.join(', ') : 'None'}
              disabled
              icon={<AlertTriangle className="w-5 h-5 text-text-outline" />}
            />
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6">
          <h3 className="font-semibold text-text-primary mb-4">Emergency Contact</h3>

          <div className="space-y-4">
            <Input
              label="Emergency Contact Number"
              value={patient.emergencyContact || 'Not set'}
              disabled
              icon={<PhoneCall className="w-5 h-5 text-text-outline" />}
            />

            <Input
              label="Guardian Name"
              value={patient.guardianName || 'Not set'}
              disabled
              icon={<Shield className="w-5 h-5 text-text-outline" />}
            />

            <Input
              label="Guardian Mobile Number"
              value={patient.guardianMobile || 'Not set'}
              disabled
              icon={<Phone className="w-5 h-5 text-text-outline" />}
            />

            <Input
              label="Guardian Location"
              value={patient.guardianLocation || 'Not set'}
              disabled
              icon={<MapPin className="w-5 h-5 text-text-outline" />}
            />
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button variant="outlined" className="w-full text-error" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </motion.div>
    </div>
  );
}
