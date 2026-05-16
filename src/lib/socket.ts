import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    // In development and production, the server is on the same host
    socket = io();
  }
  return socket;
};

export const identify = (role: 'teacher' | 'student', name?: string) => {
  const s = getSocket();
  s.emit('identify', { role, name });
};

export const updateStatus = (data: any) => {
  const s = getSocket();
  s.emit('update_student_status', data);
};

export const sendTeacherCommand = (target: string, command: any) => {
  const s = getSocket();
  s.emit('teacher_command', { target, command });
};
