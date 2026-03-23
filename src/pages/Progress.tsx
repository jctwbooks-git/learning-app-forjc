import React from 'react';
import { 
  TrendingUp, 
  Calendar,
  Zap,
  Target,
  Shield,
  Clock,
  BookOpen
} from 'lucide-react';
import { cn } from '../utils/cn';
import { format, subDays, isSameDay } from 'date-fns';
import { useTimerLogs, useMistakes, useUserStats, useHomeworks, useCheckInHistory, useDetailedCheckInHistory } from '../hooks/useDb';

const ProgressPage: React.FC = () => {
  const { logs, isReadOnly: logsReadOnly } = useTimerLogs();
  const { data: mistakes, isReadOnly: mistakesReadOnly } = useMistakes();
  const { stats, isReadOnly: statsReadOnly } = useUserStats();
  const { data: homework, isReadOnly: hwReadOnly } = useHomeworks();

  const { checkedInDates } = useCheckInHistory();
  const { history: checkInHistory } = useDetailedCheckInHistory();
  const isReadOnly = logsReadOnly || mistakesReadOnly || statsReadOnly || hwReadOnly;

  // --- Data Aggregation ---
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => subDays(today, i)).reverse();

  // Weekly Completion Rate
  const completedHw = homework.filter(h => h.completed).length;
  const totalHw = homework.length || 1;
  const completionRate = Math.round((completedHw / totalHw) * 100);

  // Study Time by Subject
  const studyTimeBySubject = logs.reduce((acc: any, log: any) => {
    const sub = log.subject || '其他';
    acc[sub] = (acc[sub] || 0) + (log.focusMinutes || 0) + (log.analyzeMinutes || 0);
    return acc;
  }, {});

  // This Month Calendar Data
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(year, month, i + 1);
    const key = d.toISOString().slice(0, 10);
    return { 
      day: i + 1, 
      key, 
      checked: checkedInDates.has(key), 
      isToday: i + 1 === today.getDate() 
    };
  });

  const mistakeTrends = last7Days.map(day => {
    const count = mistakes.filter(m => m.createdAt && isSameDay(m.createdAt.toDate(), day)).length;
    return { day: format(day, 'MM/dd'), count };
  });

  // Mistake Count by Subject
  const mistakeCountBySubject = mistakes.reduce((acc: any, m: any) => {
    const sub = m.subject || '其他';
    acc[sub] = (acc[sub] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8 pb-32">
      {/* Role Banner */}
       {isReadOnly && (
        <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-2xl flex items-center justify-center gap-2 text-orange-600 font-bold text-xs">
          <Shield size={16} />
          觀看模式：正在查看孩子的學習報表
        </div>
      )}

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-[32px] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Target size={24} />
          </div>
          <div>
            <p className="text-2xl font-black">{completionRate}%</p>
            <p className="text-xs font-bold text-[var(--muted-foreground)]">本週作業達成率</p>
          </div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-[32px] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
            <Zap size={24} />
          </div>
          <div>
            <p className="text-2xl font-black">{stats?.streak || 0} 天</p>
            <p className="text-xs font-bold text-[var(--muted-foreground)]">目前連續學習</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Study Time Chart */}
        <section className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-[32px] space-y-4">
          <h3 className="font-black flex items-center gap-2 text-sm">
            <Clock size={18} className="text-primary" />
            學習時間分布 (分鐘)
          </h3>
          <div className="space-y-3">
            {Object.entries(studyTimeBySubject).length === 0 ? (
              <p className="text-xs text-center py-8 text-[var(--muted-foreground)]">尚無計時記錄</p>
            ) : (
              Object.entries(studyTimeBySubject).map(([sub, time]: [string, any]) => (
                <div key={sub} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span>{sub}</span>
                    <span>{time} min</span>
                  </div>
                  <div className="h-2 bg-[var(--secondary)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${Math.min(100, (time / 300) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Mistake Trend Chart */}
        <section className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-[32px] space-y-4">
          <h3 className="font-black flex items-center gap-2 text-sm">
            <TrendingUp size={18} className="text-red-500" />
            近 7 日錯題趨勢
          </h3>
          <div className="flex items-end justify-between h-32 pt-4 px-2">
            {mistakeTrends.map((t, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1">
                <div 
                  className="w-4 bg-red-400 rounded-t-lg transition-all duration-500 group relative"
                  style={{ height: `${Math.min(100, t.count * 20)}%` }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[8px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {t.count}
                  </div>
                </div>
                <span className="text-[8px] font-bold text-[var(--muted-foreground)]">{t.day}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Mistake Distribution by Subject */}
        <section className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-[32px] space-y-4 md:col-span-2">
          <h3 className="font-black flex items-center gap-2 text-sm">
            <BookOpen size={18} className="text-orange-500" />
            各科錯題分布數量
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(mistakeCountBySubject).length === 0 ? (
              <p className="text-xs text-center py-4 text-[var(--muted-foreground)] col-span-full">尚無錯題記錄</p>
            ) : (
              Object.entries(mistakeCountBySubject).map(([sub, count]: [string, any]) => (
                <div key={sub} className="bg-[var(--secondary)]/50 p-4 rounded-2xl space-y-2 border border-transparent hover:border-orange-500/20 transition-all">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-black">{sub}</span>
                    <span className="text-lg font-black text-orange-500">{count}</span>
                  </div>
                  <div className="h-1.5 bg-[var(--secondary)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 rounded-full" 
                      style={{ width: `${Math.min(100, (count / (mistakes.length || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Calendar Activity Heatmap */}
      <section className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-[32px] space-y-4">
        <h3 className="font-black flex items-center gap-2 text-sm">
          <Calendar size={18} className="text-green-500" />
          {month + 1} 月學習活性
        </h3>
        <div className="grid grid-cols-7 gap-2">
          {/* Weekday headers */}
          {['日', '一', '二', '三', '四', '五', '六'].map(d => (
            <div key={d} className="text-center text-[8px] font-black text-[var(--muted-foreground)] py-1 uppercase">{d}</div>
          ))}
          
          {/* Empty slots for first week offset */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Actual days */}
          {monthDays.map((day) => (
            <div 
              key={day.key} 
              className={cn(
                "aspect-square rounded-lg border flex items-center justify-center relative overflow-hidden transition-all",
                day.checked 
                  ? "bg-green-500 border-green-600 shadow-sm shadow-green-500/20" 
                  : "bg-[var(--secondary)] border-transparent text-[var(--muted-foreground)] opacity-40",
                day.isToday && "ring-2 ring-primary ring-offset-2 ring-offset-[var(--background)]"
              )}
            >
              <span className={cn(
                "text-[8px] font-black",
                day.checked ? "text-white" : "text-[var(--muted-foreground)]"
              )}>
                {day.day}
              </span>
              {day.isToday && (
                <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-primary rounded-full translate-x-1/3 -translate-y-1/3" />
              )}
            </div>
          ))}
        </div>
        <p className="text-[10px] font-bold text-[var(--muted-foreground)] text-center">
          綠色代表當日有完成學習打卡
        </p>
      </section>

      {/* Parent Only: Detailed Check-in History */}
      {isReadOnly && checkInHistory.length > 0 && (
        <section className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-[32px] space-y-4">
          <h3 className="font-black flex items-center gap-2 text-sm text-green-600">
            <Clock size={18} />
            最近一週打卡紀錄
          </h3>
          <div className="space-y-3">
            {checkInHistory.map((h) => (
              <div key={h.id} className="flex justify-between items-center py-2 border-b border-[var(--border)] last:border-0">
                <span className="text-xs font-bold">{h.id}</span>
                <span className="text-xs font-black text-green-600">
                  {h.checkInTime ? format(h.checkInTime.toDate(), 'HH:mm') : '--:--'}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] font-bold text-[var(--muted-foreground)] text-center">
            家長可根據打卡時間，確認子孩是否維持規律作息。
          </p>
        </section>
      )}
    </div>
  );
};

export default ProgressPage;
