import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  FileCheck,
  Check,
  CheckSquare,
  Square,
  X,
  Eye,
  Clock,
  User,
  Tag,
  ArrowLeftRight,
  AlertTriangle,
  Send,
  Stethoscope,
  Syringe,
  FileText,
} from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import useStore from '@/store/useStore'
import { cn } from '@/lib/utils'
import type { Appointment, AppointmentStatus, TreatmentRecord, VerificationRecord, Voucher, Patient, SupervisorReviewResult, FrontDeskResultType, Staff } from '@/types'

const roomLabel: Record<string, string> = {
  skin_treatment: '皮肤科治疗室',
  photoelectric: '光电室',
  injection: '注射室',
}

const statusConfig: Record<string, { label: string; className: string }> = {
  treatment_completed: {
    label: '治疗完成未核销',
    className: 'bg-blue-500/10 text-blue-600',
  },
  voucher_deducted: {
    label: '已扣卡券未术后',
    className: 'bg-purple-500/10 text-purple-600',
  },
  to_front_desk: {
    label: '转前台处理',
    className: 'bg-orange-500/10 text-orange-600',
  },
}

const filterTabs: { key: AppointmentStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'treatment_completed', label: '治疗完成' },
  { key: 'voucher_deducted', label: '已扣卡券' },
  { key: 'to_front_desk', label: '转前台' },
]

const validStatuses: AppointmentStatus[] = [
  'treatment_completed',
  'voucher_deducted',
  'to_front_desk',
]

const treatmentTypeLabel: Record<string, { label: string; className: string }> = {
  normal: { label: '正常治疗', className: 'bg-green-500/10 text-green-600' },
  change_item: { label: '换项目', className: 'bg-yellow-500/10 text-yellow-600' },
  price_diff: { label: '补差价', className: 'bg-red-500/10 text-red-600' },
  to_front_desk: { label: '转前台', className: 'bg-orange-500/10 text-orange-600' },
}

const frontDeskResultLabel: Record<string, string> = {
  supplement_deduct: '补扣卡券',
  price_diff: '补差价',
  change_item: '改项处理',
  void: '作废',
}

const supervisorReviewLabel: Record<string, { label: string; className: string }> = {
  approved: { label: '复核通过', className: 'bg-green-500/10 text-green-600' },
  returned: { label: '退回补术后', className: 'bg-amber-500/10 text-amber-600' },
  to_front_desk: { label: '转前台处理', className: 'bg-orange-500/10 text-orange-600' },
}

