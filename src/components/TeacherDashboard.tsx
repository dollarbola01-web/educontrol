import React, { useEffect, useState } from 'react';
import { Classroom, Student } from '../types';
import { 
  Users, 
  Settings, 
  ShieldAlert, 
  MessageSquare, 
  Grid, 
  List, 
  Search, 
  Lock, 
  Unlock, 
  Power,
  Activity,
  Cpu,
  Layout,
  Monitor,
  Database,
  Terminal,
  X,
  Plus,
  Wifi,
  Maximize2,
  Minimize2,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { getSocket, sendTeacherCommand } from '../lib/socket';

export function TeacherDashboard({ user }: { user: { displayName: string } }) {
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'nodes' | 'cast' | 'restrictions' | 'telemetry' | 'settings'>('nodes');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [newRuleName, setNewRuleName] = useState('');
  const [showAddRule, setShowAddRule] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    socket.on('classroom_state', (state: Classroom) => {
      setClassroom(state);
    });

    socket.on('students_updated', (updatedStudents: Student[]) => {
      setStudents(updatedStudents);
    });

    socket.emit('identify', { role: 'teacher', name: user.displayName });

    return () => {
      socket.off('classroom_state');
      socket.off('students_updated');
    };
  }, [user.displayName]);

  const toggleGlobalBlock = (app: string) => {
    if (!classroom) return;
    const isBlocked = classroom.globalBlockedApps.includes(app);
    const newBlocked = isBlocked 
      ? classroom.globalBlockedApps.filter(a => a !== app)
      : [...classroom.globalBlockedApps, app];
    
    sendTeacherCommand('all', { type: 'block_global', apps: newBlocked });
  };

  const addNewRule = () => {
    if (!classroom || !newRuleName.trim()) return;
    const rule = newRuleName.trim();
    if (classroom.globalBlockedApps.includes(rule)) {
        setNewRuleName('');
        setShowAddRule(false);
        return;
    }
    const newBlocked = [...classroom.globalBlockedApps, rule];
    sendTeacherCommand('all', { type: 'block_global', apps: newBlocked });
    setNewRuleName('');
    setShowAddRule(false);
  };

  const updateBroadcast = () => {
    if (!message.trim()) return;
    sendTeacherCommand('all', { type: 'broadcast', message });
    setMessage('');
  };

  const toggleStudentLock = (student: Student) => {
    sendTeacherCommand(student.uid, { type: 'lock', value: !student.isBlocked });
  };

  const killStudentProcess = (student: Student) => {
    sendTeacherCommand(student.uid, { type: 'kill_process', process_name: student.currentApp });
  };

  const seedStudents = () => {
    const socket = getSocket();
    socket.emit('seed_students');
  };

  const toggleAutoBlock = () => {
    if (!classroom) return;
    sendTeacherCommand('all', { type: 'toggle_auto_block', value: !classroom.autoBlockGames });
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full bg-dark-bg text-dark-text overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-dark-border bg-dark-sidebar flex flex-col z-20">
        <div className="p-6 border-b border-dark-border">
          <h2 className="font-bold uppercase text-[10px] tracking-[0.2em] text-dark-muted mb-2 text-center">Ishchi maydon</h2>
          <div className="flex items-center justify-center gap-2 font-serif italic text-white text-lg overflow-hidden text-ellipsis whitespace-nowrap bg-black/30 p-2 rounded border border-dark-border/50">
            <Layout className="w-4 h-4 text-accent-blue" />
            {classroom?.name || "Yuklanmoqda..."}
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <button 
            onClick={() => setActiveTab('nodes')}
            className={cn(
                "w-full flex items-center justify-between px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 rounded",
                activeTab === 'nodes' 
                    ? "bg-accent-blue-bg text-accent-blue border border-accent-blue/30 translate-x-1" 
                    : "text-dark-muted hover:text-white hover:bg-white/5"
            )}
          >
            <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                Faol tugunlar
            </div>
            <span className="text-[10px] opacity-70">({students.length})</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('cast')}
            className={cn(
                "w-full flex items-center gap-3 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 rounded",
                activeTab === 'cast' 
                    ? "bg-accent-blue-bg text-accent-blue border border-accent-blue/30 translate-x-1" 
                    : "text-dark-muted hover:text-white hover:bg-white/5"
            )}
          >
            <Monitor className="w-4 h-4" />
            Cast Mode
          </button>

          <button 
            onClick={() => setActiveTab('restrictions')}
            className={cn(
                "w-full flex items-center gap-3 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 rounded",
                activeTab === 'restrictions' 
                    ? "bg-accent-red-bg text-accent-red border border-accent-red/30 translate-x-1" 
                    : "text-dark-muted hover:text-white hover:bg-white/5"
            )}
          >
            <ShieldAlert className="w-4 h-4" />
            Cheklovlar
          </button>

          <button 
            onClick={() => setActiveTab('telemetry')}
            className={cn(
                "w-full flex items-center gap-3 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 rounded",
                activeTab === 'telemetry' 
                    ? "bg-accent-blue-bg text-accent-blue border border-accent-blue/30 translate-x-1" 
                    : "text-dark-muted hover:text-white hover:bg-white/5"
            )}
          >
            <Activity className="w-4 h-4" />
            Telemetriya
          </button>

          <button 
            onClick={() => setActiveTab('settings')}
            className={cn(
                "w-full flex items-center gap-3 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 rounded",
                activeTab === 'settings' 
                    ? "bg-white/10 text-white border border-white/20 translate-x-1" 
                    : "text-dark-muted hover:text-white hover:bg-white/5"
            )}
          >
            <Settings className="w-4 h-4" />
            Sozlamalar
          </button>

          <div className="pt-8 pb-4">
            <h2 className="px-4 font-bold uppercase text-[9px] tracking-[0.3em] text-dark-muted mb-4">Ma'muriy vositalar</h2>
            <button 
                onClick={seedStudents}
                className="w-full flex items-center gap-3 px-4 py-2 text-dark-muted hover:text-white text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-white/5"
            >
                <Database className="w-4 h-4" />
                Simulyatsiya (Seed)
            </button>
          </div>
        </nav>

        <div className="p-6 border-t border-dark-border bg-black/20">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[9px] font-mono uppercase tracking-widest text-dark-muted">Aloqa holati</span>
            <span className={cn(
              "text-[9px] px-2 py-0.5 font-bold border rounded-full font-mono transition-all duration-500",
              classroom?.activeSession ? "border-green-500/50 text-green-500 shadow-[0_0_10px_#22c55e33]" : "border-red-500/50 text-red-500 shadow-[0_0_10px_#ef444433]"
            )}>
              {classroom?.activeSession ? "BARQAROR" : "OFFLAYN"}
            </span>
          </div>
          <button className="w-full flex items-center justify-center gap-2 bg-accent-red-bg border border-accent-red text-accent-red py-2 text-[10px] font-bold uppercase tracking-widest hover:brightness-125 transition-all active:scale-95">
            <Power className="w-3 h-3" />
            Sessiyani tugatish
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <section className="flex-1 flex flex-col overflow-hidden relative bg-dark-bg">
        <AnimatePresence mode="wait">
          {activeTab === 'nodes' && (
            <motion.div 
                key="nodes-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col h-full overflow-hidden"
            >
                {/* Header Controls */}
                <div className="bg-dark-sidebar border-b border-dark-border px-6 py-4 flex flex-col gap-4 shadow-xl relative z-10">
                    <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-4 flex-1 max-w-2xl">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-muted" />
                                <input 
                                    type="text" 
                                    placeholder="Ish stantsiyasini qidirish..." 
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-dark-border bg-dark-bg text-dark-text text-xs focus:outline-none focus:border-accent-blue transition-all rounded shadow-inner"
                                />
                            </div>
                            <div className="flex bg-dark-bg border border-dark-border p-1 rounded">
                                <button 
                                    onClick={() => setView('grid')}
                                    className={cn("p-1.5 rounded transition-all duration-300", view === 'grid' ? "bg-dark-surface text-accent-blue shadow-lg" : "text-dark-muted")}
                                >
                                    <Grid className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => setView('list')}
                                    className={cn("p-1.5 rounded transition-all duration-300", view === 'list' ? "bg-dark-surface text-accent-blue shadow-lg" : "text-dark-muted")}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden lg:flex items-center gap-3 bg-dark-bg border border-accent-red/30 px-4 py-2 rounded">
                                <ShieldAlert className="w-4 h-4 text-accent-red animate-pulse" />
                                <span className="text-[10px] font-bold font-mono text-accent-red uppercase tracking-wider">
                                    {classroom?.globalBlockedApps.length ? `Blok: ${classroom.globalBlockedApps.length} ilova` : "Cheklovlar yo'q"}
                                </span>
                            </div>
                            <button 
                                onClick={() => setShowAddRule(true)}
                                className="bg-accent-blue-bg border border-accent-blue text-accent-blue px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all rounded shadow-lg shadow-accent-blue/10 flex items-center gap-2"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Yangi qoida
                            </button>
                        </div>
                    </div>
                </div>

                {/* Global Message */}
                <div className="px-6 py-3 bg-dark-surface border-b border-dark-border flex gap-4 items-center">
                    <div className="flex-1 flex gap-3 items-center">
                        <div className="text-accent-blue">
                            <MessageSquare className="w-4 h-4" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Markaziy ko'rsatmani barchaga yuborish..."
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && updateBroadcast()}
                            className="flex-1 bg-transparent border-b border-dark-border/30 text-[11px] py-1 focus:outline-none focus:border-accent-blue transition-all font-serif italic text-white placeholder:opacity-40"
                        />
                        <button 
                            onClick={updateBroadcast}
                            className="text-[9px] font-bold font-mono text-dark-text bg-dark-bg border border-dark-border hover:border-accent-blue px-3 py-1.5 uppercase transition-all tracking-widest active:scale-95"
                        >
                            Broadcast
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-[#030303]">
                    {view === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            <AnimatePresence>
                                {filteredStudents.map(student => (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        layout
                                        key={student.uid}
                                        className={cn(
                                            "bg-dark-surface border border-dark-border rounded-xl overflow-hidden group relative transition-all duration-500",
                                            student.isBlocked ? "border-accent-red/40" : "hover:border-accent-blue/40 shadow-2xl hover:shadow-[0_0_40px_rgba(138,180,248,0.1)]"
                                        )}
                                    >
                                        <div className="p-4 border-b border-dark-border flex items-center justify-between bg-black/20">
                                            <div>
                                                <h3 className="font-bold text-sm text-white group-hover:text-accent-blue transition-colors font-serif italic leading-none mb-1">{student.name}</h3>
                                                <div className="flex items-center gap-1.5">
                                                    <span className={cn(
                                                        "w-1.5 h-1.5 rounded-full animate-pulse",
                                                        student.status === 'online' ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-dark-muted"
                                                    )} />
                                                    <span className="text-[8px] font-mono text-dark-muted uppercase tracking-widest">{student.status}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => toggleStudentLock(student)}
                                                    title={student.isBlocked ? "Qulflashdan chiqarish" : "Ish stolini bloklash"}
                                                    className={cn(
                                                        "p-2 rounded-lg border transition-all duration-300 active:scale-90",
                                                        student.isBlocked 
                                                            ? "bg-accent-red-bg border-accent-red text-accent-red" 
                                                            : "bg-dark-bg border-dark-border text-dark-muted hover:text-white hover:border-accent-blue"
                                                    )}
                                                >
                                                    {student.isBlocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="aspect-video bg-black flex flex-col items-center justify-center p-4 text-center border-b border-dark-border relative overflow-hidden group">
                                            {student.isBlocked && (
                                                <div className="absolute inset-0 bg-accent-red-bg/50 backdrop-blur-[2px] flex items-center justify-center z-20">
                                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="p-3 bg-accent-red rounded-full shadow-[0_0_20px_#ef4444]">
                                                        <Lock className="w-6 h-6 text-black" />
                                                    </motion.div>
                                                </div>
                                            )}
                                            <Monitor className="w-10 h-10 text-dark-muted opacity-10 mb-2 group-hover:scale-110 transition-transform duration-700" />
                                            <div className="text-[7px] font-mono text-dark-muted uppercase tracking-[0.5em] opacity-40">Station Telemetry Uplink</div>
                                            
                                            <div className="absolute top-2 right-2 flex items-center gap-2">
                                                <div className="bg-black/80 px-2 py-0.5 rounded text-[8px] text-green-500 font-mono border border-green-500/20 flex items-center gap-1">
                                                    <div className="w-1 h-1 bg-green-500 rounded-full animate-ping" />
                                                    LIVE
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-black/10">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-mono text-dark-muted uppercase tracking-widest mb-1">Dastur holati</span>
                                                    <span className={cn(
                                                        "text-[10px] font-bold px-2 py-0.5 border rounded uppercase tracking-wider shadow-sm",
                                                        classroom?.globalBlockedApps.includes(student.currentApp) 
                                                            ? "border-accent-red text-accent-red bg-accent-red-bg" 
                                                            : "border-accent-blue/30 text-accent-blue bg-accent-blue-bg/30"
                                                    )}>
                                                        {student.currentApp}
                                                    </span>
                                                </div>
                                                <button 
                                                    onClick={() => killStudentProcess(student)}
                                                    className="bg-accent-red-bg border border-accent-red/30 text-accent-red p-1.5 rounded hover:bg-accent-red hover:text-black transition-all active:scale-90"
                                                    title="Ilovani o'chirish"
                                                >
                                                    <Power className="w-3 h-3" />
                                                </button>
                                            </div>
                                            
                                            <div className="pt-2 border-t border-white/5 flex justify-between items-center opacity-30">
                                                <div className="flex items-center gap-1 text-[7px] font-mono uppercase tracking-tighter">
                                                    <Cpu className="w-2.5 h-2.5 text-accent-blue" />
                                                    {student.systemSpecs.cpu.split(' ').slice(0, 2).join(' ')}
                                                </div>
                                                <div className="text-[7px] font-mono tracking-widest">
                                                    {student.systemSpecs.ram} MEMORY
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {filteredStudents.length === 0 && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} className="col-span-full py-40 text-center flex flex-col items-center">
                                    <Monitor className="w-32 h-32 mb-8 stroke-[0.5]" />
                                    <p className="font-serif italic text-2xl tracking-[0.2em] text-white">Tarmoqda tugunlar yo'q</p>
                                    <p className="font-mono text-xs mt-4 uppercase tracking-[0.5em]">Scanning subnetwork 192.168.1.0/24...</p>
                                </motion.div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-dark-surface border border-dark-border rounded-xl shadow-2xl overflow-hidden">
                            <table className="w-full text-left font-mono text-[10px] border-collapse">
                                <thead>
                                    <tr className="border-b border-dark-border bg-black/40">
                                        <th className="px-6 py-5 font-bold uppercase tracking-[0.2em] text-dark-muted">Uplink ID</th>
                                        <th className="px-6 py-5 font-bold uppercase tracking-[0.2em] text-dark-muted">Node Identity</th>
                                        <th className="px-6 py-5 font-bold uppercase tracking-[0.2em] text-dark-muted">Telemetry</th>
                                        <th className="px-6 py-5 font-bold uppercase tracking-[0.2em] text-dark-muted">Active Process</th>
                                        <th className="px-6 py-5 font-bold uppercase tracking-[0.2em] text-dark-muted text-right">Operations</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredStudents.map((student) => (
                                        <tr key={student.uid} className="hover:bg-accent-blue-bg/5 transition-all group">
                                            <td className="px-6 py-4 text-dark-muted font-mono">{student.uid.slice(-10).toUpperCase()}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-white group-hover:text-accent-blue transition-colors font-serif italic text-sm">{student.name}</div>
                                                <div className="text-[8px] text-dark-muted opacity-40 uppercase tracking-tighter">{student.systemSpecs.os}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor]",
                                                        student.status === 'online' ? "text-green-500 bg-green-500" : "text-dark-muted bg-dark-muted"
                                                    )} />
                                                    <span className="opacity-60">{student.status.toUpperCase()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <span className={cn(
                                                        "px-3 py-1 border rounded uppercase tracking-tighter font-bold",
                                                        classroom?.globalBlockedApps.includes(student.currentApp) ? "border-accent-red text-accent-red bg-accent-red-bg" : "border-dark-border text-dark-muted"
                                                    )}>
                                                        {student.currentApp}
                                                    </span>
                                                    <button 
                                                        onClick={() => killStudentProcess(student)}
                                                        className="opacity-0 group-hover:opacity-100 p-1.5 text-accent-red hover:bg-accent-red-bg rounded transition-all"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => toggleStudentLock(student)}
                                                        className={cn(
                                                            "px-4 py-1.5 rounded text-[9px] uppercase font-bold tracking-[0.2em] transition-all border",
                                                            student.isBlocked 
                                                                ? "bg-accent-red text-black border-accent-red" 
                                                                : "bg-transparent text-dark-muted border-dark-border hover:border-accent-blue hover:text-accent-blue"
                                                        )}
                                                    >
                                                        {student.isBlocked ? "Off-Limit" : "Authorize"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </motion.div>
          )}

          {activeTab === 'cast' && (
            <motion.div 
                key="cast-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 p-8 overflow-y-auto bg-dark-bg relative"
            >
                <div className="max-w-[1600px] mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-serif italic text-white flex items-center gap-4">
                                <Monitor className="w-8 h-8 text-accent-blue" />
                                Live Cast Grid
                            </h2>
                            <p className="text-[10px] font-mono text-dark-muted uppercase tracking-[0.4em] mt-2">
                                Encrypted node monitoring • <span className="text-green-500">Secure Channel Active</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-black/40 border border-dark-border px-4 py-2 rounded-lg">
                                <ShieldCheck className="w-4 h-4 text-green-500" />
                                <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Antivirus: Active</span>
                            </div>
                            <div className="flex items-center gap-2 bg-black/40 border border-dark-border px-4 py-2 rounded-lg">
                                <Lock className="w-4 h-4 text-accent-blue" />
                                <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Keys: Rotated</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {students.map(student => (
                        <motion.div 
                            layoutId={`student-card-${student.uid}`}
                            key={student.uid} 
                            onClick={() => setSelectedStudent(student)}
                            className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden flex flex-col group hover:border-accent-blue/50 transition-all cursor-zoom-in shadow-2xl relative"
                        >
                            <div className="p-3 border-b border-dark-border flex items-center justify-between bg-black/40">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
                                    <span className="text-[10px] font-bold text-white font-serif italic truncate max-w-[100px]">{student.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Maximize2 className="w-3 h-3 text-dark-muted group-hover:text-accent-blue transition-colors" />
                                </div>
                            </div>
                            
                            <div className="flex-1 aspect-video bg-black relative overflow-hidden">
                                <div className="absolute inset-0 p-3">
                                    <div className="w-full h-full border border-white/5 rounded-lg flex flex-col items-center justify-center relative overflow-hidden bg-[#0a0a0a]">
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(138,180,248,0.05),transparent)] pointer-events-none" />
                                        
                                        {student.isBlocked ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <Lock className="w-6 h-6 text-accent-red opacity-40" />
                                                <div className="text-[7px] font-mono text-accent-red uppercase tracking-widest">ISOLATED</div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-accent-blue/10 flex items-center justify-center border border-accent-blue/20">
                                                    <Terminal className="w-5 h-5 text-accent-blue opacity-50" />
                                                </div>
                                                <span className="text-[9px] font-bold text-white/80">{student.currentApp}</span>
                                            </div>
                                        )}
                                        
                                        {/* Security Overlay Small */}
                                        <div className="absolute bottom-1 right-1 flex items-center gap-1 opacity-20">
                                            <ShieldCheck className="w-2 h-2 text-green-500" />
                                            <span className="text-[5px] font-mono text-green-500">AES-256</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="px-3 py-2 bg-black/20 text-[8px] font-mono flex justify-between items-center opacity-40">
                                <span>LATENCY: 4MS</span>
                                <span>FPS: 30</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
                </div>

                <AnimatePresence>
                    {selectedStudent && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col p-10"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="bg-accent-blue rounded-lg p-3">
                                        <Monitor className="w-8 h-8 text-black" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-serif italic text-white leading-none">{selectedStudent.name}</h2>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-xs font-mono text-accent-blue uppercase tracking-widest">Full Station Broadcast • {selectedStudent.uid.toUpperCase()}</span>
                                            <div className="h-4 w-px bg-white/10" />
                                            <div className="flex items-center gap-2 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded text-[10px] text-green-500 font-bold uppercase">
                                                <ShieldCheck className="w-3 h-3" />
                                                Verified Tunnel
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {selectedStudent.isBlocked ? (
                                        <button 
                                            onClick={() => toggleStudentLock(selectedStudent)}
                                            className="px-4 py-2 bg-accent-red text-black rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                                        >
                                            <Unlock className="w-4 h-4" />
                                            Unlock Station
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => toggleStudentLock(selectedStudent)}
                                            className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-accent-red hover:text-black transition-all flex items-center gap-2"
                                        >
                                            <Lock className="w-4 h-4" />
                                            Lock Station
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => setSelectedStudent(null)}
                                        className="p-4 bg-white/5 border border-white/10 rounded-full text-white hover:bg-white/10 active:scale-90 transition-all"
                                    >
                                        <Minimize2 className="w-8 h-8" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 flex gap-10 min-h-0 overflow-hidden">
                                <div className="flex-[3] bg-black rounded-3xl border border-white/5 shadow-[0_0_100px_rgba(138,180,248,0.1)] relative overflow-hidden flex items-center justify-center group cursor-crosshair">
                                    <div className="absolute inset-0 bg-[#020202]">
                                        {/* Simulated Complex OS UI */}
                                        <div className="w-full h-full p-10 flex flex-col opacity-20">
                                            <div className="flex justify-between items-center mb-10">
                                                <div className="flex gap-4">
                                                    <div className="w-12 h-12 rounded bg-white/10" />
                                                    <div className="w-32 h-4 bg-white/10 rounded mt-4" />
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="w-20 h-8 rounded bg-white/10" />
                                                    <div className="w-8 h-8 rounded-full bg-white/10" />
                                                </div>
                                            </div>
                                            <div className="flex-1 grid grid-cols-12 gap-8">
                                                <div className="col-span-3 border border-white/10 rounded-xl" />
                                                <div className="col-span-9 border border-white/10 rounded-xl bg-white/5" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative z-10 text-center">
                                        <AnimatePresence mode="wait">
                                            {selectedStudent.isBlocked ? (
                                                <motion.div 
                                                    key="locked"
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 1.2, opacity: 0 }}
                                                    className="flex flex-col items-center gap-8"
                                                >
                                                    <div className="p-16 bg-accent-red rounded-full shadow-[0_0_80px_#ef444466] border-4 border-black">
                                                        <Lock className="w-40 h-40 text-black px-2" />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <h3 className="text-6xl font-serif italic text-accent-red drop-shadow-[0_0_30px_#ef444466]">Access Revoked</h3>
                                                        <p className="text-dark-muted font-mono uppercase tracking-[0.5em] text-sm italic">Terminal Isolation Policy Alpha Active</p>
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <motion.div 
                                                    key="active"
                                                    initial={{ scale: 1.2, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 0.8, opacity: 0 }}
                                                    className="flex flex-col items-center"
                                                >
                                                    <div className="w-64 h-64 rounded-[40px] bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center mx-auto mb-12 shadow-[0_0_80px_rgba(138,180,248,0.2)] group-hover:scale-105 transition-transform duration-1000">
                                                        <Terminal className="w-32 h-32 text-accent-blue" />
                                                    </div>
                                                    <h3 className="text-7xl font-serif italic text-white mb-6 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">{selectedStudent.currentApp}</h3>
                                                    <div className="flex items-center gap-4 bg-black/60 border border-white/10 px-8 py-3 rounded-full">
                                                        <Activity className="w-4 h-4 text-accent-blue" />
                                                        <p className="font-mono text-accent-blue uppercase tracking-[0.4em] text-xs">Uplink Status: Optimized</p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div className="absolute top-6 right-6 flex items-center gap-4">
                                        <div className="flex flex-col items-end opacity-50">
                                            <span className="text-[10px] font-mono text-accent-blue uppercase tracking-widest">Framerate</span>
                                            <span className="text-xl font-bold text-white">60 FPS</span>
                                        </div>
                                        <div className="flex flex-col items-end opacity-50">
                                            <span className="text-[10px] font-mono text-accent-blue uppercase tracking-widest">Quality</span>
                                            <span className="text-xl font-bold text-white">1080P</span>
                                        </div>
                                    </div>
                                    
                                    {/* Interaction Bar Overlay */}
                                    <div className="absolute bottom-10 inset-x-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <div className="bg-black/60 backdrop-blur-2xl border border-white/10 px-8 py-4 rounded-2xl flex items-center gap-8 shadow-3xl">
                                            <button onClick={() => toggleStudentLock(selectedStudent)} className="flex flex-col items-center gap-1 group/btn">
                                                <div className={cn("p-4 rounded-full transition-all", selectedStudent.isBlocked ? "bg-accent-red text-black" : "bg-white/10 text-white group-hover/btn:bg-accent-blue group-hover/btn:text-black")}>
                                                    {selectedStudent.isBlocked ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                                                </div>
                                                <span className="text-[8px] font-bold text-dark-muted uppercase tracking-widest">{selectedStudent.isBlocked ? "Restore" : "Isolate"}</span>
                                            </button>
                                            <div className="w-px h-12 bg-white/10" />
                                            <button onClick={() => killStudentProcess(selectedStudent)} className="flex flex-col items-center gap-1 group/btn">
                                                <div className="p-4 rounded-full bg-white/10 text-white group-hover/btn:bg-accent-red group-hover/btn:text-black transition-all">
                                                    <Power className="w-6 h-6" />
                                                </div>
                                                <span className="text-[8px] font-bold text-dark-muted uppercase tracking-widest">Shutdown</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-96 flex flex-col gap-10">
                                    <div className="bg-dark-surface border border-dark-border p-8 rounded-3xl overflow-hidden relative">
                                        <div className="absolute top-0 left-0 w-1 p-2 h-full bg-accent-blue/50" />
                                        <h4 className="text-xs font-bold text-white uppercase tracking-[0.3em] mb-8">Node Security Audit</h4>
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                                <span className="text-[10px] text-dark-muted uppercase tracking-widest">Encryption</span>
                                                <span className="text-[10px] text-green-500 font-bold">AES-GCM (Active)</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                                <span className="text-[10px] text-dark-muted uppercase tracking-widest">Handshake</span>
                                                <span className="text-[10px] text-green-500 font-bold">Validated OK</span>
                                            </div>
                                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                                <span className="text-[10px] text-dark-muted uppercase tracking-widest">Integrity Check</span>
                                                <span className="text-[10px] text-accent-blue font-bold">100% Passed</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-dark-muted uppercase tracking-widest">Host ID</span>
                                                <span className="text-[10px] text-white font-mono opacity-60">ID_721-B_LAN</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 bg-dark-surface border border-dark-border p-8 rounded-3xl flex flex-col">
                                        <h4 className="text-xs font-bold text-white uppercase tracking-[0.3em] mb-6">Process History</h4>
                                        <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                                            {[1,2,3,4,5,6].map(i => (
                                                <div key={i} className="flex items-center justify-between text-[10px] p-3 bg-black/20 border border-white/5 rounded-lg opacity-40">
                                                    <span className="font-mono text-dark-muted">{10+i}:00:32</span>
                                                    <span className="text-white font-bold tracking-widest uppercase">Transition to {selectedStudent.currentApp}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {students.length === 0 && (
                    <div className="col-span-full py-40 text-center flex flex-col items-center opacity-20">
                         <Monitor className="w-24 h-24 mb-6 stroke-[0.5]" />
                         <p className="font-serif italic text-xl tracking-widest">Tugunlar monitoringi kutilmoqda</p>
                    </div>
                )}
            </motion.div>
          )}

          {activeTab === 'restrictions' && (
            <motion.div 
                key="restrictions-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 p-10 overflow-y-auto"
            >
                <div className="max-w-4xl mx-auto">
                    <header className="mb-12">
                        <h2 className="text-4xl font-serif italic text-white mb-2">Xavfsizlik Siyosati</h2>
                        <p className="text-dark-muted font-mono uppercase text-xs tracking-[0.3em]">Global cheklovlar va ruxsat etilgan ilovalar boshqaruvi</p>
                    </header>

                    <div className="grid md:grid-cols-2 gap-12">
                        <section className="bg-dark-surface border border-dark-border rounded-xl p-8 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <ShieldAlert className="w-24 h-24" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                                <Lock className="w-5 h-5 text-accent-red" />
                                Bloklangan Ilovalar
                            </h3>
                            <div className="space-y-3">
                                {classroom?.globalBlockedApps.map(app => (
                                    <motion.div 
                                        layout
                                        key={app} 
                                        className="flex items-center justify-between bg-black/40 border border-white/5 p-4 rounded-lg group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-accent-red rounded-full shadow-[0_0_5px_#ef4444]" />
                                            <span className="font-mono text-sm text-white">{app}</span>
                                        </div>
                                        <button 
                                            onClick={() => toggleGlobalBlock(app)}
                                            className="text-dark-muted hover:text-accent-red transition-colors p-1"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </motion.div>
                                ))}
                                <button 
                                    onClick={() => setShowAddRule(true)}
                                    className="w-full border-2 border-dashed border-dark-border p-4 rounded-lg text-dark-muted hover:border-accent-blue hover:text-accent-blue transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest"
                                >
                                    <Plus className="w-4 h-4" />
                                    Yangi qoida qo'shish
                                </button>
                            </div>
                        </section>

                        <section className="space-y-8">
                            <div className="bg-dark-surface border border-dark-border rounded-xl p-8">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-dark-muted mb-6">Xavfsizlik Rejimi</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-lg active:scale-95 transition-transform cursor-pointer">
                                        <div className="flex flex-col">
                                            <span className="text-white text-sm font-bold">Qat'iy Nazorat</span>
                                            <span className="text-[10px] text-dark-muted">Faqat ruxsat etilgan ilovalar</span>
                                        </div>
                                        <div className="w-12 h-6 bg-dark-bg border border-dark-border rounded-full relative p-1">
                                            <div className="w-4 h-4 bg-accent-blue rounded-full float-right shadow-[0_0_10px_#8ab4f8]" />
                                        </div>
                                    </div>
                                     <div className={cn(
                                        "flex items-center justify-between p-4 bg-black/20 border border-white/5 rounded-lg active:scale-95 transition-all cursor-pointer",
                                        classroom?.autoBlockGames ? "border-accent-blue/40" : ""
                                    )} onClick={toggleAutoBlock}>
                                        <div className="flex flex-col">
                                            <span className="text-white text-sm font-bold">Avtomatik bloklash</span>
                                            <span className="text-[10px] text-dark-muted">O'yinlarni avtomatik aniqlash (AI)</span>
                                        </div>
                                        <div className={cn(
                                            "w-12 h-6 border rounded-full relative p-1 transition-all duration-300",
                                            classroom?.autoBlockGames ? "bg-accent-blue/20 border-accent-blue/50" : "bg-dark-bg border-dark-border"
                                        )}>
                                            <motion.div 
                                                animate={{ x: classroom?.autoBlockGames ? 24 : 0 }}
                                                className={cn(
                                                    "w-4 h-4 rounded-full shadow-lg transition-colors",
                                                    classroom?.autoBlockGames ? "bg-accent-blue shadow-[0_0_10px_#8ab4f8]" : "bg-dark-muted"
                                                )} 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-accent-blue-bg/10 border border-accent-blue/20 rounded-xl p-6 italic font-serif text-accent-blue/80 text-sm leading-relaxed">
                                "Sinflarda raqamli muhit xavfsizligini ta'minlash uchun cheklovlar real vaqtda yangilanadi va barcha talaba tugunlariga darhol tatbiq etiladi."
                            </div>
                        </section>
                    </div>
                </div>
            </motion.div>
          )}

          {activeTab === 'telemetry' && (
            <motion.div 
                key="telemetry-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 p-10 overflow-y-auto"
            >
                <div className="max-w-5xl mx-auto">
                    <header className="mb-12 border-b border-white/5 pb-8">
                        <h2 className="text-4xl font-serif italic text-white mb-2">Muntazam Telemetriya</h2>
                        <p className="text-dark-muted font-mono uppercase text-xs tracking-[0.3em]">Tizim yuki, resurslar taqsimoti va aloqa sifati tahlili</p>
                    </header>

                    <div className="grid grid-cols-3 gap-8 mb-12">
                        <div className="bg-dark-surface border border-dark-border p-8 rounded-xl flex flex-col items-center">
                            <Cpu className="w-8 h-8 text-accent-blue mb-4" />
                            <span className="text-4xl font-bold text-white mb-1">12.4%</span>
                            <span className="text-[10px] font-mono text-dark-muted uppercase tracking-widest">O'rtacha CPU yuki</span>
                        </div>
                        <div className="bg-dark-surface border border-dark-border p-8 rounded-xl flex flex-col items-center">
                            <Database className="w-8 h-8 text-green-500 mb-4" />
                            <span className="text-4xl font-bold text-white mb-1">4.2 GB</span>
                            <span className="text-[10px] font-mono text-dark-muted uppercase tracking-widest">Xotira iste'moli</span>
                        </div>
                        <div className="bg-dark-surface border border-dark-border p-8 rounded-xl flex flex-col items-center">
                            <Activity className="w-8 h-8 text-accent-red mb-4" />
                            <span className="text-4xl font-bold text-white mb-1">4ms</span>
                            <span className="text-[10px] font-mono text-dark-muted uppercase tracking-widest">Joriy Kechikish</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="bg-dark-surface border border-dark-border p-8 rounded-xl h-64 flex flex-col">
                            <h3 className="text-sm font-bold text-white mb-8 uppercase tracking-widest border-b border-white/5 pb-4">Tugunlar Faolligi</h3>
                            <div className="flex-1 flex items-end gap-2">
                                {[34, 45, 67, 89, 45, 56, 78, 90, 45, 34, 56, 78].map((h, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        className="flex-1 bg-accent-blue/30 rounded-t-sm hover:bg-accent-blue transition-all"
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="bg-dark-surface border border-dark-border p-8 rounded-xl h-64 flex flex-col">
                            <h3 className="text-sm font-bold text-white mb-8 uppercase tracking-widest border-b border-white/5 pb-4">Tarmoq Paketlari</h3>
                            <div className="flex-1 flex items-center justify-center relative">
                                <div className="absolute inset-0 border border-accent-blue/10 rounded-full animate-ping" />
                                <div className="p-10 bg-accent-blue shadow-[0_0_50px_#8ab4f833] rounded-full">
                                    <Wifi className="w-12 h-12 text-black" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div 
                key="settings-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 p-10 overflow-y-auto"
            >
                <div className="max-w-3xl mx-auto">
                    <header className="mb-12">
                        <div className="bg-white/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                            <Settings className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-4xl font-serif italic text-white mb-2">Tizim Sozlamalari</h2>
                        <p className="text-dark-muted font-mono uppercase text-xs tracking-[0.3em]">Platforma konfiguratsiyasi va administrator profilini boshqarish</p>
                    </header>

                    <div className="space-y-8">
                        <section className="bg-dark-surface border border-dark-border rounded-xl p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono text-dark-muted uppercase tracking-[0.3em]">Sinf Nomi</label>
                                <input 
                                    type="text" 
                                    defaultValue={classroom?.name}
                                    className="w-full bg-black border border-dark-border p-3 text-white focus:border-accent-blue focus:outline-none transition-all font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono text-dark-muted uppercase tracking-[0.3em]">Administrator Identifikatori</label>
                                <input 
                                    type="text" 
                                    readOnly
                                    value={user.displayName}
                                    className="w-full bg-black/50 border border-dark-border p-3 text-dark-muted focus:outline-none font-mono italic"
                                />
                            </div>
                        </section>

                        <section className="bg-dark-surface border border-dark-border rounded-xl p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-white font-bold">Avtomatik yangilash</span>
                                    <span className="text-[10px] text-dark-muted">Tugunlar holatini har 2 soniyada tekshirish</span>
                                </div>
                                <div className="w-12 h-6 bg-accent-blue-bg border border-accent-blue/30 rounded-full relative p-1 shadow-[0_0_10px_#8ab4f833]">
                                    <div className="w-4 h-4 bg-accent-blue rounded-full float-right" />
                                </div>
                            </div>
                            <div className="border-t border-white/5 pt-6 flex justify-between">
                                <button className="px-6 py-2 bg-accent-blue text-black font-bold uppercase text-[10px] tracking-widest rounded hover:brightness-125 transition-all">
                                    Saqlash
                                </button>
                                <button className="px-6 py-2 bg-transparent text-dark-muted border border-dark-border font-bold uppercase text-[10px] tracking-widest rounded hover:text-white transition-all">
                                    Standartga Qaytarish
                                </button>
                            </div>
                        </section>

                        <div className="text-center py-10 opacity-20 text-[10px] font-mono uppercase tracking-[1em]">
                            EduControl Engine v1.0.4 • Build 8291
                        </div>
                    </div>
                </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer info (Sophisticated Dark layout piece) */}
        <footer className="h-10 bg-dark-sidebar border-t border-dark-border flex items-center px-6 text-[9px] font-mono tracking-[0.2em] text-dark-muted uppercase absolute bottom-0 inset-x-0 bg-opacity-80 backdrop-blur-md">
           <div className="flex-1 flex gap-6">
              <span>Telemetriya: Barqaror</span>
              <span>Kechikish: 4ms</span>
              <span className="text-accent-blue animate-pulse">Buyruq kutmoqda...</span>
           </div>
           <div>
              {students.length} Tugunlar Onlayn • {new Date().toLocaleTimeString()}
           </div>
        </footer>
      </section>

      {/* Global Add Rule Modal (Simple Overlays) */}
      <AnimatePresence>
        {showAddRule && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            >
                <div className="max-w-md w-full bg-dark-sidebar border border-accent-blue/30 p-8 rounded-2xl shadow-2xl relative">
                    <button onClick={() => setShowAddRule(false)} className="absolute top-4 right-4 text-dark-muted hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                    <h3 className="text-2xl font-serif italic text-white mb-6">Yangi Cheklov</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                             <label className="text-[10px] font-mono text-dark-muted uppercase tracking-[0.3em]">Ilova Nomi (Process ID)</label>
                             <input 
                                autoFocus
                                type="text" 
                                placeholder="Masalan: steam.exe"
                                value={newRuleName}
                                onChange={e => setNewRuleName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addNewRule()}
                                className="w-full bg-black border border-dark-border p-4 text-white focus:border-accent-blue focus:outline-none transition-all font-mono"
                             />
                        </div>
                        <button 
                            onClick={addNewRule}
                            className="w-full bg-accent-blue text-black py-4 font-bold uppercase tracking-widest text-xs hover:brightness-125 transition-all shadow-[0_0_20px_#8ab4f866]"
                        >
                            Qoidani Tatbiq Etish
                        </button>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

