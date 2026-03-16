import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketServer | null = null;

export const initSocket = (httpServer: HttpServer): SocketServer => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: false
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
    allowEIO3: true,
    perMessageDeflate: false,
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-patient-room', (patientId: string) => {
      socket.join(`patient:${patientId}`);
      console.log(`Socket ${socket.id} joined patient room: ${patientId}`);
    });

    socket.on('join-hospital-room', (hospitalId: string) => {
      socket.join(`hospital:${hospitalId}`);
      console.log(`Socket ${socket.id} joined hospital room: ${hospitalId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
};

export const getIO = (): SocketServer | null => io;

export const emitToPatient = (patientId: string, event: string, data: any) => {
  if (io) {
    io.to(`patient:${patientId}`).emit(event, data);
  }
};

export const emitToHospital = (hospitalId: string, event: string, data: any) => {
  if (io) {
    io.to(`hospital:${hospitalId}`).emit(event, data);
  }
};

export const emitToAll = (event: string, data: any) => {
  if (io) {
    io.emit(event, data);
  }
};
