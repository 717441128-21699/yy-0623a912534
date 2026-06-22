import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, Clock, ChevronRight, Filter } from 'lucide-react'
import useStore from '@/store/useStore'
import { cn } from '@/lib/utils'
import type { Room, AppointmentStatus } from '@/types'

const ROOMS: { key: Room; label: string }[] = [
  { key: 'skin_treatment', label: '皮肤科治疗室' },
  { key: 'photoelectric', label: '光电室' },
  { key: 'injection', label: '注射室' },
]

const STATUS_FILTERS: { key: AppointmentStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'waiting', label: '待治疗' },
  { key: 'in_progress', label: '治疗中' },
  { key: 'treatment_completed', label: '治疗完成' },
  { key: 'voucher_deducted', label: '已扣卡券' },
  { key: 'to_front_desk', label: '转前台' },
  { key: 'verified', label: '已核销' },
]

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  waiting: '待治疗',
  in_progress: '治疗中',
  treatment_completed: '治疗完成',
  voucher_deducted: '已扣卡券',
  to_front_desk: '转前台',
  verified: '已核销',
}

const STATUS_CLASSES: Record<AppointmentStatus, string> = {
  waiting: 'bg-amber-500/10 text-amber-600',
  in_progress: 'bg-primary-500/10 text-primary-500',
  treatment_completed: 'bg-blue-500/10 text-blue-600',
  voucher_deducted: 'bg-purple-500/10 text-purple-600',
  to_front_desk: 'bg-orange-500/10 text-orange-600',
  verified: 'bg-green-500/10 text-green-600',
}

const GENDER_LABELS = { male: '男', female: '女' }

export default function Schedule() {
  const navigate = useNavigate()
  const currentRoom = useStore((s) => s.currentRoom)
  const getAppointmentsByRoom = useStore((s) => s.getAppointmentsByRoom)
  const getPatientById = useStore((s) => s.getPatientById)
  const setSelectedAppointmentId = useStore((s) => s.setSelectedAppointmentId)

  const [activeRoom, setActiveRoom] = useState<Room>(currentRoom ?? 'skin_treatment')
  const [activeStatus, setActiveStatus] = useState<AppointmentStatus | 'all'>('all')
  const [toast, setToast] = useState<string | null>(null)

  const appointments = getAppointmentsByRoom(activeRoom)

  const filtered = activeStatus === 'all'
    ? appointments
    : appointments.filter((a) => a.status === activeStatus)

  const statusCounts = STATUS_FILTERS.map((f) => ({
    ...f,
    count: f.key === 'all'
      ? appointments.length
      : appointments.filter((a) => a.status === f.key).length,
  }))

  const today = format(new Date(), 'yyyy年M月d日', { locale: zhCN })

  const handleCardClick = (patientId: string, appointmentId: string, status: AppointmentStatus) => {
    if (status === 'verified') {
      setToast('该预约已完成全部流程')
      setTimeout(() => setToast(null), 2000)
      return
    }
    setSelectedAppointmentId(appointmentId)

    if (status === 'waiting' || status === 'in_progress') {
      navigate(`/patient/${patientId}/confirm?appointment=${appointmentId}`)
    } else if (status === 'treatment_completed') {
      navigate(`/patient/${patientId}/voucher?appointment=${appointmentId}`)
    } else if (status === 'voucher_deducted') {
      navigate(`/patient/${patientId}/post-op?appointment=${appointmentId}`)
    } else if (status === 'to_front_desk') {
      navigate(`/patient/${patientId}/voucher?appointment=${appointmentId}`)
    } else {
      navigate(`/patient/${patientId}/confirm?appointment=${appointmentId}`)
    }
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-6 h-6 text-primary-500" />
          <h1 className="text-2xl font-bold text-gray-800">今日排台</h1>
          <span className="text-gray-500 text-sm ml-2">{today}</span>
        </div>
        <div className="flex gap-2">
          {ROOMS.map((room) => (
            <button
              key={room.key}
              onClick={() => setActiveRoom(room.key)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                activeRoom === room.key
                  ? 'bg-primary-500 text-white'
                  : 'bg-warm-100 text-gray-600 hover:bg-warm-200'
              )}
            >
              {room.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-gray-400" />
        {statusCounts.map((sf) => (
          <button
            key={sf.key}
            onClick={() => setActiveStatus(sf.key)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5',
              activeStatus === sf.key
                ? 'bg-primary-500 text-white'
                : 'bg-warm-100 text-gray-600 hover:bg-warm-200'
            )}
          >
            {sf.label}
            <span
              className={cn(
                'text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                activeStatus === sf.key
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 text-gray-500'
              )}
            >
              {sf.count}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((appointment, index) => {
          const patient = getPatientById(appointment.patientId)
          if (!patient) return null

          return (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              onClick={() => handleCardClick(patient.id, appointment.id, appointment.status)}
              className="card cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm',
                      patient.gender === 'female' ? 'bg-pink-400' : 'bg-blue-400'
                    )}
                  >
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800">{patient.name}</span>
                      <span className="text-xs text-gray-400">{GENDER_LABELS[patient.gender]}</span>
                      <span className="text-xs text-gray-400">{patient.age}岁</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-3 space-y-1">
                <div className="font-bold text-gray-800">{appointment.projectName}</div>
                <div className="text-sm text-gray-500">{appointment.bodyPart}</div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {appointment.scheduledTime}
                  </span>
                  <span>约{appointment.estimatedDuration}分钟</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'text-xs font-medium px-2.5 py-1 rounded-full',
                    STATUS_CLASSES[appointment.status]
                  )}
                >
                  {STATUS_LABELS[appointment.status]}
                </span>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </div>
            </motion.div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          暂无符合条件的排台信息
        </div>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 bg-gray-800 text-white text-sm rounded-full shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
