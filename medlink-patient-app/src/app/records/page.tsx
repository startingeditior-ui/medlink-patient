'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Calendar, 
  ChevronRight,
  Image as ImageIcon,
  File,
  Download,
  X,
  Building2,
  Clock,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, Badge } from '@/components/ui/Elements';
import { useAuth } from '@/hooks/useAuth';

interface MedicalRecord {
  id: string;
  type: 'image' | 'pdf';
  name: string;
  url: string;
  date: string;
}

interface Visit {
  id: string;
  date: string;
  reason: string;
  doctor: string;
  records: MedicalRecord[];
}

interface Hospital {
  id: string;
  name: string;
  address: string;
  visits: Visit[];
}

const mockRecords: Hospital[] = [
  {
    id: '1',
    name: 'Apollo Hospital',
    address: '21, Greams Lane, Chennai',
    visits: [
      {
        id: 'v1',
        date: '2024-12-15',
        reason: 'Annual Health Checkup',
        doctor: 'Dr. Sarah Chen',
        records: [
          { id: 'r1', type: 'pdf', name: 'Blood Test Report', url: '#', date: '2024-12-15' },
          { id: 'r2', type: 'image', name: 'ECG Report', url: '#', date: '2024-12-15' },
          { id: 'r3', type: 'pdf', name: 'X-Ray Chest', url: '#', date: '2024-12-15' },
        ]
      },
      {
        id: 'v2',
        date: '2024-10-20',
        reason: 'Diabetes Consultation',
        doctor: 'Dr. Rajesh Kumar',
        records: [
          { id: 'r4', type: 'pdf', name: 'Sugar Test Report', url: '#', date: '2024-10-20' },
          { id: 'r5', type: 'image', name: 'Prescription', url: '#', date: '2024-10-20' },
        ]
      },
    ]
  },
  {
    id: '2',
    name: 'Fortis Healthcare',
    address: 'No. 23, 45th Cross Road, Chennai',
    visits: [
      {
        id: 'v3',
        date: '2024-11-05',
        reason: 'Cardiac Evaluation',
        doctor: 'Dr. Amit Patel',
        records: [
          { id: 'r6', type: 'image', name: 'ECG Analysis', url: '#', date: '2024-11-05' },
          { id: 'r7', type: 'pdf', name: 'Echo Cardiography', url: '#', date: '2024-11-05' },
          { id: 'r8', type: 'pdf', name: 'Lipid Profile', url: '#', date: '2024-11-05' },
          { id: 'r9', type: 'image', name: 'Doctor Notes', url: '#', date: '2024-11-05' },
        ]
      },
    ]
  },
  {
    id: '3',
    name: 'MIOT Hospitals',
    address: '1, Mount Road, Chennai',
    visits: [
      {
        id: 'v4',
        date: '2024-09-10',
        reason: 'General Surgery Consultation',
        doctor: 'Dr. Venkatesh',
        records: [
          { id: 'r10', type: 'pdf', name: 'Pre-Op Reports', url: '#', date: '2024-09-10' },
        ]
      },
      {
        id: 'v5',
        date: '2024-08-22',
        reason: 'Orthopedic Consultation',
        doctor: 'Dr. Ramesh Babu',
        records: [
          { id: 'r11', type: 'image', name: 'MRI Scan Report', url: '#', date: '2024-08-22' },
          { id: 'r12', type: 'image', name: 'X-Ray Spine', url: '#', date: '2024-08-22' },
          { id: 'r13', type: 'pdf', name: 'Prescription', url: '#', date: '2024-08-22' },
        ]
      },
    ]
  },
];

