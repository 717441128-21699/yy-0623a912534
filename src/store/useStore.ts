import { create } from 'zustand'
import type {
  Staff,
  Room,
  Appointment,
  AppointmentStatus,
  Patient,
  Voucher,
  TreatmentRecord,
  Exception,
  VerificationRecord,
  SupervisorReviewResult,
  FrontDeskResultType,
  TimelineItem,
} from '@/types'
import { patientList, appointmentList, voucherList, staffList } from '@/data/mock'

interface StoreState {
  currentStaff: Staff | null
  currentRoom: Room | null
  appointments: Appointment[]
  patients: Patient[]
  vouchers: Voucher[]
  treatmentRecords: TreatmentRecord[]
  verificationRecords: VerificationRecord[]
  exceptions: Exception[]
  selectedAppointmentId: string | null

  login: (staffId: string, password: string, room?: Room) => boolean
  logout: () => void
  setSelectedAppointmentId: (id: string | null) => void
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void
  addTreatmentRecord: (record: TreatmentRecord) => void
  updateTreatmentRecord: (id: string, updates: Partial<TreatmentRecord>) => void
  addException: (exception: Exception) => void
  updateException: (id: string, updates: Partial<Exception>) => void
  useVoucher: (voucherId: string) => void
  addVerificationRecord: (record: VerificationRecord) => void
  updateVerificationRecord: (id: string, updates: Partial<VerificationRecord>) => void
  getVerificationByAppointmentId: (appointmentId: string) => VerificationRecord | undefined
  getVerificationById: (id: string) => VerificationRecord | undefined
  getTreatmentRecordByAppointmentId: (appointmentId: string) => TreatmentRecord | undefined
  getPatientById: (id: string) => Patient | undefined
  getVouchersByPatientId: (patientId: string) => Voucher[]
  getAppointmentsByRoom: (room: string) => Appointment[]
  getAppointmentById: (id: string) => Appointment | undefined
  getVoucherById: (id: string) => Voucher | undefined
  reviewVerification: (verificationId: string, result: SupervisorReviewResult, note?: string) => void
  processFrontDeskResult: (verificationId: string, resultType: FrontDeskResultType, note?: string) => void
  getTimelineByAppointmentId: (appointmentId: string) => TimelineItem[]
}

