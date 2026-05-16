import React, { useEffect, useState } from 'react';
import { Classroom, Student } from '../types';
import { 
  Monitor, 
  ShieldCheck, 
  MessageSquare, 
  Cpu, 
  Database, 
  Wifi, 
  Lock,
  Box,
  Terminal,
  Ghost
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { getSocket, updateStatus } from '../lib/socket';

const APPS = [
    'VS Code', 'Chrome', 'Spotify', 'Discord', 'Steam', 'Roblox', 
    'Terminal', 'Figma', 'IntelliJ IDEA', 'Postman', 'Docker Desktop', 
    'Zoom', 'Notion', 'Minecraft', 'Counter-Strike', 'Calculator'
];

export function StudentClient({ user }: { user: { displayName: string } }) {
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [currentApp, setCurrentApp] = useState(APPS[0]);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const socket = getSocket();

    socket.on('classroom_state', (state: Classroom) => {
      setClassroom(state);
    });

    socket.on('students_updated', (students: Student[]) => {
      const me = students.find(s => s.uid === socket.id);
      if (me) setStudent(me);
    });

    socket.on('student_command', (cmd: any) => {
      console.log('Received command:', cmd);
      if (cmd.type === 'kill_process') {
        const processName = cmd.process_name;
        if (currentApp === processName) {
            setNotification(`"${processName}" jarayoni o'qituvchi tomonidan to'xtatildi.`);
            setCurrentApp(APPS[APPS.length - 1]); // Reset to Calculator or something safe
            setTimeout(() => setNotification(null), 5000);
        }
      }
    });

    return () => {
      socket.off('classroom_state');
      socket.off('students_updated');
      socket.off('student_command');
    };
  }, [currentApp]);

  useEffect(() => {
    updateStatus({ currentApp });
    
    // Simulate periodic telemetry/screen data for Cast mode
    const interval = setInterval(() => {
        updateStatus({ 
            lastActive: new Date(),
            // Randomly update system metrics a bit
        });
    }, 5000);

    return () => clearInterval(interval);
  }, [currentApp]);

  const isCurrentAppBlocked = classroom?.globalBlockedApps.includes(currentApp);
  const isScreenLocked = student?.isBlocked;

  return (
    <div className="h-full flex flex-col bg-dark-bg text-dark-text font-mono p-8 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      {/* Remote Notification */}
      <AnimatePresence>
        {notification && (
            <motion.div 
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-accent-red text-black px-8 py-3 rounded-full font-bold uppercase text-[10px] tracking-widest shadow-[0_0_30px_#ef444466] flex items-center gap-3"
            >
                <Terminal className="w-4 h-4" />
                {notification}
            </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-10 relative z-10 border-b border-dark-border pb-6"
      >
        <div className="flex items-center gap-4">
          <div className="bg-dark-surface border border-accent-blue/30 text-accent-blue px-3 py-1 font-bold text-[10px] tracking-[0.2em] uppercase rounded-sm">Tugun faol</div>
          <div className="flex items-center gap-3 text-[10px] text-dark-muted">
             <Wifi className="w-3 h-3 text-accent-blue animate-pulse" />
             <span className="font-serif italic text-white text-base ml-2 tracking-tight">LAN: {classroom?.name || "Boshlanmoqda..."}</span>
          </div>
        </div>
        <div className="text-[9px] text-dark-muted uppercase tracking-[0.3em] font-mono">
           STATION_LINK: OK • SECURE • v1.0.4-STABLE
        </div>
      </motion.div>

      {/* Main UI */}
      <div className="flex-1 grid grid-cols-12 gap-10 relative z-10">
         <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-8 flex flex-col gap-8"
         >
            <div className="bg-dark-surface border border-dark-border p-8 rounded-xl shadow-2xl relative overflow-hidden group">
               <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[11px] font-bold flex items-center gap-2 text-white uppercase tracking-[0.2em]">
                     <Box className="w-4 h-4 text-accent-blue" />
                     Jarayonlar muhiti
                  </h2>
                  <span className="text-[9px] text-dark-muted italic opacity-50 uppercase tracking-widest">Workspace Context</span>
               </div>
               <div className="grid grid-cols-4 gap-4">
                  {APPS.map((app, idx) => (
                    <motion.button
                      key={app}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setCurrentApp(app)}
                      className={cn(
                        "py-3 border transition-all text-[10px] uppercase tracking-widest font-bold rounded-lg relative overflow-hidden",
                        currentApp === app 
                          ? "bg-accent-blue-bg border-accent-blue text-accent-blue shadow-[0_0_20px_rgba(138,180,248,0.15)] ring-1 ring-accent-blue/30" 
                          : "border-dark-border/50 text-dark-muted hover:border-dark-muted hover:text-white hover:bg-white/5 active:scale-95"
                      )}
                    >
                      {app}
                      {currentApp === app && (
                        <div className="absolute top-1 right-1 w-1 h-1 bg-accent-blue rounded-full" />
                      )}
                    </motion.button>
                  ))}
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/5 blur-[80px] -mr-16 -mt-16 rounded-full pointer-events-none" />
            </div>

            <div className="bg-dark-surface border border-dark-border p-8 rounded-xl shadow-2xl flex-1 flex flex-col relative group">
               <div className="absolute top-4 right-4 text-accent-blue/20">
                  <Terminal className="w-8 h-8" />
               </div>
               <h2 className="text-[11px] font-bold mb-6 flex items-center gap-2 uppercase tracking-[0.2em] text-white">
                  <MessageSquare className="w-4 h-4 text-accent-blue" />
                  Administrator ko'rsatmasi
               </h2>
               <div className="flex-1 bg-black/40 p-10 border border-dark-border/50 rounded-xl flex items-center justify-center text-center shadow-inner">
                  <AnimatePresence mode="wait">
                    <motion.p 
                        key={classroom?.broadcastMessage}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        className="text-3xl font-serif italic text-white tracking-tight leading-relaxed drop-shadow-lg"
                    >
                        {classroom?.broadcastMessage || "Administratordan faol xabar yo'q."}
                    </motion.p>
                  </AnimatePresence>
               </div>
            </div>
         </motion.div>

         <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-4 flex flex-col gap-8"
         >
            <div className="bg-dark-surface border border-dark-border p-8 rounded-xl shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-accent-blue/5 blur-3xl -mr-10 -mt-10 rounded-full" />
               <h2 className="text-[10px] font-bold mb-8 text-dark-muted uppercase tracking-[0.3em] font-sans border-b border-white/5 pb-4">Hardware Telemetry</h2>
               <div className="space-y-8">
                  <div className="flex items-center gap-4 group">
                     <div className="p-2 bg-black/40 rounded border border-white/5 group-hover:border-accent-blue/30 transition-colors">
                        <Cpu className="w-5 h-5 text-accent-blue" />
                     </div>
                     <div className="text-[10px]">
                        <div className="text-dark-muted uppercase tracking-widest mb-1 opacity-50">Protsessor yuki</div>
                        <div className="font-bold text-white text-xs">{student?.systemSpecs.cpu} • 14%</div>
                     </div>
                  </div>
                  <div className="flex items-center gap-4 group">
                     <div className="p-2 bg-black/40 rounded border border-white/5 group-hover:border-accent-blue/30 transition-colors">
                        <Database className="w-5 h-5 text-accent-blue" />
                     </div>
                     <div className="text-[10px]">
                        <div className="text-dark-muted uppercase tracking-widest mb-1 opacity-50">Xotira ajratilishi</div>
                        <div className="font-bold text-white text-xs">{student?.systemSpecs.ram} RESERVED</div>
                     </div>
                  </div>
                  <div className="flex items-center gap-4 group">
                     <div className="p-2 bg-black/40 rounded border border-white/5 group-hover:border-accent-blue/30 transition-colors">
                        <Monitor className="w-5 h-5 text-accent-blue" />
                     </div>
                     <div className="text-[10px]">
                        <div className="text-dark-muted uppercase tracking-widest mb-1 opacity-50">Ekran buferizatsiyasi</div>
                        <div className="font-bold text-white text-xs">Primary • 2560x1440</div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-dark-surface border border-dark-border p-8 rounded-xl shadow-2xl flex flex-col items-center justify-center text-center group relative overflow-hidden">
                <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative mb-6">
                    <ShieldCheck className="w-16 h-16 text-green-500 opacity-20 transition-all duration-700 group-hover:scale-110 group-hover:opacity-40" />
                    <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
                </div>
                <h3 className="text-xs font-bold mb-2 uppercase tracking-[0.2em] text-white">Xavfsizlik yaxshi</h3>
                <p className="text-[10px] text-dark-muted leading-relaxed font-serif italic max-w-[180px]">Ushbu terminal EduControl LAN tomonidan himoyalangan va verifikatsiyadan o'tgan.</p>
            </div>
         </motion.div>
      </div>

      {/* Status Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-10 pt-6 border-t border-dark-border flex items-center justify-between text-[9px] text-dark-muted font-mono tracking-[0.3em] relative z-10 uppercase"
      >
         <div className="flex gap-10">
            <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-accent-blue animate-pulse" /> Sessiya: 03:24:12</span>
            <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-accent-blue-bg border border-accent-blue" /> TX-TEZLIK: 12.4KB/S</span>
            <span className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded border border-white/10 group overflow-hidden relative">
               <motion.div 
                 animate={{ x: [-100, 100] }}
                 transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                 className="absolute inset-x-0 h-[1px] bg-accent-blue/20 top-0"
               />
               UPLINK_STATUS: <span className="text-green-500 font-bold">SECURE_TUNNEL_ACTIVE</span>
            </span>
         </div>
         <div className="flex items-center gap-3">
            <Wifi className="w-3 h-3 text-accent-blue" />
            SHIFRLANGAN ALOQA • KECHIKISH 4MS
         </div>
      </motion.div>

      {/* Full Screen Overlays for Restrictions */}
      <AnimatePresence>
        {isCurrentAppBlocked && !isScreenLocked && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-dark-bg/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-12 text-center"
          >
             <motion.div
               animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
               transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
               className="bg-accent-red-bg border border-accent-red p-10 mb-10 text-accent-red rounded-full shadow-[0_0_50px_#ef444433]"
             >
                <Terminal className="w-20 h-20" />
             </motion.div>
             <h1 className="text-6xl font-serif italic text-white mb-6 tracking-tight drop-shadow-2xl">Kirish taqiqlangan</h1>
             <p className="text-xl max-w-2xl text-dark-muted font-sans mb-12 leading-relaxed opacity-80">
                Ma'muriyat siyosati joriy sessiya davomida <span className="text-accent-red font-bold font-mono bg-accent-red-bg px-3 py-1 rounded">{currentApp}</span> dasturidan foydalanishni cheklaydi.
             </p>
             <button 
              onClick={() => setCurrentApp(APPS[APPS.length - 1])} // Go to Calculator
              className="bg-accent-blue text-black px-12 py-5 font-bold uppercase tracking-[0.4em] text-[10px] hover:brightness-125 transition-all shadow-xl active:scale-95"
             >
                Xavfsiz muhitga o'tish
             </button>
             <div className="mt-20 text-[8px] text-dark-muted uppercase tracking-[0.6em] font-mono opacity-30">
                SYSTEM_RESTRICTION_ENGINE v1.0.4 • POLICY_ID: 9281
             </div>
          </motion.div>
        )}

        {isScreenLocked && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-accent-blue-bg/80 z-[60] flex flex-col items-center justify-center p-12 text-center text-white backdrop-blur-[20px]"
          >
             <motion.div
               initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
               animate={{ scale: 1, opacity: 1, rotate: 0 }}
               transition={{ type: "spring", damping: 10, stiffness: 50 }}
             >
                <div className="p-10 bg-accent-blue rounded-full shadow-[0_0_60px_#8ab4f866] mb-12">
                    <Lock className="w-32 h-32 text-black" />
                </div>
             </motion.div>
             <h1 className="text-7xl font-serif italic text-white mb-8 leading-none tracking-tight">Konsol bloklandi</h1>
             <p className="text-2xl text-accent-blue max-w-2xl font-mono uppercase tracking-[0.3em] font-bold drop-shadow-lg">
                Markaziy izolatsiya faol. Iltimos, o'qituvchining ko'rsatmasini kuting.
             </p>
             <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-[10px] font-mono tracking-[0.5em] opacity-30">
                 <div className="flex items-center gap-4">
                    <Ghost className="w-5 h-5 animate-bounce" />
                    IZOLATSIYA_PROTOKOLI_YOQILGAN
                 </div>
                 <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                        animate={{ x: [-200, 200] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="w-20 h-full bg-accent-blue"
                    />
                 </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
