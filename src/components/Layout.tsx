import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, Timer, BookOpen, BarChart2, Sun, Moon, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../utils/cn';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const navItems = [
    { to: '/', icon: Home, label: '首頁' },
    { to: '/timer', icon: Timer, label: '計時器' },
    { to: '/notes', icon: BookOpen, label: '錯題本' },
    { to: '/progress', icon: BarChart2, label: '進度' },
    { to: '/settings', icon: User, label: '設定' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-10 w-full border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md px-4 py-3 sm:px-6 flex justify-between items-center">
        <h1 className="text-xl font-bold text-primary flex items-center gap-2">
          <span className="bg-primary text-primary-foreground p-1.5 rounded-lg">寶</span>
          寶山學習助手
        </h1>
        <div className="flex items-center gap-2 sm:gap-4">
          {user && (
            <div className="hidden md:flex items-center gap-2 px-2 py-1 bg-[var(--secondary)] rounded-full border border-[var(--border)]">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ""} className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black">
                  {user.displayName?.charAt(0) || "U"}
                </div>
              )}
              <span className="text-xs font-black truncate max-w-[100px]">{user.displayName}</span>
            </div>
          )}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-[var(--accent)] transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <div className="h-6 w-[1px] bg-[var(--border)] mx-1"></div>
          <NavLink 
            to="/settings"
            className="flex items-center gap-2 p-1.5 px-3 rounded-lg hover:bg-[var(--accent)] transition-colors text-sm font-medium"
          >
            <span className="hidden sm:inline">帳號設定</span>
            <User size={18} />
          </NavLink>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-32">
        <div className="container mx-auto px-4 py-6 sm:px-6">
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation (Mobile/iPad optimized) */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-lg px-2 py-2 sm:py-4 transition-colors">
        <div className="container mx-auto max-w-lg flex justify-around items-center">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-16 sm:w-20",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )
              }
            >
              <item.icon size={24} />
              <span className="text-[10px] sm:text-xs font-bold leading-none">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
