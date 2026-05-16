export interface Student {
  uid: string;
  name: string;
  status: 'online' | 'offline' | 'away';
  currentApp: string;
  lastActive: any;
  isBlocked: boolean;
  individualBlockedApps: string[];
  screenData?: string | null; // Base64 or placeholder for cast mode
  systemSpecs: {
    os: string;
    ram: string;
    cpu: string;
  };
}

export interface Classroom {
  id: string;
  name: string;
  teacherId: string;
  globalBlockedApps: string[];
  broadcastMessage: string;
  activeSession: boolean;
  autoBlockGames: boolean;
}
