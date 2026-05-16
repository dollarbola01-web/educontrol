/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentClient } from './components/StudentClient';
import { LogIn, Monitor, Shield, LogOut, UserCircle, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getSocket, identify } from './lib/socket';

import { cn } from './lib/utils';

export default function App() {
  const [userName, setUserName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<'teacher' | 'student' | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  const handleLogin = () => {
    if (userName.trim()) {
      setIsLoggedIn(true);
    }
  };

  const handleRoleSelect = (selectedRole: 'teacher' | 'student') => {
    setRole(selectedRole);
    identify(selectedRole, userName);
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-dark-bg p-4 text-dark-text">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-dark-surface border border-dark-border p-10 shadow-2xl rounded-xl"
        >
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-12 h-12 text-accent-blue" />
            <h1 className="text-4xl font-bold font-serif italic tracking-tight text-white">EduControl</h1>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-[0.3em] text-dark-muted ml-1">STANTSIYA IDENTIFIKATSIYASI</label>
              <input 
                type="text" 
                placeholder="Kompyuter nomi yoki foydalanuvchi taxallusi..."
                value={userName}
                onChange={e => setUserName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full bg-dark-bg border border-dark-border p-4 text-white focus:border-accent-blue focus:outline-none transition-all font-mono"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={!userName.trim()}
              className="w-full flex items-center justify-center gap-2 bg-accent-blue-bg border border-accent-blue text-accent-blue p-5 font-bold hover:brightness-125 transition-all active:scale-95 uppercase tracking-widest text-xs disabled:opacity-30 disabled:pointer-events-none"
            >
              <LogIn className="w-4 h-4" />
              LAN HUBGA ULANISH
            </button>
          </div>
          <div className="mt-8 flex items-center justify-center gap-2 text-[9px] font-mono text-dark-muted uppercase tracking-widest">
             <Wifi className={cn("w-3 h-3", connected ? "text-green-500" : "text-red-500")} />
             {connected ? "Server topildi" : "Hub qidirilmoqda..."}
          </div>
        </motion.div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-dark-bg p-4 text-dark-text">
        <div className="max-w-3xl w-full grid md:grid-cols-2 gap-8">
          <motion.button
            whileHover={{ scale: 1.02, translateY: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRoleSelect('teacher')}
            className="flex flex-col items-center gap-6 bg-dark-surface border border-dark-border p-12 hover:border-accent-blue transition-all group rounded-2xl shadow-xl hover:shadow-[0_0_30px_rgba(138,180,248,0.1)]"
          >
            <div className="p-6 bg-dark-bg rounded-full border border-dark-border group-hover:border-accent-blue/30 transition-colors">
              <Shield className="w-16 h-16 group-hover:text-accent-blue transition-colors" />
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-3 text-white font-serif italic">Administrator paneli</h2>
              <p className="text-sm text-dark-muted font-mono leading-relaxed">Telemetriya, cheklovlar va ish stantsiyalarini markaziy boshqarish.</p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, translateY: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleRoleSelect('student')}
            className="flex flex-col items-center gap-6 bg-dark-surface border border-dark-border p-12 hover:border-accent-blue transition-all group rounded-2xl shadow-xl hover:shadow-[0_0_30px_rgba(138,180,248,0.1)]"
          >
            <div className="p-6 bg-dark-bg rounded-full border border-dark-border group-hover:border-accent-blue/30 transition-colors">
              <Monitor className="w-16 h-16 group-hover:text-accent-blue transition-colors" />
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-3 text-white font-serif italic">Talaba mijoz</h2>
              <p className="text-sm text-dark-muted font-mono leading-relaxed">Tarmoqqa ulangan workstation. Ma'muriy boshqaruvni kutmoqda.</p>
            </div>
          </motion.button>
        </div>
        
        <button 
          onClick={() => setIsLoggedIn(false)}
          className="mt-16 flex items-center gap-2 text-[10px] font-mono text-dark-muted hover:text-dark-text transition-colors uppercase tracking-[0.4em]"
        >
          <LogOut className="w-3 h-3" />
          ALOQANI UZISH: {userName}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text font-sans">
      <div className="border-b border-dark-border bg-dark-sidebar px-8 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <Shield className="w-6 h-6 text-accent-blue" />
          <h1 className="font-bold text-2xl font-serif italic tracking-tight text-white leading-none">EduControl</h1>
          <span className="text-[9px] bg-accent-blue-bg text-accent-blue border border-accent-blue/30 px-3 py-1 font-mono uppercase ml-4 tracking-[0.2em] rounded-full">{role} mode</span>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 text-xs font-mono text-dark-muted">
            <UserCircle className="w-4 h-4 text-accent-blue/50" />
            <span className="text-white">{userName}</span>
            <span className="opacity-30">@</span>
            <span className="opacity-60 uppercase text-[10px] tracking-widest">{connected ? "Onlayn" : "Ulanmoqda..."}</span>
          </div>
          <div className="h-6 w-px bg-dark-border" />
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setRole(null)}
              className="text-[10px] font-mono uppercase text-dark-muted hover:text-white transition-colors tracking-widest"
            >
              Rejimni o'zgartirish
            </button>
            <button 
              onClick={() => setIsLoggedIn(false)} 
              className="text-[10px] font-mono uppercase bg-accent-red-bg border border-accent-red/50 text-accent-red px-5 py-2 hover:brightness-125 transition-all tracking-[0.2em] rounded"
            >
              Chiqish
            </button>
          </div>
        </div>
      </div>

      <main className="h-[calc(100vh-65px)] overflow-hidden bg-dark-bg">
        <AnimatePresence mode="wait">
          {role === 'teacher' ? (
            <div key="teacher-wrap" className="h-full">
              <TeacherDashboard user={{ displayName: userName } as any} />
            </div>
          ) : (
            <div key="student-wrap" className="h-full">
              <StudentClient user={{ displayName: userName } as any} />
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

