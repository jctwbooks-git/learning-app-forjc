import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, BookOpen, Shield } from 'lucide-react';
import { cn } from '../utils/cn';
import { useTimerLogs } from '../hooks/useDb';

const Timer: React.FC = () => {
  const { addTimerLog, isReadOnly } = useTimerLogs();
  const [status, setStatus] = useState<'idle' | 'focusing' | 'analyzing' | 'completed'>('idle');
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [selectedSubject, setSelectedSubject] = useState('數學');

  const FOCUS_TIME = 30 * 60;
  const ANALYZE_TIME = 15 * 60;

  useEffect(() => {
    let interval: any;
    if ((status === 'focusing' || status === 'analyzing') && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (status === 'focusing') {
        setStatus('analyzing');
        setTimeLeft(ANALYZE_TIME);
      } else if (status === 'analyzing') {
        setStatus('completed');
        saveLog();
      }
    }
    return () => clearInterval(interval);
  }, [status, timeLeft]);

  const saveLog = async () => {
    if (isReadOnly) return;
    await addTimerLog({
      subject: selectedSubject,
      focusMinutes: 30,
      analyzeMinutes: 15
    });
  };

  const startTimer = () => {
    if (isReadOnly) return;
    setStatus('focusing');
  };
  
  const pauseTimer = () => setStatus('idle');
  const resetTimer = () => {
    setStatus('idle');
    setTimeLeft(FOCUS_TIME);
  };

  const completeManually = () => {
    if (status === 'analyzing' && !isReadOnly) {
      setStatus('completed');
      saveLog();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const subjects = ['國文', '數學', '英語', '自然', '社會', '地理', '歷史', '公民', '健康', '客語', '生科', '資科'];

  const progress = status === 'focusing' 
    ? (1 - timeLeft / FOCUS_TIME) * 100 
    : status === 'analyzing' 
      ? (1 - timeLeft / ANALYZE_TIME) * 100 
      : 0;

  return (
    <div className="max-w-md mx-auto space-y-8 py-4 pb-16 animate-in fade-in duration-500">
      {/* Role Banner */}
       {isReadOnly && (
        <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-2xl flex items-center justify-center gap-2 text-orange-600 font-bold text-xs">
          <Shield size={16} />
          觀看模式：計時功能僅供學生使用
        </div>
      )}

      {/* Subject Selection (Only in idle) */}
      <div className={cn("space-y-4 transition-all", (status !== 'idle' || isReadOnly) && "opacity-50 pointer-events-none")}>
        <h2 className="text-xl font-black flex items-center gap-2">
          <BookOpen className="text-primary" size={24} />
          選擇練習科目
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {subjects.map((s) => (
            <button
              key={s}
              disabled={isReadOnly}
              onClick={() => setSelectedSubject(s)}
              className={cn(
                "py-2.5 rounded-xl font-black text-xs border transition-all active:scale-95",
                selectedSubject === s 
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                  : "bg-[var(--card)] border-[var(--border)] text-[var(--muted-foreground)] hover:border-primary/50"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Main Timer Display */}
      <div className="relative flex flex-col items-center justify-center py-6">
        <div className="w-64 h-64 sm:w-80 sm:h-80 relative flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 drop-shadow-xl">
            <circle 
              cx="50%" cy="50%" r="45%" 
              className="stroke-[var(--secondary)] fill-none" 
              strokeWidth="12" 
            />
            <circle 
              cx="50%" cy="50%" r="45%" 
              className={cn(
                "fill-none transition-all duration-300",
                status === 'focusing' ? "stroke-primary" : "stroke-blue-500"
              )} 
              strokeWidth="12" 
              strokeDasharray="100.5" 
              strokeDashoffset={100.5 - (100.5 * progress) / 100}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute text-center">
            <p className={cn(
              "text-[10px] font-black uppercase tracking-widest mb-1",
              status === 'focusing' ? "text-primary" : "text-blue-500"
            )}>
              {status === 'focusing' ? '第一階段：專注解題' : status === 'analyzing' ? '第二階段：對答解析' : status === 'completed' ? '練習完成' : '準備開始'}
            </p>
            <span className="text-6xl sm:text-7xl font-black tabular-nums tracking-tighter">
              {status === 'completed' ? 'Done' : formatTime(timeLeft)}
            </span>
            <p className="text-xs font-bold text-[var(--muted-foreground)] mt-1">
              目前科目：{selectedSubject}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-6">
        {(status === 'idle' || status === 'completed') ? (
          <button 
            disabled={isReadOnly}
            onClick={startTimer}
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all",
              isReadOnly 
                ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50" 
                : "bg-primary text-primary-foreground shadow-primary/40 hover:scale-110 active:scale-90"
            )}
          >
            <Play size={32} fill="currentColor" />
          </button>
        ) : (
          <button 
            onClick={pauseTimer}
            className="w-20 h-20 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/40 hover:scale-110 active:scale-90 transition-all"
          >
            <Pause size={32} fill="currentColor" />
          </button>
        )}
        
        <button 
          disabled={isReadOnly}
          onClick={resetTimer}
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center border transition-all",
            isReadOnly
              ? "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed"
              : "bg-[var(--secondary)] text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--accent)] hover:scale-110 active:scale-90"
          )}
        >
          <RotateCcw size={32} />
        </button>

        {status === 'analyzing' && !isReadOnly && (
          <button 
            onClick={completeManually}
            className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-green-500/40 hover:scale-110 active:scale-90 transition-all animate-pulse"
          >
            <CheckCircle size={32} />
          </button>
        )}
      </div>

      {/* 30+15 Strategy Guide (from Spec) */}
      <div className="grid gap-4">
        <div className={cn(
          "p-5 rounded-[32px] border transition-all",
          status === 'focusing' ? "bg-primary/10 border-primary" : "bg-[var(--secondary)] border-[var(--border)]"
        )}>
          <div className="flex items-center gap-2 mb-2">
            <span className={cn(
              "text-[10px] font-black px-2 py-0.5 rounded-full",
              status === 'focusing' ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
            )}>第一階段 30 min</span>
            <h3 className="text-sm font-black">專心寫講義題目</h3>
          </div>
          <p className="text-xs font-bold text-[var(--muted-foreground)] leading-relaxed pl-1">
            專注解題，這段時間請不要翻看後面答案解析。
          </p>
        </div>

        <div className={cn(
          "p-5 rounded-[32px] border transition-all",
          status === 'analyzing' ? "bg-blue-500/10 border-blue-500" : "bg-[var(--secondary)] border-[var(--border)]"
        )}>
          <div className="flex items-center gap-2 mb-2">
            <span className={cn(
              "text-[10px] font-black px-2 py-0.5 rounded-full",
              status === 'analyzing' ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
            )}>第二階段 15 min</span>
            <h3 className="text-sm font-black">對答案、讀解析</h3>
          </div>
          <p className="text-xs font-bold text-[var(--muted-foreground)] leading-relaxed pl-1">
            閱讀解析，弄懂為什麼錯。看懂一題錯誤因原，比多寫 10 題更有效！
          </p>
        </div>
      </div>
    </div>
  );
};

export default Timer;
