import React, { useState } from 'react';
import {
  GraduationCap,
  Calendar,
  CheckCircle,
  XCircle,
  Award,
  Star,
  Users,
  Waves,
  ClipboardList,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Send,
  Plus,
  Shield,
  Zap,
  Sun,
} from 'lucide-react';
import {
  Instructor,
  ClassSession,
  Booking,
  User,
  StudentEvaluation,
  InstructorReview,
  SurfSchool,
} from '../types';
import { storageService } from '../services/storageService';

interface InstructorPanelProps {
  currentInstructor: Instructor;
  currentSchool: SurfSchool;
  sessions: ClassSession[];
  bookings: Booking[];
  users: User[];
  evaluations: StudentEvaluation[];
  reviews: InstructorReview[];
}

export const InstructorPanel: React.FC<InstructorPanelProps> = ({
  currentInstructor,
  currentSchool,
  sessions,
  bookings,
  users,
  evaluations,
  reviews,
}) => {
  const [activeTab, setActiveTab] = useState<'sessions' | 'evaluations' | 'reviews'>('sessions');

  // Evaluation modal
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [selectedSessionForEval, setSelectedSessionForEval] = useState<ClassSession | null>(null);
  const [selectedStudentForEval, setSelectedStudentForEval] = useState<User | null>(null);

  // Evaluation form state
  const [paddling, setPaddling] = useState(4);
  const [popupDrop, setPopupDrop] = useState(4);
  const [balance, setBalance] = useState(4);
  const [waveReading, setWaveReading] = useState(3);
  const [seaSafety, setSeaSafety] = useState(5);
  const [wavesCaught, setWavesCaught] = useState(6);
  const [boardUsed, setBoardUsed] = useState('Softboard 8\'0');
  const [notes, setNotes] = useState('');
  const [coachTips, setCoachTips] = useState('');
  const [alertMsg, setAlertMsg] = useState('');

  const showAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(''), 5000);
  };

  // Filter sessions for this instructor
  const mySessions = sessions.filter((s) => s.instructorId === currentInstructor.id);
  const myReviews = reviews.filter((r) => r.instructorId === currentInstructor.id);
  const myEvaluations = evaluations.filter((e) => e.instructorId === currentInstructor.id);

  // Mark attendance
  const handleMarkAttendance = (bookingId: string, status: 'present' | 'absent' | 'excused') => {
    storageService.updateAttendance(bookingId, status);
    showAlert(`Presença atualizada com sucesso!`);
  };

  // Open evaluation modal for a specific student in a session
  const openEvaluationModal = (session: ClassSession, student: User) => {
    setSelectedSessionForEval(session);
    setSelectedStudentForEval(student);
    setPaddling(4);
    setPopupDrop(4);
    setBalance(4);
    setWaveReading(3);
    setSeaSafety(5);
    setWavesCaught(5);
    setBoardUsed(student.boardType || 'Softboard 8\'0');
    setNotes(`Ótima postura e empenho na aula de hoje na bancada do ${session.spot}!`);
    setCoachTips('Focar na aceleração da remada nas 3 últimas braçadas antes de apoiar as mãos na prancha.');
    setIsEvalModalOpen(true);
  };

  // Submit evaluation
  const handleSubmitEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionForEval || !selectedStudentForEval) return;

    const overallRating = Number(
      ((paddling + popupDrop + balance + waveReading + seaSafety) / 5).toFixed(1)
    );

    storageService.createEvaluation({
      sessionId: selectedSessionForEval.id,
      schoolId: currentSchool.id,
      instructorId: currentInstructor.id,
      studentId: selectedStudentForEval.id,
      date: selectedSessionForEval.date,
      skills: {
        paddling,
        popupDrop,
        balance,
        waveReading,
        seaSafety,
      },
      overallRating,
      wavesCaught: Number(wavesCaught),
      boardUsed,
      notes,
      coachTips,
    });

    setIsEvalModalOpen(false);
    showAlert(`Avaliação técnica enviada para ${selectedStudentForEval.name}! O aluno foi notificado.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Instructor Header - Ocean & Sun Beach Style */}
      <div className="bg-gradient-to-r from-blue-900/90 via-sky-900/80 to-teal-950/40 border border-sky-700/70 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl shadow-sky-950/50">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={currentInstructor.photo}
                alt={currentInstructor.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-400/80 shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 border border-sky-950 flex items-center justify-center">
                <Sun className="w-3.5 h-3.5 text-amber-950" />
              </div>
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-bold mb-1">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Painel do Professor de Surf</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{currentInstructor.name}</h1>
              <p className="text-xs sm:text-sm text-sky-200/90 mt-0.5">
                {currentInstructor.crefOrCert} • {currentSchool.name}
              </p>
            </div>
          </div>

          {/* Rating box */}
          <div className="bg-sky-950/80 p-3 sm:p-4 rounded-2xl border border-sky-800 flex items-center space-x-4 shadow-lg">
            <div className="text-right">
              <span className="text-[11px] text-sky-300 block font-semibold">Avaliação Média</span>
              <div className="flex items-center space-x-1 justify-end text-amber-400 font-black text-xl">
                <Star className="w-4 h-4 fill-current" />
                <span>{currentInstructor.rating.toFixed(1)}</span>
              </div>
              <span className="text-[10px] text-sky-400">{currentInstructor.reviewCount} avaliações</span>
            </div>
          </div>
        </div>

        {/* Quick metrics */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6 pt-6 border-t border-sky-800/80">
          <div className="bg-sky-950/70 p-3.5 rounded-2xl border border-sky-800/80 text-center">
            <span className="text-[10px] sm:text-xs text-sky-300 font-medium">Turmas Conduzidas</span>
            <div className="text-xl sm:text-2xl font-black text-white mt-0.5">{mySessions.length}</div>
          </div>
          <div className="bg-sky-950/70 p-3.5 rounded-2xl border border-sky-800/80 text-center">
            <span className="text-[10px] sm:text-xs text-sky-300 font-medium">Avaliações Feitas</span>
            <div className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">{myEvaluations.length}</div>
          </div>
          <div className="bg-sky-950/70 p-3.5 rounded-2xl border border-sky-800/80 text-center">
            <span className="text-[10px] sm:text-xs text-sky-300 font-medium">Feedback dos Alunos</span>
            <div className="text-xl sm:text-2xl font-black text-sky-200 mt-0.5">{myReviews.length}</div>
          </div>
        </div>
      </div>

      {alertMsg && (
        <div className="bg-sky-900/80 border border-amber-400/60 text-amber-200 px-4 py-3 rounded-2xl flex items-center space-x-3 text-xs sm:text-sm animate-fade-in shadow-lg">
          <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-sky-800/80 space-x-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'sessions'
              ? 'border-amber-400 text-amber-300 font-bold'
              : 'border-transparent text-sky-200/70 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>Minhas Turmas & Chamada ({mySessions.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('evaluations')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'evaluations'
              ? 'border-amber-400 text-amber-300 font-bold'
              : 'border-transparent text-sky-200/70 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4 text-sky-400" />
          <span>Avaliações Técnicas Enviadas ({myEvaluations.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 flex items-center space-x-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'reviews'
              ? 'border-amber-400 text-amber-300 font-bold'
              : 'border-transparent text-sky-200/70 hover:text-white'
          }`}
        >
          <Star className="w-4 h-4 text-amber-400" />
          <span>Avaliações dos Alunos sobre Você ({myReviews.length})</span>
        </button>
      </div>

      {/* TAB 1: SESSIONS & ROSTER */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          {mySessions.length === 0 ? (
            <div className="bg-sky-950/80 border border-sky-800/80 rounded-3xl p-12 text-center text-sky-300/80">
              Nenhuma turma agendada para você no momento.
            </div>
          ) : (
            mySessions.map((session) => {
              const enrolledStudents = users.filter((u) => session.enrolledStudentIds.includes(u.id));
              const sessionBookings = bookings.filter((b) => b.sessionId === session.id);

              return (
                <div
                  key={session.id}
                  className="bg-sky-950/80 border border-sky-800/80 rounded-3xl p-6 shadow-xl space-y-4 hover:border-amber-400/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sky-800/80">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-sky-900 border border-amber-400/60 flex flex-col items-center justify-center text-amber-300 shadow-md">
                        <span className="text-[10px] font-mono uppercase font-bold">
                          {new Date(session.date).toLocaleDateString('pt-BR', { weekday: 'short' })}
                        </span>
                        <span className="text-sm font-black text-white">{session.date.split('-')[2]}</span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-base font-bold text-white">
                            {session.startTime} às {session.endTime}
                          </h3>
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-sky-900 text-amber-300 border border-sky-700 font-semibold">
                            {session.spot}
                          </span>
                        </div>
                        <p className="text-xs text-sky-300/80 mt-0.5">
                          Nível indicado: <span className="capitalize text-white font-medium">{session.level}</span> • Capacidade:{' '}
                          <strong className="text-amber-300">{enrolledStudents.length}</strong> de {session.maxStudents} alunos
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-start sm:self-auto">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                          session.status === 'completed'
                            ? 'bg-blue-500/20 text-sky-200 border-blue-400/30'
                            : 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                        }`}
                      >
                        {session.status === 'completed' ? 'Aula Concluída' : '☀️ Agendada'}
                      </span>
                    </div>
                  </div>

                  {/* Enrolled Students & Actions */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300 mb-2">
                      Lista de Chamada & Alunos Inscritos:
                    </h4>

                    {enrolledStudents.length === 0 ? (
                      <p className="text-xs text-sky-400/70 italic py-2">Nenhum aluno inscrito nesta turma ainda.</p>
                    ) : (
                      <div className="space-y-2">
                        {enrolledStudents.map((student) => {
                          const booking = sessionBookings.find((b) => b.studentId === student.id);
                          const evalForThisSession = evaluations.find(
                            (e) => e.sessionId === session.id && e.studentId === student.id
                          );

                          return (
                            <div
                              key={student.id}
                              className="p-3.5 rounded-2xl bg-sky-900/40 border border-sky-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center space-x-3">
                                <img
                                  src={student.avatar}
                                  alt={student.name}
                                  className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-400/50"
                                />
                                <div>
                                  <div className="font-bold text-white flex items-center space-x-2">
                                    <span>{student.name}</span>
                                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-sky-800 text-amber-300 uppercase font-mono font-bold">
                                      {student.skillLevel}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-sky-300/80 flex items-center space-x-2 mt-0.5">
                                    <span>Prancha: {student.boardType || 'Padrão'}</span>
                                    <span>•</span>
                                    <span>Emergência: {student.emergencyContact || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Attendance & Evaluate buttons */}
                              <div className="flex items-center space-x-2 self-end sm:self-center">
                                {/* Presença */}
                                {booking && (
                                  <div className="flex items-center space-x-1 bg-sky-950 p-1 rounded-xl border border-sky-800">
                                    <button
                                      onClick={() => handleMarkAttendance(booking.id, 'present')}
                                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                                        booking.attendanceStatus === 'present'
                                          ? 'bg-amber-400 text-slate-950 shadow-sm'
                                          : 'text-sky-300 hover:text-white'
                                      }`}
                                    >
                                      Presente
                                    </button>
                                    <button
                                      onClick={() => handleMarkAttendance(booking.id, 'absent')}
                                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                                        booking.attendanceStatus === 'absent'
                                          ? 'bg-rose-500 text-white shadow-sm'
                                          : 'text-sky-300 hover:text-white'
                                      }`}
                                    >
                                      Falta
                                    </button>
                                  </div>
                                )}

                                {/* Avaliação Técnica do Aluno */}
                                {evalForThisSession ? (
                                  <span className="px-3 py-1.5 rounded-xl bg-sky-900 border border-amber-400/50 text-amber-300 font-bold text-[11px] flex items-center space-x-1">
                                    <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Avaliado ({evalForThisSession.overallRating}★)</span>
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => openEvaluationModal(session, student)}
                                    className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black px-3.5 py-1.5 rounded-xl text-[11px] shadow-md shadow-amber-500/20 flex items-center space-x-1.5 transition-transform active:scale-95 cursor-pointer"
                                  >
                                    <Award className="w-3.5 h-3.5" />
                                    <span>Avaliar Pós-Aula</span>
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
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: TECHNICAL EVALUATIONS GIVEN */}
      {activeTab === 'evaluations' && (
        <div className="space-y-4">
          {myEvaluations.length === 0 ? (
            <div className="bg-sky-950/80 border border-sky-800/80 rounded-3xl p-12 text-center text-sky-300/80">
              Nenhuma avaliação técnica emitida ainda. Ao término da aula, avalie seus alunos na aba "Minhas Turmas".
            </div>
          ) : (
            myEvaluations.map((ev) => {
              const student = users.find((u) => u.id === ev.studentId);
              return (
                <div
                  key={ev.id}
                  className="bg-sky-950/80 border border-sky-800/80 rounded-3xl p-6 shadow-xl space-y-4 hover:border-amber-400/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={student?.avatar}
                        alt={student?.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400/60"
                      />
                      <div>
                        <h3 className="font-bold text-white text-base">{student?.name}</h3>
                        <p className="text-xs text-sky-300/80">
                          Data da aula: {ev.date} • Prancha: {ev.boardUsed} • {ev.wavesCaught} ondas surfadas
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 text-amber-300 font-bold text-base bg-sky-900 px-3 py-1 rounded-xl border border-sky-700">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{ev.overallRating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Skills radar / bar breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
                    {[
                      { label: 'Remada', val: ev.skills.paddling },
                      { label: 'Drop / Subida', val: ev.skills.popupDrop },
                      { label: 'Equilíbrio', val: ev.skills.balance },
                      { label: 'Leitura Onda', val: ev.skills.waveReading },
                      { label: 'Segurança', val: ev.skills.seaSafety },
                    ].map((sk, idx) => (
                      <div key={idx} className="bg-sky-900/50 p-2.5 rounded-xl border border-sky-800 text-center">
                        <span className="text-[10px] text-sky-300/80 block">{sk.label}</span>
                        <div className="font-black text-amber-300 text-sm mt-0.5">{sk.val} / 5</div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-sky-900/40 p-3.5 rounded-2xl border border-sky-800/80 text-xs space-y-2">
                    <div>
                      <span className="font-bold text-white">Parecer Técnico:</span>
                      <p className="text-sky-200/90 mt-0.5">{ev.notes}</p>
                    </div>
                    {ev.coachTips && (
                      <div className="pt-2 border-t border-sky-800/80 text-amber-300">
                        <span className="font-bold text-amber-300 flex items-center space-x-1">
                          <Sun className="w-3.5 h-3.5 text-amber-400" />
                          <span>Dica de Ouro do Coach para a próxima:</span>
                        </span>
                        <p className="mt-0.5 text-sky-100">{ev.coachTips}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: REVIEWS RECEIVED FROM STUDENTS */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {myReviews.length === 0 ? (
            <div className="bg-sky-950/80 border border-sky-800/80 rounded-3xl p-12 text-center text-sky-300/80">
              Ainda não há avaliações de alunos registradas.
            </div>
          ) : (
            myReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-sky-950/80 border border-sky-800/80 rounded-3xl p-6 shadow-xl space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">{rev.studentName}</h3>
                    <p className="text-xs text-sky-300/80">
                      Avaliado em {new Date(rev.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 text-amber-300 font-bold bg-sky-900 px-3 py-1 rounded-xl border border-sky-700">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{rev.rating} ★</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-sky-900/50 p-2 rounded-xl border border-sky-800">
                    <span className="text-[10px] text-sky-300/80">Didática</span>
                    <div className="font-bold text-white">{rev.didactics} / 5</div>
                  </div>
                  <div className="bg-sky-900/50 p-2 rounded-xl border border-sky-800">
                    <span className="text-[10px] text-sky-300/80">Segurança no Mar</span>
                    <div className="font-bold text-white">{rev.safetyAttention} / 5</div>
                  </div>
                  <div className="bg-sky-900/50 p-2 rounded-xl border border-sky-800">
                    <span className="text-[10px] text-sky-300/80">Vibe & Motivação</span>
                    <div className="font-bold text-amber-300">{rev.vibe} / 5</div>
                  </div>
                </div>

                <p className="text-xs text-sky-100 italic bg-sky-900/40 p-3 rounded-xl border border-sky-800/80">
                  "{rev.comment}"
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL: POST-CLASS EVALUATION */}
      {isEvalModalOpen && selectedStudentForEval && selectedSessionForEval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sky-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-sky-950 border border-sky-800 rounded-3xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-sky-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Avaliação Técnica Pós-Aula</h3>
                  <p className="text-xs text-sky-300/80">
                    Aluno: <span className="text-amber-300 font-bold">{selectedStudentForEval.name}</span> • Data:{' '}
                    {selectedSessionForEval.date}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsEvalModalOpen(false)} className="text-sky-300 hover:text-white cursor-pointer font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmitEvaluation} className="space-y-4 text-xs">
              {/* Technical skills (1 to 5) */}
              <div className="space-y-3 bg-sky-900/40 p-4 rounded-2xl border border-sky-800">
                <span className="text-xs font-bold text-white block mb-1">
                  Notas de Desempenho Técnico (1 a 5 estrelas):
                </span>

                {[
                  { label: 'Remada (Paddling & Posicionamento)', val: paddling, setter: setPaddling },
                  { label: 'Drop / Subida Rápida (Pop-up)', val: popupDrop, setter: setPopupDrop },
                  { label: 'Equilíbrio e Postura na Prancha', val: balance, setter: setBalance },
                  { label: 'Leitura de Onda e Timing da Série', val: waveReading, setter: setWaveReading },
                  { label: 'Segurança no Mar e Respeito a Correntes', val: seaSafety, setter: setSeaSafety },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2">
                    <span className="text-sky-200 font-medium">{item.label}</span>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => item.setter(star)}
                          className={`p-1 text-sm transition-colors cursor-pointer ${
                            star <= item.val ? 'text-amber-400' : 'text-sky-800 hover:text-amber-400/50'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                      <span className="font-black text-amber-300 ml-1 w-4">{item.val}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Waves caught and board used */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sky-200 font-semibold mb-1">Ondas Pegas na Aula</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={wavesCaught}
                    onChange={(e) => setWavesCaught(Number(e.target.value))}
                    className="w-full bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-sky-200 font-semibold mb-1">Prancha Utilizada</label>
                  <input
                    type="text"
                    value={boardUsed}
                    onChange={(e) => setBoardUsed(e.target.value)}
                    className="w-full bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sky-200 font-semibold mb-1">Parecer Técnico da Sessão</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  placeholder="Descreva a evolução do aluno na água..."
                ></textarea>
              </div>

              <div>
                <label className="block text-amber-300 font-semibold mb-1 flex items-center space-x-1">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dica de Ouro do Coach para a Próxima Aula</span>
                </label>
                <textarea
                  rows={2}
                  value={coachTips}
                  onChange={(e) => setCoachTips(e.target.value)}
                  className="w-full bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  placeholder="Qual o próximo detalhe biomecânico que ele deve focar?"
                ></textarea>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-sky-800">
                <button
                  type="button"
                  onClick={() => setIsEvalModalOpen(false)}
                  className="px-4 py-2 text-sky-300 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black px-5 py-2 rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
                >
                  Publicar Avaliação do Aluno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
