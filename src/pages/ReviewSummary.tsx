import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  FileText,
  X,
  Check,
  CheckCircle,
  Clock,
  User,
  Tag,
  Filter,
  Eye,
  FileCheck,
  ArrowLeftRight,
  Stethoscope,
  CalendarDays,
} from 'lucide-react'
import { format, isToday } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import useStore from '@/store/useStore'
import { cn } from '@/lib/utils'
import type {
  Appointment,
  VerificationRecord,
  Voucher,
  Patient,
  SupervisorReviewResult,
  FrontDeskResultType,
  TimelineItem,
  Room,
} from '@/types'

const roomLabel: Record<string, string> = {
  skin_treatment: '皮肤科治疗室',
  photoelectric: '光电室',
  injection: '注射室',
}

const supervisorReviewLabel: Record<SupervisorReviewResult, { label: string; className: string }> = {
  approved: { label: '通过', className: 'bg-green-500/10 text-green-600' },
  returned: { label: '退回补术后', className: 'bg-amber-500/10 text-amber-600' },
  to_front_desk: { label: '转前台', className: 'bg-orange-500/10 text-orange-600' },
}

const frontDeskResultLabel: Record<FrontDeskResultType, string> = {
  supplement_deduct: '补扣卡券',
  price_diff: '补差价',
  change_item: '改项处理',
  void: '作废',
}

const treatmentTypeLabel: Record<string, { label: string; className: string }> = {
  normal: { label: '正常核销', className: 'bg-green-500/10 text-green-600' },
  change_item: { label: '改项', className: 'bg-blue-500/10 text-blue-600' },
  price_diff: { label: '补差', className: 'bg-amber-500/10 text-amber-600' },
  to_front_desk: { label: '转前台', className: 'bg-orange-500/10 text-orange-600' },
}

const ROOMS: { key: Room | 'all'; label: string }[] = [
  { key: 'all', label: '全部诊室' },
  { key: 'skin_treatment', label: '皮肤科治疗室' },
  { key: 'photoelectric', label: '光电室' },
  { key: 'injection', label: '注射室' },
]

const RESULT_FILTERS: { key: SupervisorReviewResult | 'all'; label: string }[] = [
  { key: 'all', label: '全部结果' },
  { key: 'approved', label: '通过' },
  { key: 'returned', label: '退回补术后' },
  { key: 'to_front_desk', label: '转前台' },
]

