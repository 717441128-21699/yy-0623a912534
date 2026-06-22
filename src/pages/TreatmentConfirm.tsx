import { useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import SignatureCanvas from 'react-signature-canvas'
import {
  Stethoscope,
  MapPin,
  Clock,
  Timer,
  AlertTriangle,
  ShieldAlert,
  Check,
  Eraser,
  ArrowLeft,
} from 'lucide-react'
import useStore from '@/store/useStore'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4 },
  }),
}

export default function TreatmentConfirm() {
  const { id: patientId } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const appointmentId = searchParams.get('appointment') ?? ''
  const navigate = useNavigate()
  const sigRef = useRef<SignatureCanvas>(null)

  const getPatientById = useStore((s) => s.getPatientById)
  const getAppointmentById = useStore((s) => s.getAppointmentById)
  const updateAppointmentStatus = useStore((s) => s.updateAppointmentStatus)
  const addTreatmentRecord = useStore((s) => s.addTreatmentRecord)
  const currentStaff = useStore((s) => s.currentStaff)

  const patient = patientId ? getPatientById(patientId) : undefined
  const appointment = appointmentId ? getAppointmentById(appointmentId) : undefined

  if (!patient || !appointment) {
    return (
      <div className="page-container flex items-center justify-center min-h-screen">
        <p className="text-gray-400 text-lg">未找到顾客或预约信息</p>
      </div>
    )
  }

  const genderText = patient.gender === 'male' ? '男' : '女'
  const hasAllergies = patient.allergies.length > 0
  const hasContraindications = patient.contraindications.length > 0
  const hasSpecialNotes = patient.specialNotes.length > 0

  const handleConfirm = () => {
    const signatureData = sigRef.current
      ? sigRef.current.toDataURL()
      : ''

    updateAppointmentStatus(appointmentId, 'in_progress')

    addTreatmentRecord({
      id: `TR-${Date.now()}`,
      appointmentId,
      patientId: patient.id,
      actualProject: appointment.projectName,
      operator: currentStaff?.name ?? '',
      deviceOrBatch: '',
      startTime: new Date().toISOString(),
      endTime: '',
      voucherId: '',
      voucherType: 'normal',
      patientSignature: signatureData,
      patientConfirmed: true,
      postOpConfirmed: false,
    })

    navigate(`/patient/${patientId}/consumable?appointment=${appointmentId}`)
  }

  return (
    <div className="page-container pb-8">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-warm-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">治疗确认</h1>
      </div>

      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="card mb-4"
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-primary-500">
              {patient.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl font-bold text-gray-800">{patient.name}</span>
              <span className="px-2 py-0.5 rounded-md bg-primary-50 text-primary-500 text-sm font-medium">
                {genderText}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-warm-100 text-gray-600 text-sm font-medium">
                {patient.age}岁
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500 text-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M2 10h20" />
              </svg>
              <span>{patient.cardNo}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-warm-200 pt-3 mb-3">
          <p className="text-sm font-medium text-gray-600 mb-2">过敏史</p>
          {hasAllergies ? (
            <div className="flex flex-wrap gap-2">
              {patient.allergies.map((a) => (
                <span
                  key={a}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-sm font-medium"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {a}
                </span>
              ))}
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-50 text-green-600 text-sm font-medium">
              <Check className="w-3.5 h-3.5" />
              无过敏史
            </span>
          )}
        </div>

        <div className="border-t border-warm-200 pt-3 mb-3">
          <p className="text-sm font-medium text-gray-600 mb-2">禁忌症</p>
          {hasContraindications ? (
            <div className="flex flex-wrap gap-2">
              {patient.contraindications.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-sm font-medium"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {c}
                </span>
              ))}
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-50 text-green-600 text-sm font-medium">
              <Check className="w-3.5 h-3.5" />
              无禁忌症
            </span>
          )}
        </div>

        {hasSpecialNotes && (
          <div className="border-t border-warm-200 pt-3">
            <p className="text-sm font-medium text-gray-600 mb-2">特别备注</p>
            <div className="flex flex-wrap gap-2">
              {patient.specialNotes.map((n) => (
                <span
                  key={n}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-600 text-sm font-medium"
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      <motion.div
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="card mb-4"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-primary-500" />
            <span className="text-lg font-bold text-gray-800">{appointment.projectName}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{appointment.bodyPart}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{appointment.scheduledTime}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Timer className="w-4 h-4" />
            <span className="text-sm">预计 {appointment.estimatedDuration} 分钟</span>
          </div>
        </div>

        {hasContraindications && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 font-medium text-sm leading-relaxed">
              禁忌提醒：该顾客存在禁忌症，请确认是否可以执行治疗
            </p>
          </div>
        )}
      </motion.div>

      <motion.div
        custom={2}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="card"
      >
        <p className="text-sm font-medium text-gray-600 mb-3">顾客签字确认</p>
        <div className="bg-white border-2 border-dashed border-warm-300 rounded-xl overflow-hidden mb-3">
          <SignatureCanvas
            ref={sigRef}
            canvasProps={{
              className: 'signature-canvas w-full',
              style: { width: '100%', height: '160px' },
            }}
          />
        </div>
        <div className="flex items-center justify-end mb-4">
          <button
            onClick={() => sigRef.current?.clear()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-500 text-sm hover:bg-warm-100 transition-colors"
          >
            <Eraser className="w-4 h-4" />
            清除签名
          </button>
        </div>
        <button
          onClick={handleConfirm}
          className="btn-primary w-full text-lg py-4"
        >
          确认开始治疗
        </button>
      </motion.div>
    </div>
  )
}
