import React, { useState } from 'react';
import { 
  User, 
  Shield, 
  Link, 
  LogOut, 
  Copy, 
  Check, 
  Smartphone,
  Info,
  Calendar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils/cn';

const Settings: React.FC = () => {
  const { user, profile, logout, updateProfile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [childIdInput, setChildIdInput] = useState(profile?.childId || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const copyToClipboard = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUpdateRole = async (newRole: 'student' | 'parent') => {
    setIsUpdating(true);
    await updateProfile({ role: newRole });
    setIsUpdating(false);
  };

  const handleLinkChild = async () => {
    if (!childIdInput.trim()) return;
    setIsUpdating(true);
    await updateProfile({ childId: childIdInput.trim() });
    setIsUpdating(false);
    alert('孩子帳號已成功連結！現在您可以從首頁查看學習進度。');
  };

  if (!profile) return null;

  return (
    <div className="space-y-8 pb-32">
      <h2 className="text-xl font-black flex items-center gap-2">
        <User className="text-primary" size={24} />
        帳號設定
      </h2>

      {/* Profile Card */}
      <div className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-[32px] flex items-center gap-4 shadow-sm">
        <img 
          src={profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} 
          alt="Avatar" 
          className="w-16 h-16 rounded-full border-4 border-primary/20"
        />
        <div className="space-y-1">
          <h3 className="font-black text-lg">{profile.displayName}</h3>
          <p className="text-xs font-bold text-[var(--muted-foreground)]">{user?.email}</p>
          <div className="flex gap-2">
             <span className={cn(
               "px-2 py-0.5 rounded-full text-[10px] font-black uppercase",
               profile.role === 'student' ? "bg-blue-500/10 text-blue-500" : "bg-orange-500/10 text-orange-500"
             )}>
               {profile.role === 'student' ? '學生' : '家長'}
             </span>
          </div>
        </div>
      </div>

      {/* Role Selection */}
      <section className="space-y-4">
        <h3 className="text-sm font-black text-[var(--muted-foreground)] uppercase tracking-widest flex items-center gap-2">
          <Shield size={16} />
          身分切換
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            disabled={isUpdating}
            onClick={() => handleUpdateRole('student')}
            className={cn(
              "p-5 rounded-3xl border-2 transition-all text-left space-y-2",
              profile.role === 'student' 
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" 
                : "border-[var(--border)] bg-[var(--card)] hover:border-primary/50"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              profile.role === 'student' ? "bg-primary text-white" : "bg-[var(--secondary)] text-[var(--muted-foreground)]"
            )}>
              <Smartphone size={20} />
            </div>
            <div>
              <p className="font-black text-sm">身分為：學生</p>
              <p className="text-[10px] font-bold text-[var(--muted-foreground)]">自律練習、記錄錯題</p>
            </div>
          </button>

          <button
            disabled={isUpdating}
            onClick={() => handleUpdateRole('parent')}
            className={cn(
              "p-5 rounded-3xl border-2 transition-all text-left space-y-2",
              profile.role === 'parent' 
                ? "border-orange-500 bg-orange-500/5 shadow-lg shadow-orange-500/10" 
                : "border-[var(--border)] bg-[var(--card)] hover:border-orange-500/50"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              profile.role === 'parent' ? "bg-orange-500 text-white" : "bg-[var(--secondary)] text-[var(--muted-foreground)]"
            )}>
              <Shield size={20} />
            </div>
            <div>
              <p className="font-black text-sm">身分為：家長</p>
              <p className="text-[10px] font-bold text-[var(--muted-foreground)]">遠端看過、陪伴成長</p>
            </div>
          </button>
        </div>
      </section>

      {/* Role Specific Settings */}
      <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
        {profile.role === 'student' ? (
          <section className="bg-primary/5 border border-primary/20 p-6 rounded-[32px] space-y-4">
            <h3 className="font-black flex items-center gap-2 text-sm text-primary">
              <Link size={18} />
              孩子專屬 ID
            </h3>
            <p className="text-xs font-medium text-[var(--muted-foreground)]">
              請將下方 ID 提供給家長，讓家長能在他手機上查看您的練習進度。
            </p>
            <div className="flex items-center gap-2 bg-[var(--card)] border border-[var(--border)] p-3 rounded-2xl">
              <code className="flex-1 text-[10px] font-mono break-all font-bold opacity-70">
                {user?.uid}
              </code>
              <button 
                onClick={copyToClipboard}
                className="shrink-0 p-2 bg-primary text-white rounded-lg hover:scale-110 active:scale-95 transition-all"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>

            {/* Exam Date Setting */}
            <div className="pt-4 border-t border-primary/10 space-y-3">
               <h3 className="font-black flex items-center gap-2 text-sm text-primary">
                <Calendar size={18} />
                下次段考日期
              </h3>
              <p className="text-[10px] font-bold text-[var(--muted-foreground)] translate-y-[-4px]">
                設定後 Dashboard 倒數與提示將自動同步。
              </p>
              <input 
                type="date"
                value={profile.examDate || '2026-04-10'}
                onChange={(e) => updateProfile({ examDate: e.target.value })}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </section>
        ) : (
          <section className="bg-orange-500/5 border border-orange-500/20 p-6 rounded-[32px] space-y-4">
            <h3 className="font-black flex items-center gap-2 text-sm text-orange-500">
              <Link size={18} />
              連結孩子帳號
            </h3>
            <p className="text-xs font-medium text-[var(--muted-foreground)]">
              請在此輸入孩子手機上顯示的專屬 ID，建立連線後即可查看其學習狀況。
            </p>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="輸入孩子帳號 ID (UID)"
                value={childIdInput}
                onChange={(e) => setChildIdInput(e.target.value)}
                className="w-full bg-[var(--card)] border border-[var(--border)] rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
              <button 
                onClick={handleLinkChild}
                disabled={isUpdating || !childIdInput}
                className="w-full py-3 bg-orange-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                開始連結
              </button>
            </div>
          </section>
        )}
      </div>

      {/* App Info & Logout */}
      <div className="space-y-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-[32px] overflow-hidden">
          <div className="p-4 flex items-center gap-4 hover:bg-[var(--secondary)] transition-colors cursor-pointer border-b border-[var(--border)]">
            <div className="p-2 bg-gray-500/10 rounded-lg text-gray-500">
              <Info size={18} />
            </div>
            <span className="flex-1 font-bold text-sm">關於此版本</span>
            <span className="text-[10px] font-black text-[var(--muted-foreground)]">v1.0.0</span>
          </div>
          <button 
            onClick={logout}
            className="w-full p-4 flex items-center gap-4 hover:bg-red-500/5 transition-colors text-red-500"
          >
            <div className="p-2 bg-red-500/10 rounded-lg">
              <LogOut size={18} />
            </div>
            <span className="flex-1 font-bold text-sm text-left">登出帳號</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