export default function ReviewSummary() {
  const currentStaff = useStore((s) => s.currentStaff)
  const getReviewedVerifications = useStore((s) => s.getReviewedVerifications)
  const getPatientById = useStore((s) => s.getPatientById)
  const getAppointmentById = useStore((s) => s.getAppointmentById)
  const getVoucherById = useStore((s) => s.getVoucherById)
  const getTimelineByAppointmentId = useStore((s) => s.getTimelineByAppointmentId)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState<'today' | 'all'>('today')
  const [roomFilter, setRoomFilter] = useState<Room | 'all'>('all')
  const [resultFilter, setResultFilter] = useState<SupervisorReviewResult | 'all'>('all')

  const allRecords = useMemo(() => getReviewedVerifications(), [getReviewedVerifications])

  const filteredRecords = useMemo(() => {
    return allRecords.filter((v) => {
      if (dateFilter === 'today' && !isToday(new Date(v.supervisorReviewedAt!))) return false
      const appointment = getAppointmentById(v.appointmentId)
      if (roomFilter !== 'all' && appointment?.room !== roomFilter) return false
      if (resultFilter !== 'all' && v.supervisorReviewResult !== resultFilter) return false
      return true
    })
  }, [allRecords, dateFilter, roomFilter, resultFilter, getAppointmentById])

  const stats = useMemo(() => {
    const today = allRecords.filter((v) => isToday(new Date(v.supervisorReviewedAt!)))
    return {
      total: allRecords.length,
      today: today.length,
      approved: today.filter((v) => v.supervisorReviewResult === 'approved').length,
      returned: today.filter((v) => v.supervisorReviewResult === 'returned').length,
      toFrontDesk: today.filter((v) => v.supervisorReviewResult === 'to_front_desk').length,
    }
  }, [allRecords])

  const selectedVerification = useMemo(() => {
    if (!selectedId) return null
    return allRecords.find((v) => v.id === selectedId) ?? null
  }, [selectedId, allRecords])

  const selectedPatient = useMemo(() => {
    if (!selectedVerification) return null
    return getPatientById(selectedVerification.patientId) ?? null
  }, [selectedVerification, getPatientById])

  const selectedAppointment = useMemo(() => {
    if (!selectedVerification) return null
    return getAppointmentById(selectedVerification.appointmentId) ?? null
  }, [selectedVerification, getAppointmentById])

  const selectedVoucher = useMemo(() => {
    if (!selectedVerification?.voucherId) return null
    return getVoucherById(selectedVerification.voucherId) ?? null
  }, [selectedVerification, getVoucherById])

  const timeline = useMemo(() => {
    if (!selectedVerification) return []
    return getTimelineByAppointmentId(selectedVerification.appointmentId)
  }, [selectedVerification, getTimelineByAppointmentId])

  const formatDate = (dateStr: string) =>
    format(new Date(dateStr), 'yyyy-MM-dd HH:mm', { locale: zhCN })

  const today = format(new Date(), 'yyyy年M月d日', { locale: zhCN })

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-purple-500" />
          <h1 className="text-2xl font-bold text-gray-800">复核记录汇总</h1>
          <span className="text-gray-500 text-sm ml-2">{today}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">今日复核</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{stats.today}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">通过</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">退回补术后</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">{stats.returned}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-500 text-sm">转前台</p>
          <p className="text-3xl font-bold text-orange-600 mt-1">{stats.toFrontDesk}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">筛选：</span>
          </div>

          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setDateFilter('today')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                dateFilter === 'today'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              今天
            </button>
            <button
              onClick={() => setDateFilter('all')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                dateFilter === 'all'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              全部
            </button>
          </div>

          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {ROOMS.map((room) => (
              <button
                key={room.key}
                onClick={() => setRoomFilter(room.key)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  roomFilter === room.key
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {room.label}
              </button>
            ))}
          </div>

          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {RESULT_FILTERS.map((res) => (
              <button
                key={res.key}
                onClick={() => setResultFilter(res.key)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  resultFilter === res.key
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {res.label}
              </button>
            ))}
          </div>

          <div className="ml-auto text-sm text-gray-500">
            共 {filteredRecords.length} 条记录
          </div>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">没有符合条件的复核记录</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map((v) => {
            const patient = getPatientById(v.patientId)
            const appointment = getAppointmentById(v.appointmentId)
            if (!patient || !appointment) return null
            return (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">{patient.name}</span>
                        <span className={cn(
                          'text-[10px] px-2 py-0.5 rounded-full font-medium',
                          supervisorReviewLabel[v.supervisorReviewResult ?? '']?.className
                        )}>
                          {supervisorReviewLabel[v.supervisorReviewResult ?? '']?.label}
                        </span>
                        {v.frontDeskProcessed && v.frontDeskResultType && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-orange-500/10 text-orange-600">
                            {frontDeskResultLabel[v.frontDeskResultType]}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-500">{appointment.projectName}</span>
                        <span className="text-xs text-gray-400">{roomLabel[appointment.room]}</span>
                        <span className="text-xs text-gray-400">
                          复核人：{v.supervisorName}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm text-gray-600 font-medium">
                        {formatDate(v.supervisorReviewedAt!)}
                      </p>
                      {v.patientConfirmed ? (
                        <span className="text-xs text-green-600">顾客已确认</span>
                      ) : (
                        <span className="text-xs text-orange-500">顾客待确认</span>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedId(v.id)}
                      className="px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="w-4 h-4" />
                      详情
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {selectedVerification && selectedPatient && selectedAppointment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedId(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-warm-200">
                <h2 className="text-lg font-bold text-gray-800">复核详情</h2>
                <button
                  onClick={() => setSelectedId(null)}
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
                        {selectedPatient.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {selectedAppointment.projectName} · {roomLabel[selectedAppointment.room]}
                      </div>
                    </div>
                    <span className={cn(
                      'text-[10px] px-2 py-0.5 rounded-full font-medium',
                      supervisorReviewLabel[selectedVerification.supervisorReviewResult ?? '']?.className
                    )}>
                      {supervisorReviewLabel[selectedVerification.supervisorReviewResult ?? '']?.label}
                    </span>
                  </div>

                  <div className="p-4 border border-warm-200 rounded-xl">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary-500" />
                      完整流程时间线
                    </h3>
                    <div className="relative pl-8">
                      {timeline.map((item: TimelineItem, idx: number) => (
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

                  <div className="space-y-4">
                    <div className="p-4 border border-green-200 bg-green-50/50 rounded-xl">
                      <h3 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                        <FileCheck className="w-4 h-4" />
                        核销凭证
                      </h3>
                      <div className="space-y-2.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">核销流水号</span>
                          <span className="font-mono font-medium text-gray-800">{selectedVerification.traceNo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">操作人</span>
                          <span className="font-medium text-gray-800">{selectedVerification.operatorName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">使用卡券</span>
                          <span className="font-medium text-gray-800">
                            {selectedVoucher?.name ?? selectedVerification.voucherName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">治疗类型</span>
                          <span className={cn(
                            'text-xs px-2 py-0.5 rounded-full font-medium',
                            treatmentTypeLabel[selectedVerification.treatmentType]?.className
                          )}>
                            {treatmentTypeLabel[selectedVerification.treatmentType]?.label}
                          </span>
                        </div>
                        <div className="border-t border-green-200 pt-2.5 mt-2.5">
                          <div className="flex justify-between mb-1.5">
                            <span className="text-gray-500">核销前次数</span>
                            <span className="font-medium text-gray-800">{selectedVerification.sessionsBefore} 次</span>
                          </div>
                          <div className="flex justify-between mb-1.5">
                            <span className="text-gray-500">本次使用</span>
                            <span className="font-medium text-red-600">- {selectedVerification.sessionsUsed} 次</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">剩余次数</span>
                            <span className="font-semibold text-primary-600">{selectedVerification.sessionsAfter} 次</span>
                          </div>
                        </div>
                        <div className="border-t border-green-200 pt-2.5 mt-2.5 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">核销时间</span>
                            <span className="font-medium text-gray-700">
                              {formatDate(selectedVerification.verifiedAt)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">顾客确认</span>
                            {selectedVerification.patientConfirmed ? (
                              <div className="text-right">
                                <span className="text-green-600 font-medium flex items-center gap-1 justify-end">
                                  <Check className="w-4 h-4" />
                                  已确认
                                </span>
                                {selectedVerification.patientConfirmedAt && (
                                  <span className="text-xs text-gray-400 block mt-0.5">
                                    {formatDate(selectedVerification.patientConfirmedAt)}
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
                            supervisorReviewLabel[selectedVerification.supervisorReviewResult ?? '']?.className
                          )}>
                            {supervisorReviewLabel[selectedVerification.supervisorReviewResult ?? '']?.label ?? '—'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">复核人</span>
                          <span className="font-medium text-gray-800">{selectedVerification.supervisorName ?? '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">复核时间</span>
                          <span className="font-medium text-gray-700">
                            {selectedVerification.supervisorReviewedAt ? formatDate(selectedVerification.supervisorReviewedAt) : '—'}
                          </span>
                        </div>
                        {selectedVerification.supervisorReviewNote && (
                          <div>
                            <div className="text-gray-500 mb-1">复核备注</div>
                            <div className="p-2 bg-white rounded-lg text-gray-700 text-sm">
                              {selectedVerification.supervisorReviewNote}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedVerification.frontDeskProcessed && (
                      <div className="p-4 border border-orange-200 bg-orange-50/50 rounded-xl">
                        <h3 className="text-sm font-semibold text-orange-800 mb-3 flex items-center gap-2">
                          <ArrowLeftRight className="w-4 h-4" />
                          前台处理结果
                        </h3>
                        <div className="space-y-2.5 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">处理方式</span>
                            <span className="font-medium text-orange-700">
                              {frontDeskResultLabel[selectedVerification.frontDeskResultType ?? ''] ?? '—'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">处理人</span>
                            <span className="font-medium text-gray-800">
                              {selectedVerification.frontDeskProcessedByName ?? '—'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">处理时间</span>
                            <span className="font-medium text-gray-700">
                              {selectedVerification.frontDeskProcessedAt ? formatDate(selectedVerification.frontDeskProcessedAt) : '—'}
                            </span>
                          </div>
                          {selectedVerification.frontDeskResultNote && (
                            <div>
                              <div className="text-gray-500 mb-1">处理说明</div>
                              <div className="p-2 bg-white rounded-lg text-gray-700 text-sm">
                                {selectedVerification.frontDeskResultNote}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedVerification.postOpCompletedAt && (
                      <div className="p-4 border border-blue-200 bg-blue-50/50 rounded-xl">
                        <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          术后交代
                        </h3>
                        <div className="space-y-2.5 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">完成时间</span>
                            <span className="font-medium text-gray-700">
                              {formatDate(selectedVerification.postOpCompletedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
