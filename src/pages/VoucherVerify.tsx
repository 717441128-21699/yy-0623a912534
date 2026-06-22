import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  CreditCard,
  Check,
  AlertTriangle,
  X,
  ChevronRight,
  Calendar,
} from 'lucide-react'
import useStore from '@/store/useStore'
import { cn } from '@/lib/utils'

const typeLabel: Record<string, string> = {
  course_card: '疗程卡',
  experience_voucher: '体验券',
  gift_session: '赠送次数',
}

const typeGradient: Record<string, string> = {
  course_card: 'from-primary-500 to-primary-700',
  experience_voucher: 'from-amber-500 to-amber-600',
  gift_session: 'from-purple-500 to-purple-700',
}

const typeTagBg: Record<string, string> = {
  course_card: 'bg-primary-100 text-primary-700',
  experience_voucher: 'bg-amber-100 text-amber-700',
  gift_session: 'bg-purple-100 text-purple-700',
}

export default function VoucherVerify() {
  const { id: patientId } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const appointmentId = searchParams.get('appointment') ?? ''
  const navigate = useNavigate()

  const getPatientById = useStore((s) => s.getPatientById)
  const getAppointmentById = useStore((s) => s.getAppointmentById)
  const getVouchersByPatientId = useStore((s) => s.getVouchersByPatientId)
  const useVoucher = useStore((s) => s.useVoucher)
  const addTreatmentRecord = useStore((s) => s.addTreatmentRecord)
  const updateTreatmentRecord = useStore((s) => s.updateTreatmentRecord)
  const treatmentRecords = useStore((s) => s.treatmentRecords)
  const currentStaff = useStore((s) => s.currentStaff)

  const patient = getPatientById(patientId!)
  const appointment = getAppointmentById(appointmentId)
  const vouchers = getVouchersByPatientId(patientId!)

  const existingRecord = treatmentRecords.find(
    (r) => r.appointmentId === appointmentId
  )
  const actualProject =
    existingRecord?.actualProject ?? appointment?.projectName ?? ''

  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(
    null
  )
  const [showMismatchModal, setShowMismatchModal] = useState(false)
  const [verified, setVerified] = useState(false)
  const [patientConfirmed, setPatientConfirmed] = useState(false)
  const [usedVoucherId, setUsedVoucherId] = useState<string | null>(null)

  const selectedVoucher = vouchers.find((v) => v.id === selectedVoucherId)

  const todayStr = new Date().toISOString().split('T')[0]

  const isMatch = selectedVoucher
    ? selectedVoucher.applicableProjects.includes(actualProject)
    : true

  const handleSelectVoucher = (voucherId: string) => {
    const voucher = vouchers.find((v) => v.id === voucherId)
    if (!voucher) return
    if (voucher.remainingSessions === 0) return
    if (voucher.expiryDate < todayStr) return

    setSelectedVoucherId(voucherId)
  }

  const handleConfirmVerify = () => {
    if (!selectedVoucher) return

    if (!selectedVoucher.applicableProjects.includes(actualProject)) {
      setShowMismatchModal(true)
      return
    }

    executeVerify('normal')
  }

  const executeVerify = (
    voucherType: 'normal' | 'change_item' | 'price_diff' | 'to_front_desk'
  ) => {
    if (!selectedVoucher || !patientId) return

    useVoucher(selectedVoucher.id)
    setUsedVoucherId(selectedVoucher.id)

    if (existingRecord) {
      updateTreatmentRecord(existingRecord.id, {
        voucherId: selectedVoucher.id,
        voucherType,
      })
    } else {
      addTreatmentRecord({
        id: `TR-${Date.now()}`,
        appointmentId,
        patientId,
        actualProject,
        operator: currentStaff?.name ?? '',
        deviceOrBatch: '',
        startTime: new Date().toISOString(),
        endTime: '',
        voucherId: selectedVoucher.id,
        voucherType,
        patientSignature: '',
        patientConfirmed: false,
        postOpConfirmed: false,
      })
    }

    setShowMismatchModal(false)
    setVerified(true)
  }

  const handlePatientConfirm = () => {
    const record = treatmentRecords.find(
      (r) => r.appointmentId === appointmentId
    )
    if (record) {
      updateTreatmentRecord(record.id, { patientConfirmed: true })
    }
    setPatientConfirmed(true)
    setTimeout(() => {
      navigate(`/patient/${patientId}/post-op?appointment=${appointmentId}`)
    }, 800)
  }

  const usedVoucher = usedVoucherId
    ? vouchers.find((v) => v.id === usedVoucherId)
    : null

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
        <h1 className="text-lg font-bold text-gray-800">卡券核销</h1>
        <span className="ml-auto text-sm text-gray-500">{patient.name}</span>
      </header>

      <main className="flex-1 px-6 py-4 pb-48 overflow-y-auto">
        <div className="mb-4 p-4 bg-white rounded-xl2 border border-warm-200">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-semibold text-gray-700">
              当前治疗信息
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">实际项目</p>
              <p className="text-base font-bold text-gray-800">
                {actualProject || '—'}
              </p>
            </div>
            {appointment && (
              <div className="text-right">
                <p className="text-sm text-gray-500">预约项目</p>
                <p className="text-sm text-gray-600">
                  {appointment.projectName}
                </p>
              </div>
            )}
          </div>
          {appointment && (
            <div className="mt-2 flex items-center gap-1.5">
              {actualProject === appointment.projectName ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-medium text-green-600">
                    项目一致
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-medium text-amber-600">
                    项目不一致，请选择处理方式
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        <h2 className="text-sm font-semibold text-gray-600 mb-3">
          可用卡券
        </h2>

        <div className="space-y-3">
          {vouchers.map((voucher) => {
            const isExpired = voucher.expiryDate < todayStr
            const isUsedUp = voucher.remainingSessions === 0
            const isDisabled = isExpired || isUsedUp
            const isSelected = selectedVoucherId === voucher.id

            return (
              <motion.div
                key={voucher.id}
                layout
                className={cn(
                  'relative rounded-xl2 overflow-hidden bg-white border-2 transition-colors cursor-pointer',
                  isSelected
                    ? 'border-primary-500 shadow-lg shadow-primary-500/20'
                    : 'border-transparent shadow-md',
                  isDisabled && 'opacity-60 cursor-not-allowed'
                )}
                onClick={() => !isDisabled && handleSelectVoucher(voucher.id)}
                whileHover={!isDisabled ? { scale: 1.01 } : {}}
                whileTap={!isDisabled ? { scale: 0.99 } : {}}
              >
                <div
                  className={cn(
                    'h-2 bg-gradient-to-r',
                    typeGradient[voucher.type]
                  )}
                />

                {isDisabled && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                    <span className="text-lg font-bold text-gray-400">
                      {isUsedUp ? '已用完' : '已过期'}
                    </span>
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-bold text-gray-800">
                          {voucher.name}
                        </span>
                        <span
                          className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                            typeTagBg[voucher.type]
                          )}
                        >
                          {typeLabel[voucher.type]}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-3xl font-mono font-bold text-primary-600">
                          {voucher.remainingSessions}
                        </span>
                        <span className="text-sm text-gray-500">次剩余</span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-400 mb-2">
                        <span>
                          总计 {voucher.totalSessions} / 已用{' '}
                          {voucher.usedSessions}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {voucher.expiryDate}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {voucher.applicableProjects.map((proj) => (
                          <span
                            key={proj}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-warm-100 text-gray-600"
                          >
                            {proj}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-center ml-3">
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
                          isSelected
                            ? 'border-primary-500 bg-primary-500'
                            : 'border-gray-300'
                        )}
                      >
                        {isSelected && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </main>

      <AnimatePresence>
        {showMismatchModal && selectedVoucher && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-6"
            onClick={() => setShowMismatchModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl2 p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  卡券项目与实际治疗不一致
                </h3>
                <button
                  onClick={() => setShowMismatchModal(false)}
                  className="p-1 rounded hover:bg-warm-100"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                卡券「{selectedVoucher.name}」适用项目为{' '}
                {selectedVoucher.applicableProjects.join('、')}
                ，与实际治疗「{actualProject}」不一致
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => executeVerify('change_item')}
                  className="w-full py-3 px-4 rounded-xl2 bg-warm-100 text-gray-700 font-semibold text-base flex items-center justify-between hover:bg-warm-200 transition-colors"
                >
                  <span>改项</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => executeVerify('price_diff')}
                  className="w-full py-3 px-4 rounded-xl2 bg-amber-500 text-white font-semibold text-base flex items-center justify-between hover:bg-amber-600 transition-colors"
                >
                  <span>补差价</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => executeVerify('to_front_desk')}
                  className="w-full py-3 px-4 rounded-xl2 bg-coral-500 text-white font-semibold text-base flex items-center justify-between hover:bg-coral-600 transition-colors"
                >
                  <span>转前台处理</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => setShowMismatchModal(false)}
                className="w-full mt-4 py-2 text-sm text-gray-400 hover:text-gray-600"
              >
                取消
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur border-t border-warm-200 px-6 py-4">
        <AnimatePresence mode="wait">
          {!verified ? (
            <motion.div
              key="verify"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {selectedVoucher && (
                <div className="mb-3 p-3 bg-warm-50 rounded-xl2 flex items-center gap-3">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center',
                      typeGradient[selectedVoucher.type]
                    )}
                  >
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {selectedVoucher.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      剩余 {selectedVoucher.remainingSessions} 次
                    </p>
                  </div>
                  {!isMatch && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                      项目不一致
                    </span>
                  )}
                </div>
              )}
              <button
                disabled={!selectedVoucher}
                onClick={handleConfirmVerify}
                className={cn(
                  'w-full py-4 rounded-xl2 text-lg font-bold transition-colors',
                  selectedVoucher
                    ? 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700'
                    : 'bg-warm-200 text-gray-400 cursor-not-allowed'
                )}
              >
                确认核销
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {usedVoucher && (
                <div className="mb-3 text-center">
                  <p className="text-sm text-gray-500">
                    本次使用1次，已累计使用{usedVoucher.usedSessions}次，剩余
                    {usedVoucher.remainingSessions}次
                  </p>
                </div>
              )}
              <button
                onClick={handlePatientConfirm}
                disabled={patientConfirmed}
                className={cn(
                  'w-full py-4 rounded-xl2 text-lg font-bold transition-colors',
                  patientConfirmed
                    ? 'bg-green-500 text-white'
                    : 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700'
                )}
              >
                {patientConfirmed ? '已确认 ✓' : '顾客确认'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
