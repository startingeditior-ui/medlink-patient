'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Bell, Shield, Clock, AlertTriangle, Check, CheckCheck, Loader } from 'lucide-react';
import { Card } from '@/components/ui/Elements';
import { Button } from '@/components/ui/Button';
import { notificationAPI } from '@/lib/api';
import { Notification } from '@/types';
import { useNotificationListener } from '@/hooks/useNotificationListener';

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-IN');
};

const getIcon = (type: string) => {
  switch (type) {
    case 'ACCESS_GRANTED':
      return <Shield className="w-5 h-5 text-primary" />;
    case 'ACCESS_EXPIRED':
      return <Clock className="w-5 h-5 text-text-outline" />;
    case 'ACCESS_REVOKED':
    case 'CONSENT_REJECTED':
      return <Check className="w-5 h-5 text-error" />;
    case 'EMERGENCY_ACCESS':
      return <AlertTriangle className="w-5 h-5 text-error" />;
    case 'CONSENT_REQUEST':
      return <Shield className="w-5 h-5 text-warning" />;
    default:
      return <Bell className="w-5 h-5 text-text-outline" />;
  }
};

const getBgColor = (type: string) => {
  switch (type) {
    case 'ACCESS_GRANTED':
      return 'bg-primary/10';
    case 'ACCESS_EXPIRED':
      return 'bg-surface-high';
    case 'ACCESS_REVOKED':
    case 'CONSENT_REJECTED':
      return 'bg-red-50';
    case 'EMERGENCY_ACCESS':
      return 'bg-red-50';
    case 'CONSENT_REQUEST':
      return 'bg-warning/10';
    default:
      return 'bg-surface-high';
  }
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await notificationAPI.getNotifications();
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useNotificationListener({
    onNewNotification: (notification) => {
      setNotifications(prev => [notification, ...prev]);
    },
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' || (filter === 'unread' && !n.read)
  );

  const markAsRead = async (id: string) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
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
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold text-text-primary">Notifications</h1>
          <p className="text-text-secondary text-sm">{unreadCount} unread notifications</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="tonal" onClick={markAllAsRead} className="text-sm">
            <CheckCheck className="w-4 h-4 mr-1" />
            Mark all read
          </Button>
        )}
      </motion.div>

      <div className="flex gap-2">
        {(['all', 'unread'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === f
                ? 'bg-primary text-white'
                : 'bg-surface-low text-text-secondary hover:bg-surface-high'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="text-center py-8">
            <Bell className="w-12 h-12 text-primary/30 mx-auto mb-3" />
            <p className="text-text-secondary">No notifications</p>
          </Card>
        ) : (
          filteredNotifications.map((notification, idx) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => markAsRead(notification.id)}
              className={`cursor-pointer transition-all ${
                !notification.read ? 'ring-2 ring-primary/30 rounded-lg' : ''
              }`}
            >
              <Card className={`${getBgColor(notification.type)} border-0 p-4`}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-text-primary">{notification.title}</h3>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>
                    <p className="text-sm text-text-secondary mt-1">{notification.message}</p>
                    <p className="text-xs text-text-outline mt-2">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
