import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  Calendar,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  FileText,
  Plus,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Send,
  Printer,
  ChevronRight,
  UserCheck,
  UserX,
  CreditCard,
  MapPin,
  Waves,
  Eye,
  Star,
  Sun,
} from 'lucide-react';
import {
  SurfSchool,
  User,
  Instructor,
  ScheduleSlot,
  ClassSession,
  Booking,
  FinancialRecord,
  MembershipPlan,
  StudentEvaluation,
} from '../types';
import { storageService } from '../services/storageService';
import { exportService } from '../services/exportService';

interface SchoolOwnerPanelProps {
  currentSchool: SurfSchool;
  users: User[];
  instructors: Instructor[];
  slots: ScheduleSlot[];
  sessions: ClassSession[];
  bookings: Booking[];
  financialRecords: FinancialRecord[];
  plans: MembershipPlan[];
  evaluations: StudentEvaluation[];
}

export const SchoolOwnerPanel: React.FC<SchoolOwnerPanelProps> = ({
  currentSchool,
  users,
  instructors,
  slots,
  sessions,
  bookings,
  financialRecords,
  plans,
  evaluations,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'instructors' | 'schedules' | 'students' | 'finances' | 'sessions' | 'reports'>('overview');

  // Modals
  const [isInstructorModalOpen, setIsInstructorModalOpen] = useState(false);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);

  // Search & Filters
  const [studentSearch, setStudentSearch] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [financeStatusFilter, setFinanceStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  // Instructor Form
  const [instName, setInstName] = useState('');
  const [instEmail, setInstEmail] = useState('');
  const [instPassword, setInstPassword] = useState('123');
  const [instPhone, setInstPhone] = useState('');
  const [instCref, setInstCref] = useState('');
  const [instBio, setInstBio] = useState('');
  const [instSpecialties, setInstSpecialties] = useState('Iniciantes, Leitura de Onda');
  const [instYearsExp, setInstYearsExp] = useState(5);
  const [instPhoto, setInstPhoto] = useState('');

  // Slot Form
  const [slotInstructorId, setSlotInstructorId] = useState(instructors[0]?.id || '');
  const [slotDayOfWeek, setSlotDayOfWeek] = useState(1);
  const [slotStartTime, setSlotStartTime] = useState('07:00');
  const [slotEndTime, setSlotEndTime] = useState('08:30');
  const [slotMaxStudents, setSlotMaxStudents] = useState(currentSchool.maxStudentsPerClass || 5);
  const [slotLevel, setSlotLevel] = useState<'todos' | 'iniciante' | 'intermediario' | 'avancado'>('todos');
  const [slotSpot, setSlotSpot] = useState(currentSchool.beachSpot || 'Pico Principal');

  // Student Form
  const [studName, setStudName] = useState('');
  const [studEmail, setStudEmail] = useState('');
  const [studPassword, setStudPassword] = useState('123');
  const [studPhone, setStudPhone] = useState('');
  const [studLevel, setStudLevel] = useState<'iniciante' | 'intermediario' | 'avancado'>('iniciante');
  const [studBoard, setStudBoard] = useState('Softboard 8\'0');
  const [studPlanId, setStudPlanId] = useState(plans[0]?.id || '');
  const [studEmergency, setStudEmergency] = useState('');

  // Quick message / feedback alert
  const [actionAlert, setActionAlert] = useState<string | null>(null);

  const showAlert = (msg: string) => {
    setActionAlert(msg);
    setTimeout(() => setActionAlert(null), 5000);
  };

  // Derived datasets for current school
  const schoolStudents = users.filter((u) => u.schoolId === currentSchool.id && u.role === 'student');
  const activeStudentsCount = schoolStudents.filter((s) => s.status === 'active').length;
  const schoolInstructors = instructors.filter((i) => i.schoolId === currentSchool.id);
  const schoolFinances = financialRecords.filter((f) => f.schoolId === currentSchool.id);
  const schoolSessions = sessions.filter((s) => s.schoolId === currentSchool.id);
  const schoolBookings = bookings.filter((b) => b.schoolId === currentSchool.id);

  // Financial calculations
  const totalRevenuePaid = schoolFinances
    .filter((f) => f.status === 'paid')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalPending = schoolFinances
    .filter((f) => f.status === 'pending')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalOverdue = schoolFinances
    .filter((f) => f.status === 'overdue')
    .reduce((sum, f) => sum + f.amount, 0);

  const daysOfWeekNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

  // Handlers
  const handleCreateInstructor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instName || !instEmail) return;

    // 1. Create user account
    const user = storageService.createUser({
      name: instName,
      email: instEmail,
      password: instPassword,
      role: 'instructor',
      schoolId: currentSchool.id,
      phone: instPhone,
      status: 'active',
      avatar: instPhoto || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
    });

    // 2. Create instructor profile
    storageService.createInstructor({
      userId: user.id,
      schoolId: currentSchool.id,
      name: instName,
      email: instEmail,
      phone: instPhone,
      photo: user.avatar || '',
      bio: instBio || 'Instrutor experiente e dedicado.',
      crefOrCert: instCref || 'Certificação ISA Nível 1',
      specialties: instSpecialties.split(',').map((s) => s.trim()),
      colorTag: 'cyan',
      active: true,
      yearsExperience: Number(instYearsExp),
    });

    setIsInstructorModalOpen(false);
    showAlert(`Instrutor ${instName} cadastrado com sucesso!`);
    setInstName('');
    setInstEmail('');
    setInstPhone('');
    setInstCref('');
    setInstBio('');
  };

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotInstructorId) return;

    storageService.saveScheduleSlot({
      schoolId: currentSchool.id,
      instructorId: slotInstructorId,
      dayOfWeek: Number(slotDayOfWeek),
      startTime: slotStartTime,
      endTime: slotEndTime,
      maxStudents: Number(slotMaxStudents),
      level: slotLevel,
      spot: slotSpot,
      active: true,
    });

    setIsSlotModalOpen(false);
    showAlert('Novo horário recorrente adicionado para a grade de aulas!');
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studName || !studEmail) return;

    const newStudent = storageService.createUser({
      name: studName,
      email: studEmail,
      password: studPassword,
      role: 'student',
      schoolId: currentSchool.id,
      phone: studPhone,
      status: 'active',
      skillLevel: studLevel,
      boardType: studBoard,
      planId: studPlanId,
      emergencyContact: studEmergency,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    });

    // Generate first monthly invoice
    const selectedPlan = plans.find((p) => p.id === studPlanId) || plans[0];
    if (selectedPlan) {
      storageService.createFinancialRecord({
        schoolId: currentSchool.id,
        studentId: newStudent.id,
        studentName: newStudent.name,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        amount: selectedPlan.price,
        dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
        status: 'pending',
        referenceMonth: 'Mês Atual',
        notes: 'Primeira mensalidade gerada no ato da matrícula.',
      });
    }

    setIsStudentModalOpen(false);
    showAlert(`Aluno(a) ${studName} cadastrado(a) com sucesso como ATIVO!`);
    setStudName('');
    setStudEmail('');
    setStudPhone('');
  };

  const toggleStudentStatus = (student: User) => {
    const newStatus = student.status === 'active' ? 'inactive' : 'active';
    storageService.updateUser(student.id, { status: newStatus });
    showAlert(
      `Status do aluno ${student.name} alterado para ${newStatus === 'active' ? 'ATIVO (Pode agendar)' : 'INATIVO (Agendamentos suspensos)'}.`
    );
  };

  const markFinanceAsPaid = (recordId: string) => {
    storageService.updateFinancialRecord(recordId, {
      status: 'paid',
      paidDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'pix',
    });
    showAlert('Pagamento confirmado e aluno regularizado automaticamente!');
  };

  const sendPaymentReminderWhatsApp = (rec: FinancialRecord) => {
    const student = users.find((u) => u.id === rec.studentId);
    const msg = `Olá ${rec.studentName}! Aqui é da ${currentSchool.name}. Lembramos sobre a sua mensalidade do plano "${rec.planName}" no valor de R$ ${rec.amount.toFixed(2)} com vencimento em ${rec.dueDate}. Mantenha seu status ativo para agendar suas aulas de surf!`;
    const cleanPhone = (student?.phone || '').replace(/\D/g, '');
    const waUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  // Filtered Students
  const filteredStudents = schoolStudents.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (s.phone && s.phone.includes(studentSearch));
    const matchesStatus = studentStatusFilter === 'all' || s.status === studentStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Finances
  const filteredFinances = schoolFinances.filter((f) => {
    if (financeStatusFilter === 'all') return true;
    return f.status === financeStatusFilter;
  });

  return (
    <div className="space-y-6">
      {/* School Header Banner - Beach & Ocean Atmosphere */}
      <div className="bg-gradient-to-r from-blue-900/90 via-sky-900/80 to-amber-950/40 border border-sky-700/70 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl shadow-sky-950/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-600 via-blue-700 to-amber-400 border border-amber-300/40 flex items-center justify-center text-3xl shadow-xl shadow-sky-900/40 ring-2 ring-amber-400/60">
                {currentSchool.logo}
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 border border-sky-950 flex items-center justify-center">
                <Sun className="w-3.5 h-3.5 text-amber-950" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold uppercase tracking-wider flex items-center space-x-1">
                  <span>Gestão da Escolinha de Surf</span>
                </span>
                <span className="text-xs text-sky-300/80">ID: {currentSchool.slug}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                {currentSchool.name}
              </h1>
              <p className="text-sky-200/90 text-xs sm:text-sm flex items-center space-x-2 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentSchool.beachSpot} • {currentSchool.city}/{currentSchool.state}</span>
                <span>•</span>
                <span className="text-amber-300 font-semibold">Até {currentSchool.maxStudentsPerClass} alunos por turma</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => {
                setActiveTab('reports');
              }}
              className="bg-sky-900/80 hover:bg-sky-800 text-sky-100 text-xs font-semibold px-4 py-2.5 rounded-xl border border-sky-700/80 flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Exportar Dados</span>
            </button>
            <button
              onClick={() => setIsSlotModalOpen(true)}
              className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 text-xs font-black px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Clock className="w-4 h-4 text-slate-950" />
              <span>Novo Horário na Grade</span>
            </button>
          </div>
        </div>

        {/* Global School KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-sky-800/80">
          <div className="bg-sky-950/70 p-4 rounded-2xl border border-sky-800/80">
            <div className="text-[11px] text-sky-300 flex items-center space-x-1 font-semibold">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span>Alunos Ativos</span>
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {activeStudentsCount}
              <span className="text-xs text-sky-400 font-normal ml-1">/ {schoolStudents.length} matriculados</span>
            </div>
          </div>

          <div className="bg-sky-950/70 p-4 rounded-2xl border border-sky-800/80">
            <div className="text-[11px] text-sky-300 flex items-center space-x-1 font-semibold">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Professores</span>
            </div>
            <div className="text-2xl font-black text-emerald-300 mt-1">{schoolInstructors.length}</div>
          </div>

          <div className="bg-sky-950/70 p-4 rounded-2xl border border-sky-800/80">
            <div className="text-[11px] text-amber-300 flex items-center space-x-1 font-semibold">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              <span>Receita do Mês</span>
            </div>
            <div className="text-2xl font-black text-amber-300 mt-1">
              R$ {totalRevenuePaid.toLocaleString('pt-BR')}
            </div>
          </div>

          <div className="bg-sky-950/70 p-4 rounded-2xl border border-sky-800/80">
            <div className="text-[11px] text-rose-300 flex items-center space-x-1 font-semibold">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Em Atraso / Pendente</span>
            </div>
            <div className="text-2xl font-black text-rose-400 mt-1">
              R$ {(totalPending + totalOverdue).toLocaleString('pt-BR')}
            </div>
          </div>
        </div>
      </div>

      {actionAlert && (
        <div className="bg-sky-900/80 border border-amber-400/60 text-amber-200 px-4 py-3 rounded-2xl flex items-center space-x-3 text-xs sm:text-sm animate-fade-in shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <span>{actionAlert}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-sky-800/80 overflow-x-auto text-xs sm:text-sm font-medium space-x-2 sm:space-x-6 pb-px">
        {[
          { id: 'overview', label: 'Visão Geral', icon: TrendingUp },
          { id: 'instructors', label: `Professores (${schoolInstructors.length})`, icon: GraduationCap },
          { id: 'schedules', label: `Horários & Grades (${slots.filter((s) => s.schoolId === currentSchool.id).length})`, icon: Clock },
          { id: 'students', label: `Gestão de Alunos (${schoolStudents.length})`, icon: Users },
          { id: 'finances', label: 'Gestão Financeira & Mensalidades', icon: DollarSign },
          { id: 'sessions', label: `Turmas & Agenda (${schoolSessions.length})`, icon: Calendar },
          { id: 'reports', label: 'Exportações (PDF & Excel)', icon: FileSpreadsheet },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 pt-1 px-2 whitespace-nowrap flex items-center space-x-2 border-b-2 transition-colors cursor-pointer ${
                isActive
                  ? 'border-amber-400 text-amber-300 font-bold'
                  : 'border-transparent text-sky-200/70 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Next upcoming classes in the school */}
          <div className="lg:col-span-2 bg-sky-950/80 border border-sky-800/80 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sky-800/80">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-bold text-white">Próximas Turmas da Escolinha</h3>
              </div>
              <button
                onClick={() => setActiveTab('sessions')}
                className="text-xs text-amber-300 hover:text-amber-200 font-bold cursor-pointer"
              >
                Ver todas as turmas
              </button>
            </div>

            <div className="space-y-3">
              {schoolSessions.slice(0, 5).map((session) => {
                const instructor = schoolInstructors.find((i) => i.id === session.instructorId);
                const enrolledCount = session.enrolledStudentIds.length;
                const isFull = enrolledCount >= session.maxStudents;

                return (
                  <div
                    key={session.id}
                    className="p-4 rounded-2xl bg-sky-900/40 border border-sky-800/80 hover:border-amber-400/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors shadow-md"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2.5 rounded-xl bg-sky-900 border border-amber-400/60 text-center min-w-[54px] shadow-sm">
                        <span className="text-[10px] text-amber-300 block uppercase font-mono font-bold">
                          {new Date(session.date).toLocaleDateString('pt-BR', { weekday: 'short' })}
                        </span>
                        <span className="text-sm font-black text-white">
                          {session.date.split('-')[2]}/{session.date.split('-')[1]}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-white">
                            {session.startTime} - {session.endTime}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-800 text-amber-300 border border-sky-700 font-semibold">
                            {session.spot}
                          </span>
                        </div>
                        <p className="text-xs text-sky-300/80 mt-0.5">
                          Professor: <span className="text-white font-medium">{instructor?.name || 'Instrutor'}</span> • Nível:{' '}
                          <span className="capitalize text-amber-300">{session.level}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 self-end sm:self-center">
                      <div className="text-right">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                            isFull
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                          }`}
                        >
                          {enrolledCount} / {session.maxStudents} Vagas
                        </span>
                        <div className="text-[10px] text-sky-400 mt-1">
                          {isFull ? 'Turma lotada' : `${session.maxStudents - enrolledCount} disponíveis no mar`}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Financial Status & Student Health Widget */}
          <div className="space-y-6">
            <div className="bg-sky-950/80 border border-sky-800/80 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                <span>Saúde Financeira do Mês</span>
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-sky-900/40 border border-sky-800/80">
                  <span className="text-sky-200 flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <span>Mensalidades Pagas</span>
                  </span>
                  <span className="font-black text-emerald-300">R$ {totalRevenuePaid.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-sky-900/40 border border-sky-800/80">
                  <span className="text-sky-200 flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <span>Pendente / A Vencer</span>
                  </span>
                  <span className="font-black text-amber-300">R$ {totalPending.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-sky-900/40 border border-sky-800/80">
                  <span className="text-sky-200 flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                    <span>Em Atraso (Bloqueados)</span>
                  </span>
                  <span className="font-black text-rose-400">R$ {totalOverdue.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('finances')}
                className="w-full py-2.5 bg-sky-900 hover:bg-sky-800 text-xs text-amber-300 hover:text-amber-200 font-bold rounded-xl border border-sky-700 transition-colors cursor-pointer"
              >
                Gerenciar Mensalidades
              </button>
            </div>

            {/* Rule card */}
            <div className="bg-sky-900/30 border border-sky-700/60 rounded-3xl p-5 text-xs space-y-2">
              <div className="flex items-center space-x-2 text-amber-300 font-bold">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Regra de Agendamento Ativo</span>
              </div>
              <p className="text-sky-200/90 leading-relaxed text-[11px]">
                O sistema bloqueia automaticamente novos agendamentos para alunos com status <strong>Inativo</strong> ou inadimplentes. Assim que o pagamento é marcado como pago, o acesso é reativado na hora!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INSTRUCTORS MANAGEMENT */}
      {activeTab === 'instructors' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Professores e Instrutores de Surf</h2>
              <p className="text-xs text-sky-300/80">
                Cadastre os instrutores da escola com certificações e especialidades para que os alunos possam escolhê-los.
              </p>
            </div>
            <button
              onClick={() => setIsInstructorModalOpen(true)}
              className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/25 flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Cadastrar Professor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {schoolInstructors.map((inst) => {
              const instSlots = slots.filter((s) => s.instructorId === inst.id);
              return (
                <div
                  key={inst.id}
                  className="bg-sky-950/80 border border-sky-800/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 hover:border-amber-400/50 transition-colors"
                >
                  <div>
                    <div className="flex items-start space-x-4">
                      <img
                        src={inst.photo}
                        alt={inst.name}
                        className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-400/70 shadow-md"
                      />
                      <div>
                        <h3 className="font-bold text-white text-base">{inst.name}</h3>
                        <p className="text-xs text-amber-300 font-mono mt-0.5">{inst.crefOrCert}</p>
                        <div className="flex items-center space-x-1 text-xs text-amber-400 mt-1">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="font-bold">{inst.rating.toFixed(1)}</span>
                          <span className="text-sky-400 text-[10px]">({inst.reviewCount} avaliações)</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-sky-200/90 mt-4 leading-relaxed line-clamp-3">
                      {inst.bio}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {inst.specialties.map((spec, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-sky-900 text-amber-300 border border-sky-700 font-semibold"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-sky-800/80 flex items-center justify-between text-xs text-sky-300/80">
                      <span>Experiência:</span>
                      <span className="text-white font-semibold">{inst.yearsExperience} anos no mar</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-sky-300/80 mt-1">
                      <span>Horários na grade:</span>
                      <span className="text-amber-300 font-bold">{instSlots.length} horários semanais</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-sky-800/80 flex items-center justify-between text-xs">
                    <span className="text-sky-400">{inst.email}</span>
                    <button
                      onClick={() => {
                        setSlotInstructorId(inst.id);
                        setIsSlotModalOpen(true);
                      }}
                      className="text-amber-300 hover:text-amber-200 font-bold text-xs flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar Horário</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: SCHEDULES & SLOTS */}
      {activeTab === 'schedules' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">Organização de Horários dos Professores</h2>
              <p className="text-xs text-sky-300/80">
                Monte a grade semanal de aulas. O sistema disponibiliza vagas automaticamente para os alunos com base nesses horários.
              </p>
            </div>
            <button
              onClick={() => setIsSlotModalOpen(true)}
              className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/25 flex items-center space-x-1.5 transition-all cursor-pointer self-start sm:self-auto active:scale-95"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Adicionar Horário na Grade</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {daysOfWeekNames.map((dayName, dayIndex) => {
              const daySlots = slots.filter(
                (s) => s.schoolId === currentSchool.id && s.dayOfWeek === dayIndex
              );

              return (
                <div
                  key={dayIndex}
                  className="bg-sky-950/80 border border-sky-800/80 rounded-2xl p-4 shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-sky-800/80 mb-3">
                      <span className="text-sm font-bold text-white flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{dayName}</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-900 text-amber-300 border border-sky-700 font-semibold">
                        {daySlots.length} turmas
                      </span>
                    </div>

                    <div className="space-y-2">
                      {daySlots.length === 0 ? (
                        <p className="text-xs text-sky-400/80 italic py-4 text-center">
                          Nenhum horário cadastrado para este dia.
                        </p>
                      ) : (
                        daySlots.map((slot) => {
                          const instructor = schoolInstructors.find((i) => i.id === slot.instructorId);
                          return (
                            <div
                              key={slot.id}
                              className="p-3 rounded-xl bg-sky-900/40 border border-sky-800/80 text-xs space-y-1.5 hover:border-amber-400/50 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-amber-300">
                                  {slot.startTime} - {slot.endTime}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-800 text-sky-200 font-semibold">
                                  {slot.maxStudents} vagas
                                </span>
                              </div>
                              <div className="text-white font-medium">
                                {instructor?.name || 'Instrutor'}
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-sky-300/80">
                                <span>{slot.spot}</span>
                                <span className="capitalize text-amber-300">{slot.level}</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSlotDayOfWeek(dayIndex);
                      setIsSlotModalOpen(true);
                    }}
                    className="w-full mt-3 py-1.5 rounded-lg bg-sky-900/80 hover:bg-sky-800 text-amber-300 hover:text-amber-200 text-[11px] font-bold border border-sky-700 transition-colors cursor-pointer"
                  >
                    + Adicionar neste dia
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: STUDENTS MANAGEMENT */}
      {activeTab === 'students' && (
        <div className="bg-sky-950/80 border border-sky-800/80 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Gestão de Alunos da Escolinha</h2>
              <p className="text-xs text-sky-300/80">
                Alunos com status <strong className="text-amber-300">ATIVO</strong> podem agendar aulas no mar. Controle o acesso, visualize níveis e planos.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => exportService.exportStudentsToExcel(schoolStudents, currentSchool.name)}
                className="bg-sky-900 hover:bg-sky-850 text-emerald-300 text-xs font-bold px-3.5 py-2 rounded-xl border border-sky-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
                title="Exportar alunos para Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Excel</span>
              </button>
              <button
                onClick={() => exportService.triggerPDFPrint()}
                className="bg-sky-900 hover:bg-sky-850 text-amber-300 text-xs font-bold px-3.5 py-2 rounded-xl border border-sky-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
                title="Imprimir / Exportar lista em PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir PDF</span>
              </button>
              <button
                onClick={() => setIsStudentModalOpen(true)}
                className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 text-xs font-black px-4 py-2 rounded-xl shadow-lg shadow-amber-500/25 flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-slate-950" />
                <span>Novo Aluno</span>
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-sky-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar aluno por nome, email ou tel..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full bg-sky-900 border border-sky-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-sky-400" />
              <select
                value={studentStatusFilter}
                onChange={(e) => setStudentStatusFilter(e.target.value as any)}
                className="bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-xs text-sky-100 focus:outline-none focus:border-amber-400"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Apenas Ativos (Podem agendar)</option>
                <option value="inactive">Inativos / Bloqueados</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-sky-200">
              <thead className="bg-sky-900/60 text-sky-300 font-bold border-b border-sky-800">
                <tr>
                  <th className="py-3 px-4">Aluno</th>
                  <th className="py-3 px-4">Status no Sistema</th>
                  <th className="py-3 px-4">Nível & Prancha</th>
                  <th className="py-3 px-4">Plano</th>
                  <th className="py-3 px-4">Contato / Emergência</th>
                  <th className="py-3 px-4 text-right">Ação / Alterar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-800/60">
                {filteredStudents.map((st) => {
                  const plan = plans.find((p) => p.id === st.planId);
                  const isAct = st.status === 'active';

                  return (
                    <tr key={st.id} className="hover:bg-sky-900/40 transition-colors">
                      <td className="py-3 px-4 flex items-center space-x-3">
                        <img
                          src={st.avatar}
                          alt={st.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-sky-700"
                        />
                        <div>
                          <div className="font-bold text-white">{st.name}</div>
                          <div className="text-[11px] text-sky-300/80">{st.email}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isAct
                              ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {isAct ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                          <span>{isAct ? 'ATIVO (Agendando)' : 'INATIVO (Bloqueado)'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="capitalize font-bold text-white">
                          {st.skillLevel || 'Iniciante'}
                        </div>
                        <div className="text-[10px] text-sky-300/80">{st.boardType || 'Prancha padrão'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-amber-300">{plan ? plan.name : 'Plano Padrão'}</span>
                      </td>
                      <td className="py-3 px-4 text-sky-300/80">
                        <div>{st.phone || 'Sem telefone'}</div>
                        <div className="text-[10px] text-sky-400">{st.emergencyContact}</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => toggleStudentStatus(st)}
                          className={`text-xs px-3 py-1 rounded-xl font-bold transition-colors cursor-pointer ${
                            isAct
                              ? 'bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/80'
                              : 'bg-sky-900 hover:bg-sky-800 text-amber-300 border border-amber-400/50'
                          }`}
                        >
                          {isAct ? 'Bloquear' : 'Ativar Aluno'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: FINANCIAL DASHBOARD */}
      {activeTab === 'finances' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Dashboard de Gestão Financeira de Mensalidades</h2>
              <p className="text-xs text-sky-300/80">
                Acompanhe cobranças, pagamentos recebidos e envie lembretes automáticos com cobrança via WhatsApp.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => exportService.exportFinancesToExcel(schoolFinances, currentSchool.name)}
                className="bg-sky-900 hover:bg-sky-850 text-emerald-300 text-xs font-bold px-3 py-2 rounded-xl border border-sky-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Exportar Excel</span>
              </button>
              <button
                onClick={() => exportService.triggerPDFPrint()}
                className="bg-sky-900 hover:bg-sky-850 text-amber-300 text-xs font-bold px-3 py-2 rounded-xl border border-sky-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Relatório PDF</span>
              </button>
            </div>
          </div>

          {/* Cards metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-sky-950/80 border border-sky-800/80 p-5 rounded-3xl shadow-xl">
              <span className="text-xs text-sky-300 font-semibold">Total Recebido (Mês Atual)</span>
              <div className="text-3xl font-black text-emerald-300 mt-1">
                R$ {totalRevenuePaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-sky-400 mt-2 block font-medium">
                {schoolFinances.filter((f) => f.status === 'paid').length} mensalidades quitadas
              </span>
            </div>

            <div className="bg-sky-950/80 border border-sky-800/80 p-5 rounded-3xl shadow-xl">
              <span className="text-xs text-sky-300 font-semibold">Previsão a Receber (Pendente)</span>
              <div className="text-3xl font-black text-amber-300 mt-1">
                R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-sky-400 mt-2 block font-medium">
                {schoolFinances.filter((f) => f.status === 'pending').length} faturas dentro do prazo
              </span>
            </div>

            <div className="bg-sky-950/80 border border-sky-800/80 p-5 rounded-3xl shadow-xl">
              <span className="text-xs text-rose-300 font-semibold">Inadimplência / Atrasadas</span>
              <div className="text-3xl font-black text-rose-400 mt-1">
                R$ {totalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-rose-300/80 mt-2 block font-medium">
                {schoolFinances.filter((f) => f.status === 'overdue').length} alunos bloqueados por atraso
              </span>
            </div>
          </div>

          {/* Filter & Table */}
          <div className="bg-sky-950/80 border border-sky-800/80 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sky-800/80">
              <h3 className="text-sm font-bold text-white">Extrato de Mensalidades</h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-sky-300">Filtrar:</span>
                <select
                  value={financeStatusFilter}
                  onChange={(e) => setFinanceStatusFilter(e.target.value as any)}
                  className="bg-sky-900 border border-sky-700 rounded-xl px-3 py-1.5 text-xs text-sky-100 focus:outline-none focus:border-amber-400"
                >
                  <option value="all">Todas as Cobranças</option>
                  <option value="paid">Pagas</option>
                  <option value="pending">Pendentes</option>
                  <option value="overdue">Atrasadas</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-sky-200">
                <thead className="bg-sky-900/60 text-sky-300 font-bold border-b border-sky-800">
                  <tr>
                    <th className="py-3 px-4">Aluno</th>
                    <th className="py-3 px-4">Plano</th>
                    <th className="py-3 px-4">Valor</th>
                    <th className="py-3 px-4">Vencimento</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Mês Ref.</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-800/60">
                  {filteredFinances.map((rec) => {
                    return (
                      <tr key={rec.id} className="hover:bg-sky-900/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-white">{rec.studentName}</td>
                        <td className="py-3 px-4 text-amber-300 font-medium">{rec.planName}</td>
                        <td className="py-3 px-4 font-black text-white">
                          R$ {rec.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-sky-300/80">{rec.dueDate}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              rec.status === 'paid'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : rec.status === 'overdue'
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                : 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                            }`}
                          >
                            {rec.status === 'paid'
                              ? 'PAGO'
                              : rec.status === 'overdue'
                              ? 'ATRASADO'
                              : 'PENDENTE'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sky-300/80">{rec.referenceMonth}</td>
                        <td className="py-3 px-4 text-right space-x-2">
                          {rec.status !== 'paid' && (
                            <>
                              <button
                                onClick={() => markFinanceAsPaid(rec.id)}
                                className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black px-2.5 py-1 rounded-lg text-[11px] transition-colors cursor-pointer"
                              >
                                Marcar Pago
                              </button>
                              <button
                                onClick={() => sendPaymentReminderWhatsApp(rec)}
                                className="bg-sky-900 hover:bg-sky-850 text-emerald-300 font-bold px-2 py-1 rounded-lg text-[11px] border border-sky-700 inline-flex items-center space-x-1 transition-colors cursor-pointer"
                                title="Enviar Lembrete no WhatsApp"
                              >
                                <Send className="w-3 h-3" />
                                <span>Cobrar Zap</span>
                              </button>
                            </>
                          )}
                          {rec.status === 'paid' && (
                            <span className="text-[11px] text-emerald-300 font-bold">
                              Pago em {rec.paidDate} ({rec.paymentMethod?.toUpperCase()})
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SESSIONS & ROSTER */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Turmas & Agenda da Escola</h2>
              <p className="text-xs text-sky-300/80">
                Visualize os alunos matriculados em cada aula e acompanhe o histórico de presenças.
              </p>
            </div>
            <button
              onClick={() => exportService.exportClassesToExcel(schoolSessions, currentSchool.name)}
              className="bg-sky-900 hover:bg-sky-850 text-emerald-300 text-xs font-bold px-3 py-2 rounded-xl border border-sky-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar Aulas (Excel)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {schoolSessions.map((session) => {
              const instructor = schoolInstructors.find((i) => i.id === session.instructorId);
              const enrolledStudents = schoolStudents.filter((s) =>
                session.enrolledStudentIds.includes(s.id)
              );

              return (
                <div
                  key={session.id}
                  className="bg-sky-950/80 border border-sky-800/80 rounded-3xl p-6 shadow-xl space-y-4 hover:border-amber-400/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-base">
                          {session.date} • {session.startTime} - {session.endTime}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-900 text-amber-300 border border-sky-700 font-semibold">
                          {session.spot}
                        </span>
                      </div>
                      <p className="text-xs text-sky-300/80 mt-1">
                        Professor: <span className="text-white font-bold">{instructor?.name}</span>
                      </p>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                        session.status === 'completed'
                          ? 'bg-blue-500/20 text-sky-200 border-blue-400/30'
                          : session.status === 'cancelled'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                      }`}
                    >
                      {session.status === 'completed'
                        ? 'Realizada'
                        : session.status === 'cancelled'
                        ? 'Cancelada'
                        : 'Confirmada'}
                    </span>
                  </div>

                  {/* Wave report */}
                  {session.waveConditions && (
                    <div className="bg-sky-900/40 p-3 rounded-2xl border border-sky-800/80 text-[11px] text-sky-200 flex items-center justify-between">
                      <span className="flex items-center space-x-1.5 text-amber-300 font-semibold">
                        <Waves className="w-3.5 h-3.5 text-sky-400" />
                        <span>Ondulação: {session.waveConditions.height}</span>
                      </span>
                      <span className="text-sky-300/80">{session.waveConditions.wind}</span>
                    </div>
                  )}

                  {/* Enrolled Students */}
                  <div>
                    <span className="text-xs font-bold text-sky-300 uppercase tracking-wider block mb-2">
                      Alunos Inscritos ({enrolledStudents.length} / {session.maxStudents}):
                    </span>
                    {enrolledStudents.length === 0 ? (
                      <p className="text-xs text-sky-400/70 italic">Nenhum aluno inscrito ainda.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {enrolledStudents.map((st) => (
                          <div
                            key={st.id}
                            className="flex items-center justify-between p-2 rounded-xl bg-sky-900/30 border border-sky-800/60 text-xs"
                          >
                            <div className="flex items-center space-x-2">
                              <img
                                src={st.avatar}
                                alt={st.name}
                                className="w-6 h-6 rounded-full object-cover ring-1 ring-amber-400/50"
                              />
                              <span className="font-bold text-white">{st.name}</span>
                              <span className="text-[10px] text-sky-300/80 capitalize">({st.skillLevel})</span>
                            </div>
                            <span className="text-[10px] text-amber-300 font-bold">Inscrito no Mar</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 7: REPORTS & EXPORT */}
      {activeTab === 'reports' && (
        <div className="bg-sky-950/80 border border-sky-800/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Central de Exportação de Dados e Relatórios</h2>
            <p className="text-xs sm:text-sm text-sky-300/80 mt-1">
              Gere relatórios completos para contabilidade, controle de presença e desempenho dos alunos em formato Excel (.csv com UTF-8) e PDF formatado para impressão.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {/* Box 1: Alunos */}
            <div className="bg-sky-900/40 border border-sky-800 rounded-2xl p-6 space-y-4 hover:border-amber-400/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-sky-900 text-amber-300 border border-sky-700 flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Relatório de Alunos</h3>
                <p className="text-xs text-sky-300/80 mt-1">
                  Lista com todos os alunos matriculados, status ativo/inativo, contatos e níveis.
                </p>
              </div>
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => exportService.exportStudentsToExcel(schoolStudents, currentSchool.name)}
                  className="w-full py-2 bg-sky-900 hover:bg-sky-850 text-xs font-bold text-emerald-300 rounded-xl border border-sky-700 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Baixar Planilha Excel</span>
                </button>
                <button
                  onClick={() => exportService.triggerPDFPrint()}
                  className="w-full py-2 bg-sky-900 hover:bg-sky-850 text-xs font-bold text-amber-300 rounded-xl border border-sky-700 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir em PDF</span>
                </button>
              </div>
            </div>

            {/* Box 2: Financeiro */}
            <div className="bg-sky-900/40 border border-sky-800 rounded-2xl p-6 space-y-4 hover:border-amber-400/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-sky-900 text-emerald-300 border border-sky-700 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Relatório Financeiro</h3>
                <p className="text-xs text-sky-300/80 mt-1">
                  Extrato detalhado de receitas, mensalidades quitadas e lista de inadimplência.
                </p>
              </div>
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => exportService.exportFinancesToExcel(schoolFinances, currentSchool.name)}
                  className="w-full py-2 bg-sky-900 hover:bg-sky-850 text-xs font-bold text-emerald-300 rounded-xl border border-sky-700 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Baixar Planilha Excel</span>
                </button>
                <button
                  onClick={() => exportService.triggerPDFPrint()}
                  className="w-full py-2 bg-sky-900 hover:bg-sky-850 text-xs font-bold text-amber-300 rounded-xl border border-sky-700 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir em PDF</span>
                </button>
              </div>
            </div>

            {/* Box 3: Presenças & Aulas */}
            <div className="bg-sky-900/40 border border-sky-800 rounded-2xl p-6 space-y-4 hover:border-amber-400/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-sky-900 text-sky-300 border border-sky-700 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Aulas & Frequência</h3>
                <p className="text-xs text-sky-300/80 mt-1">
                  Histórico de todas as turmas realizadas, picos de treino e taxa de ocupação.
                </p>
              </div>
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => exportService.exportClassesToExcel(schoolSessions, currentSchool.name)}
                  className="w-full py-2 bg-sky-900 hover:bg-sky-850 text-xs font-bold text-emerald-300 rounded-xl border border-sky-700 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Baixar Planilha Excel</span>
                </button>
                <button
                  onClick={() => exportService.triggerPDFPrint()}
                  className="w-full py-2 bg-sky-900 hover:bg-sky-850 text-xs font-bold text-amber-300 rounded-xl border border-sky-700 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir em PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CADASTRAR PROFESSOR */}
      {isInstructorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sky-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-sky-950 border border-sky-800 rounded-3xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sky-800">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-amber-400" />
                <span>Cadastrar Novo Professor de Surf</span>
              </h3>
              <button onClick={() => setIsInstructorModalOpen(false)} className="text-sky-300 hover:text-white cursor-pointer font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateInstructor} className="space-y-4 text-xs">
              <div>
                <label className="block text-sky-200 font-semibold mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Teco Padaratz"
                  value={instName}
                  onChange={(e) => setInstName(e.target.value)}
                  className="w-full bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sky-200 font-semibold mb-1">Email de Acesso *</label>
                  <input
                    type="email"
                    required
                    placeholder="teco@surf.com"
                    value={instEmail}
                    onChange={(e) => setInstEmail(e.target.value)}
                    className="w-full bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-sky-200 font-semibold mb-1">Senha de Acesso</label>
                  <input
                    type="text"
                    value={instPassword}
                    onChange={(e) => setInstPassword(e.target.value)}
                    className="w-full bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sky-200 font-semibold mb-1">CREF / Certificação</label>
                  <input
                    type="text"
                    placeholder="CREF 123456-G/SP | ISA"
                    value={instCref}
                    onChange={(e) => setInstCref(e.target.value)}
                    className="w-full bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-sky-200 font-semibold mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(12) 99888-0000"
                    value={instPhone}
                    onChange={(e) => setInstPhone(e.target.value)}
                    className="w-full bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sky-200 font-semibold mb-1">Especialidades (separadas por vírgula)</label>
                <input
                  type="text"
                  placeholder="Iniciantes, Drop rápido, Leitura de Mar"
                  value={instSpecialties}
                  onChange={(e) => setInstSpecialties(e.target.value)}
                  className="w-full bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-sky-200 font-semibold mb-1">Mini Biografia / Filosofia de Ensino</label>
                <textarea
                  rows={2}
                  placeholder="Foco em segurança, técnica biomecânica e diversão."
                  value={instBio}
                  onChange={(e) => setInstBio(e.target.value)}
                  className="w-full bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                ></textarea>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-sky-800">
                <button
                  type="button"
                  onClick={() => setIsInstructorModalOpen(false)}
                  className="px-4 py-2 text-sky-300 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black px-4 py-2 rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
                >
                  Salvar Professor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADICIONAR HORÁRIO / GRADE */}
      {isSlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sky-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-sky-950 border border-sky-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sky-800">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Adicionar Horário na Grade</span>
              </h3>
              <button onClick={() => setIsSlotModalOpen(false)} className="text-sky-300 hover:text-white cursor-pointer font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateSlot} className="space-y-4 text-xs">
              <div>
                <label className="block text-sky-200 font-semibold mb-1">Professor Responsável *</label>
                <select
                  value={slotInstructorId}
                  onChange={(e) => setSlotInstructorId(e.target.value)}
                  className="w-full bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                >
                  {schoolInstructors.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sky-200 font-semibold mb-1">Dia da Semana *</label>
                <select
                  value={slotDayOfWeek}
                  onChange={(e) => setSlotDayOfWeek(Number(e.target.value))}
                  className="w-full bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                >
                  {daysOfWeekNames.map((d, index) => (
                    <option key={index} value={index}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sky-200 font-semibold mb-1">Horário Início *</label>
                  <input
                    type="time"
                    value={slotStartTime}
                    onChange={(e) => setSlotStartTime(e.target.value)}
                    className="w-full bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-sky-200 font-semibold mb-1">Horário Término *</label>
                  <input
                    type="time"
                    value={slotEndTime}
                    onChange={(e) => setSlotEndTime(e.target.value)}
                    className="w-full bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sky-200 font-semibold mb-1">Capacidade (Vagas)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={slotMaxStudents}
                    onChange={(e) => setSlotMaxStudents(Number(e.target.value))}
                    className="w-full bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-sky-200 font-semibold mb-1">Nível da Turma</label>
                  <select
                    value={slotLevel}
                    onChange={(e) => setSlotLevel(e.target.value as any)}
                    className="w-full bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="todos">Todos os Níveis</option>
                    <option value="iniciante">Iniciante</option>
                    <option value="intermediario">Intermediário</option>
                    <option value="avancado">Avançado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sky-200 font-semibold mb-1">Pico / Ponto na Praia</label>
                <input
                  type="text"
                  value={slotSpot}
                  onChange={(e) => setSlotSpot(e.target.value)}
                  className="w-full bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-sky-800">
                <button
                  type="button"
                  onClick={() => setIsSlotModalOpen(false)}
                  className="px-4 py-2 text-sky-300 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black px-4 py-2 rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
                >
                  Salvar na Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CADASTRAR ALUNO */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sky-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-sky-950 border border-sky-800 rounded-3xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sky-800">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>Matricular Novo Aluno</span>
              </h3>
              <button onClick={() => setIsStudentModalOpen(false)} className="text-sky-300 hover:text-white cursor-pointer font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
              <div>
                <label className="block text-sky-200 font-semibold mb-1">Nome do Aluno *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Amanda Silva"
                  value={studName}
                  onChange={(e) => setStudName(e.target.value)}
                  className="w-full bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sky-200 font-semibold mb-1">Email de Acesso *</label>
                  <input
                    type="email"
                    required
                    placeholder="amanda@email.com"
                    value={studEmail}
                    onChange={(e) => setStudEmail(e.target.value)}
                    className="w-full bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-sky-200 font-semibold mb-1">WhatsApp / Telefone</label>
                  <input
                    type="text"
                    placeholder="(11) 98765-4321"
                    value={studPhone}
                    onChange={(e) => setStudPhone(e.target.value)}
                    className="w-full bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sky-200 font-semibold mb-1">Nível de Surf</label>
                  <select
                    value={studLevel}
                    onChange={(e) => setStudLevel(e.target.value as any)}
                    className="w-full bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="iniciante">Iniciante</option>
                    <option value="intermediario">Intermediário</option>
                    <option value="avancado">Avançado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sky-200 font-semibold mb-1">Plano Escolhido</label>
                  <select
                    value={studPlanId}
                    onChange={(e) => setStudPlanId(e.target.value)}
                    className="w-full bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} - R$ {p.price}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sky-200 font-semibold mb-1">Prancha Utilizada</label>
                  <input
                    type="text"
                    value={studBoard}
                    onChange={(e) => setStudBoard(e.target.value)}
                    className="w-full bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-sky-200 font-semibold mb-1">Contato de Emergência</label>
                  <input
                    type="text"
                    placeholder="Mãe (11) 99999-0000"
                    value={studEmergency}
                    onChange={(e) => setStudEmergency(e.target.value)}
                    className="w-full bg-sky-900 border border-sky-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-sky-800">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-4 py-2 text-sky-300 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black px-4 py-2 rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
                >
                  Cadastrar Aluno Ativo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
