export type Room = 'skin_treatment' | 'photoelectric' | 'injection'

export type AppointmentStatus =
  | 'waiting'
  | 'in_progress'
  | 'treatment_completed'
  | 'voucher_deducted'
  | 'to_front_desk'
  | 'verified'

export interface Staff {
  id: string
  name: string
  role: 'nurse' | 'therapist' | 'doctor' | 'supervisor'
  room: Room
  avatar: string
  password: string
}

export interface Patient {
  id: string
  name: string
  gender: 'male' | 'female'
  age: number
  cardNo: string
  avatar: string
  allergies: string[]
  contraindications: string[]
  specialNotes: string[]
}

export interface Appointment {
  id: string
  patientId: string
  room: Room
  projectName: string
  bodyPart: string
  estimatedDuration: number
  scheduledTime: string
  status: AppointmentStatus
}

export interface Voucher {
  id: string
  patientId: string
  type: 'course_card' | 'experience_voucher' | 'gift_session'
  name: string
  totalSessions: number
  usedSessions: number
  remainingSessions: number
  expiryDate: string
  applicableProjects: string[]
}

export interface TreatmentRecord {
  id: string
  appointmentId: string
  patientId: string
  actualProject: string
  operator: string
  deviceOrBatch: string
  startTime: string
  endTime: string
  voucherId: string
  voucherType: 'normal' | 'change_item' | 'price_diff' | 'to_front_desk'
  patientSignature: string
  patientConfirmed: boolean
  postOpConfirmed: boolean
  priceDiffAmount?: number
  changeItemNote?: string
  frontDeskNote?: string
  operatorId?: string
  verificationId?: string
}

export interface VerificationRecord {
  id: string
  appointmentId: string
  patientId: string
  voucherId: string
  voucherName: string
  voucherType: 'course_card' | 'experience_voucher' | 'gift_session'
  actualProject: string
  bookedProject: string
  treatmentType: 'normal' | 'change_item' | 'price_diff' | 'to_front_desk'
  sessionsBefore: number
  sessionsAfter: number
  sessionsUsed: number
  operatorId: string
  operatorName: string
  patientConfirmed: boolean
  patientConfirmedAt?: string
  verifiedAt: string
  priceDiffAmount?: number
  changeItemNote?: string
  frontDeskNote?: string
  traceNo: string
}

export interface Exception {
  id: string
  appointmentId: string
  patientId: string
  reporterId: string
  type: 'voucher_insufficient' | 'patient_dispute' | 'no_voucher_in_system' | 'other'
  description: string
  photos: string[]
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  resolvedAt?: string
  resolvedBy?: string
  projectName?: string
  reason?: string
}

export interface PostOpInstruction {
  projectName: string
  items: string[]
}
