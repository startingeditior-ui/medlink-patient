'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Shield, Ban, X, AlertTriangle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, Badge, Divider } from '@/components/ui/Elements';
import Link from 'next/link';
import { accessAPI } from '@/lib/api';
import { AccessRecord } from '@/types';
import { useNotificationListener } from '@/hooks/useNotificationListener';

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString('en-IN', { 
    day: 'numeric', 
    month: 'short', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const getTimeRemaining = (expiryStr: string) => {
  const now = new Date();
  const expiry = new Date(expiryStr);
  const diff = expiry.getTime() - now.getTime();
  
  if (diff <= 0) return 'Expired';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

export default function AccessPage() {
  const [accessList, setAccessList] = useState<AccessRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<{id: string, name: string} | null>(null);
  const [isRevoking, setIsRevoking] = useState<string | null>(null);

  const fetchAccessRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await accessAPI.getActiveAccess();
      setAccessList(response.data.accessRecords || []);
    } catch (error) {
      console.error('Failed to fetch access records:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccessRecords();
  }, [fetchAccessRecords]);

  useNotificationListener({
    onAccessUpdate: () => {
      fetchAccessRecords();
    },
  });

  const handleRevoke = async (accessId: string) => {
    if (confirm('Are you sure you want to revoke access?')) {
      try {
        setIsRevoking(accessId);
        await accessAPI.revokeAccess(accessId);
        setAccessList(prev => prev.filter(a => a.id !== accessId));
        alert('Access revoked successfully');
      } catch (error) {
        console.error('Failed to revoke access:', error);
        alert('Failed to revoke access');
      } finally {
        setIsRevoking(null);
      }
    }
  };

  const handleBlockHospital = (hospitalId: string, hospitalName: string) => {
    setSelectedHospital({ id: hospitalId, name: hospitalName });
    setShowBlockModal(true);
  };

  const confirmBlock = async () => {
    if (!selectedHospital) return;
    
    try {
      await accessAPI.blockHospital(selectedHospital.id);
      alert(`Blocked ${selectedHospital.name} from future access`);
      setShowBlockModal(false);
      setSelectedHospital(null);
      fetchAccessRecords();
    } catch (error: any) {
      console.error('Failed to block hospital:', error);
      const message = error.response?.data?.error || 'Failed to block hospital';
      alert(message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl font-bold text-text-primary">Access Control</h1>
        <p className="text-text-secondary text-sm">Manage who can view your records</p>
      </motion.div>

      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-text-primary">Active Access ({accessList.length})</h2>
        <Link href="/logs" className="text-primary text-sm">View All Logs</Link>
      </div>

      {accessList.length === 0 ? (
        <Card className="text-center py-10 px-6">
          <Shield className="w-12 h-12 text-primary/30 mx-auto mb-3" />
          <p className="text-text-secondary">No active access sessions</p>
        </Card>
      ) : (
        accessList.map((access, idx) => (
          <motion.div
            key={access.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">{access.doctorName}</h3>
                    <p className="text-sm text-text-secondary">{access.hospitalName}</p>
                    <p className="text-xs text-text-outline">{access.specialization}</p>
                  </div>
                </div>
                <Badge variant="success">Active</Badge>
              </div>

              <Divider />

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Started</span>
                  <span className="text-text-primary">{formatTime(access.accessStartTime)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Expires in</span>
                  <span className="text-primary font-medium">{getTimeRemaining(access.accessExpiryTime)}</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-text-secondary mb-2">Records accessible:</p>
                <div className="flex flex-wrap gap-2">
                  {access.recordsViewed.map((record, rIdx) => (
                    <span key={rIdx} className="text-xs bg-surface-low px-2 py-1 rounded">
                      {record}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outlined" 
                  className="flex-1 text-sm"
                  onClick={() => handleRevoke(access.id)}
                  isLoading={isRevoking === access.id}
                >
                  <X className="w-4 h-4 mr-1" />
                  Revoke
                </Button>
                <Button 
                  variant="tonal" 
                  className="flex-1 text-sm"
                  onClick={() => handleBlockHospital(access.hospitalId, access.hospitalName)}
                >
                  <Ban className="w-4 h-4 mr-1" />
                  Block
                </Button>
              </div>
            </Card>
          </motion.div>
        ))
      )}

      {showBlockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 max-w-sm w-full"
          >
            <div className="text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-error" />
              </div>
              <h3 className="font-semibold text-text-primary mb-2">Block Hospital?</h3>
              <p className="text-sm text-text-secondary mb-6">
                {selectedHospital?.name} will be permanently blocked from requesting access to your records.
              </p>
              <div className="flex gap-3">
                <Button variant="outlined" className="flex-1" onClick={() => setShowBlockModal(false)}>
                  Cancel
                </Button>
                <Button variant="filled" className="flex-1 bg-error hover:bg-error/90" onClick={confirmBlock}>
                  Block
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
