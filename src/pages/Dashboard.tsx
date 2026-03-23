import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Plus, 
  Calendar, 
  Zap, 
  ChevronRight, 
  BookOpen,
  AlertCircle,
  X,
  Shield,
  Clock,
  Sparkles,
  Target
} from 'lucide-react';
import { cn } from '../utils/cn';
import { format, differenceInDays, isSameDay } from 'date-fns';
import { useHomeworks, useUserStats, useTimerLogs } from '../hooks/useDb';
import { useAuth } from '../contexts/AuthContext';
import { Timestamp } from 'firebase/firestore';
import { SCHOOL_TIMETABLE, WEEKLY_PRACTICE, EXAM_TIPS } from '../data/timetable';

interface UserStatsData {
  streak: number;
  lastCheckIn: Timestamp | null;
}

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const { data: homework, addHomework, toggleHomework, isReadOnly: hwReadOnly, loading: hwLoading } = useHomeworks();
  const { stats, checkIn, isReadOnly: statsReadOnly, loading: statsLoading } = useUserStats();
  const { logs, loading: logsLoading } = useTimerLogs();
  
  const typedStats = stats as UserStatsData;
  const [isAdding, setIsAdding] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const isReadOnly = hwReadOnly || statsReadOnly;

  const today = new Date();
  const dayNameEn = format(today, 'eee'); // Mon, Tue...
  const isWeekend = dayNameEn === 'Sat' || dayNameEn === 'Sun';
  
  // Smart Exam Date Logic
  const midtermDate = profile?.midtermDate ? new Date(profile.midtermDate) : null;
  const finalDate = profile?.finalDate ? new Date(profile.finalDate) : null;
  
  let targetExamDate = finalDate || new Date('2026-06-25');
  let examName = '期末考';

  if (midtermDate && midtermDate >= today) {
    targetExamDate = midtermDate;
    examName = '期中考';
  }

  const daysToExam = differenceInDays(targetExamDate, today);

  const handleAdd = async () => {
    if (!inputValue.trim() || isReadOnly) return;
    await addHomework(inputValue.trim());
    setInputValue('');
    setIsAdding(false);
  };

  const isCheckInDisabled = isReadOnly || (typedStats?.lastCheckIn && isSameDay(typedStats.lastCheckIn.toDate(), today));

  // Get active exam tip
  const activeTip = EXAM_TIPS.slice().reverse().find(tip => daysToExam <= tip.days);

  if (hwLoading || statsLoading || logsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const todayLogs = logs.filter(log => log.timestamp && isSameDay(log.timestamp.toDate(), today));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Role Banner */}
      {isReadOnly && (
        <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-2xl flex items-center justify-center gap-2 text-orange-600 font-bold text-xs">
          <Shield size={16} />
          家長監管模式：目前為唯讀狀態，無法新增或修改資料
        </div>
      )}

      {/* Exam Tip */}
      {activeTip && (
        <div className="bg-primary/10 border border-primary/20 p-4 rounded-[24px] flex items-start gap-3 animate-pulse">
          <Sparkles className="text-primary shrink-0 mt-0.5" size={18} />
          <p className="text-sm font-black text-primary leading-tight">
            {activeTip.message}
          </p>
        </div>
      )}

      {/* Header Section */}
      <section className="flex items-end justify-between px-1">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.2em]">
            {format(today, 'yyyy / MM / dd')}
          </p>
          <h2 className="text-3xl font-black tracking-tighter">
            {isReadOnly ? '孩子目前進度' : `嗨, ${profile?.displayName || '同學'}!`}
          </h2>
        </div>
        {!isReadOnly && (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-12 h-12 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all border-2 border-white/20"
          >
            <Plus size={28} />
          </button>
        )}
      </section>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-primary p-5 rounded-[32px] text-primary-foreground space-y-3 shadow-xl shadow-primary/20 relative overflow-hidden group">
          <div className="absolute right-[-10%] top-[-10%] w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
          <div className="flex justify-between items-start">
            <Zap size={24} className="opacity-80" />
            <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full uppercase">Streak</span>
          </div>
          <div>
            <p className="text-4xl font-black">{typedStats?.streak || 0}</p>
            <p className="text-[10px] font-bold opacity-70">連續學習天數</p>
          </div>
          <button 
            disabled={!!isCheckInDisabled}
            onClick={checkIn}
            className={cn(
              "w-full py-2 rounded-xl text-xs font-black transition-all",
              isCheckInDisabled 
                ? "bg-white/10 text-white/40 cursor-not-allowed" 
                : "bg-white text-primary hover:bg-opacity-90 active:scale-95"
            )}
          >
            {isCheckInDisabled ? (isReadOnly ? '家長模式' : '今日已打卡') : '點我打卡'}
          </button>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] p-5 rounded-[32px] space-y-3 shadow-sm relative overflow-hidden group">
           <div className="absolute right-[-10%] top-[-10%] w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
           <div className="flex justify-between items-start">
            <Calendar size={24} className="text-primary opacity-80" />
            <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">Exam</span>
          </div>
          <div>
            <p className="text-4xl font-black text-primary">{Math.max(0, daysToExam)}</p>
            <p className="text-[10px] font-bold text-[var(--muted-foreground)]">{examName}倒數</p>
          </div>
          <div className="w-full h-1.5 bg-[var(--secondary)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-1000" 
              style={{ width: `${Math.max(0, 100 - (daysToExam / 30) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Parent Only: Today's Practiced Subjects */}
      {isReadOnly && todayLogs.length > 0 && (
        <section className="bg-green-500/5 border border-green-500/10 p-5 rounded-[32px] space-y-3">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 size={18} />
            <h3 className="font-black text-sm">今日已練習科目</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(todayLogs.map(l => l.subject))).map(sub => (
              <span key={sub} className="px-3 py-1 bg-green-500 text-white rounded-full text-[10px] font-black">
                {sub}
              </span>
            ))}
          </div>
          <p className="text-[10px] font-bold text-green-600/60 pl-1">
            孩子今天已完成 {todayLogs.length} 次自主練習
          </p>
        </section>
      )}

      {/* Practice Focus Section */}
      <section className="bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-[32px] space-y-4">
        <div className="flex items-center gap-2">
          <Target className="text-indigo-500" size={20} />
          <h3 className="font-black text-lg text-indigo-900 dark:text-indigo-100">今晚自主練習建議</h3>
        </div>
        {WEEKLY_PRACTICE[dayNameEn] ? (
          <div className="space-y-3">
            <div className="bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-indigo-500/10">
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">練習科目</p>
              <p className="text-md font-black">{WEEKLY_PRACTICE[dayNameEn].focus}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/50 dark:bg-black/20 p-3 rounded-2xl border border-indigo-500/10">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">策略</p>
                <p className="text-xs font-bold leading-tight">{WEEKLY_PRACTICE[dayNameEn].methods}</p>
              </div>
              <div className="bg-white/50 dark:bg-black/20 p-3 rounded-2xl border border-indigo-500/10">
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">講義</p>
                <p className="text-xs font-bold leading-tight">{WEEKLY_PRACTICE[dayNameEn].materials}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm font-bold opacity-60 italic px-2">週末休息時間，預習或放鬆一下吧！</p>
        )}
      </section>

      {/* School Timetable Section (Only Weekdays) */}
      {!isWeekend && (
        <section className="space-y-4 px-1">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-lg flex items-center gap-2">
              <Clock size={20} className="text-primary" />
              今日學校課表
            </h3>
            <span className="text-[10px] font-bold text-[var(--muted-foreground)]">七年級下學期</span>
          </div>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-[32px] overflow-hidden shadow-sm">
            <div className="flex bg-[var(--secondary)] py-2 px-6 border-b border-[var(--border)]">
              <div className="w-16 text-[10px] font-black text-[var(--muted-foreground)]">節次</div>
              <div className="w-20 text-[10px] font-black text-[var(--muted-foreground)]">時間</div>
              <div className="flex-1 text-[10px] font-black text-[var(--muted-foreground)]">科目</div>
            </div>
            {SCHOOL_TIMETABLE.map((p, idx) => (
              <div key={idx} className="flex items-center py-3 px-6 border-b border-[var(--border)] last:border-0 hover:bg-primary/5 transition-colors">
                <div className="w-16 text-xs font-black">{p.period}</div>
                <div className="w-20 text-[10px] font-bold text-[var(--muted-foreground)]">{p.time}</div>
                <div className="flex-1 text-sm font-black">{p.subjects[dayNameEn as keyof typeof p.subjects]}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Homework Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-black text-lg flex items-center gap-2">
            <BookOpen size={20} className="text-primary" />
            今日作業清單
            <span className="bg-[var(--secondary)] text-[var(--muted-foreground)] text-[10px] px-2 py-0.5 rounded-full">
              {homework.filter(h => h.completed).length}/{homework.length}
            </span>
          </h3>
          <button className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
            全部 <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid gap-3">
          {homework.length === 0 ? (
            <div className="bg-[var(--card)] border border-[var(--border)] p-8 rounded-3xl border-dashed flex flex-col items-center gap-2 opacity-60">
              <AlertCircle size={32} className="text-[var(--muted-foreground)]" />
              <p className="text-sm font-bold">目前沒有作業，放鬆一下吧！</p>
              {!isReadOnly && <p className="text-xs">點擊右上方 + 開始新增</p>}
            </div>
          ) : (
            homework.map((item) => (
              <div 
                key={item.id}
                onClick={() => !isReadOnly && toggleHomework(item.id, item.completed)}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-3xl border transition-all group",
                  item.completed 
                    ? "bg-[var(--secondary)] border-[var(--border)] opacity-60" 
                    : "bg-[var(--card)] border-[var(--border)] shadow-sm hover:border-primary/30 hover:translate-x-1",
                  isReadOnly ? "cursor-default" : "cursor-pointer"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shadow-inner",
                  item.completed ? "bg-green-500 border-green-500 text-white" : "border-[var(--border)] group-hover:border-primary"
                )}>
                  {item.completed && <CheckCircle2 size={14} />}
                </div>
                <div className="flex-1">
                  <p className={cn("text-sm font-bold", item.completed && "line-through opacity-50")}>{item.title}</p>
                </div>
                {!isReadOnly && <ChevronRight size={16} className="text-[var(--border)] opacity-0 group-hover:opacity-100 transition-opacity" />}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Add Homework Modal */}
      {isAdding && !isReadOnly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[var(--background)] w-full max-w-sm rounded-[32px] p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black">新增練習作業</h3>
              <button onClick={() => setIsAdding(false)} className="p-2 bg-[var(--secondary)] rounded-full hover:rotate-90 transition-all">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-[var(--muted-foreground)] uppercase tracking-wider ml-1">作業名稱</label>
              <input 
                autoFocus
                type="text" 
                placeholder="例如：數學講義 P.12" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 text-[var(--foreground)]"
              />
            </div>
            <button 
              onClick={handleAdd}
              className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-md hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
            >
              儲存作業
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