export default function UnverifiedList() {
  const appointments = useStore((s) => s.appointments)
  const getPatientById = useStore((s) => s.getPatientById)
  const updateAppointmentStatus = useStore((s) => s.updateAppointmentStatus)
  const getTreatmentRecordByAppointmentId = useStore((s) => s.getTreatmentRecordByAppointmentId)
  const getVerificationByAppointmentId = useStore((s) => s.getVerificationByAppointmentId)
  const updateTreatmentRecord = useStore((s) => s.updateTreatmentRecord)
  const getVoucherById = useStore((s) => s.getVoucherById)
  const reviewVerification = useStore((s) => s.reviewVerification)
  const processFrontDeskResult = useStore((s) => s.processFrontDeskResult)
  const getTimelineByAppointmentId = useStore((s) => s.getTimelineByAppointmentId)
  const currentStaff = useStore((s) => s.currentStaff)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [activeFilter, setActiveFilter] = useState<AppointmentStatus | 'all'>('all')
  const [detailAppointment, setDetailAppointment] = useState<Appointment | null>(null)

  const filteredList = useMemo(() => {
    return appointments.filter((a) => {
      if (!validStatuses.includes(a.status)) return false
      if (activeFilter === 'all') return true
      return a.status === activeFilter
    })
  }, [appointments, activeFilter])

  const formatDate = (isoDate: string) => {
    try {
      return format(new Date(isoDate), 'yyyy-MM-dd HH:mm', { locale: zhCN })
    } catch {
      return isoDate
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selectedIds.size === filteredList.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredList.map((a) => a.id)))
    }
  }

  const handleVerify = (id: string) => {
    updateAppointmentStatus(id, 'verified')
    const treatment = getTreatmentRecordByAppointmentId(id)
    if (treatment) {
      updateTreatmentRecord(treatment.id, { postOpConfirmed: true })
    }
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const handleBatchVerify = () => {
    selectedIds.forEach((id) => {
      updateAppointmentStatus(id, 'verified')
      const treatment = getTreatmentRecordByAppointmentId(id)
      if (treatment) {
        updateTreatmentRecord(treatment.id, { postOpConfirmed: true })
      }
    })
    setSelectedIds(new Set())
  }

  const handleViewDetail = (apt: Appointment) => {
    setDetailAppointment(apt)
  }

  const handleCloseDetail = () => {
    setDetailAppointment(null)
  }

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-warm-200 px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <FileCheck className="w-5 h-5 text-primary-500" />
            <h1 className="text-lg font-bold text-gray-800">
              已完成未核销清单
            </h1>
          </div>
          {filteredList.length > 0 && (
            <span className="text-sm text-gray-500">
              共 {filteredList.length} 条记录
            </span>
          )}
        </div>

        <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveFilter(tab.key)
                setSelectedIds(new Set())
              }}
              className={cn(
                'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                activeFilter === tab.key
                  ? 'bg-primary-500 text-white'
                  : 'bg-warm-100 text-gray-600 hover:bg-warm-200'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filteredList.length > 0 && (
          <div className="flex items-center justify-between mt-2">
            <button
              onClick={toggleAll}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
            >
              {selectedIds.size === filteredList.length ? (
                <CheckSquare className="w-4 h-4 text-primary-500" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              <span>全选</span>
            </button>
            <button
              disabled={selectedIds.size === 0}
              onClick={handleBatchVerify}
              className={cn(
                'px-4 py-1.5 rounded-xl text-sm font-semibold transition-colors',
                selectedIds.size > 0
                  ? 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700'
                  : 'bg-warm-200 text-gray-400 cursor-not-allowed'
              )}
            >
              批量核销 ({selectedIds.size})
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 px-6 py-4 overflow-y-auto">
        {filteredList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <FileCheck className="w-12 h-12 mb-3" />
            <p className="text-base">暂无未核销记录</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredList.map((apt, i) => {
              const patient = getPatientById(apt.patientId)
              const isSelected = selectedIds.has(apt.id)
              const treatment = getTreatmentRecordByAppointmentId(apt.id)
              const status = statusConfig[apt.status]

              return (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl2 border border-warm-200 p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleSelect(apt.id)}
                      className="flex-shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-primary-500" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-300" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base font-bold text-gray-800">
                          {patient?.name ?? '未知顾客'}
                        </span>
                        <span className={cn(
                          'text-[10px] px-2 py-0.5 rounded-full font-medium',
                          status.className
                        )}>
                          {status.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <span>{apt.projectName}</span>
                        <span>{roomLabel[apt.room] ?? apt.room}</span>
                      </div>

                      {treatment?.endTime && (
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>治疗结束: {formatDate(treatment.endTime)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetail(apt)}
                        className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-warm-100 text-gray-600 text-sm font-semibold hover:bg-warm-200 transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        查看详情
                      </button>
                      <button
                        onClick={() => handleVerify(apt.id)}
                        className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 active:bg-primary-700 transition-colors flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        核销
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>

      <AnimatePresence>
        {detailAppointment && (
          <DetailModal
            appointment={detailAppointment}
            onClose={handleCloseDetail}
            getPatientById={getPatientById}
            getTreatmentRecordByAppointmentId={getTreatmentRecordByAppointmentId}
            getVerificationByAppointmentId={getVerificationByAppointmentId}
            getVoucherById={getVoucherById}
            getTimelineByAppointmentId={getTimelineByAppointmentId}
            reviewVerification={reviewVerification}
            processFrontDeskResult={processFrontDeskResult}
            formatDate={formatDate}
            currentStaff={currentStaff}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

interface DetailModalProps {
  appointment: Appointment
  onClose: () => void
  getPatientById: (id: string) => Patient | undefined
  getTreatmentRecordByAppointmentId: (id: string) => TreatmentRecord | undefined
  getVerificationByAppointmentId: (id: string) => VerificationRecord | undefined
  getVoucherById: (id: string) => Voucher | undefined
  getTimelineByAppointmentId: (id: string) => Array<{ key: string; label: string; time?: string; status: 'done' | 'pending' | 'current' }>
  reviewVerification: (verificationId: string, result: SupervisorReviewResult, note?: string) => void
  processFrontDeskResult: (verificationId: string, resultType: FrontDeskResultType, note?: string) => void
  formatDate: (isoDate: string) => string
  currentStaff: Staff | null
}

function DetailModal({
  appointment,
  onClose,
  getPatientById,
  getTreatmentRecordByAppointmentId,
  getVerificationByAppointmentId,
  getVoucherById,
  getTimelineByAppointmentId,
  reviewVerification,
  processFrontDeskResult,
  formatDate,
}: DetailModalProps) {
  const patient = getPatientById(appointment.patientId)
  const treatment = getTreatmentRecordByAppointmentId(appointment.id)
  const verification = getVerificationByAppointmentId(appointment.id)
  const voucher = verification?.voucherId ? getVoucherById(verification.voucherId) : undefined
  const timeline = getTimelineByAppointmentId(appointment.id)

  const [showReviewActions, setShowReviewActions] = useState(false)
  const [reviewNote, setReviewNote] = useState('')
  const [showFrontDeskForm, setShowFrontDeskForm] = useState(false)
  const [frontDeskResultType, setFrontDeskResultType] = useState<FrontDeskResultType | null>(null)
  const [frontDeskResultNote, setFrontDeskResultNote] = useState('')

  const canReview = verification && appointment.status === 'voucher_deducted'
  const canProcessFrontDesk = verification && appointment.status === 'to_front_desk' && !verification.frontDeskProcessed

  const handleReview = (result: SupervisorReviewResult) => {
    if (!verification) return
    reviewVerification(verification.id, result, reviewNote || undefined)
    setShowReviewActions(false)
    setReviewNote('')
  }

  const handleFrontDeskProcess = () => {
    if (!verification || !frontDeskResultType) return
    processFrontDeskResult(verification.id, frontDeskResultType, frontDeskResultNote || undefined)
    setShowFrontDeskForm(false)
    setFrontDeskResultType(null)
    setFrontDeskResultNote('')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-warm-200">
          <h2 className="text-lg font-bold text-gray-800">核销详情</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-warm-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-warm-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-800">
                  {patient?.name ?? '未知顾客'}
                </div>
                <div className="text-sm text-gray-500">
                  {appointment.projectName} · {roomLabel[appointment.room] ?? appointment.room}
                </div>
              </div>
              <span className={cn(
                'text-[10px] px-2 py-0.5 rounded-full font-medium',
                statusConfig[appointment.status]?.className
              )}>
                {statusConfig[appointment.status]?.label}
              </span>
            </div>

            <div className="p-4 border border-warm-200 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-500" />
                完整流程时间线
              </h3>
              <div className="relative pl-8">
                {timeline.map((item, idx) => (
                  <div key={item.key} className="relative pb-4 last:pb-0">
                    {idx < timeline.length - 1 && (
                      <div className={cn(
                        "absolute left-[-1.25rem] top-5 bottom-0 w-0.5",
                        item.status === 'done' ? 'bg-primary-300' : 'bg-warm-200'
                      )} />
                    )}
                    <div className={cn(
                      "absolute left-[-1.625rem] top-0 w-6 h-6 rounded-full flex items-center justify-center",
                      item.status === 'done' && 'bg-primary-500',
                      item.status === 'current' && 'bg-amber-500 ring-4 ring-amber-200',
                      item.status === 'pending' && 'bg-gray-200'
                    )}>
                      {item.status === 'done' ? (
                        <Check className="w-3.5 h-3.5 text-white" />
                      ) : item.status === 'current' ? (
                        <Clock className="w-3 h-3 text-white" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                      )}
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <span className={cn(
                        "text-sm font-medium",
                        item.status === 'done' && 'text-gray-700',
                        item.status === 'current' && 'text-amber-700 font-semibold',
                        item.status === 'pending' && 'text-gray-400'
                      )}>
                        {item.label}
                      </span>
                      <span className={cn(
                        "text-xs font-mono",
                        item.status === 'done' && 'text-gray-500',
                        item.status === 'current' && 'text-amber-600',
                        item.status === 'pending' && 'text-gray-300'
                      )}>
                        {item.time ? formatDate(item.time) : '待完成'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {verification ? (
              <div className="space-y-4">
                <div className="p-4 border border-green-200 bg-green-50/50 rounded-xl">
                  <h3 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <FileCheck className="w-4 h-4" />
                    核销凭证
                  </h3>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">核销流水号</span>
                      <span className="font-mono font-medium text-gray-800">{verification.traceNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">操作人</span>
                      <span className="font-medium text-gray-800">{verification.operatorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">使用卡券</span>
                      <span className="font-medium text-gray-800">
                        {voucher?.name ?? verification.voucherName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">卡券类型</span>
                      <span className="font-medium text-gray-800">
                        {verification.voucherType === 'course_card' ? '疗程卡' :
                         verification.voucherType === 'experience_voucher' ? '体验券' : '赠送次数'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">治疗类型</span>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-medium',
                        treatmentTypeLabel[verification.treatmentType]?.className
                      )}>
                        {treatmentTypeLabel[verification.treatmentType]?.label}
                      </span>
                    </div>
                    <div className="border-t border-green-200 pt-2.5 mt-2.5">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-gray-500">核销前次数</span>
                        <span className="font-medium text-gray-800">{verification.sessionsBefore} 次</span>
                      </div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-gray-500">本次使用</span>
                        <span className="font-medium text-red-600">- {verification.sessionsUsed} 次</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">剩余次数</span>
                        <span className="font-semibold text-primary-600">{verification.sessionsAfter} 次</span>
                      </div>
                    </div>
                    {verification.priceDiffAmount !== undefined && verification.priceDiffAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">补差价金额</span>
                        <span className="font-medium text-red-600">¥{verification.priceDiffAmount}</span>
                      </div>
                    )}
                    {verification.changeItemNote && (
                      <div>
                        <div className="text-gray-500 mb-1">改项说明</div>
                        <div className="p-2 bg-white rounded-lg text-gray-700 text-sm">
                          {verification.changeItemNote}
                        </div>
                      </div>
                    )}
                    {verification.frontDeskNote && (
                      <div>
                        <div className="text-gray-500 mb-1">转前台备注</div>
                        <div className="p-2 bg-white rounded-lg text-gray-700 text-sm">
                          {verification.frontDeskNote}
                        </div>
                      </div>
                    )}
                    <div className="border-t border-green-200 pt-2.5 mt-2.5 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">核销时间</span>
                        <span className="font-medium text-gray-700">
                          {formatDate(verification.verifiedAt)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">顾客确认</span>
                        {verification.patientConfirmed ? (
                          <div className="text-right">
                            <span className="text-green-600 font-medium flex items-center gap-1 justify-end">
                              <Check className="w-4 h-4" />
                              已确认
                            </span>
                            {verification.patientConfirmedAt && (
                              <span className="text-xs text-gray-400 block mt-0.5">
                                {formatDate(verification.patientConfirmedAt)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-orange-600 font-medium">待确认</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {verification.supervisorReviewed && (
                  <div className="p-4 border border-purple-200 bg-purple-50/50 rounded-xl">
                    <h3 className="text-sm font-semibold text-purple-800 mb-3 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4" />
                      主管复核
                    </h3>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">复核结果</span>
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full font-medium',
                          supervisorReviewLabel[verification.supervisorReviewResult ?? '']?.className
                        )}>
                          {supervisorReviewLabel[verification.supervisorReviewResult ?? '']?.label ?? '—'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">复核人</span>
                        <span className="font-medium text-gray-800">{verification.supervisorName ?? '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">复核时间</span>
                        <span className="font-medium text-gray-700">
                          {verification.supervisorReviewedAt ? formatDate(verification.supervisorReviewedAt) : '—'}
                        </span>
                      </div>
                      {verification.supervisorReviewNote && (
                        <div>
                          <div className="text-gray-500 mb-1">复核备注</div>
                          <div className="p-2 bg-white rounded-lg text-gray-700 text-sm">
                            {verification.supervisorReviewNote}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {verification.frontDeskProcessed && (
                  <div className="p-4 border border-orange-200 bg-orange-50/50 rounded-xl">
                    <h3 className="text-sm font-semibold text-orange-800 mb-3 flex items-center gap-2">
                      <ArrowLeftRight className="w-4 h-4" />
                      前台处理结果
                    </h3>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">处理方式</span>
                        <span className="font-medium text-orange-700">
                          {frontDeskResultLabel[verification.frontDeskResultType ?? ''] ?? '—'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">处理人</span>
                        <span className="font-medium text-gray-800">
                          {verification.frontDeskProcessedByName ?? '—'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">处理时间</span>
                        <span className="font-medium text-gray-700">
                          {verification.frontDeskProcessedAt ? formatDate(verification.frontDeskProcessedAt) : '—'}
                        </span>
                      </div>
                      {verification.frontDeskResultNote && (
                        <div>
                          <div className="text-gray-500 mb-1">处理说明</div>
                          <div className="p-2 bg-white rounded-lg text-gray-700 text-sm">
                            {verification.frontDeskResultNote}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {canReview && !verification.supervisorReviewed && !showReviewActions && (
                  <button
                    onClick={() => setShowReviewActions(true)}
                    className="w-full py-3 rounded-xl bg-purple-500 text-white font-semibold hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    主管复核处理
                  </button>
                )}

                {canReview && !verification.supervisorReviewed && showReviewActions && (
                  <div className="p-4 border border-purple-200 bg-purple-50/50 rounded-xl space-y-3">
                    <h3 className="text-sm font-semibold text-purple-800 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4" />
                      主管复核
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        复核备注（可选）
                      </label>
                      <textarea
                        value={reviewNote}
                        onChange={(e) => setReviewNote(e.target.value)}
                        placeholder="请输入复核备注..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleReview('approved')}
                        className="py-2 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors flex flex-col items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        通过
                      </button>
                      <button
                        onClick={() => handleReview('returned')}
                        className="py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors flex flex-col items-center gap-1"
                      >
                        <Send className="w-4 h-4" />
                        退回补术后
                      </button>
                      <button
                        onClick={() => handleReview('to_front_desk')}
                        className="py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition-colors flex flex-col items-center gap-1"
                      >
                        <ArrowLeftRight className="w-4 h-4" />
                        转前台
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setShowReviewActions(false)
                        setReviewNote('')
                      }}
                      className="w-full py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                )}

                {canProcessFrontDesk && !showFrontDeskForm && (
                  <button
                    onClick={() => setShowFrontDeskForm(true)}
                    className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                    前台处理结果回填
                  </button>
                )}

                {canProcessFrontDesk && showFrontDeskForm && (
                  <div className="p-4 border border-orange-200 bg-orange-50/50 rounded-xl space-y-3">
                    <h3 className="text-sm font-semibold text-orange-800 flex items-center gap-2">
                      <ArrowLeftRight className="w-4 h-4" />
                      前台处理结果
                    </h3>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        处理方式
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['supplement_deduct', 'price_diff', 'change_item', 'void'] as FrontDeskResultType[]).map((type) => (
                          <button
                            key={type}
                            onClick={() => setFrontDeskResultType(type)}
                            className={cn(
                              'py-2 rounded-lg text-sm font-medium transition-colors',
                              frontDeskResultType === type
                                ? 'bg-orange-500 text-white'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-orange-50'
                            )}
                          >
                            {frontDeskResultLabel[type]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        处理说明（可选）
                      </label>
                      <textarea
                        value={frontDeskResultNote}
                        onChange={(e) => setFrontDeskResultNote(e.target.value)}
                        placeholder="请输入处理说明..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowFrontDeskForm(false)
                          setFrontDeskResultType(null)
                          setFrontDeskResultNote('')
                        }}
                        className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-colors"
                      >
                        取消
                      </button>
                      <button
                        onClick={handleFrontDeskProcess}
                        disabled={!frontDeskResultType}
                        className={cn(
                          'flex-1 py-2 rounded-lg text-sm font-semibold transition-colors',
                          frontDeskResultType
                            ? 'bg-orange-500 text-white hover:bg-orange-600'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        )}
                      >
                        确认提交
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 border-2 border-dashed border-warm-300 rounded-xl text-center">
                <Tag className="w-12 h-12 text-warm-400 mx-auto mb-3" />
                <p className="text-warm-600 font-medium">待核销</p>
                <p className="text-sm text-warm-500 mt-1">该预约尚未完成核销操作</p>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-warm-200 bg-warm-50">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-warm-200 text-gray-700 font-semibold hover:bg-warm-300 transition-colors"
          >
            关闭
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
