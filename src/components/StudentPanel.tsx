import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  Waves,
  Star,
  CheckCircle,
  AlertTriangle,
  Award,
  ChevronRight,
  UserCheck,
  UserX,
  Sparkles,
  MapPin,
  TrendingUp,
  FileText,
  Printer,
  XCircle,
  MessageSquare,
  ShieldAlert,
  Wind,
  Compass,
  ArrowRight,
  Sun,
} from 'lucide-react';
import {
  User,
  SurfSchool,
  Instructor,
  ClassSession,
  Booking,
  StudentEvaluation,
  InstructorReview,
  ScheduleSlot,
} from '../types';
import { storageService } from '../services/storageService';
import { exportService } from '../services/exportService';

interface StudentPanelProps {
  currentUser: User;
  currentSchool: SurfSchool;
  instructors: Instructor[];
  sessions: ClassSession[];
  bookings: Booking[];
  evaluations: StudentEvaluation[];
  reviews: InstructorReview[];
  slots: ScheduleSlot[];
}

export const StudentPanel: React.FC<StudentPanelProps> = ({
  currentUser,
  currentSchool,
  instructors,
  sessions,
  bookings,
  evaluations,
  reviews,
  slots,
}) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'my_classes' | 'performance'>('schedule');

  // Booking Flow Filters
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  // Cancel Modal
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('Imprevisto de trabalho / compromisso pessoal');

  // Review Instructor Modal
  const [reviewModalBooking, setReviewModalBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewDidactics, setReviewDidactics] = useState(5);
  const [reviewSafety, setReviewSafety] = useState(5);
  const [reviewVibe, setReviewVibe] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Alerts
  const [feedbackAlert, setFeedbackAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedbackAlert({ type, message });
    setTimeout(() => setFeedbackAlert(null), 5000);
  };

  const isStudentActive = currentUser.status === 'active';

  // My bookings
  const myBookings = bookings.filter((b) => b.studentId === currentUser.id);
  const myUpcomingBookings = myBookings.filter((b) => b.status === 'confirmed');
  const myPastBookings = myBookings.filter((b) => b.status === 'completed' || b.status === 'cancelled');

  // My technical evaluations
  const myEvaluations = evaluations.filter((e) => e.studentId === currentUser.id);

  // Calculate average skill progress
  const averageSkills = myEvaluations.length > 0
    ? {
        paddling: (myEvaluations.reduce((sum, e) => sum + e.skills.paddling, 0) / myEvaluations.length).toFixed(1),
        popupDrop: (myEvaluations.reduce((sum, e) => sum + e.skills.popupDrop, 0) / myEvaluations.length).toFixed(1),
        balance: (myEvaluations.reduce((sum, e) => sum + e.skills.balance, 0) / myEvaluations.length).toFixed(1),
        waveReading: (myEvaluations.reduce((sum, e) => sum + e.skills.waveReading, 0) / myEvaluations.length).toFixed(1),
        seaSafety: (myEvaluations.reduce((sum, e) => sum + e.skills.seaSafety, 0) / myEvaluations.length).toFixed(1),
      }
    : { paddling: '3.5', popupDrop: '3.5', balance: '3.8', waveReading: '3.0', seaSafety: '4.5' };

  // Generate next 7 days for quick date selector
  const nextDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const weekday = d.toLocaleDateString('pt-BR', { weekday: 'short' });
    const dayNum = d.getDate();
    return { dateStr, weekday, dayNum };
  });

  // Filter available sessions for the selected date
  const availableSessions = sessions.filter((s) => {
    if (s.schoolId !== currentSchool.id) return false;
    if (s.date !== selectedDate) return false;
    if (selectedInstructorId !== 'all' && s.instructorId !== selectedInstructorId) return false;
    if (selectedLevel !== 'all' && s.level !== selectedLevel && s.level !== 'todos') return false;
    return true;
  });

  // Handle Booking Confirmation
  const handleBookSession = (session: ClassSession) => {
    if (!isStudentActive) {
      showAlert(
        'Você não pode agendar aulas pois seu status está INATIVO. Entre em contato com a coordenação para regularizar sua matrícula.',
        'error'
      );
      return;
    }

    const res = storageService.createBooking(
      currentSchool.id,
      session.id,
      currentUser.id,
      session.instructorId,
      session.date,
      session.startTime,
      session.endTime,
      session.spot
    );

    if (res.success) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#10b981', '#38bdf8', '#fbbf24'],
      });
      showAlert('🏄‍♂️ Aula agendada com sucesso! Uma confirmação automática foi enviada.');
    } else {
      showAlert(res.error || 'Erro ao realizar o agendamento.', 'error');
    }
  };

  // Handle Booking Cancellation
  const handleConfirmCancel = () => {
    if (!cancelModalBooking) return;

    const res = storageService.cancelBooking(cancelModalBooking.id, cancelReason);
    if (res.success) {
      showAlert('Aula cancelada. O professor e a escolinha foram notificados automaticamente.');
      setCancelModalBooking(null);
    } else {
      showAlert(res.error || 'Erro ao cancelar.', 'error');
    }
  };

  // Handle Review Submission
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalBooking) return;

    storageService.createReview({
      sessionId: reviewModalBooking.sessionId,
      schoolId: currentSchool.id,
      instructorId: reviewModalBooking.instructorId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      rating: reviewRating,
      didactics: reviewDidactics,
      safetyAttention: reviewSafety,
      vibe: reviewVibe,
      comment: reviewComment || 'Excelente aula de surf!',
    });

    setReviewModalBooking(null);
    showAlert('Obrigado pela sua avaliação! Seu feedback ajuda muito o instrutor e a escola.');
  };

  return (
    <div className="space-y-6">
      {/* Student Banner - Ocean & Sun Coastal Atmosphere */}
      <div className="bg-gradient-to-r from-blue-900/90 via-sky-900/80 to-amber-950/40 border border-sky-700/70 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl shadow-sky-950/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-400/80 shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 border-2 border-sky-950 flex items-center justify-center">
                <Sun className="w-3.5 h-3.5 text-amber-950" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold uppercase tracking-wider flex items-center space-x-1">
                  <span>Área do Surfista</span>
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold border flex items-center space-x-1 ${
                    isStudentActive
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                  }`}
                >
                  {isStudentActive ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                  <span>{isStudentActive ? 'Status: ATIVO' : 'Status: INATIVO (Bloqueado)'}</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">{currentUser.name}</h1>
              <p className="text-xs sm:text-sm text-sky-200/90 mt-0.5 flex items-center space-x-2">
                <span className="capitalize font-medium text-amber-300">Nível: {currentUser.skillLevel || 'Iniciante'}</span>
                <span>•</span>
                <span>Prancha: {currentUser.boardType || 'Softboard'}</span>
                <span>•</span>
                <span className="text-white font-medium">{currentSchool.name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setActiveTab('performance')}
              className="bg-sky-900/80 hover:bg-sky-800 text-amber-300 text-xs font-semibold px-4 py-2.5 rounded-xl border border-sky-700/80 flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Meu Desempenho</span>
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Sun className="w-4 h-4 text-slate-950" />
              <span>Agendar no Mar</span>
            </button>
          </div>
        </div>

        {/* Status Warning if Inactive */}
        {!isStudentActive && (
          <div className="mt-6 p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center space-x-3">
              <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <div>
                <span className="font-bold text-white block">Atenção: Agendamentos Temporariamente Bloqueados</span>
                <span>
                  Sua conta está com status INATIVO devido a pendências de mensalidade ou cadastro. Fale com a coordenação da {currentSchool.name} para desbloquear suas aulas.
                </span>
              </div>
            </div>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Olá ${currentSchool.name}, sou o aluno ${currentUser.name} e gostaria de regularizar minha mensalidade para agendar aulas de surf.`)}`}
              target="_blank"
              rel="noreferrer"
              className="bg-rose-600 hover:bg-rose-500 text-white font-semibold px-3 py-1.5 rounded-xl text-xs whitespace-nowrap"
            >
              Falar no WhatsApp
            </a>
          </div>
        )}
      </div>

      {feedbackAlert && (
        <div
          className={`px-4 py-3 rounded-2xl border flex items-center space-x-3 text-xs sm:text-sm animate-fade-in ${
            feedbackAlert.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
              : 'bg-rose-950/80 border-rose-800 text-rose-200'
          }`}
        >
          {feedbackAlert.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          )}
          <span>{feedbackAlert.message}</span>
        </div>
      )}

      {/* Navigation Tabs - Beach & Ocean style */}
      <div className="flex border-b border-sky-800/80 space-x-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'schedule'
              ? 'border-amber-400 text-amber-300 font-bold'
              : 'border-transparent text-sky-200/70 hover:text-white'
          }`}
        >
          <Sun className="w-4 h-4 text-amber-400" />
          <span>Agendamento em Tempo Real</span>
        </button>
        <button
          onClick={() => setActiveTab('my_classes')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'my_classes'
              ? 'border-amber-400 text-amber-300 font-bold'
              : 'border-transparent text-sky-200/70 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4 text-sky-400" />
          <span>Minhas Aulas ({myBookings.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'performance'
              ? 'border-amber-400 text-amber-300 font-bold'
              : 'border-transparent text-sky-200/70 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>Evolução & Desempenho</span>
        </button>
      </div>

      {/* TAB 1: SCHEDULE CLASS IN REAL TIME */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          {/* Step 1: Choose Instructor */}
          <div className="bg-sky-950/80 border border-sky-800/80 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span className="w-7 h-7 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-md shadow-amber-400/20">
                    1
                  </span>
                  <span>Escolha seu Professor de Surf</span>
                </h3>
                <p className="text-xs text-sky-300/80 mt-0.5">
                  Instrutores certificados para dias de sol, treino de remada e leitura de séries.
                </p>
              </div>

              {selectedInstructorId !== 'all' && (
                <button
                  onClick={() => setSelectedInstructorId('all')}
                  className="text-xs text-amber-300 hover:text-amber-200 underline font-semibold"
                >
                  Ver todos os professores
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {instructors.map((inst) => {
                const isSelected = selectedInstructorId === inst.id;
                return (
                  <div
                    key={inst.id}
                    onClick={() => setSelectedInstructorId(isSelected ? 'all' : inst.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-sky-900/90 border-amber-400 shadow-xl shadow-amber-500/20 ring-1 ring-amber-400'
                        : 'bg-sky-900/40 border-sky-850 hover:border-sky-700 hover:bg-sky-900/60'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={inst.photo}
                        alt={inst.name}
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-amber-400/60"
                      />
                      <div>
                        <h4 className="font-bold text-white text-sm">{inst.name}</h4>
                        <div className="flex items-center space-x-1 text-xs text-amber-400 mt-0.5">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="font-bold">{inst.rating.toFixed(1)}</span>
                          <span className="text-[10px] text-sky-300">({inst.reviewCount})</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-sky-200/80 mt-2.5 line-clamp-2 leading-relaxed">
                      {inst.bio}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {inst.specialties.slice(0, 2).map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] px-2 py-0.2 rounded-full bg-sky-800 text-amber-300 border border-sky-700 font-semibold"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Date Selector & Surf Conditions Widget */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-sky-950/80 border border-sky-800/80 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span className="w-7 h-7 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-md shadow-amber-400/20">
                    2
                  </span>
                  <span>Escolha o Dia da Aula</span>
                </h3>
                <span className="text-xs text-amber-300 font-medium">☀️ Previsão ensolarada</span>
              </div>

              {/* Day pills with sun gold style */}
              <div className="grid grid-cols-7 gap-2">
                {nextDays.map((d) => {
                  const isSelected = selectedDate === d.dateStr;
                  return (
                    <button
                      key={d.dateStr}
                      onClick={() => setSelectedDate(d.dateStr)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-b from-amber-400 via-amber-500 to-orange-500 text-slate-950 border-amber-300 font-extrabold shadow-lg shadow-amber-500/40 ring-1 ring-amber-300'
                          : 'bg-sky-900/40 border-sky-800 text-sky-300 hover:text-white hover:border-amber-400/50 hover:bg-sky-900/70'
                      }`}
                    >
                      <span className="text-[10px] block uppercase font-mono font-bold tracking-wider">{d.weekday}</span>
                      <span className="text-lg font-black block mt-0.5">{d.dayNum}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Surf Conditions Widget - Beach, Tide, Water */}
            <div className="bg-gradient-to-br from-sky-900/90 via-sky-950/90 to-blue-950/90 border border-sky-700/80 rounded-3xl p-6 shadow-xl space-y-3">
              <div className="flex items-center space-x-2 text-amber-400">
                <Sun className="w-5 h-5 animate-spin-slow" />
                <h3 className="text-sm font-bold text-white">Boletim de Praia & Mar</h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-sky-950/80 border border-sky-800/80">
                  <span className="text-sky-300 flex items-center space-x-1.5 font-medium">
                    <Waves className="w-3.5 h-3.5 text-sky-400" />
                    <span>Ondulação:</span>
                  </span>
                  <span className="font-bold text-white">1.2m - 1.5m (Tubular)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-sky-950/80 border border-sky-800/80">
                  <span className="text-sky-300 flex items-center space-x-1.5 font-medium">
                    <Wind className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Vento:</span>
                  </span>
                  <span className="font-bold text-emerald-300">Terral 5 nós (Liso)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-sky-950/80 border border-sky-800/80">
                  <span className="text-sky-300 flex items-center space-x-1.5 font-medium">
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    <span>Maré:</span>
                  </span>
                  <span className="font-bold text-amber-300">Secando (Pico Cedo)</span>
                </div>
              <p className="text-[11px] text-sky-300/80 italic">
                *Água morna (23°C) e muito sol na bancada do {currentSchool.beachSpot}.
              </p>
            </div>
          </div>
        </div>

          {/* Step 3: Real-Time Slots Availability */}
          <div className="bg-sky-950/80 border border-sky-800/80 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span className="w-7 h-7 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-md shadow-amber-400/20">
                    3
                  </span>
                  <span>Horários com Vagas no Mar</span>
                </h3>
                <p className="text-xs text-sky-300/80 mt-0.5">
                  Vagas em tempo real para: <strong className="text-amber-300 font-bold">{selectedDate}</strong>
                </p>
              </div>

              {/* Filter level */}
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-sky-300">Filtrar nível:</span>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="bg-sky-900 border border-sky-700 rounded-xl px-3 py-1.5 text-sky-100 focus:outline-none focus:border-amber-400"
                >
                  <option value="all">Todos os Níveis</option>
                  <option value="iniciante">Iniciante</option>
                  <option value="intermediario">Intermediário</option>
                  <option value="avancado">Avançado</option>
                </select>
              </div>
            </div>

            {availableSessions.length === 0 ? (
              <div className="bg-sky-900/30 border border-sky-800/80 rounded-2xl p-12 text-center text-sky-300/80 space-y-3">
                <Clock className="w-8 h-8 text-sky-600 mx-auto" />
                <p className="text-sm font-semibold text-white">
                  Não há turmas abertas para esta data com os filtros selecionados.
                </p>
                <p className="text-xs text-sky-400">
                  Experimente escolher outro dia ensolarado acima ou outro professor.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableSessions.map((session) => {
                  const instructor = instructors.find((i) => i.id === session.instructorId);
                  const enrolledCount = session.enrolledStudentIds.length;
                  const spotsLeft = session.maxStudents - enrolledCount;
                  const isFull = spotsLeft <= 0;
                  const isAlreadyBooked = session.enrolledStudentIds.includes(currentUser.id);

                  return (
                    <div
                      key={session.id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                        isAlreadyBooked
                          ? 'bg-sky-900/70 border-amber-400/80 shadow-md shadow-amber-500/10'
                          : isFull
                          ? 'bg-sky-950/40 border-sky-900/60 opacity-60'
                          : 'bg-sky-900/40 border-sky-800 hover:border-amber-400/70 hover:bg-sky-900/60 shadow-lg'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-lg font-black text-white">
                              {session.startTime} - {session.endTime}
                            </span>
                            <div className="text-xs text-amber-300 font-medium flex items-center space-x-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-amber-400" />
                              <span>{session.spot}</span>
                            </div>
                          </div>

                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                              isFull
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                : spotsLeft <= 2
                                ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 animate-pulse'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            }`}
                          >
                            {isFull ? 'Esgotado' : `${spotsLeft} vagas no mar`}
                          </span>
                        </div>

                        <div className="flex items-center space-x-3 mt-4 pt-3 border-t border-sky-800/80">
                          <img
                            src={instructor?.photo}
                            alt={instructor?.name}
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-400/60"
                          />
                          <div>
                            <span className="text-xs font-bold text-white block">
                              Prof. {instructor?.name}
                            </span>
                            <span className="text-[10px] text-sky-300/80 capitalize">
                              Nível: {session.level}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div>
                        {isAlreadyBooked ? (
                          <div className="w-full py-2.5 bg-sky-900 text-amber-300 border border-amber-400/40 rounded-xl text-center text-xs font-bold flex items-center justify-center space-x-1.5">
                            <CheckCircle className="w-4 h-4 text-amber-400" />
                            <span>Inscrito nesta turma</span>
                          </div>
                        ) : isFull ? (
                          <button
                            disabled
                            className="w-full py-2.5 bg-sky-950/60 text-sky-500 rounded-xl text-xs font-semibold cursor-not-allowed border border-sky-900"
                          >
                            Turma Lotada
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBookSession(session)}
                            disabled={!isStudentActive}
                            className={`w-full py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 ${
                              isStudentActive
                                ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/25 active:scale-95 cursor-pointer'
                                : 'bg-sky-950 text-sky-500 cursor-not-allowed border border-sky-900'
                            }`}
                          >
                            <span>Reservar Vaga no Mar</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY BOOKINGS (UPCOMING & HISTORY) */}
      {activeTab === 'my_classes' && (
        <div className="space-y-6">
          {/* Upcoming */}
          <div className="bg-sky-950/80 border border-sky-800/80 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Próximas Aulas no Mar ({myUpcomingBookings.length})</span>
            </h3>

            {myUpcomingBookings.length === 0 ? (
              <p className="text-xs text-sky-400/80 italic py-4">Você ainda não tem aulas futuras agendadas.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myUpcomingBookings.map((b) => {
                  const inst = instructors.find((i) => i.id === b.instructorId);
                  return (
                    <div
                      key={b.id}
                      className="p-5 rounded-2xl bg-sky-900/40 border border-sky-800/80 hover:border-amber-400/60 flex flex-col justify-between space-y-4 transition-colors shadow-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-lg font-black text-white">
                            {b.date} • {b.startTime} às {b.endTime}
                          </span>
                          <p className="text-xs text-amber-300 font-semibold mt-0.5">{b.spot}</p>
                          <p className="text-xs text-sky-200/80 mt-1">
                            Professor: <span className="text-white font-bold">{inst?.name}</span>
                          </p>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold">
                          Confirmada
                        </span>
                      </div>

                      <div className="pt-3 border-t border-sky-800/80 flex items-center justify-between">
                        <span className="text-[11px] text-sky-300">Agendado em {new Date(b.bookedAt).toLocaleDateString('pt-BR')}</span>
                        <button
                          onClick={() => setCancelModalBooking(b)}
                          className="text-xs text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
                        >
                          Cancelar Aula
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Past classes & Review */}
          <div className="bg-sky-950/80 border border-sky-800/80 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>Histórico de Sessões de Surf</span>
            </h3>

            {myPastBookings.length === 0 ? (
              <p className="text-xs text-sky-400/80 italic py-4">Nenhuma aula anterior encontrada.</p>
            ) : (
              <div className="space-y-3">
                {myPastBookings.map((b) => {
                  const inst = instructors.find((i) => i.id === b.instructorId);
                  const hasReviewed = reviews.some(
                    (r) => r.sessionId === b.sessionId && r.studentId === currentUser.id
                  );

                  return (
                    <div
                      key={b.id}
                      className="p-4 rounded-2xl bg-sky-900/30 border border-sky-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-900 border border-sky-700 flex items-center justify-center text-amber-300 font-mono font-bold">
                          {b.date.split('-')[2]}
                        </div>
                        <div>
                          <div className="font-bold text-white">
                            {b.date} • {b.startTime} - {b.endTime} ({b.spot})
                          </div>
                          <div className="text-sky-200/80 mt-0.5">
                            Professor: {inst?.name} • Status:{' '}
                            <span className={b.status === 'cancelled' ? 'text-rose-400' : 'text-emerald-300 font-bold'}>
                              {b.status === 'cancelled' ? 'Cancelada' : 'Realizada (Presença confirmada)'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {b.status !== 'cancelled' && (
                        <div>
                          {hasReviewed ? (
                            <span className="text-[11px] text-amber-300 flex items-center space-x-1 font-bold">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Você já avaliou o professor</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => setReviewModalBooking(b)}
                              className="bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/50 font-bold px-3 py-1.5 rounded-xl text-[11px] flex items-center space-x-1 transition-colors"
                            >
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span>Avaliar Professor</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PERFORMANCE DOSSIER & TECHNICAL EVOLUTION */}
      {activeTab === 'performance' && (
        <div className="bg-sky-950/80 border border-sky-800/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold">
                  Dossiê Técnico do Surfista
                </span>
                <span className="text-xs text-sky-300/80">Atualizado após cada sessão</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Evolução Técnica & Relatório de Desempenho
              </h2>
            </div>

            <button
              onClick={() => exportService.triggerPDFPrint()}
              className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/25 transition-transform active:scale-95 cursor-pointer self-start sm:self-auto"
            >
              <Printer className="w-4 h-4 text-slate-950" />
              <span>Exportar Certificado em PDF</span>
            </button>
          </div>

          {/* Technical radar skills grid - Beach ocean colors */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
            {[
              { title: 'Remada & Entrada', score: averageSkills.paddling, desc: 'Força propulsora e leitura do ponto de quebra' },
              { title: 'Drop & Pop-up Rápido', score: averageSkills.popupDrop, desc: 'Agilidade de apoiar pés e posicionar base' },
              { title: 'Equilíbrio na Prancha', score: averageSkills.balance, desc: 'Estabilidade sobre o centro de gravidade' },
              { title: 'Leitura de Séries', score: averageSkills.waveReading, desc: 'Antecipação da parede e momento da crista' },
              { title: 'Segurança & Respeito', score: averageSkills.seaSafety, desc: 'Correntes, outros surfistas e leash' },
            ].map((skill, index) => (
              <div
                key={index}
                className="bg-sky-900/40 p-4 rounded-2xl border border-sky-800 text-center flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-bold text-sky-100 block min-h-[32px]">
                    {skill.title}
                  </span>
                  <div className="text-2xl font-black text-amber-300 mt-2">
                    {skill.score} <span className="text-xs text-sky-400 font-normal">/ 5.0</span>
                  </div>
                  {/* Progress bar with sunny beach gradient */}
                  <div className="w-full bg-sky-950 h-2.5 rounded-full mt-2 overflow-hidden border border-sky-800">
                    <div
                      className="bg-gradient-to-r from-sky-400 via-teal-400 to-amber-400 h-full rounded-full"
                      style={{ width: `${(parseFloat(skill.score) / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-[10px] text-sky-300/80 mt-3">{skill.desc}</p>
              </div>
            ))}
          </div>

          {/* Detailed logs of coach feedbacks */}
          <div className="pt-4 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Pareceres e Dicas dos Professores por Aula ({myEvaluations.length})</span>
            </h3>

            {myEvaluations.length === 0 ? (
              <p className="text-xs text-sky-400/80 italic py-4">
                Nenhum feedback registrado pelos instrutores ainda. Ao término da sua primeira aula, seu relatório aparecerá aqui!
              </p>
            ) : (
              myEvaluations.map((ev) => {
                const inst = instructors.find((i) => i.id === ev.instructorId);
                return (
                  <div
                    key={ev.id}
                    className="p-5 rounded-2xl bg-sky-900/40 border border-sky-800 space-y-3 text-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={inst?.photo}
                          alt={inst?.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400/60"
                        />
                        <div>
                          <div className="font-bold text-white text-sm">Prof. {inst?.name}</div>
                          <div className="text-sky-300 text-[11px]">
                            Aula de {ev.date} • Prancha: {ev.boardUsed} • {ev.wavesCaught} ondas surfadas
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1 text-amber-300 font-bold bg-sky-950 px-3 py-1 rounded-xl border border-sky-800">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{ev.overallRating.toFixed(1)} ★</span>
                      </div>
                    </div>

                    <div className="p-3 bg-sky-950/60 rounded-xl border border-sky-800/80">
                      <span className="font-bold text-white block mb-1">Feedback do Treino:</span>
                      <p className="text-sky-200 leading-relaxed">{ev.notes}</p>
                    </div>

                    {ev.coachTips && (
                      <div className="p-3 bg-amber-400/10 rounded-xl border border-amber-400/30 text-amber-200">
                        <span className="font-bold text-amber-300 flex items-center space-x-1">
                          <Sun className="w-3.5 h-3.5 text-amber-400" />
                          <span>Dica de Ouro do Coach:</span>
                        </span>
                        <p className="mt-0.5">{ev.coachTips}</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* MODAL: CANCEL CLASS */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sky-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-sky-950 border border-sky-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Confirmar Cancelamento de Aula</h3>
            </div>

            <p className="text-xs text-sky-200/90 leading-relaxed">
              Deseja cancelar sua aula de <strong>{cancelModalBooking.date}</strong> às{' '}
              <strong>{cancelModalBooking.startTime}</strong>? A vaga será liberada e o instrutor será notificado imediatamente.
            </p>

            <div>
              <label className="block text-xs font-semibold text-sky-300 mb-1">
                Motivo do Cancelamento:
              </label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-sky-900 border border-sky-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-400"
              ></textarea>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="px-4 py-2 text-xs text-sky-300 hover:text-white"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors"
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REVIEW INSTRUCTOR */}
      {reviewModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sky-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-sky-950 border border-sky-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sky-800">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Star className="w-4 h-4 text-amber-400 fill-current" />
                <span>Avaliar Instrutor da Aula</span>
              </h3>
              <button onClick={() => setReviewModalBooking(null)} className="text-sky-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              <div className="space-y-3 bg-sky-900/60 p-4 rounded-2xl border border-sky-800">
                {[
                  { label: 'Nota Geral da Aula', val: reviewRating, setter: setReviewRating },
                  { label: 'Didática e Explicações na Água', val: reviewDidactics, setter: setReviewDidactics },
                  { label: 'Atenção e Segurança', val: reviewSafety, setter: setReviewSafety },
                  { label: 'Vibe e Motivação no Mar', val: reviewVibe, setter: setReviewVibe },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sky-200 font-medium">{item.label}</span>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => item.setter(star)}
                          className={`p-1 text-sm ${
                            star <= item.val ? 'text-amber-400' : 'text-sky-700'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sky-200 font-semibold mb-1">
                  Comentário / Depoimento (opcional)
                </label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Conte como foi sua experiência com o professor..."
                  className="w-full bg-sky-900 border border-sky-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                ></textarea>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-sky-800">
                <button
                  type="button"
                  onClick={() => setReviewModalBooking(null)}
                  className="px-4 py-2 text-sky-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2 rounded-xl transition-all shadow-md"
                >
                  Enviar Avaliação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
