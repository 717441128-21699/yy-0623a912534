import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Stethoscope,
  UserCheck,
  Cpu,
  ScanLine,
  Check,
  AlertTriangle,
  Clock,
} from 'lucide-react'
import useStore from '@/store/useStore'
import { staffList } from '@/data/mock'
import { cn } from '@/lib/utils'

const PROJECT_LIST = [
  '光子嫩肤',
  '皮秒激光',
  '热玛吉',
  '水光针',
  '玻尿酸填充',
  '点阵激光',
  '射频紧肤',
  '果酸焕肤',
]

const DEVICE_OPTIONS = [
  '皮秒激光仪-A01',
  '光子嫩肤仪-B02',
  '热玛吉仪-C03',
  '射频仪-D04',
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4 },
  }),
}

export default function ConsumableCheck() {
  const { id: patientId } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const appointmentId = searchParams.get('appointment') ?? ''
  const navigate = useNavigate()

  const getPatientById = useStore((s) => s.getPatientById)
  const getAppointmentById = useStore((s) => s.getAppointmentById)
  const updateAppointmentStatus = useStore((s) => s.updateAppointmentStatus)
  const addTreatmentRecord = useStore((s) => s.addTreatmentRecord)
  const updateTreatmentRecord = useStore((s) => s.updateTreatmentRecord)
  const getTreatmentRecordByAppointmentId = useStore((s) => s.getTreatmentRecordByAppointmentId)
  const currentStaff = useStore((s) => s.currentStaff)

  const patient = patientId ? getPatientById(patientId) : undefined
  const appointment = appointmentId ? getAppointmentById(appointmentId) : undefined

  const existingRecord = appointmentId
    ? getTreatmentRecordByAppointmentId(appointmentId)
    : undefined

  const [selectedProjects, setSelectedProjects] = useState<string[]>(
    appointment ? [appointment.projectName] : []
  )
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>(
    currentStaff?.id ?? ''
  )
  const [selectedDevice, setSelectedDevice] = useState('')
  const [batchNo, setBatchNo] = useState('')
  const [completedTime, setCompletedTime] = useState<string>(
    existingRecord?.endTime ?? ''
  )

  if (!patient || !appointment) {
    return (
      <div className="page-container flex items-center justify-center min-h-screen">
        <p className="text-gray-400 text-lg">未找到顾客或预约信息</p>
      </div>
    )
  }

  const room = appointment.room

  const toggleProject = (project: string) => {
    setSelectedProjects((prev) =>
      prev.includes(project)
        ? prev.filter((p) => p !== project)
        : [...prev, project]
    )
  }

  const handleConfirm = () => {
    const endTime = new Date().toISOString()
    setCompletedTime(endTime)

    const deviceOrBatch =
      room === 'photoelectric'
        ? selectedDevice
        : room === 'injection'
          ? batchNo
          : [selectedDevice, batchNo].filter(Boolean).join(' / ')

    const operatorName = staffList.find((s) => s.id === selectedOperatorId)?.name ?? ''

    if (existingRecord) {
      updateTreatmentRecord(existingRecord.id, {
        actualProject: selectedProjects.join('、'),
        operator: operatorName,
        operatorId: selectedOperatorId,
        deviceOrBatch,
        endTime,
      })
    } else {
      addTreatmentRecord({
        id: `TR-${Date.now()}`,
        appointmentId,
        patientId: patient.id,
        actualProject: selectedProjects.join('、'),
        operator: operatorName,
        operatorId: selectedOperatorId,
        deviceOrBatch,
        startTime: new Date().toISOString(),
        endTime,
        voucherId: '',
        voucherType: 'normal',
        patientSignature: '',
        patientConfirmed: false,
        postOpConfirmed: false,
      })
    }

    updateAppointmentStatus(appointmentId, 'treatment_completed')

    setTimeout(() => {
      navigate(`/patient/${patientId}/voucher?appointment=${appointmentId}`)
    }, 500)
  }

  const isConfirmDisabled =
    selectedProjects.length === 0 ||
    !selectedOperatorId ||
    (room === 'photoelectric' && !selectedDevice) ||
    (room === 'injection' && !batchNo) ||
    (room === 'skin_treatment' && !selectedDevice && !batchNo)

  return (
    <div className="page-container min-h-screen bg-warm-50 flex flex-col">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-warm-200 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-warm-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-800">耗材校验</h1>
        <span className="flex-1 text-right text-sm text-gray-500">
          {patient.name}
        </span>
        <button
          onClick={() =>
            navigate(
              `/patient/${patientId}/exception?appointment=${appointmentId}`
            )
          }
          className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors"
        >
          <AlertTriangle className="w-4 h-4" />
          异常上报
        </button>
      </header>

      <main className="flex-1 px-6 py-4 pb-44 overflow-y-auto">
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="card mb-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Stethoscope className="w-5 h-5 text-primary-500" />
            <span className="text-base font-bold text-gray-800">
              实际执行项目
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {PROJECT_LIST.map((project) => {
              const isSelected = selectedProjects.includes(project)
              return (
                <button
                  key={project}
                  onClick={() => toggleProject(project)}
                  className={cn(
                    'py-2.5 px-3 rounded-xl2 text-sm font-medium transition-all',
                    isSelected
                      ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                      : 'bg-warm-100 text-gray-600 hover:bg-warm-200'
                  )}
                >
                  {project}
                </button>
              )
            })}
          </div>
        </motion.div>

        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="card mb-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <UserCheck className="w-5 h-5 text-primary-500" />
            <span className="text-base font-bold text-gray-800">操作人</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
            {staffList.map((staff) => {
              const isSelected = selectedOperatorId === staff.id
              return (
                <button
                  key={staff.id}
                  onClick={() => setSelectedOperatorId(staff.id)}
                  className="flex flex-col items-center gap-1.5 flex-shrink-0 min-w-[64px]"
                >
                  <div
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all',
                      isSelected
                        ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                        : 'border-warm-200 bg-warm-100'
                    )}
                  >
                    <span
                      className={cn(
                        'text-lg font-bold',
                        isSelected ? 'text-primary-500' : 'text-gray-500'
                      )}
                    >
                      {staff.name.charAt(0)}
                    </span>
                  </div>
                  <span
                    className={cn(
                      'text-xs font-medium whitespace-nowrap',
                      isSelected ? 'text-primary-600' : 'text-gray-500'
                    )}
                  >
                    {staff.name}
                  </span>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-primary-500" />
                  )}
                </button>
              )
            })}
          </div>
        </motion.div>

        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="card mb-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-5 h-5 text-primary-500" />
            <span className="text-base font-bold text-gray-800">
              设备/产品批次
            </span>
          </div>

          {(room === 'photoelectric' || room === 'skin_treatment') && (
            <div className="mb-3">
              <label className="text-sm text-gray-500 mb-1.5 block">
                设备选择
              </label>
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="w-full px-4 py-3 rounded-xl2 bg-warm-50 border border-warm-200 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 appearance-none"
              >
                <option value="">请选择设备</option>
                {DEVICE_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(room === 'injection' || room === 'skin_treatment') && (
            <div>
              <label className="text-sm text-gray-500 mb-1.5 block">
                产品批次号
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={batchNo}
                  onChange={(e) => setBatchNo(e.target.value)}
                  placeholder="请输入产品批次号"
                  className="w-full px-4 py-3 pr-12 rounded-xl2 bg-warm-50 border border-warm-200 text-gray-800 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-warm-200 transition-colors">
                  <ScanLine className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {completedTime && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mb-4 flex items-center gap-2"
          >
            <Clock className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-600">
              治疗完成时间：{(() => {
                const timeToDisplay = existingRecord?.endTime || completedTime
                try {
                  return format(new Date(timeToDisplay), 'yyyy-MM-dd HH:mm', { locale: zhCN })
                } catch {
                  return timeToDisplay
                }
              })()}
            </span>
          </motion.div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur border-t border-warm-200 px-6 py-4">
        <button
          onClick={handleConfirm}
          disabled={isConfirmDisabled}
          className={cn(
            'w-full py-4 rounded-xl2 text-lg font-bold transition-colors',
            isConfirmDisabled
              ? 'bg-warm-200 text-gray-400 cursor-not-allowed'
              : 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700'
          )}
        >
          确认完成
        </button>
      </div>
    </div>
  )
}
