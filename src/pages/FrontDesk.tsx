import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeftRight,
  X,
  Clock,
  User,
  Tag,
  CheckCircle,
  AlertTriangle,
  Send,
  Stethoscope,
  Syringe,
  FileText,
  CalendarDays,
} from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import useStore from '@/store/useStore'
import { cn } from '@/lib/utils'
import type {
  Appointment,
  TreatmentRecord,
  VerificationRecord,
  Voucher,
  Patient,
  FrontDeskResultType,
  TimelineItem,
} from '@/types'

const roomLabel: Record<string, string> = {
  skin_treatment: '皮肤科治疗室',
  photoelectric: '光电室',
  injection: '注射室',
}

const frontDeskResultLabel: Record<FrontDeskResultType, string> = {
  supplement_deduct: '补扣卡券',
  price_diff: '补差价',
  change_item: '改项处理',
  void: '作废',
}

const frontDeskResultClass: Record<FrontDeskResultType, string> = {
  supplement_deduct: 'bg-purple-500/10 text-purple-600',
  price_diff: 'bg-amber-500/10 text-amber-600',
  change_item: 'bg-blue-500/10 text-blue-600',
  void: 'bg-gray-500/10 text-gray-600',
}

const frontDeskOptions: { key: FrontDeskResultType; label: string; desc: string }[] = [
  { key: 'supplement_deduct', label: '补扣卡券', desc: '从顾客卡券中扣除对应次数' },
  { key: 'price_diff', label: '补差价', desc: '顾客补交项目差价，不扣卡券' },
  { key: 'change_item', label: '改项处理', desc: '调整为其他适用项目' },
  { key: 'void', label: '作废', desc: '取消本次核销记录' },
]

