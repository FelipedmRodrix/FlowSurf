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
} from '../types';
import {
  INITIAL_SCHOOLS,
  INITIAL_USERS,
  INITIAL_INSTRUCTORS,
  INITIAL_PLANS,
  INITIAL_SCHEDULE_SLOTS,
  INITIAL_SESSIONS,
  INITIAL_BOOKINGS,
  INITIAL_EVALUATIONS,
  INITIAL_REVIEWS,
  INITIAL_FINANCIAL_RECORDS,
  INITIAL_NOTIFICATIONS,
} from './mockData';

const STORAGE_KEYS = {
  SCHOOLS: 'surfflow_schools',
  USERS: 'surfflow_users',
  INSTRUCTORS: 'surfflow_instructors',
  PLANS: 'surfflow_plans',
  SLOTS: 'surfflow_slots',
  SESSIONS: 'surfflow_sessions',
  BOOKINGS: 'surfflow_bookings',
  EVALUATIONS: 'surfflow_evaluations',
  REVIEWS: 'surfflow_reviews',
  FINANCES: 'surfflow_finances',
  NOTIFICATIONS: 'surfflow_notifications',
  CURRENT_USER_ID: 'surfflow_current_user_id',
  CURRENT_SCHOOL_ID: 'surfflow_current_school_id',
};

type Listener = () => void;
const listeners: Set<Listener> = new Set();

function emitChange() {
  listeners.forEach((listener) => listener());
}

export const subscribeToStorage = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item);
  } catch (err) {
    console.error(`Error reading ${key} from localStorage`, err);
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    emitChange();
  } catch (err) {
    console.error(`Error setting ${key} in localStorage`, err);
  }
}

