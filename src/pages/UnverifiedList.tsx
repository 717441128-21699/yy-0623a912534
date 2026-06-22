import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileCheck,
  Check,
  CheckSquare,
  Square,
} from 'lucide-react'
import useStore from '@/store/useStore'
import { cn } from '@/lib/utils'

const roomLabel: Record<string, string> = {
  skin_treatment: '皮肤科治疗室',
  photoelectric: '光电室',
  injection: '注射室',
}

export default function UnverifiedList() {
  const appointments = useStore((s) => s.appointments)
  const getPatientById = useStore((s) => s.getPatientById)
  const updateAppointmentStatus = useStore((s) => s.updateAppointmentStatus)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const completedList = appointments.filter(
    (a) => a.status === 'completed'
  )

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selectedIds.size === completedList.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(completedList.map((a) => a.id)))
    }
  }

  const handleVerify = (id: string) => {
    updateAppointmentStatus(id, 'verified')
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  const handleBatchVerify = () => {
    selectedIds.forEach((id) => {
      updateAppointmentStatus(id, 'verified')
    })
    setSelectedIds(new Set())
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
          {completedList.length > 0 && (
            <span className="text-sm text-gray-500">
              共 {completedList.length} 条记录
            </span>
          )}
        </div>

        {completedList.length > 0 && (
          <div className="flex items-center justify-between mt-2">
            <button
              onClick={toggleAll}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
            >
              {selectedIds.size === completedList.length ? (
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
        {completedList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <FileCheck className="w-12 h-12 mb-3" />
            <p className="text-base">暂无未核销记录</p>
          </div>
        ) : (
          <div className="space-y-3">
            {completedList.map((apt, i) => {
              const patient = getPatientById(apt.patientId)
              const isSelected = selectedIds.has(apt.id)
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
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">
                          已完成
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{apt.projectName}</span>
                        <span>{roomLabel[apt.room] ?? apt.room}</span>
                        <span>{apt.scheduledTime}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleVerify(apt.id)}
                      className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 active:bg-primary-700 transition-colors flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      核销
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
