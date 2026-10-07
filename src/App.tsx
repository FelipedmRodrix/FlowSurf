/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  SurfSchool,
  User,
  Instructor,
  ScheduleSlot,
  ClassSession,
  Booking,
  StudentEvaluation,
  InstructorReview,
  MembershipPlan,
  FinancialRecord,
  AppNotification,
} from './types';
import { storageService, subscribeToStorage } from './services/storageService';
import { Navbar } from './components/Navbar';
import { SuperAdminPanel } from './components/SuperAdminPanel';
import { SchoolOwnerPanel } from './components/SchoolOwnerPanel';
import { InstructorPanel } from './components/InstructorPanel';
import { StudentPanel } from './components/StudentPanel';
import { PrintReportView } from './components/PrintReportView';
import {
  Waves,
  Shield,
  GraduationCap,
  Users,
  AlertTriangle,
  Info,
  Calendar,
  Sparkles,
} from 'lucide-react';

export default function App() {
  // Reactive state from local storage engine
  const [schools, setSchools] = useState<SurfSchool[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [evaluations, setEvaluations] = useState<StudentEvaluation[]>([]);
  const [reviews, setReviews] = useState<InstructorReview[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [finances, setFinances] = useState<FinancialRecord[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('user_owner_1');
  const [currentSchoolId, setCurrentSchoolId] = useState<string>('school_1');

  // Load state and subscribe
  const loadState = () => {
    storageService.init();
    setSchools(storageService.getSchools());
    setUsers(storageService.getUsers());
    setInstructors(storageService.getInstructors());
    setSlots(storageService.getScheduleSlots());
    setSessions(storageService.getSessions());
    setBookings(storageService.getBookings());
    setEvaluations(storageService.getEvaluations());
    setReviews(storageService.getReviews());
    setPlans(storageService.getPlans());
    setFinances(storageService.getFinancialRecords());
    setNotifications(storageService.getNotifications());
    setCurrentUserId(storageService.getCurrentUserId());
    setCurrentSchoolId(storageService.getCurrentSchoolId());
  };

  useEffect(() => {
    loadState();
    const unsubscribe = subscribeToStorage(() => {
      loadState();
    });
    return () => unsubscribe();
  }, []);

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];
  const currentSchool = schools.find((s) => s.id === currentSchoolId) || schools[0];
  const currentInstructor = instructors.find((i) => i.userId === currentUser?.id) || instructors[0];

  const handleSelectUser = (user: User) => {
    storageService.setCurrentUserId(user.id);
    setCurrentUserId(user.id);
  };

  const handleSelectSchool = (school: SurfSchool) => {
    storageService.setCurrentSchoolId(school.id);
    setCurrentSchoolId(school.id);
  };

  const handleResetData = () => {
    if (confirm('Deseja restaurar todos os dados para o padrão inicial da demonstração?')) {
      storageService.resetDemoData();
      loadState();
    }
  };

  if (!currentUser || !currentSchool) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex items-center space-x-3 text-cyan-400">
          <Waves className="w-8 h-8 animate-spin" />
          <span>Carregando ecossistema SurfFlow...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-950 via-[#0b2847] to-[#06182c] text-sky-100 flex flex-col font-sans selection:bg-amber-400 selection:text-sky-950">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        currentSchool={currentSchool}
        notifications={notifications.filter((n) => n.recipientId === currentUser.id)}
        allUsers={users}
        allSchools={schools}
        onSelectUser={handleSelectUser}
        onSelectSchool={handleSelectSchool}
        onResetData={handleResetData}
      />

      {/* Role Quick Switch Bar - Sunny Beach & Ocean styling */}
      <div className="bg-sky-950/80 border-b border-sky-800/80 px-4 py-2.5 backdrop-blur-md shadow-md no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2 text-sky-200">
            <span className="text-base">☀️</span>
            <span className="font-bold text-amber-300">Simulador de Perfis:</span>
            <span className="hidden sm:inline text-sky-300/80">Alterne instantaneamente a experiência de cada usuário:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* Super Admin */}
            <button
              onClick={() => {
                const su = users.find((u) => u.role === 'super_admin');
                if (su) handleSelectUser(su);
              }}
              className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                currentUser.role === 'super_admin'
                  ? 'bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-md shadow-indigo-900/60 ring-2 ring-indigo-400'
                  : 'bg-sky-900/60 text-indigo-200 hover:bg-sky-800 border border-indigo-500/30'
              }`}
            >
              👑 Super Admin
            </button>

            {/* Dono da Escola */}
            <button
              onClick={() => {
                const owner = users.find((u) => u.role === 'school_owner' && u.schoolId === currentSchool.id) || users.find((u) => u.role === 'school_owner');
                if (owner) handleSelectUser(owner);
              }}
              className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                currentUser.role === 'school_owner'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold shadow-md shadow-amber-900/60 ring-2 ring-amber-300'
                  : 'bg-sky-900/60 text-amber-300 hover:bg-sky-800 border border-amber-500/30'
              }`}
            >
              🏄 Dono da Escolinha
            </button>

            {/* Professor */}
            <button
              onClick={() => {
                const instUser = users.find((u) => u.role === 'instructor');
                if (instUser) handleSelectUser(instUser);
              }}
              className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                currentUser.role === 'instructor'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-bold shadow-md shadow-teal-900/60 ring-2 ring-teal-300'
                  : 'bg-sky-900/60 text-teal-300 hover:bg-sky-800 border border-teal-500/30'
              }`}
            >
              🌊 Professor
            </button>

            {/* Aluno Ativo */}
            <button
              onClick={() => {
                const activeStud = users.find((u) => u.role === 'student' && u.status === 'active');
                if (activeStud) handleSelectUser(activeStud);
              }}
              className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                currentUser.role === 'student' && currentUser.status === 'active'
                  ? 'bg-gradient-to-r from-sky-400 to-cyan-300 text-slate-950 font-bold shadow-md shadow-cyan-900/60 ring-2 ring-cyan-200'
                  : 'bg-sky-900/60 text-sky-200 hover:bg-sky-800 border border-sky-500/30'
              }`}
            >
              ☀️ Aluno (Ativo)
            </button>

            {/* Aluno Inativo para testar bloqueio */}
            <button
              onClick={() => {
                const inactStud = users.find((u) => u.role === 'student' && u.status === 'inactive') || users.find((u) => u.id === 'user_student_3');
                if (inactStud) handleSelectUser(inactStud);
              }}
              className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer ${
                currentUser.role === 'student' && currentUser.status === 'inactive'
                  ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-900/60 ring-2 ring-rose-300'
                  : 'bg-sky-900/60 text-rose-300 hover:bg-sky-800 border border-rose-500/30'
              }`}
            >
              ⛔ Aluno (Inativo/Bloqueado)
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 no-print">
        {currentUser.role === 'super_admin' && (
          <SuperAdminPanel
            schools={schools}
            users={users}
            instructors={instructors}
            onSelectSchool={handleSelectSchool}
            onImpersonateOwner={handleSelectUser}
          />
        )}

        {currentUser.role === 'school_owner' && (
          <SchoolOwnerPanel
            currentSchool={currentSchool}
            users={users}
            instructors={instructors}
            slots={slots}
            sessions={sessions}
            bookings={bookings}
            financialRecords={finances}
            plans={plans}
            evaluations={evaluations}
          />
        )}

        {currentUser.role === 'instructor' && (
          <InstructorPanel
            currentInstructor={currentInstructor}
            currentSchool={currentSchool}
            sessions={sessions}
            bookings={bookings}
            users={users}
            evaluations={evaluations}
            reviews={reviews}
          />
        )}

        {currentUser.role === 'student' && (
          <StudentPanel
            currentUser={currentUser}
            currentSchool={currentSchool}
            instructors={instructors.filter((i) => i.schoolId === currentSchool.id)}
            sessions={sessions}
            bookings={bookings}
            evaluations={evaluations}
            reviews={reviews}
            slots={slots}
          />
        )}
      </main>

      {/* Hidden view for Print / PDF Export */}
      <PrintReportView
        currentSchool={currentSchool}
        currentUser={currentUser}
        evaluations={evaluations}
        financialRecords={finances}
        bookings={bookings}
      />

      {/* Footer with Beach and Sun theme */}
      <footer className="bg-sky-950/90 border-t border-sky-800/80 py-6 text-center text-xs text-sky-300/80 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-amber-400 text-sm">🏄</span>
            <span className="font-bold text-amber-300">SurfFlow</span>
            <span>• Sol, Praia & Gestão Inteligente para Escolinhas de Surf</span>
          </div>
          <div>
            Escola atual: <strong className="text-white font-semibold">{currentSchool.name}</strong> ({currentSchool.beachSpot})
          </div>
        </div>
      </footer>
    </div>
  );
}