const useStore = create<StoreState>()((set, get) => ({
  currentStaff: null,
  currentRoom: null,
  appointments: appointmentList,
  patients: patientList,
  vouchers: voucherList,
  treatmentRecords: [],
  verificationRecords: [],
  exceptions: [],
  selectedAppointmentId: null,

  login(staffId, password, room) {
    const found = staffList.find(
      (s) => s.id === staffId && s.password === password
    )
    if (!found) return false
    set({ currentStaff: found, currentRoom: room ?? found.room })
    return true
  },

  logout() {
    set({ currentStaff: null, currentRoom: null })
  },

  setSelectedAppointmentId(id) {
    set({ selectedAppointmentId: id })
  },

  updateAppointmentStatus(id, status) {
    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === id ? { ...a, status } : a
      ),
    }))
  },

  addTreatmentRecord(record) {
    set((state) => ({
      treatmentRecords: [...state.treatmentRecords, record],
    }))
  },

  updateTreatmentRecord(id, updates) {
    set((state) => ({
      treatmentRecords: state.treatmentRecords.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    }))
  },

  addException(exception) {
    set((state) => ({
      exceptions: [...state.exceptions, exception],
    }))
  },

  updateException(id, updates) {
    set((state) => ({
      exceptions: state.exceptions.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    }))
  },

  useVoucher(voucherId) {
    set((state) => ({
      vouchers: state.vouchers.map((v) =>
        v.id === voucherId
          ? {
              ...v,
              remainingSessions: Math.max(0, v.remainingSessions - 1),
              usedSessions: v.usedSessions + 1,
            }
          : v
      ),
    }))
  },

  addVerificationRecord(record) {
    set((state) => ({
      verificationRecords: [...state.verificationRecords, record],
    }))
  },

  updateVerificationRecord(id, updates) {
    set((state) => ({
      verificationRecords: state.verificationRecords.map((v) =>
        v.id === id ? { ...v, ...updates } : v
      ),
    }))
  },

  getVerificationByAppointmentId(appointmentId) {
    return get().verificationRecords.find(
      (v) => v.appointmentId === appointmentId
    )
  },

  getVerificationById(id) {
    return get().verificationRecords.find((v) => v.id === id)
  },

  getTreatmentRecordByAppointmentId(appointmentId) {
    return get().treatmentRecords.find(
      (t) => t.appointmentId === appointmentId
    )
  },

  getPatientById(id) {
    return get().patients.find((p) => p.id === id)
  },

  getVouchersByPatientId(patientId) {
    return get().vouchers.filter((v) => v.patientId === patientId)
  },

  getAppointmentsByRoom(room) {
    return get().appointments.filter((a) => a.room === room)
  },

  getAppointmentById(id) {
    return get().appointments.find((a) => a.id === id)
  },

  getVoucherById(id) {
    return get().vouchers.find((v) => v.id === id)
  },

  reviewVerification(verificationId, result, note) {
    const state = get()
    const verification = state.verificationRecords.find(
      (v) => v.id === verificationId
    )
    if (!verification) return

    const now = new Date().toISOString()
    const supervisor = state.currentStaff

    set((s) => ({
      verificationRecords: s.verificationRecords.map((v) =>
        v.id === verificationId
          ? {
              ...v,
              supervisorReviewed: true,
              supervisorReviewedAt: now,
              supervisorId: supervisor?.id,
              supervisorName: supervisor?.name,
              supervisorReviewResult: result,
              supervisorReviewNote: note,
            }
          : v
      ),
    }))

    if (result === 'approved') {
      state.updateAppointmentStatus(verification.appointmentId, 'verified')
      const treatment = state.getTreatmentRecordByAppointmentId(
        verification.appointmentId
      )
      if (treatment) {
        state.updateTreatmentRecord(treatment.id, { postOpConfirmed: true })
      }
    } else if (result === 'returned') {
      state.updateAppointmentStatus(
        verification.appointmentId,
        'voucher_deducted'
      )
    } else if (result === 'to_front_desk') {
      state.updateAppointmentStatus(verification.appointmentId, 'to_front_desk')
    }
  },

  processFrontDeskResult(verificationId, resultType, note) {
    const state = get()
    const verification = state.verificationRecords.find(
      (v) => v.id === verificationId
    )
    if (!verification) return

    const now = new Date().toISOString()
    const staff = state.currentStaff

    set((s) => ({
      verificationRecords: s.verificationRecords.map((v) =>
        v.id === verificationId
          ? {
              ...v,
              frontDeskProcessed: true,
              frontDeskProcessedAt: now,
              frontDeskProcessedBy: staff?.id,
              frontDeskProcessedByName: staff?.name,
              frontDeskResultType: resultType,
              frontDeskResultNote: note,
            }
          : v
      ),
    }))

    if (resultType === 'supplement_deduct') {
      state.useVoucher(verification.voucherId)
      set((s) => ({
        verificationRecords: s.verificationRecords.map((v) =>
          v.id === verificationId
            ? {
                ...v,
                sessionsAfter: v.sessionsAfter - 1,
                sessionsUsed: v.sessionsUsed + 1,
              }
            : v
        ),
      }))
      state.updateAppointmentStatus(
        verification.appointmentId,
        'voucher_deducted'
      )
    } else if (resultType === 'price_diff') {
      state.updateAppointmentStatus(
        verification.appointmentId,
        'voucher_deducted'
      )
    } else if (resultType === 'change_item') {
      state.updateAppointmentStatus(
        verification.appointmentId,
        'voucher_deducted'
      )
    } else if (resultType === 'void') {
      state.updateAppointmentStatus(verification.appointmentId, 'verified')
    }
  },

  getTimelineByAppointmentId(appointmentId) {
    const state = get()
    const treatment = state.getTreatmentRecordByAppointmentId(appointmentId)
    const verification = state.getVerificationByAppointmentId(appointmentId)
    const appointment = state.getAppointmentById(appointmentId)

    const items: TimelineItem[] = []

    items.push({
      key: 'treatment_start',
      label: '治疗开始',
      time: treatment?.startTime,
      status: treatment?.startTime ? 'done' : 'pending',
    })

    items.push({
      key: 'treatment_end',
      label: '治疗完成',
      time: treatment?.endTime,
      status: treatment?.endTime ? 'done' : 'pending',
    })

    items.push({
      key: 'consumables',
      label: '耗材校验',
      time: treatment?.endTime,
      status: treatment?.endTime ? 'done' : 'pending',
    })

    items.push({
      key: 'voucher',
      label: '卡券扣减',
      time: verification?.verifiedAt,
      status: verification?.verifiedAt ? 'done' : 'pending',
    })

    items.push({
      key: 'patient_confirm',
      label: '顾客确认',
      time: verification?.patientConfirmedAt,
      status: verification?.patientConfirmed ? 'done' : 'pending',
    })

    items.push({
      key: 'post_op',
      label: '术后交代',
      time: verification?.postOpCompletedAt,
      status: verification?.postOpCompletedAt ? 'done' : 'pending',
    })

    items.push({
      key: 'supervisor',
      label: '主管复核',
      time: verification?.supervisorReviewedAt,
      status: verification?.supervisorReviewed ? 'done' : 'pending',
    })

    const doneCount = items.filter((i) => i.status === 'done').length
    if (
      doneCount > 0 &&
      doneCount < items.length &&
      appointment?.status !== 'verified'
    ) {
      items[doneCount].status = 'current'
    }

    return items
  },
}))

export default useStore
