import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  CreditCard,
  Check,
  Send,
  Clock,
} from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import useStore from '@/store/useStore'
import { cn } from '@/lib/utils'
import { postOpInstructions } from '@/data/mock'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
}

const treatmentTypeLabel: Record<string, string> = {
  normal: '正常核销',
  change_item: '改项',
  price_diff: '补差价',
  to_front_desk: '转前台',
}

const treatmentTypeBadge: Record<string, string> = {
  normal: 'bg-green-100 text-green-700',
  change_item: 'bg-gray-100 text-gray-700',
  price_diff: 'bg-amber-100 text-amber-700',
  to_front_desk: 'bg-coral-100 text-coral-700',
}

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '—'
  try {
    return format(new Date(dateStr), 'yyyy-MM-dd HH:mm', { locale: zhCN })
  } catch {
    return '—'
  }
}

export default function PostOp() {
  const { id: patientId } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const appointmentId = searchParams.get('appointment') ?? ''
  const navigate = useNavigate()

  const getPatientById = useStore((s) => s.getPatientById)
  const getAppointmentById = useStore((s) => s.getAppointmentById)
  const getTreatmentRecordByAppointmentId = useStore(
    (s) => s.getTreatmentRecordByAppointmentId
  )
  const getVerificationByAppointmentId = useStore(
    (s) => s.getVerificationByAppointmentId
  )
  const updateTreatmentRecord = useStore((s) => s.updateTreatmentRecord)
  const updateAppointmentStatus = useStore((s) => s.updateAppointmentStatus)
  const getVouchersByPatientId = useStore((s) => s.getVouchersByPatientId)
  const addVerificationRecord = useStore((s) => s.addVerificationRecord)

  const patient = getPatientById(patientId!)
  const appointment = getAppointmentById(appointmentId)
  const record = getTreatmentRecordByAppointmentId(appointmentId)
  const verification = getVerificationByAppointmentId(appointmentId)

  const [confirmed, setConfirmed] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const projectName = record?.actualProject ?? appointment?.projectName ?? ''
  const matchedInstructions = postOpInstructions.find(
    (p) => p.projectName === projectName
  )
  const instructions = matchedInstructions
    ? matchedInstructions.items
    : ['请遵医嘱进行术后护理，如有不适请及时联系医生']

  const vouchers = getVouchersByPatientId(patientId!)
  const usedVoucher = record?.voucherId
    ? vouchers.find((v) => v.id === record.voucherId)
    : null

  const timelineItems = [
    {
      label: '治疗开始',
      time: record?.startTime,
      key: 'start',
    },
    {
      label: '治疗完成',
      time: record?.endTime,
      key: 'end',
    },
    {
      label: '卡券核销',
      time: verification?.verifiedAt,
      key: 'verify',
    },
    {
      label: '顾客确认',
      time: verification?.patientConfirmedAt,
      key: 'confirm',
    },
  ]

  const handleConfirm = () => {
    if (!record) return
    updateTreatmentRecord(record.id, { postOpConfirmed: true })
    if (verification) {
      addVerificationRecord({
        ...verification,
        patientConfirmed: true,
        patientConfirmedAt: new Date().toISOString(),
      })
    }
    updateAppointmentStatus(appointmentId, 'verified')
    setShowSuccess(true)
    setTimeout(() => {
      navigate('/')
    }, 2000)
  }

  const handleSend = () => {
    setToast('已发送')
    setTimeout(() => setToast(null), 2000)
  }

  if (!patient) return null

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-warm-200 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-warm-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-800">术后交代</h1>
        <span className="ml-auto text-sm text-gray-500">{patient.name}</span>
      </header>

      <main className="flex-1 px-6 py-4 pb-52 overflow-y-auto space-y-4">
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="p-4 bg-white rounded-xl2 border border-warm-200"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
              <CheckCircle className="w-4 h-4" />
              治疗完成
            </span>
            {verification && (
              <span
                className={cn(
                  'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                  treatmentTypeBadge[verification.treatmentType]
                )}
              >
                {treatmentTypeLabel[verification.treatmentType]}
              </span>
            )}
          </div>
          <p className="text-xl font-bold text-gray-800 mb-3">{projectName}</p>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Clock className="w-4 h-4" />
            <span>
              {formatDate(record?.startTime)} →{' '}
              {formatDate(record?.endTime)}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {record?.operator && <span>操作者：{record.operator}</span>}
            {record?.deviceOrBatch && <span>设备/批号：{record.deviceOrBatch}</span>}
          </div>
        </motion.div>

        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="p-4 bg-white rounded-xl2 border border-warm-200"
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-semibold text-gray-700">
              治疗时间线
            </span>
          </div>
          <div className="relative pl-8">
            {timelineItems.map((item, idx) => (
              <div key={item.key} className="relative pb-6 last:pb-0">
                {idx < timelineItems.length - 1 && (
                  <div className="absolute left-[-1.25rem] top-6 bottom-0 w-0.5 bg-warm-200" />
                )}
                <div className="absolute left-[-1.625rem] top-0 w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                  <Clock className="w-3 h-3 text-primary-600" />
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm font-medium text-gray-700">
                    {item.label}
                  </span>
                  <span className="text-sm text-gray-500 font-mono">
                    {formatDate(item.time)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {verification && (
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="p-4 bg-white rounded-xl2 border border-warm-200"
          >
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-semibold text-gray-700">
                核销信息
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">凭证编号</span>
                <span className="text-sm font-mono font-medium text-gray-800">
                  HX{verification.traceNo}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">操作人</span>
                <span className="text-sm text-gray-800">
                  {verification.operatorName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">核销类型</span>
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    treatmentTypeBadge[verification.treatmentType]
                  )}
                >
                  {treatmentTypeLabel[verification.treatmentType]}
                </span>
              </div>
              {verification.priceDiffAmount !== undefined &&
                verification.priceDiffAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">补差价金额</span>
                    <span className="text-sm font-medium text-amber-600">
                      ¥{verification.priceDiffAmount.toFixed(2)}
                    </span>
                  </div>
                )}
              {verification.changeItemNote && (
                <div className="pt-3 border-t border-warm-100">
                  <span className="text-sm text-gray-500 block mb-1">改项说明</span>
                  <p className="text-sm text-gray-700 bg-warm-50 p-3 rounded-lg">
                    {verification.changeItemNote}
                  </p>
                </div>
              )}
              {verification.frontDeskNote && (
                <div className="pt-3 border-t border-warm-100">
                  <span className="text-sm text-gray-500 block mb-1">前台备注</span>
                  <p className="text-sm text-gray-700 bg-coral-50 p-3 rounded-lg">
                    {verification.frontDeskNote}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        <motion.div
          custom={verification ? 3 : 2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="p-4 bg-white rounded-xl2 border border-warm-200"
        >
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-semibold text-gray-700">
              术后注意事项
            </span>
          </div>
          <div className="space-y-2.5">
            {instructions.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.06, duration: 0.3 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-warm-50 border-l-3 border-primary-500"
              >
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed flex-1">
                  {item}
                </p>
                <Check className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {usedVoucher && (
          <motion.div
            custom={verification ? 4 : 3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="p-4 bg-white rounded-xl2 border border-warm-200"
          >
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-semibold text-gray-700">
                卡券使用情况
              </span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-base font-semibold text-gray-800">
                  {usedVoucher.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  已使用 / 总次数
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-2xl font-bold text-gray-800">
                  {usedVoucher.usedSessions}
                  <span className="text-gray-400 text-base"> / {usedVoucher.totalSessions}</span>
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  剩余{' '}
                  <span className="font-mono font-semibold text-primary-600">
                    {usedVoucher.remainingSessions}
                  </span>{' '}
                  次
                </p>
              </div>
            </div>
            <div className="w-full h-2.5 bg-warm-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${(usedVoucher.usedSessions / usedVoucher.totalSessions) * 100}%`,
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={cn(
                  'h-full rounded-full',
                  usedVoucher.remainingSessions === 0
                    ? 'bg-red-500'
                    : 'bg-primary-500'
                )}
              />
            </div>
          </motion.div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-warm-200 px-6 py-4 z-20">
        <label className="flex items-center gap-3 mb-4 cursor-pointer select-none">
          <div
            className={cn(
              'w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors',
              confirmed
                ? 'bg-primary-500 border-primary-500'
                : 'border-gray-300 bg-white'
            )}
            onClick={() => setConfirmed(!confirmed)}
          >
            {confirmed && <Check className="w-4 h-4 text-white" />}
          </div>
          <span className="text-sm text-gray-600">
            顾客确认已阅读注意事项
          </span>
        </label>

        <div className="flex gap-3">
          <button
            onClick={handleSend}
            className="btn-secondary flex items-center justify-center gap-2 flex-1 py-3.5 rounded-xl2 text-base font-semibold"
          >
            <Send className="w-4 h-4" />
            发送至顾客手机
          </button>
          <button
            disabled={!confirmed || showSuccess}
            onClick={handleConfirm}
            className={cn(
              'flex items-center justify-center gap-2 flex-1 py-3.5 rounded-xl2 text-base font-semibold transition-colors',
              confirmed && !showSuccess
                ? 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700'
                : 'bg-warm-200 text-gray-400 cursor-not-allowed'
            )}
          >
            <CheckCircle className="w-5 h-5" />
            {showSuccess ? '已完成 ✓' : '确认完成'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', damping: 10 }}
                className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center"
              >
                <CheckCircle className="w-9 h-9 text-green-600" />
              </motion.div>
              <p className="text-lg font-bold text-gray-800">术后交代已完成</p>
              <p className="text-sm text-gray-400">即将返回首页…</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