export const storageService = {
  // Initialization
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.SCHOOLS)) {
      setToStorage(STORAGE_KEYS.SCHOOLS, INITIAL_SCHOOLS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      setToStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.INSTRUCTORS)) {
      setToStorage(STORAGE_KEYS.INSTRUCTORS, INITIAL_INSTRUCTORS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PLANS)) {
      setToStorage(STORAGE_KEYS.PLANS, INITIAL_PLANS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SLOTS)) {
      setToStorage(STORAGE_KEYS.SLOTS, INITIAL_SCHEDULE_SLOTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SESSIONS)) {
      setToStorage(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
      setToStorage(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EVALUATIONS)) {
      setToStorage(STORAGE_KEYS.EVALUATIONS, INITIAL_EVALUATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
      setToStorage(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.FINANCES)) {
      setToStorage(STORAGE_KEYS.FINANCES, INITIAL_FINANCIAL_RECORDS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      setToStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID)) {
      // Default as School Owner for immediate high-value management demonstration
      setToStorage(STORAGE_KEYS.CURRENT_USER_ID, 'user_owner_1');
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_SCHOOL_ID)) {
      setToStorage(STORAGE_KEYS.CURRENT_SCHOOL_ID, 'school_1');
    }
  },

  resetDemoData() {
    setToStorage(STORAGE_KEYS.SCHOOLS, INITIAL_SCHOOLS);
    setToStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    setToStorage(STORAGE_KEYS.INSTRUCTORS, INITIAL_INSTRUCTORS);
    setToStorage(STORAGE_KEYS.PLANS, INITIAL_PLANS);
    setToStorage(STORAGE_KEYS.SLOTS, INITIAL_SCHEDULE_SLOTS);
    setToStorage(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS);
    setToStorage(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    setToStorage(STORAGE_KEYS.EVALUATIONS, INITIAL_EVALUATIONS);
    setToStorage(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    setToStorage(STORAGE_KEYS.FINANCES, INITIAL_FINANCIAL_RECORDS);
    setToStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    setToStorage(STORAGE_KEYS.CURRENT_USER_ID, 'user_owner_1');
    setToStorage(STORAGE_KEYS.CURRENT_SCHOOL_ID, 'school_1');
  },

  // Current session
  getCurrentUserId(): string {
    return getFromStorage(STORAGE_KEYS.CURRENT_USER_ID, 'user_owner_1');
  },
  setCurrentUserId(id: string) {
    setToStorage(STORAGE_KEYS.CURRENT_USER_ID, id);
    const user = this.getUserById(id);
    if (user?.schoolId) {
      this.setCurrentSchoolId(user.schoolId);
    }
  },
  getCurrentSchoolId(): string {
    return getFromStorage(STORAGE_KEYS.CURRENT_SCHOOL_ID, 'school_1');
  },
  setCurrentSchoolId(id: string) {
    setToStorage(STORAGE_KEYS.CURRENT_SCHOOL_ID, id);
  },

  // Schools
  getSchools(): SurfSchool[] {
    return getFromStorage(STORAGE_KEYS.SCHOOLS, INITIAL_SCHOOLS);
  },
  getSchoolById(id: string): SurfSchool | undefined {
    return this.getSchools().find((s) => s.id === id);
  },
  createSchool(school: Omit<SurfSchool, 'id' | 'createdAt'>): SurfSchool {
    const schools = this.getSchools();
    const newSchool: SurfSchool = {
      ...school,
      id: `school_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setToStorage(STORAGE_KEYS.SCHOOLS, [newSchool, ...schools]);
    return newSchool;
  },
  updateSchool(id: string, updates: Partial<SurfSchool>) {
    const schools = this.getSchools().map((s) => (s.id === id ? { ...s, ...updates } : s));
    setToStorage(STORAGE_KEYS.SCHOOLS, schools);
  },

  // Users
  getUsers(): User[] {
    return getFromStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
  },
  getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  },
  createUser(user: Omit<User, 'id' | 'joinedDate'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...user,
      id: `user_${Date.now()}`,
      joinedDate: new Date().toISOString().split('T')[0],
    };
    setToStorage(STORAGE_KEYS.USERS, [...users, newUser]);
    return newUser;
  },
  updateUser(id: string, updates: Partial<User>) {
    const users = this.getUsers().map((u) => (u.id === id ? { ...u, ...updates } : u));
    setToStorage(STORAGE_KEYS.USERS, users);
  },

  // Instructors
  getInstructors(schoolId?: string): Instructor[] {
    const list = getFromStorage<Instructor[]>(STORAGE_KEYS.INSTRUCTORS, INITIAL_INSTRUCTORS);
    if (schoolId) return list.filter((i) => i.schoolId === schoolId);
    return list;
  },
  getInstructorById(id: string): Instructor | undefined {
    return this.getInstructors().find((i) => i.id === id);
  },
  createInstructor(data: Omit<Instructor, 'id' | 'rating' | 'reviewCount'>): Instructor {
    const list = this.getInstructors();
    const newInstructor: Instructor = {
      ...data,
      id: `inst_${Date.now()}`,
      rating: 5.0,
      reviewCount: 0,
    };
    setToStorage(STORAGE_KEYS.INSTRUCTORS, [...list, newInstructor]);
    return newInstructor;
  },
  updateInstructor(id: string, updates: Partial<Instructor>) {
    const list = this.getInstructors().map((i) => (i.id === id ? { ...i, ...updates } : i));
    setToStorage(STORAGE_KEYS.INSTRUCTORS, list);
  },

  // Plans
  getPlans(schoolId?: string): MembershipPlan[] {
    const list = getFromStorage<MembershipPlan[]>(STORAGE_KEYS.PLANS, INITIAL_PLANS);
    if (schoolId) return list.filter((p) => p.schoolId === schoolId);
    return list;
  },
  createPlan(plan: Omit<MembershipPlan, 'id'>): MembershipPlan {
    const list = this.getPlans();
    const newPlan: MembershipPlan = {
      ...plan,
      id: `plan_${Date.now()}`,
    };
    setToStorage(STORAGE_KEYS.PLANS, [...list, newPlan]);
    return newPlan;
  },

  // Schedule Slots
  getScheduleSlots(schoolId?: string, instructorId?: string): ScheduleSlot[] {
    let list = getFromStorage<ScheduleSlot[]>(STORAGE_KEYS.SLOTS, INITIAL_SCHEDULE_SLOTS);
    if (schoolId) list = list.filter((s) => s.schoolId === schoolId);
    if (instructorId) list = list.filter((s) => s.instructorId === instructorId);
    return list;
  },
  saveScheduleSlot(slot: Omit<ScheduleSlot, 'id'> & { id?: string }): ScheduleSlot {
    const list = this.getScheduleSlots();
    if (slot.id) {
      const updated = list.map((s) => (s.id === slot.id ? { ...s, ...slot } as ScheduleSlot : s));
      setToStorage(STORAGE_KEYS.SLOTS, updated);
      return slot as ScheduleSlot;
    } else {
      const newSlot: ScheduleSlot = {
        ...slot,
        id: `slot_${Date.now()}`,
      };
      setToStorage(STORAGE_KEYS.SLOTS, [...list, newSlot]);
      return newSlot;
    }
  },
  deleteScheduleSlot(id: string) {
    const list = this.getScheduleSlots().filter((s) => s.id !== id);
    setToStorage(STORAGE_KEYS.SLOTS, list);
  },

  // Sessions
  getSessions(schoolId?: string): ClassSession[] {
    let list = getFromStorage<ClassSession[]>(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS);
    if (schoolId) list = list.filter((s) => s.schoolId === schoolId);
    return list;
  },
  getSessionById(id: string): ClassSession | undefined {
    return this.getSessions().find((s) => s.id === id);
  },
  createSession(data: Omit<ClassSession, 'id' | 'enrolledStudentIds' | 'status'>): ClassSession {
    const list = this.getSessions();
    const newSession: ClassSession = {
      ...data,
      id: `session_${Date.now()}`,
      enrolledStudentIds: [],
      status: 'scheduled',
    };
    setToStorage(STORAGE_KEYS.SESSIONS, [...list, newSession]);
    return newSession;
  },
  updateSession(id: string, updates: Partial<ClassSession>) {
    const list = this.getSessions().map((s) => (s.id === id ? { ...s, ...updates } : s));
    setToStorage(STORAGE_KEYS.SESSIONS, list);
  },

  // Bookings
  getBookings(schoolId?: string): Booking[] {
    let list = getFromStorage<Booking[]>(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    if (schoolId) list = list.filter((b) => b.schoolId === schoolId);
    return list;
  },
  createBooking(
    schoolId: string,
    sessionId: string,
    studentId: string,
    instructorId: string,
    date: string,
    startTime: string,
    endTime: string,
    spot: string
  ): { success: boolean; booking?: Booking; error?: string } {
    const user = this.getUserById(studentId);
    if (!user) return { success: false, error: 'Aluno não encontrado.' };
    
    // Strict requirement: Only active students can schedule
    if (user.status !== 'active') {
      return {
        success: false,
        error: 'Apenas alunos com status ATIVO podem agendar aulas. Regularize sua mensalidade com a coordenação.',
      };
    }

    const session = this.getSessionById(sessionId);
    if (session) {
      if (session.enrolledStudentIds.includes(studentId)) {
        return { success: false, error: 'Você já está inscrito nesta aula!' };
      }
      if (session.enrolledStudentIds.length >= session.maxStudents) {
        return { success: false, error: 'Esta turma já atingiu a lotação máxima de alunos!' };
      }
    }

    const newBooking: Booking = {
      id: `book_${Date.now()}`,
      schoolId,
      sessionId,
      studentId,
      instructorId,
      date,
      startTime,
      endTime,
      spot,
      status: 'confirmed',
      bookedAt: new Date().toISOString(),
    };

    const bookings = this.getBookings();
    setToStorage(STORAGE_KEYS.BOOKINGS, [newBooking, ...bookings]);

    // Update session enrolled students
    if (session) {
      this.updateSession(sessionId, {
        enrolledStudentIds: [...session.enrolledStudentIds, studentId],
      });
    }

    // Dispatch automatic notifications
    const instructor = this.getInstructorById(instructorId);
    this.createNotification({
      recipientId: studentId,
      schoolId,
      title: '🌊 Agendamento Confirmado!',
      message: `Sua aula de surf para ${date} às ${startTime} (${spot}) com ${instructor?.name || 'Instrutor'} está confirmada. Aloha!`,
      type: 'booking_confirmed',
    });

    if (instructor) {
      this.createNotification({
        recipientId: instructor.userId,
        schoolId,
        title: '🏄 Novo Aluno na Turma',
        message: `${user.name} agendou para a aula de ${date} às ${startTime} no pico ${spot}.`,
        type: 'booking_confirmed',
      });
    }

    return { success: true, booking: newBooking };
  },

  cancelBooking(bookingId: string, reason: string): { success: boolean; error?: string } {
    const booking = this.getBookings().find((b) => b.id === bookingId);
    if (!booking) return { success: false, error: 'Agendamento não encontrado.' };

    const updatedBookings = this.getBookings().map((b) =>
      b.id === bookingId
        ? {
            ...b,
            status: 'cancelled' as const,
            cancelledAt: new Date().toISOString(),
            cancelReason: reason,
          }
        : b
    );
    setToStorage(STORAGE_KEYS.BOOKINGS, updatedBookings);

    // Free slot in session
    const session = this.getSessionById(booking.sessionId);
    if (session) {
      this.updateSession(booking.sessionId, {
        enrolledStudentIds: session.enrolledStudentIds.filter((id) => id !== booking.studentId),
      });
    }

    // Dispatch notifications
    const student = this.getUserById(booking.studentId);
    const instructor = this.getInstructorById(booking.instructorId);

    this.createNotification({
      recipientId: booking.studentId,
      schoolId: booking.schoolId,
      title: '❌ Aula Cancelada',
      message: `Sua aula de surf de ${booking.date} às ${booking.startTime} foi cancelada. Motivo: ${reason}`,
      type: 'booking_cancelled',
    });

    if (instructor) {
      this.createNotification({
        recipientId: instructor.userId,
        schoolId: booking.schoolId,
        title: '⚠️ Vaga Liberada na Turma',
        message: `${student?.name || 'Um aluno'} cancelou a presença na aula de ${booking.date} às ${booking.startTime}. Motivo: ${reason}`,
        type: 'booking_cancelled',
      });
    }

    return { success: true };
  },

  updateAttendance(bookingId: string, attendanceStatus: 'present' | 'absent' | 'excused') {
    const bookings = this.getBookings().map((b) =>
      b.id === bookingId ? { ...b, attendanceStatus } : b
    );
    setToStorage(STORAGE_KEYS.BOOKINGS, bookings);
  },

  // Evaluations
  getEvaluations(schoolId?: string, studentId?: string): StudentEvaluation[] {
    let list = getFromStorage<StudentEvaluation[]>(STORAGE_KEYS.EVALUATIONS, INITIAL_EVALUATIONS);
    if (schoolId) list = list.filter((e) => e.schoolId === schoolId);
    if (studentId) list = list.filter((e) => e.studentId === studentId);
    return list;
  },
  createEvaluation(data: Omit<StudentEvaluation, 'id' | 'createdAt'>): StudentEvaluation {
    const list = this.getEvaluations();
    const newEval: StudentEvaluation = {
      ...data,
      id: `eval_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setToStorage(STORAGE_KEYS.EVALUATIONS, [newEval, ...list]);

    // Notify student
    const student = this.getUserById(data.studentId);
    const instructor = this.getInstructorById(data.instructorId);
    if (student) {
      this.createNotification({
        recipientId: student.id,
        schoolId: data.schoolId,
        title: '🏆 Relatório Técnico Pós-Aula Disponível!',
        message: `O instrutor ${instructor?.name || 'da aula'} enviou seu feedback com notas técnicas, evolução de remada e dicas.`,
        type: 'evaluation_posted',
      });
    }

    return newEval;
  },

  // Reviews
  getReviews(instructorId?: string): InstructorReview[] {
    let list = getFromStorage<InstructorReview[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
    if (instructorId) list = list.filter((r) => r.instructorId === instructorId);
    return list;
  },
  createReview(data: Omit<InstructorReview, 'id' | 'createdAt'>): InstructorReview {
    const list = this.getReviews();
    const newReview: InstructorReview = {
      ...data,
      id: `rev_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setToStorage(STORAGE_KEYS.REVIEWS, [newReview, ...list]);

    // Recalculate instructor average rating
    const instructorReviews = [newReview, ...list.filter((r) => r.instructorId === data.instructorId)];
    const avg = instructorReviews.reduce((sum, r) => sum + r.rating, 0) / instructorReviews.length;
    this.updateInstructor(data.instructorId, {
      rating: parseFloat(avg.toFixed(1)),
      reviewCount: instructorReviews.length,
    });

    return newReview;
  },

  // Finances
  getFinancialRecords(schoolId?: string): FinancialRecord[] {
    let list = getFromStorage<FinancialRecord[]>(STORAGE_KEYS.FINANCES, INITIAL_FINANCIAL_RECORDS);
    if (schoolId) list = list.filter((f) => f.schoolId === schoolId);
    return list;
  },
  createFinancialRecord(data: Omit<FinancialRecord, 'id'>): FinancialRecord {
    const list = this.getFinancialRecords();
    const newRecord: FinancialRecord = {
      ...data,
      id: `fin_${Date.now()}`,
    };
    setToStorage(STORAGE_KEYS.FINANCES, [newRecord, ...list]);
    return newRecord;
  },
  updateFinancialRecord(id: string, updates: Partial<FinancialRecord>) {
    const list = this.getFinancialRecords().map((f) => (f.id === id ? { ...f, ...updates } : f));
    setToStorage(STORAGE_KEYS.FINANCES, list);

    // If marked as paid, notify student and check user active status
    if (updates.status === 'paid') {
      const rec = list.find((f) => f.id === id);
      if (rec) {
        this.createNotification({
          recipientId: rec.studentId,
          schoolId: rec.schoolId,
          title: '✅ Mensalidade Confirmada',
          message: `Seu pagamento de R$ ${rec.amount.toFixed(2)} (${rec.referenceMonth}) foi processado com sucesso. Boas ondas!`,
          type: 'payment_received',
        });
        // Reactivate student if inactive
        const student = this.getUserById(rec.studentId);
        if (student && student.status === 'inactive') {
          this.updateUser(rec.studentId, { status: 'active' });
        }
      }
    }
  },

  // Notifications
  getNotifications(userId?: string): AppNotification[] {
    let list = getFromStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    if (userId) list = list.filter((n) => n.recipientId === userId);
    return list;
  },
  createNotification(data: Omit<AppNotification, 'id' | 'read' | 'createdAt'>): AppNotification {
    const list = getFromStorage<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const newNotif: AppNotification = {
      ...data,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setToStorage(STORAGE_KEYS.NOTIFICATIONS, [newNotif, ...list]);
    return newNotif;
  },
  markNotificationRead(id: string) {
    const list = this.getNotifications().map((n) => (n.id === id ? { ...n, read: true } : n));
    setToStorage(STORAGE_KEYS.NOTIFICATIONS, list);
  },
  markAllNotificationsRead(userId: string) {
    const list = this.getNotifications().map((n) =>
      n.recipientId === userId ? { ...n, read: true } : n
    );
    setToStorage(STORAGE_KEYS.NOTIFICATIONS, list);
  },
};
