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
} from '@/types'
import { patientList, appointmentList, voucherList, staffList } from '@/data/mock'

const useStore = create<{
  currentStaff: Staff | null
  currentRoom: Room | null
  appointments: Appointment[]
  patients: Patient[]
  vouchers: Voucher[]
  treatmentRecords: TreatmentRecord[]
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
  getPatientById: (id: string) => Patient | undefined
  getVouchersByPatientId: (patientId: string) => Voucher[]
  getAppointmentsByRoom: (room: string) => Appointment[]
  getAppointmentById: (id: string) => Appointment | undefined
}>((set, get) => ({
  currentStaff: null,
  currentRoom: null,
  appointments: appointmentList,
  patients: patientList,
  vouchers: voucherList,
  treatmentRecords: [],
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
              remainingSessions: v.remainingSessions - 1,
              usedSessions: v.usedSessions + 1,
            }
          : v
      ),
    }))
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
}))

export default useStore
