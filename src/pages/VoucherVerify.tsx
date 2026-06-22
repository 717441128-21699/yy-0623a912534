import { useState, useMemo } from 'react'
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
  AlertCircle,
  Flag,
  Minus,
  ArrowRight,
  Printer,
} from 'lucide-react'
import useStore from '@/store/useStore'
import { cn } from '@/lib/utils'
import type { VerificationRecord, Voucher } from '@/types'

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
  const getTreatmentRecordByAppointmentId = useStore(
    (s) => s.getTreatmentRecordByAppointmentId
  )
  const addVerificationRecord = useStore((s) => s.addVerificationRecord)
  const updateAppointmentStatus = useStore((s) => s.updateAppointmentStatus)
  const currentStaff = useStore((s) => s.currentStaff)

  const patient = getPatientById(patientId!)
  const appointment = getAppointmentById(appointmentId)
  const vouchers = getVouchersByPatientId(patientId!)
  const existingRecord = getTreatmentRecordByAppointmentId(appointmentId)

  const actualProject =
    existingRecord?.actualProject ?? appointment?.projectName ?? ''

  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(
    null
  )
  const [showMismatchModal, setShowMismatchModal] = useState(false)
  const [showVoucherModal, setShowVoucherModal] = useState(false)
  const [verified, setVerified] = useState(false)
  const [patientConfirmed, setPatientConfirmed] = useState(false)
  const [usedVoucherData, setUsedVoucherData] = useState<{
    before: number
    after: number
    voucher: Voucher
    treatmentType: 'normal' | 'change_item' | 'price_diff' | 'to_front_desk'
    verificationId: string
    traceNo: string
  } | null>(null)
  const [priceDiffInput, setPriceDiffInput] = useState('')
  const [changeItemNote, setChangeItemNote] = useState('')
  const [frontDeskNote, setFrontDeskNote] = useState('')
  const [activeMismatchAction, setActiveMismatchAction] = useState<
    'change_item' | 'price_diff' | 'to_front_desk' | null
  >(null)

  const selectedVoucher = vouchers.find((v) => v.id === selectedVoucherId)

  const todayStr = new Date().toISOString().split('T')[0]

  const voucherAnalysis = useMemo(() => {
    const available = vouchers.filter(
      (v) => v.remainingSessions > 0 && v.expiryDate >= todayStr
    )
    const applicable = available.filter((v) =>
      v.applicableProjects.includes(actualProject)
    )
    const expired = vouchers.filter((v) => v.expiryDate < todayStr)
    const usedUp = vouchers.filter(
      (v) => v.remainingSessions === 0 && v.expiryDate >= todayStr
    )

    const insufficient = applicable.filter(
      (v) => v.remainingSessions < 1
    )

    return {
      hasAvailable: available.length > 0,
      hasApplicable: applicable.length > 0,
      expiredCount: expired.length,
      usedUpCount: usedUp.length,
      insufficientCount: insufficient.length,
      applicableVouchers: applicable,
    }
  }, [vouchers, actualProject, todayStr])

  const isMatch = selectedVoucher
    ? selectedVoucher.applicableProjects.includes(actualProject)
    : true

  const generateTraceNo = () => {
    const date = new Date()
    const prefix = 'HX'
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    const random = Math.random().toString(36).slice(2, 8).toUpperCase()
    return `${prefix}${dateStr}${random}`
  }

  const handleSelectVoucher = (voucherId: string) => {
    const voucher = vouchers.find((v) => v.id === voucherId)
    if (!voucher) return
    if (voucher.remainingSessions === 0) return
    if (voucher.expiryDate < todayStr) return

    setSelectedVoucherId(voucherId)
  }

  const handleQuickException = (
    type: 'voucher_insufficient' | 'no_voucher_in_system' | 'other',
    reason: string
  ) => {
    const params = new URLSearchParams({
      appointment: appointmentId,
      type,
      reason,
      project: actualProject,
    })
    navigate(
      `/patient/${patientId}/exception?${params.toString()}`
    )
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
    voucherType: 'normal' | 'change_item' | 'price_diff' | 'to_front_desk',
    priceDiffAmount?: number,
    changeItemNote?: string,
    frontDeskNote?: string
  ) => {
    if (!selectedVoucher || !patientId) return

    const sessionsBefore = selectedVoucher.remainingSessions
    const sessionsAfter =
      voucherType === 'to_front_desk' ? sessionsBefore : sessionsBefore - 1

    if (voucherType !== 'to_front_desk') {
      useVoucher(selectedVoucher.id)
    }

    const verificationId = `VER-${Date.now()}`
    const traceNo = generateTraceNo()

    const verificationRecord: VerificationRecord = {
      id: verificationId,
      appointmentId,
      patientId: patientId,
      voucherId: selectedVoucher.id,
      voucherName: selectedVoucher.name,
      voucherType: selectedVoucher.type,
      actualProject,
      bookedProject: appointment?.projectName ?? actualProject,
      treatmentType: voucherType,
      sessionsBefore,
      sessionsAfter,
      sessionsUsed: voucherType === 'to_front_desk' ? 0 : 1,
      operatorId: currentStaff?.id ?? '',
      operatorName: currentStaff?.name ?? '',
      patientConfirmed: false,
      verifiedAt: new Date().toISOString(),
      priceDiffAmount,
      changeItemNote,
      frontDeskNote,
      traceNo,
    }
    addVerificationRecord(verificationRecord)

    if (existingRecord) {
      updateTreatmentRecord(existingRecord.id, {
        voucherId: selectedVoucher.id,
        voucherType,
        verificationId,
        priceDiffAmount,
        changeItemNote,
        frontDeskNote,
      })
    } else {
      addTreatmentRecord({
        id: `TR-${Date.now()}`,
        appointmentId,
        patientId: patientId,
        actualProject,
        operator: currentStaff?.name ?? '',
        operatorId: currentStaff?.id ?? '',
        deviceOrBatch: '',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        voucherId: selectedVoucher.id,
        voucherType,
        patientSignature: '',
        patientConfirmed: false,
        postOpConfirmed: false,
        verificationId,
        priceDiffAmount,
        changeItemNote,
        frontDeskNote,
      })
    }

    if (voucherType === 'to_front_desk') {
      updateAppointmentStatus(appointmentId, 'to_front_desk')
    } else {
      updateAppointmentStatus(appointmentId, 'voucher_deducted')
    }

    const updatedVoucher = {
      ...selectedVoucher,
      remainingSessions: sessionsAfter,
      usedSessions:
        selectedVoucher.usedSessions +
        (voucherType === 'to_front_desk' ? 0 : 1),
    }

    setUsedVoucherData({
      before: sessionsBefore,
      after: sessionsAfter,
      voucher: updatedVoucher,
      treatmentType: voucherType,
      verificationId,
      traceNo,
    })

    setShowMismatchModal(false)
    setActiveMismatchAction(null)
    setVerified(true)
  }

  const handleMismatchAction = (
    action: 'change_item' | 'price_diff' | 'to_front_desk'
  ) => {
    if (action === 'change_item') {
      setActiveMismatchAction('change_item')
    } else if (action === 'price_diff') {
      setActiveMismatchAction('price_diff')
    } else if (action === 'to_front_desk') {
      setActiveMismatchAction('to_front_desk')
    }
  }

  const handleConfirmMismatchAction = () => {
    if (!activeMismatchAction) return

    if (activeMismatchAction === 'price_diff') {
      const amount = parseFloat(priceDiffInput)
      if (isNaN(amount) || amount <= 0) return
      executeVerify('price_diff', amount)
    } else if (activeMismatchAction === 'change_item') {
      executeVerify('change_item', undefined, changeItemNote)
    } else if (activeMismatchAction === 'to_front_desk') {
      executeVerify('to_front_desk', undefined, undefined, frontDeskNote)
    }
  }

  const handlePatientConfirm = () => {
    if (!usedVoucherData) return

    const record = getTreatmentRecordByAppointmentId(appointmentId)
    if (record) {
      updateTreatmentRecord(record.id, {
        patientConfirmed: true,
      })
    }

    const verification = useStore
      .getState()
      .getVerificationByAppointmentId(appointmentId)
    if (verification) {
      addVerificationRecord({
        ...verification,
        patientConfirmed: true,
        patientConfirmedAt: new Date().toISOString(),
      })
    }

    setPatientConfirmed(true)
    setTimeout(() => {
      navigate(`/patient/${patientId}/post-op?appointment=${appointmentId}`)
    }, 1500)
  }

  const handlePrintVoucher = () => {
    setShowVoucherModal(false)
    alert('核销凭证已发送至打印机')
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

        {!voucherAnalysis.hasApplicable && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-coral-500/10 border border-coral-500/30 rounded-xl2"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-coral-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-coral-700 mb-1">
                  无适用卡券
                </p>
                <p className="text-xs text-coral-600 mb-3">
                  未找到「{actualProject}」对应的可用卡券，顾客名下共有 {vouchers.length} 张卡券，其中{voucherAnalysis.applicableVouchers.length > 0 ? `${voucherAnalysis.applicableVouchers.length}张适用但` : ''}
                  {voucherAnalysis.usedUpCount > 0
                    ? `${voucherAnalysis.usedUpCount}张次数用完、`
                    : ''}
                  {voucherAnalysis.expiredCount > 0
                    ? `${voucherAnalysis.expiredCount}张已过期`
                    : '无适用项目'}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleQuickException(
                        'no_voucher_in_system',
                        `无${actualProject}适用卡券`
                      )
                    }
                    className="px-3 py-1.5 bg-coral-500 text-white text-xs font-medium rounded-lg hover:bg-coral-600 transition-colors"
                  >
                    <Flag className="w-3 h-3 inline mr-1" />
                    上报异常
                  </button>
                  <button
                    onClick={() =>
                      handleQuickException(
                        'other',
                        `卡券${voucherAnalysis.usedUpCount > 0 ? '次数用完' : ''}${voucherAnalysis.expiredCount > 0 ? '、过期' : ''}`
                      )
                    }
                    className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Flag className="w-3 h-3 inline mr-1" />
                    卡券问题
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {voucherAnalysis.insufficientCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl2"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-700 mb-1">
                  卡券次数不足
                </p>
                <p className="text-xs text-amber-600 mb-3">
                  有 {voucherAnalysis.insufficientCount} 张适用卡券次数不足
                </p>
                <button
                  onClick={() =>
                    handleQuickException(
                      'voucher_insufficient',
                      `${actualProject}卡券次数不足`
                    )
                  }
                  className="px-3 py-1.5 bg-amber-500 text-white text-xs font-medium rounded-lg hover:bg-amber-600 transition-colors"
                >
                  <Flag className="w-3 h-3 inline mr-1" />
                  卡券不足上报
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {(voucherAnalysis.expiredCount > 0 || voucherAnalysis.usedUpCount > 0) &&
          voucherAnalysis.hasApplicable && (
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-xl2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <AlertCircle className="w-4 h-4" />
                <span>
                  {voucherAnalysis.expiredCount > 0 &&
                    `${voucherAnalysis.expiredCount}张已过期`}
                  {voucherAnalysis.expiredCount > 0 && voucherAnalysis.usedUpCount > 0 && '、'}
                  {voucherAnalysis.usedUpCount > 0 &&
                    `${voucherAnalysis.usedUpCount}张次数用完`}
                  ，已自动过滤
                </span>
              </div>
            </div>
          )}

        <h2 className="text-sm font-semibold text-gray-600 mb-3">
          可用卡券
        </h2>

        <div className="space-y-3">
          {vouchers.map((voucher) => {
            const isExpired = voucher.expiryDate < todayStr
            const isUsedUp = voucher.remainingSessions === 0
            const isDisabled = isExpired || isUsedUp
            const isSelected = selectedVoucherId === voucher.id
            const isApplicable = voucher.applicableProjects.includes(
              actualProject
            )

            return (
              <motion.div
                key={voucher.id}
                layout
                className={cn(
                  'relative rounded-xl2 overflow-hidden bg-white border-2 transition-colors cursor-pointer',
                  isSelected
                    ? 'border-primary-500 shadow-lg shadow-primary-500/20'
                    : 'border-transparent shadow-md',
                  isDisabled && 'opacity-60 cursor-not-allowed',
                  !isApplicable && !isDisabled && 'opacity-75'
                )}
                onClick={() =>
                  !isDisabled && handleSelectVoucher(voucher.id)
                }
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

                {!isApplicable && !isDisabled && (
                  <div className="absolute top-3 right-3 z-10">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600">
                      不适用
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
                            className={cn(
                              'text-[10px] px-1.5 py-0.5 rounded',
                              proj === actualProject
                                ? 'bg-green-100 text-green-700'
                                : 'bg-warm-100 text-gray-600'
                            )}
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
            onClick={() => {
              setShowMismatchModal(false)
              setActiveMismatchAction(null)
              setPriceDiffInput('')
              setChangeItemNote('')
              setFrontDeskNote('')
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl2 p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  卡券项目与实际治疗不一致
                </h3>
                <button
                  onClick={() => {
                    setShowMismatchModal(false)
                    setActiveMismatchAction(null)
                    setPriceDiffInput('')
                    setChangeItemNote('')
                    setFrontDeskNote('')
                  }}
                  className="p-1 rounded hover:bg-warm-100"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                卡券「{selectedVoucher.name}」适用项目为{' '}
                {selectedVoucher.applicableProjects.join('、')}
                ，与实际治疗「{actualProject}」不一致，请选择处理方式：
              </p>

              {!activeMismatchAction ? (
                <div className="space-y-3">
                  <button
                    onClick={() => handleMismatchAction('change_item')}
                    className="w-full py-3 px-4 rounded-xl2 bg-warm-100 text-gray-700 font-semibold text-base flex items-center justify-between hover:bg-warm-200 transition-colors"
                  >
                    <span>改项</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleMismatchAction('price_diff')}
                    className="w-full py-3 px-4 rounded-xl2 bg-amber-500 text-white font-semibold text-base flex items-center justify-between hover:bg-amber-600 transition-colors"
                  >
                    <span>补差价</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleMismatchAction('to_front_desk')}
                    className="w-full py-3 px-4 rounded-xl2 bg-coral-500 text-white font-semibold text-base flex items-center justify-between hover:bg-coral-600 transition-colors"
                  >
                    <span>转前台处理</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              ) : activeMismatchAction === 'price_diff' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      补差价金额（元）
                    </label>
                    <input
                      type="number"
                      value={priceDiffInput}
                      onChange={(e) => setPriceDiffInput(e.target.value)}
                      placeholder="请输入差价金额"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl2 text-lg font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setActiveMismatchAction(null)}
                      className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl2 hover:bg-gray-300 transition-colors"
                    >
                      返回
                    </button>
                    <button
                      onClick={handleConfirmMismatchAction}
                      disabled={
                        !priceDiffInput ||
                        parseFloat(priceDiffInput) <= 0
                      }
                      className="flex-1 py-3 bg-amber-500 text-white font-semibold rounded-xl2 hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      确认补差 ¥{priceDiffInput}
                    </button>
                  </div>
                </div>
              ) : activeMismatchAction === 'change_item' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      改项说明
                    </label>
                    <textarea
                      value={changeItemNote}
                      onChange={(e) => setChangeItemNote(e.target.value)}
                      placeholder="请输入改项原因和变更内容..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl2 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setActiveMismatchAction(null)}
                      className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl2 hover:bg-gray-300 transition-colors"
                    >
                      返回
                    </button>
                    <button
                      onClick={handleConfirmMismatchAction}
                      disabled={!changeItemNote.trim()}
                      className="flex-1 py-3 bg-warm-100 text-gray-800 font-semibold rounded-xl2 hover:bg-warm-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      确认改项
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-coral-500/10 border border-coral-500/30 rounded-xl2">
                    <p className="text-xs text-coral-700">
                      <AlertTriangle className="w-3 h-3 inline mr-1" />
                      转前台处理将不扣除卡券次数，需前台人员后续处理
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      转前台备注
                    </label>
                    <textarea
                      value={frontDeskNote}
                      onChange={(e) => setFrontDeskNote(e.target.value)}
                      placeholder="请输入需要前台处理的事项..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl2 focus:outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setActiveMismatchAction(null)}
                      className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl2 hover:bg-gray-300 transition-colors"
                    >
                      返回
                    </button>
                    <button
                      onClick={handleConfirmMismatchAction}
                      className="flex-1 py-3 bg-coral-500 text-white font-semibold rounded-xl2 hover:bg-coral-600 transition-colors"
                    >
                      转前台
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setShowMismatchModal(false)
                  setActiveMismatchAction(null)
                  setPriceDiffInput('')
                  setChangeItemNote('')
                  setFrontDeskNote('')
                }}
                className="w-full mt-4 py-2 text-sm text-gray-400 hover:text-gray-600"
              >
                取消
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVoucherModal && usedVoucherData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-6"
            onClick={() => setShowVoucherModal(false)}
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
                  核销凭证
                </h3>
                <button
                  onClick={() => setShowVoucherModal(false)}
                  className="p-1 rounded hover:bg-warm-100"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">凭证编号</span>
                  <span className="font-mono font-medium text-gray-800">
                    {usedVoucherData.traceNo}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">核销时间</span>
                  <span className="text-gray-800">
                    {new Date().toLocaleString('zh-CN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">操作人</span>
                  <span className="text-gray-800">
                    {currentStaff?.name || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">顾客</span>
                  <span className="text-gray-800">{patient.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">治疗项目</span>
                  <span className="text-gray-800">{actualProject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">使用卡券</span>
                  <span className="text-gray-800">
                    {usedVoucherData.voucher.name}
                  </span>
                </div>
                {usedVoucherData.treatmentType !== 'normal' && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">处理方式</span>
                    <span
                      className={cn(
                        'font-medium',
                        usedVoucherData.treatmentType === 'change_item' &&
                          'text-gray-800',
                        usedVoucherData.treatmentType === 'price_diff' &&
                          'text-amber-600',
                        usedVoucherData.treatmentType ===
                          'to_front_desk' && 'text-coral-600'
                      )}
                    >
                      {usedVoucherData.treatmentType === 'change_item' && '改项'}
                      {usedVoucherData.treatmentType === 'price_diff' &&
                        '补差价'}
                      {usedVoucherData.treatmentType === 'to_front_desk' &&
                        '转前台'}
                    </span>
                  </div>
                )}
                <div className="border-t border-warm-200 pt-3">
                  <div className="flex items-center justify-center gap-6 mb-3">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">核销前</p>
                      <p className="text-2xl font-mono font-bold text-gray-800">
                        {usedVoucherData.before}
                      </p>
                    </div>
                    <Minus className="w-5 h-5 text-gray-400" />
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">本次</p>
                      <p className="text-2xl font-mono font-bold text-coral-500">
                        {usedVoucherData.treatmentType === 'to_front_desk'
                          ? 0
                          : 1}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">核销后</p>
                      <p className="text-2xl font-mono font-bold text-primary-600">
                        {usedVoucherData.after}
                      </p>
                    </div>
                  </div>
                  <div className="text-center text-xs text-gray-400">
                    剩余 {usedVoucherData.after} 次 / 总计{' '}
                    {usedVoucherData.voucher.totalSessions} 次 / 已用{' '}
                    {usedVoucherData.voucher.totalSessions -
                      usedVoucherData.after}{' '}
                    次
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowVoucherModal(false)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl2 hover:bg-gray-300 transition-colors"
                >
                  关闭
                </button>
                <button
                  onClick={handlePrintVoucher}
                  className="flex-1 py-3 bg-primary-500 text-white font-semibold rounded-xl2 hover:bg-primary-600 transition-colors"
                >
                  <Printer className="w-4 h-4 inline mr-1" />
                  打印凭证
                </button>
              </div>
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
              {usedVoucherData && (
                <div className="mb-3">
                  <div className="bg-gradient-to-r from-primary-50 to-primary-100/30 rounded-xl2 p-4 border border-primary-200/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-primary-600">
                        核销成功 · {usedVoucherData.traceNo}
                      </span>
                      <button
                        onClick={() => setShowVoucherModal(true)}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                      >
                        查看详情
                      </button>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                      <div className="text-center">
                        <p className="text-[10px] text-gray-500 mb-0.5">
                          核销前
                        </p>
                        <p className="text-xl font-mono font-bold text-gray-800">
                          {usedVoucherData.before}
                        </p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-coral-100 flex items-center justify-center">
                        <Minus className="w-3 h-3 text-coral-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-gray-500 mb-0.5">
                          本次
                        </p>
                        <p className="text-xl font-mono font-bold text-coral-600">
                          {usedVoucherData.treatmentType === 'to_front_desk'
                            ? 0
                            : 1}
                        </p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                        <ArrowRight className="w-3 h-3 text-primary-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-gray-500 mb-0.5">
                          核销后
                        </p>
                        <p className="text-xl font-mono font-bold text-primary-600">
                          {usedVoucherData.after}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 text-center text-xs text-gray-500">
                      {usedVoucherData.treatmentType === 'to_front_desk'
                        ? '已转前台处理，未扣卡券次数'
                        : `本次使用1次，已累计使用 ${usedVoucherData.voucher.totalSessions - usedVoucherData.after} 次，剩余 ${usedVoucherData.after} 次`}
                    </div>
                  </div>
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
