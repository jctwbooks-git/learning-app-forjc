import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, GraduationCap, ShieldCheck, Zap } from 'lucide-react';

const Login: React.FC = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center animate-bounce-subtle">
            <GraduationCap size={48} className="text-primary" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter">
            寶山學習助手
          </h1>
          <p className="text-[var(--muted-foreground)] font-medium">
            落實每日練習，紀錄成長點滴
          </p>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 gap-4 text-left py-8">
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <Zap size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm">30+15 專注法</h3>
              <p className="text-xs text-[var(--muted-foreground)]">科學化管理時間，提升讀書效率。</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
            <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm">家長隨時監控</h3>
              <p className="text-xs text-[var(--muted-foreground)]">即時掌握進度，陪伴孩子共同進步。</p>
            </div>
          </div>
        </div>

        {/* Login Button */}
        <button
          onClick={signInWithGoogle}
          className="w-full py-4 px-6 bg-primary text-primary-foreground rounded-2xl font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
        >
          <LogIn size={20} />
          使用 Google 帳號登入
        </button>

        <p className="text-[10px] text-[var(--muted-foreground)] font-bold uppercase tracking-widest">
          寶山國中學習輔助系統 v1.0
        </p>
      </div>
    </div>
  );
};

export default Login;