export default function FrontDesk() {
  const currentStaff = useStore((s) => s.currentStaff)
  const getVerificationsToFrontDesk = useStore((s) => s.getVerificationsToFrontDesk)
  const getPatientById = useStore((s) => s.getPatientById)
  const getAppointmentById = useStore((s) => s.getAppointmentById)
  const getVoucherById = useStore((s) => s.getVoucherById)
  const getTimelineByAppointmentId = useStore((s) => s.getTimelineByAppointmentId)
  const processFrontDeskResult = useStore((s) => s.processFrontDeskResult)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [processingType, setProcessingType] = useState<FrontDeskResultType | null>(null)
  const [processNote, setProcessNote] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const verifications = useMemo(() => getVerificationsToFrontDesk(), [getVerificationsToFrontDesk])

  const selectedVerification = useMemo(() => {
    if (!selectedId) return null
    return verifications.find((v) => v.id === selectedId) ?? null
  }, [selectedId, verifications])

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

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const handleProcess = () => {
    if (!selectedVerification || !processingType || !currentStaff) return
    processFrontDeskResult(selectedVerification.id, processingType, processNote || undefined)
    showToast(`处理完成：${frontDeskResultLabel[processingType]}`)
    setSelectedId(null)
    setProcessingType(null)
    setProcessNote('')
  }

  const today = format(new Date(), 'yyyy年M月d日', { locale: zhCN })

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ArrowLeftRight className="w-6 h-6 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-800">前台工作台</h1>
          <span className="text-gray-500 text-sm ml-2">{today}</span>
        </div>
        <div className="px-4 py-1.5 bg-orange-500/10 text-orange-600 rounded-full text-sm font-medium">
          待处理 {verifications.length} 条
        </div>
      </div>

      {verifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">当前没有需要处理的顾客</p>
          <p className="text-gray-400 text-sm mt-1">主管转前台的顾客会显示在这里</p>
        </div>
      ) : (
        <div className="space-y-3">
          {verifications.map((v) => {
            const patient = getPatientById(v.patientId)
            const appointment = getAppointmentById(v.appointmentId)
            if (!patient || !appointment) return null
            return (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedId(v.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">{patient.name}</span>
                        <span className="text-gray-500 text-sm">{patient.gender === 'female' ? '女' : '男'} {patient.age}岁</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-500">{appointment.projectName}</span>
                        <span className="text-xs text-gray-400">{roomLabel[appointment.room]}</span>
                      </div>
                      {v.supervisorReviewNote && (
                        <p className="text-xs text-orange-600 mt-1">
                          <AlertTriangle className="w-3 h-3 inline mr-1" />
                          主管备注：{v.supervisorReviewNote}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 bg-orange-500/10 text-orange-600 rounded-full text-xs font-medium">
                      转前台
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {format(new Date(v.supervisorReviewedAt!), 'HH:mm', { locale: zhCN })} 转来
                    </p>
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
              className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{selectedPatient.name} - 前台处理</h3>
                  <p className="text-sm text-gray-500">{selectedAppointment.projectName}</p>
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-orange-800 font-medium">主管转前台处理</p>
                      <p className="text-orange-600 text-sm mt-0.5">
                        转来时间：{format(new Date(selectedVerification.supervisorReviewedAt!), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                      </p>
                      {selectedVerification.supervisorReviewNote && (
                        <p className="text-orange-700 text-sm mt-1">主管备注：{selectedVerification.supervisorReviewNote}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> 完整流程时间线
                  </h4>
                  <div className="relative pl-4 space-y-0">
                    {timeline.map((item: TimelineItem, idx: number) => (
                      <div key={item.key} className="relative flex gap-4 pb-3 last:pb-0">
                        {idx < timeline.length - 1 && (
                          <div
                            className={cn(
                              'absolute left-[11px] top-6 w-0.5 -bottom-0',
                              item.status === 'done' ? 'bg-green-300' : 'bg-gray-200'
                            )}
                          />
                        )}
                        <div
                          className={cn(
                            'relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0',
                            item.status === 'done' && 'bg-green-500 text-white',
                            item.status === 'current' && 'bg-amber-500 text-white ring-4 ring-amber-100',
                            item.status === 'pending' && 'bg-gray-200 text-gray-400'
                          )}
                        >
                          {item.status === 'done' ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-white" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-current" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={cn(
                            'text-sm',
                            item.status === 'done' && 'text-gray-700',
                            item.status === 'current' && 'text-amber-700 font-semibold',
                            item.status === 'pending' && 'text-gray-400'
                          )}>
                            {item.label}
                          </p>
                          {item.time && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {format(new Date(item.time), 'HH:mm', { locale: zhCN })}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> 核销凭证信息
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">顾客姓名</p>
                      <p className="text-gray-800 font-medium">{selectedPatient.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">治疗项目</p>
                      <p className="text-gray-800 font-medium">{selectedVerification.actualProject}</p>
                    </div>
                    {selectedVoucher && (
                      <>
                        <div>
                          <p className="text-gray-500">卡券名称</p>
                          <p className="text-gray-800 font-medium">{selectedVoucher.name}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">卡券编号</p>
                          <p className="text-gray-800 font-medium">{selectedVerification.traceNo}</p>
                        </div>
                      </>
                    )}
                    <div>
                      <p className="text-gray-500">核销时间</p>
                      <p className="text-gray-800">
                        {format(new Date(selectedVerification.verifiedAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">操作护士</p>
                      <p className="text-gray-800">{selectedVerification.operatorName}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500">顾客确认</p>
                      <div className="mt-1">
                        {selectedVerification.patientConfirmed ? (
                          <span className="inline-flex items-center gap-1.5 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            已确认
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-orange-500">
                            待确认
                          </span>
                        )}
                        {selectedVerification.patientConfirmedAt && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            确认时间：{format(new Date(selectedVerification.patientConfirmedAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Send className="w-4 h-4" /> 选择处理方式
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {frontDeskOptions.map((opt) => {
                      const selected = processingType === opt.key
                      return (
                        <button
                          key={opt.key}
                          onClick={() => setProcessingType(opt.key)}
                          className={cn(
                            'p-4 rounded-xl border-2 text-left transition-all',
                            selected
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 bg-white hover:border-orange-300'
                          )}
                        >
                          <p className={cn(
                            'font-medium',
                            selected ? 'text-orange-700' : 'text-gray-800'
                          )}>
                            {opt.label}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{opt.desc}</p>
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      处理说明（必填）
                    </label>
                    <textarea
                      value={processNote}
                      onChange={(e) => setProcessNote(e.target.value)}
                      rows={3}
                      placeholder="请详细说明处理情况..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm resize-none"
                    />
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setSelectedId(null)}
                      className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleProcess}
                      disabled={!processingType || !processNote.trim()}
                      className={cn(
                        'flex-1 px-4 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2',
                        processingType && processNote.trim()
                          ? 'bg-orange-500 text-white hover:bg-orange-600'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      )}
                    >
                      <CheckCircle className="w-4 h-4" />
                      确认提交
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-green-600 text-white rounded-full shadow-lg z-[60]"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
