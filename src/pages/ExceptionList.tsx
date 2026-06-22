import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  Check,
  X,
  Clock,
  Filter,
} from 'lucide-react'
import useStore from '@/store/useStore'
import { cn } from '@/lib/utils'

const typeLabel: Record<string, string> = {
  voucher_insufficient: '卡券不足',
  patient_dispute: '顾客争议',
  no_voucher_in_system: '系统无券',
  other: '其他',
}

const typeBadgeBg: Record<string, string> = {
  voucher_insufficient: 'bg-amber-100 text-amber-700',
  patient_dispute: 'bg-orange-100 text-orange-700',
  no_voucher_in_system: 'bg-red-100 text-red-700',
  other: 'bg-gray-100 text-gray-700',
}

const statusBadge: Record<string, { label: string; cls: string }> = {
  pending: { label: '待处理', cls: 'bg-amber-100 text-amber-700' },
  approved: { label: '已通过', cls: 'bg-green-100 text-green-700' },
  rejected: { label: '已驳回', cls: 'bg-gray-100 text-gray-500' },
}

const filterTabs = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待处理' },
  { value: 'processed', label: '已处理' },
]

export default function ExceptionList() {
  const exceptions = useStore((s) => s.exceptions)
  const getPatientById = useStore((s) => s.getPatientById)
  const updateException = useStore((s) => s.updateException)
  const currentStaff = useStore((s) => s.currentStaff)

  const [activeFilter, setActiveFilter] = useState('all')

  const filtered = exceptions.filter((e) => {
    if (activeFilter === 'pending') return e.status === 'pending'
    if (activeFilter === 'processed') return e.status !== 'pending'
    return true
  })

  const handleApprove = (id: string) => {
    updateException(id, {
      status: 'approved',
      resolvedAt: new Date().toLocaleString('zh-CN'),
      resolvedBy: currentStaff?.id,
    })
  }

  const handleReject = (id: string) => {
    updateException(id, {
      status: 'rejected',
      resolvedAt: new Date().toLocaleString('zh-CN'),
      resolvedBy: currentStaff?.id,
    })
  }

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-warm-200 px-6 py-4">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h1 className="text-lg font-bold text-gray-800">异常列表</h1>
        </div>

        <div className="flex items-center gap-1 bg-warm-100 rounded-xl2 p-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={cn(
                'flex-1 py-2 rounded-xl text-sm font-semibold transition-colors',
                activeFilter === tab.value
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 px-6 py-4 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Filter className="w-12 h-12 mb-3" />
            <p className="text-base">暂无异常记录</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map((ex, i) => {
                const patient = getPatientById(ex.patientId)
                const badge = statusBadge[ex.status]
                return (
                  <motion.div
                    key={ex.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-xl2 border border-warm-200 p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-base font-bold text-gray-800">
                        {patient?.name ?? '未知顾客'}
                      </span>
                      <span
                        className={cn(
                          'text-[10px] px-2 py-0.5 rounded-full font-medium',
                          typeBadgeBg[ex.type]
                        )}
                      >
                        {typeLabel[ex.type]}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {ex.description || '无描述'}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{ex.createdAt}</span>
                      </div>
                      <span
                        className={cn(
                          'text-[10px] px-2 py-0.5 rounded-full font-medium',
                          badge.cls
                        )}
                      >
                        {badge.label}
                      </span>
                    </div>

                    {ex.status === 'pending' && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-warm-100">
                        <button
                          onClick={() => handleApprove(ex.id)}
                          className="flex-1 py-2 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 active:bg-green-700 transition-colors flex items-center justify-center gap-1"
                        >
                          <Check className="w-4 h-4" />
                          通过
                        </button>
                        <button
                          onClick={() => handleReject(ex.id)}
                          className="flex-1 py-2 rounded-xl bg-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-300 active:bg-gray-400 transition-colors flex items-center justify-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          驳回
                        </button>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  )
}
