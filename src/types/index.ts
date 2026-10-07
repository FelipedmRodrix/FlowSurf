export type UserRole = 'super_admin' | 'school_owner' | 'instructor' | 'student';

export type StudentStatus = 'active' | 'inactive' | 'pending';

export type SkillLevel = 'iniciante' | 'intermediario' | 'avancado' | 'todos';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  schoolId?: string;
  avatar?: string;
  phone?: string;
  status: StudentStatus;
  planId?: string;
  emergencyContact?: string;
  skillLevel?: 'iniciante' | 'intermediario' | 'avancado';
  boardType?: string;
  joinedDate: string;
}

export interface SurfSchool {
  id: string;
  name: string;
  slug: string;
  logo: string;
  coverImage?: string;
  beachSpot: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  description: string;
  active: boolean;
  maxStudentsPerClass: number;
  createdAt: string;
}

export interface Instructor {
  id: string;
  userId: string;
  schoolId: string;
  name: string;
  email: string;
  phone: string;
  photo: string;
  bio: string;
  crefOrCert: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  colorTag: string;
  active: boolean;
  yearsExperience: number;
}

export interface ScheduleSlot {
  id: string;
  schoolId: string;
  instructorId: string;
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  startTime: string; // '07:00'
  endTime: string;   // '08:30'
  maxStudents: number;
  level: SkillLevel;
  spot: string;
  active: boolean;
}

export interface WaveConditions {
  height: string; // '1.0m - 1.5m'
  swell: string;  // 'Sul / Sudeste'
  wind: string;   // 'Terral Fraco (5 nós)'
  tide: string;   // 'Enchendo (Pico 11:30)'
  waterTemp: string; // '22°C'
}

export interface ClassSession {
  id: string;
  schoolId: string;
  instructorId: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  spot: string;
  level: SkillLevel;
  maxStudents: number;
  enrolledStudentIds: string[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  cancelReason?: string;
  waveConditions?: WaveConditions;
}

export interface Booking {
  id: string;
  schoolId: string;
  sessionId: string;
  studentId: string;
  instructorId: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  spot: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  bookedAt: string;
  cancelledAt?: string;
  cancelReason?: string;
  attendanceStatus?: 'present' | 'absent' | 'excused';
}

export interface TechnicalSkills {
  paddling: number;    // Remada (1-5)
  popupDrop: number;   // Drop / Subida rápida (1-5)
  balance: number;     // Postura e Equilíbrio (1-5)
  waveReading: number; // Leitura de Onda & Timing (1-5)
  seaSafety: number;   // Segurança no Mar e Correntes (1-5)
}

export interface StudentEvaluation {
  id: string;
  sessionId: string;
  schoolId: string;
  instructorId: string;
  studentId: string;
  date: string;
  skills: TechnicalSkills;
  overallRating: number; // 1-5
  wavesCaught: number;
  boardUsed: string;
  notes: string;
  coachTips: string;
  createdAt: string;
}

export interface InstructorReview {
  id: string;
  sessionId: string;
  schoolId: string;
  instructorId: string;
  studentId: string;
  studentName: string;
  rating: number; // 1-5
  didactics: number;
  safetyAttention: number;
  vibe: number;
  comment: string;
  createdAt: string;
}

export interface MembershipPlan {
  id: string;
  schoolId: string;
  name: string;
  description: string;
  price: number;
  classesPerWeek: number | 'ilimitado';
  billingPeriod: 'mensal' | 'trimestral' | 'semestral' | 'avulso';
}

export interface FinancialRecord {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  planId: string;
  planName: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'paid' | 'pending' | 'overdue';
  paymentMethod?: 'pix' | 'cartao' | 'dinheiro' | 'boleto';
  referenceMonth: string; // 'Outubro/2026'
  notes?: string;
}

export interface AppNotification {
  id: string;
  recipientId: string; // User ID or 'all_school_owners' etc.
  schoolId?: string;
  title: string;
  message: string;
  type: 'booking_confirmed' | 'booking_cancelled' | 'class_reminder' | 'payment_reminder' | 'payment_received' | 'evaluation_posted' | 'system';
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}
