import React, { useState } from 'react';
import { BookOpen, Plus, Filter, CheckCircle2, Circle, AlertTriangle, X, Shield } from 'lucide-react';
import { cn } from '../utils/cn';
import { format, differenceInDays } from 'date-fns';
import { useMistakes } from '../hooks/useDb';
import { useAuth } from '../contexts/AuthContext';

const Notes: React.FC = () => {
  const { data: mistakes, addMistake, toggleReviewed, isReadOnly, loading } = useMistakes();
  const { profile } = useAuth();
  const [filter, setFilter] = useState('全部');
  const [isAdding, setIsAdding] = useState(false);
  
  // New note form state
  const [newMistake, setNewMistake] = useState({
    subject: '數學',
    unit: '',
    reason: '',
  });

  const subjects = ['全部', '數學', '英語', '國文', '自然', '社會'];
  
  const filteredNotes = filter === '全部' 
    ? mistakes 
    : mistakes.filter(n => n.subject === filter);

  const examDate = profile?.examDate ? new Date(profile.examDate) : new Date('2026-04-10');
  const daysToExam = differenceInDays(examDate, new Date());

  const handleSave = async () => {
    if (!newMistake.unit || !newMistake.reason || isReadOnly) return;
    await addMistake({
      ...newMistake,
      reviewed: false
    });
    setIsAdding(false);
    setNewMistake({ subject: '數學', unit: '', reason: '' });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Role Banner */}
       {isReadOnly && (
        <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-2xl flex items-center justify-center gap-2 text-orange-600 font-bold text-xs">
          <Shield size={16} />
          觀看模式：錯題紀錄僅供檢視
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black flex items-center gap-2">
          <BookOpen className="text-primary" size={24} />
          錯題記錄本
        </h2>
        {!isReadOnly && (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-10 h-10 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-110 active:scale-90 transition-all border-2 border-white/20"
          >
            <Plus size={24} />
          </button>
        )}
      </div>

      {/* Exam Warning Banner */}
      {daysToExam <= 14 && (
        <div className="bg-red-500 text-white p-4 rounded-3xl flex items-center gap-4 shadow-lg shadow-red-500/20 animate-pulse">
          <AlertTriangle size={32} className="shrink-0" />
          <div className="space-y-0.5">
            <h3 className="font-black text-sm">段考倒數 {daysToExam} 天！</h3>
            <p className="text-[10px] font-bold opacity-90">目前還有 {mistakes.filter(n => !n.reviewed).length} 題錯題尚未複習，加油！</p>
          </div>
        </div>
      )}

      {/* Subject Filter Area */}
      <div className="flex items-center gap-2 py-2 overflow-x-auto no-scrollbar">
        <div className="p-2 bg-[var(--secondary)] rounded-xl text-[var(--muted-foreground)]">
          <Filter size={18} />
        </div>
        {subjects.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "px-5 py-2 rounded-xl text-sm font-black transition-all whitespace-nowrap border",
              filter === s 
                ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/10" 
                : "bg-[var(--card)] border-[var(--border)] text-[var(--muted-foreground)] hover:border-primary/50"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Notes List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="py-12 text-center text-[var(--muted-foreground)]">
            <p className="font-bold">目前沒有錯題記錄</p>
            {!isReadOnly && <p className="text-xs">點擊右上角 + 開始建立吧！</p>}
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div 
              key={note.id}
              className={cn(
                "group p-5 rounded-3xl border bg-[var(--card)] transition-all flex items-start gap-4 hover:border-primary/30",
                note.reviewed ? "opacity-60 grayscale-[0.5]" : "shadow-sm",
                !isReadOnly && "active:scale-[0.98]"
              )}
            >
              <button 
                disabled={isReadOnly}
                onClick={() => !isReadOnly && toggleReviewed(note.id, note.reviewed)}
                className={cn(
                  "p-1 rounded-full flex-shrink-0 transition-colors mt-0.5",
                  note.reviewed ? "text-green-500" : "text-[var(--border)]",
                  !isReadOnly && !note.reviewed && "group-hover:text-primary"
                )}
              >
                {note.reviewed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
              </button>
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase">
                    {note.subject}
                  </span>
                  <span className="text-[10px] font-black text-[var(--muted-foreground)]">
                    {note.unit}
                  </span>
                </div>
                <h3 className="font-bold text-sm leading-relaxed break-words">
                  {note.reason}
                </h3>
              </div>
              <span className="text-[10px] font-bold text-[var(--muted-foreground)] pt-1">
                {note.createdAt && format(note.createdAt.toDate(), 'MM/dd')}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {isAdding && !isReadOnly && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[var(--background)] w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-8 space-y-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black">新增錯題記錄</h3>
              <button onClick={() => setIsAdding(false)} className="p-2 bg-[var(--secondary)] rounded-full hover:rotate-90 transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {subjects.filter(s => s !== '全部').map((s) => (
                  <button
                    key={s}
                    onClick={() => setNewMistake(prev => ({ ...prev, subject: s }))}
                    className={cn(
                      "py-2 rounded-xl text-xs font-bold border transition-all",
                      newMistake.subject === s 
                        ? "bg-primary text-primary-foreground border-primary" 
                        : "bg-[var(--secondary)] border-transparent text-[var(--muted-foreground)]"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-[var(--muted-foreground)] uppercase tracking-wider ml-1">單元名稱</label>
                <input 
                  type="text" 
                  placeholder="例如：三角形的性質" 
                  value={newMistake.unit}
                  onChange={(e) => setNewMistake(prev => ({ ...prev, unit: e.target.value }))}
                  className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 text-[var(--foreground)]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-[var(--muted-foreground)] uppercase tracking-wider ml-1">錯誤原因</label>
                <textarea 
                  rows={3}
                  placeholder="詳細描述為什麼會錯..." 
                  value={newMistake.reason}
                  onChange={(e) => setNewMistake(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full bg-[var(--secondary)] border border-[var(--border)] rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50 text-[var(--foreground)] resize-none"
                />
              </div>
            </div>

            <button 
              onClick={handleSave}
              className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-md hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
            >
              儲存記錄
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
