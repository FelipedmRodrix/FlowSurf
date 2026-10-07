import React, { useState } from 'react';
import {
  Waves,
  Bell,
  User,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  ChevronDown,
  RefreshCw,
  LogOut,
  Send,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Sun,
  Flame,
} from 'lucide-react';
import { UserRole, User as UserType, SurfSchool, AppNotification } from '../types';
import { storageService } from '../services/storageService';

interface NavbarProps {
  currentUser: UserType;
  currentSchool?: SurfSchool;
  notifications: AppNotification[];
  allUsers: UserType[];
  allSchools: SurfSchool[];
  onSelectUser: (user: UserType) => void;
  onSelectSchool: (school: SurfSchool) => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentSchool,
  notifications,
  allUsers,
  allSchools,
  onSelectUser,
  onSelectSchool,
  onResetData,
}) => {
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSchoolSwitcher, setShowSchoolSwitcher] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return { label: 'Super Admin', bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' };
      case 'school_owner':
        return { label: 'Dono da Escola', bg: 'bg-amber-500/25 text-amber-300 border-amber-500/50' };
      case 'instructor':
        return { label: 'Instrutor', bg: 'bg-teal-500/25 text-teal-300 border-teal-500/50' };
      case 'student':
        return { label: 'Aluno', bg: 'bg-sky-500/25 text-sky-200 border-sky-500/50' };
    }
  };

  const roleBadge = getRoleBadge(currentUser.role);

  const handleMarkAllRead = () => {
    storageService.markAllNotificationsRead(currentUser.id);
  };

  return (
    <header className="sticky top-0 z-40 bg-sky-950/95 backdrop-blur-md border-b border-sky-800/80 shadow-lg shadow-sky-950/50 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand with Sun & Ocean Waves */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-amber-300 flex items-center justify-center shadow-lg shadow-sky-500/30 ring-2 ring-amber-300/40">
                <Waves className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border border-sky-950 flex items-center justify-center">
                <Sun className="w-3 h-3 text-amber-950 animate-spin-slow" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-sky-300 via-amber-200 to-amber-400">
                  SurfFlow
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold tracking-wide uppercase flex items-center space-x-1">
                  <span>ALOHA</span>
                </span>
              </div>
              <p className="text-[11px] text-sky-200/80 hidden sm:block">
                {currentSchool ? `${currentSchool.name} • ${currentSchool.beachSpot}` : 'Escolinha de Surf & Praia'}
              </p>
            </div>
          </div>

          {/* Beach weather snippet in center */}
          <div className="hidden lg:flex items-center space-x-2 bg-sky-900/50 border border-sky-700/60 px-3 py-1 rounded-full text-xs text-sky-200">
            <Sun className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-amber-300">Sol & Mar Aberto</span>
            <span className="text-sky-400">•</span>
            <span>28°C Água Morna</span>
            <span className="text-sky-400">•</span>
            <span className="text-emerald-300 font-medium">Ondas 1.2m</span>
          </div>

          {/* Center: School Selector for Super Admin / Owner */}
          {(currentUser.role === 'super_admin' || allSchools.length > 1) && (
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowSchoolSwitcher(!showSchoolSwitcher)}
                className="flex items-center space-x-2 text-xs bg-sky-900/70 hover:bg-sky-800 text-sky-100 px-3 py-1.5 rounded-xl border border-sky-700/80 transition-colors"
              >
                <span className="text-sky-300">Pico:</span>
                <span className="font-semibold text-amber-300 max-w-[150px] truncate">
                  {currentSchool?.name || 'Selecione a Escola'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-sky-300" />
              </button>

              {showSchoolSwitcher && (
                <div className="absolute left-0 mt-2 w-64 bg-sky-950 border border-sky-800 rounded-2xl shadow-2xl p-2 z-50">
                  <div className="text-[11px] font-semibold text-sky-300 px-2 py-1 uppercase tracking-wider">
                    Alternar Escolinha de Surf
                  </div>
                  {allSchools.map((school) => (
                    <button
                      key={school.id}
                      onClick={() => {
                        onSelectSchool(school);
                        setShowSchoolSwitcher(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        currentSchool?.id === school.id
                          ? 'bg-sky-800/80 text-amber-200 border border-amber-400/50 font-semibold'
                          : 'text-sky-200 hover:bg-sky-900'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-white">{school.name}</div>
                        <div className="text-[10px] text-sky-300">{school.beachSpot}</div>
                      </div>
                      <span className="text-base">{school.logo}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Right actions: Notifications & User Profile Switcher */}
          <div className="flex items-center space-x-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-sky-200 hover:text-white rounded-xl hover:bg-sky-900/80 transition-colors focus:outline-none"
                title="Notificações automáticas"
              >
                <Bell className="w-5 h-5 text-sky-300" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-sky-950 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-sky-950 border border-sky-800 rounded-2xl shadow-2xl p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-sky-800 mb-3">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-amber-400" />
                      <h3 className="text-sm font-semibold text-white">Notificações Automáticas</h3>
                      {unreadCount > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                          {unreadCount} novas
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-sky-300 hover:text-amber-300 transition-colors"
                      >
                        Marcar lidas
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-sky-300/60 text-xs">
                        Nenhuma notificação no momento.
                      </div>
                    ) : (
                      notifications.slice(0, 8).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => storageService.markNotificationRead(notif.id)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                            notif.read
                              ? 'bg-sky-950/60 border-sky-900/80 text-sky-300/70'
                              : 'bg-sky-900/50 border-sky-700/80 text-sky-100'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="font-semibold text-white">{notif.title}</span>
                            <span className="text-[10px] text-sky-300 whitespace-nowrap">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-sky-200 mb-2">{notif.message}</p>
                          <div className="flex items-center justify-between pt-1 border-t border-sky-800/60 text-[10px] text-sky-400">
                            <span>Tipo: {notif.type.replace('_', ' ')}</span>
                            <a
                              href={`https://wa.me/?text=${encodeURIComponent(`[SurfFlow] ${notif.title}\n${notif.message}`)}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1"
                            >
                              <Send className="w-3 h-3" />
                              <span>Enviar WhatsApp</span>
                            </a>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Role & User Profile Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                className="flex items-center space-x-2 bg-sky-900/80 hover:bg-sky-800 border border-sky-700/80 rounded-xl px-3 py-1.5 text-xs text-sky-100 transition-all hover:border-amber-400/60"
              >
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover ring-2 ring-amber-400/60"
                />
                <div className="text-left hidden sm:block">
                  <div className="font-semibold text-white max-w-[120px] truncate">{currentUser.name}</div>
                  <div className="flex items-center space-x-1">
                    <span className={`text-[9px] px-1.5 py-0.2 rounded border font-medium ${roleBadge.bg}`}>
                      {roleBadge.label}
                    </span>
                    {currentUser.role === 'student' && (
                      <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${currentUser.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                        {currentUser.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-sky-300" />
              </button>

              {/* Role Switcher Dropdown */}
              {showRoleSwitcher && (
                <div className="absolute right-0 mt-2 w-80 bg-sky-950 border border-sky-800 rounded-2xl shadow-2xl p-3 z-50">
                  <div className="px-2 py-1.5 border-b border-sky-800 mb-2">
                    <div className="flex items-center space-x-1 text-amber-400 text-xs font-semibold">
                      <Sun className="w-3.5 h-3.5" />
                      <span>Simulador de Perfis de Surf</span>
                    </div>
                    <p className="text-[11px] text-sky-300">
                      Troque instantaneamente entre os papéis da escolinha:
                    </p>
                  </div>

                  <div className="space-y-1 max-h-72 overflow-y-auto">
                    {allUsers.map((user) => {
                      const isSelected = user.id === currentUser.id;
                      const uBadge = getRoleBadge(user.role);
                      return (
                        <button
                          key={user.id}
                          onClick={() => {
                            onSelectUser(user);
                            setShowRoleSwitcher(false);
                          }}
                          className={`w-full text-left p-2 rounded-xl flex items-center justify-between text-xs transition-colors ${
                            isSelected
                              ? 'bg-sky-800/90 border border-amber-400/60 text-white font-medium'
                              : 'text-sky-200 hover:bg-sky-900/70'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-7 h-7 rounded-full object-cover ring-1 ring-sky-700"
                            />
                            <div>
                              <div className="font-medium text-white">{user.name}</div>
                              <div className="flex items-center space-x-1 mt-0.5">
                                <span className={`text-[9px] px-1.5 py-0.2 rounded border font-medium ${uBadge.bg}`}>
                                  {uBadge.label}
                                </span>
                                {user.role === 'student' && (
                                  <span
                                    className={`text-[9px] px-1 py-0.2 rounded ${
                                      user.status === 'active'
                                        ? 'bg-emerald-500/20 text-emerald-300'
                                        : 'bg-rose-500/20 text-rose-300 font-bold'
                                    }`}
                                  >
                                    {user.status === 'active' ? 'Ativo' : 'Bloqueado'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2.5 mt-2 border-t border-sky-800 flex items-center justify-between">
                    <button
                      onClick={() => {
                        onResetData();
                        setShowRoleSwitcher(false);
                      }}
                      className="text-[11px] text-sky-300 hover:text-amber-400 flex items-center space-x-1 transition-colors"
                      title="Restaurar dados de demonstração originais"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Restaurar Demonstração</span>
                    </button>
                    <span className="text-[10px] text-amber-400/80 font-mono">PRAIA & SURF</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
