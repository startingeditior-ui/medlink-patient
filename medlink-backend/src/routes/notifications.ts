import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.patientId!;
    
    const notifications = await prisma.notification.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.get('/unread-count', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.patientId!;
    
    const count = await prisma.notification.count({
      where: {
        patientId,
        read: false
      }
    });

    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

router.put('/:notificationId/read', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { notificationId } = req.params;
    const patientId = req.patientId!;

    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        patientId
      }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    });

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

router.put('/read-all', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const patientId = req.patientId!;

    await prisma.notification.updateMany({
      where: {
        patientId,
        read: false
      },
      data: { read: true }
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

router.delete('/:notificationId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { notificationId } = req.params;
    const patientId = req.patientId!;

    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        patientId
      }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await prisma.notification.delete({
      where: { id: notificationId }
    });

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

export default router;