export default function RecordsPage() {
  const { patient } = useAuth();
  const [expandedHospital, setExpandedHospital] = useState<string | null>(null);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [previewRecord, setPreviewRecord] = useState<MedicalRecord | null>(null);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getTotalVisits = (hospital: Hospital) => hospital.visits.length;
  const getTotalRecords = (hospital: Hospital) => 
    hospital.visits.reduce((acc, v) => acc + v.records.length, 0);

  if (!patient) return null;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl lg:text-2xl font-bold text-text-primary">Medical Records</h1>
        <p className="text-text-secondary text-sm lg:text-base">View your medical history and records</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Hospitals Visited</p>
              <p className="text-2xl font-bold text-primary">{mockRecords.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-primary/5 border-primary/20 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Visits</p>
              <p className="text-2xl font-bold text-primary">
                {mockRecords.reduce((acc, h) => acc + h.visits.length, 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-primary/5 border-primary/20 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Records</p>
              <p className="text-2xl font-bold text-primary">
                {mockRecords.reduce((acc, h) => acc + h.visits.reduce((a, v) => a + v.records.length, 0), 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="font-semibold text-text-primary mb-4">Hospitals</h2>
        
        <div className="space-y-3">
          {mockRecords.map((hospital) => (
            <Card key={hospital.id} className="overflow-hidden p-4">
              <button
                onClick={() => setExpandedHospital(expandedHospital === hospital.id ? null : hospital.id)}
                className="w-full flex items-center justify-between p-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-text-primary">{hospital.name}</h3>
                    <p className="text-sm text-text-secondary">{hospital.address}</p>
                    <div className="flex gap-3 mt-1">
                      <span className="text-xs text-text-outline flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {getTotalVisits(hospital)} visits
                      </span>
                      <span className="text-xs text-text-outline flex items-center gap-1">
                        <FileText className="w-3 h-3" /> {getTotalRecords(hospital)} records
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight 
                  className={`w-5 h-5 text-text-outline transition-transform ${
                    expandedHospital === hospital.id ? 'rotate-90' : ''
                  }`} 
                />
              </button>

              <AnimatePresence>
                {expandedHospital === hospital.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-outline-variant mt-2 pt-2"
                  >
                    <div className="space-y-2">
                      {hospital.visits.map((visit) => (
                        <button
                          key={visit.id}
                          onClick={() => setSelectedVisit(visit)}
                          className="w-full flex items-center justify-between p-3 bg-surface-low rounded-lg hover:bg-surface-high transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-surface-high rounded-full flex items-center justify-center">
                              <Clock className="w-4 h-4 text-text-secondary" />
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-text-primary text-sm">{visit.reason}</p>
                              <p className="text-xs text-text-secondary">{formatDate(visit.date)} • {visit.doctor}</p>
                            </div>
                          </div>
                          <Badge variant="secondary">{visit.records.length} files</Badge>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Visit Details Modal */}
      <AnimatePresence>
        {selectedVisit && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setSelectedVisit(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                <div className="p-4 border-b border-outline-variant flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-text-primary">{selectedVisit.reason}</h3>
                    <p className="text-sm text-text-secondary">
                      {formatDate(selectedVisit.date)} • {selectedVisit.doctor}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedVisit(null)}
                    className="p-2 hover:bg-surface-low rounded-lg"
                  >
                    <X className="w-5 h-5 text-text-secondary" />
                  </button>
                </div>
                
                <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
                  <h4 className="font-medium text-text-primary mb-3">Medical Records</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedVisit.records.map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center gap-3 p-3 border border-outline-variant rounded-lg hover:border-primary/30 transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          record.type === 'pdf' ? 'bg-red-100' : 'bg-blue-100'
                        }`}>
                          {record.type === 'pdf' ? (
                            <File className="w-5 h-5 text-error" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-text-primary text-sm truncate">{record.name}</p>
                          <p className="text-xs text-text-secondary">{formatDate(record.date)}</p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setPreviewRecord(record)}
                            className="p-2 hover:bg-surface-low rounded-lg"
                            title="View"
                          >
                            <Eye className="w-4 h-4 text-text-secondary" />
                          </button>
                          <button
                            className="p-2 hover:bg-surface-low rounded-lg"
                            title="Download"
                          >
                            <Download className="w-4 h-4 text-text-secondary" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewRecord && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-[60]"
              onClick={() => setPreviewRecord(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div className="p-4 border-b border-outline-variant flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-text-primary">{previewRecord.name}</h3>
                    <p className="text-sm text-text-secondary">{formatDate(previewRecord.date)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outlined" size="sm" onClick={() => setPreviewRecord(null)}>
                      <X className="w-4 h-4 mr-1" />
                      Close
                    </Button>
                    <Button variant="filled" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-center bg-surface-low min-h-[400px]">
                  {previewRecord.type === 'image' ? (
                    <div className="text-center">
                      <ImageIcon className="w-20 h-20 text-text-outline mx-auto mb-4" />
                      <p className="text-text-secondary">Image Preview</p>
                      <p className="text-sm text-text-outline mt-1">{previewRecord.name}.png</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <File className="w-20 h-20 text-error mx-auto mb-4" />
                      <p className="text-text-secondary">PDF Preview</p>
                      <p className="text-sm text-text-outline mt-1">{previewRecord.name}.pdf</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
