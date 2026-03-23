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
  Shield
} from 'lucide-react';
import { cn } from '../utils/cn';
import { format, differenceInDays, isSameDay } from 'date-fns';
import { useHomeworks, useUserStats } from '../hooks/useDb';
import { useAuth } from '../contexts/AuthContext';
import { Timestamp } from 'firebase/firestore';

interface UserStatsData {
  streak: number;
  lastCheckIn: Timestamp | null;
}

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const { data: homework, addHomework, toggleHomework, isReadOnly: hwReadOnly, loading: hwLoading } = useHomeworks();
  const { stats, checkIn, isReadOnly: statsReadOnly, loading: statsLoading } = useUserStats();
  
  const typedStats = stats as UserStatsData;
  const [isAdding, setIsAdding] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const isReadOnly = hwReadOnly || statsReadOnly;

  const handleAdd = async () => {
    if (!inputValue.trim() || isReadOnly) return;
    await addHomework(inputValue.trim());
    setInputValue('');
    setIsAdding(false);
  };

  const today = new Date();
  const examDate = new Date('2026-04-10');
  const daysToExam = differenceInDays(examDate, today);

  const isCheckInDisabled = isReadOnly || (typedStats?.lastCheckIn && isSameDay(typedStats.lastCheckIn.toDate(), today));

  if (hwLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Role Banner */}
      {isReadOnly && (
        <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-2xl flex items-center justify-center gap-2 text-orange-600 font-bold text-xs">
          <Shield size={16} />
          家長監管模式：目前為唯讀狀態，無法新增或修改資料
        </div>
      )}

      {/* Header Section */}
      <section className="flex items-end justify-between">
        <div className="space-y-1">
          <p className="text-xs font-black text-[var(--muted-foreground)] uppercase tracking-widest">
            {format(today, 'yyyy年 M月 d日')}
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
            <p className="text-[10px] font-bold text-[var(--muted-foreground)]">第一次段考倒數</p>
          </div>
          <div className="w-full h-1.5 bg-[var(--secondary)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-1000" 
              style={{ width: `${Math.max(0, 100 - (daysToExam / 30) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

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
            查看全部 <ChevronRight size={14} />
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
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                  item.completed ? "bg-green-500 border-green-500 text-white" : "border-[var(--border)] group-hover:border-primary"
                )}>
                  {item.completed && <CheckCircle2 size={14} />}
                </div>
                <div className="flex-1">
                  <p className={cn("text-sm font-bold", item.completed && "line-through")}>{item.title}</p>
                </div>
                {!isReadOnly && <ChevronRight size={16} className="text-[var(--border)]" />}
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
