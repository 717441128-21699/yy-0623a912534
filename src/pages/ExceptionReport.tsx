import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CreditCard,
  Users,
  FileX,
  HelpCircle,
  Camera,
  Send,
} from 'lucide-react'
import useStore from '@/store/useStore'
import type { Exception } from '@/types'
import { cn } from '@/lib/utils'

const exceptionTypes = [
  {
    value: 'voucher_insufficient' as const,
    label: '卡券不足',
    icon: CreditCard,
    bgTint: 'bg-amber-50',
    iconColor: 'text-amber-500',
  },
  {
    value: 'patient_dispute' as const,
    label: '顾客争议',
    icon: Users,
    bgTint: 'bg-orange-50',
    iconColor: 'text-orange-500',
  },
  {
    value: 'no_voucher_in_system' as const,
    label: '系统无券',
    icon: FileX,
    bgTint: 'bg-red-50',
    iconColor: 'text-red-500',
  },
  {
    value: 'other' as const,
    label: '其他',
    icon: HelpCircle,
    bgTint: 'bg-gray-50',
    iconColor: 'text-gray-500',
  },
]

export default function ExceptionReport() {
  const { id: patientId } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const appointmentId = searchParams.get('appointment') ?? ''
  const navigate = useNavigate()

  const getPatientById = useStore((s) => s.getPatientById)
  const getAppointmentById = useStore((s) => s.getAppointmentById)
  const addException = useStore((s) => s.addException)
  const currentStaff = useStore((s) => s.currentStaff)

  const patient = getPatientById(patientId!)

  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [description, setDescription] = useState('')

  const handleSubmit = () => {
    if (!selectedType || !patientId || !currentStaff) return

    addException({
      id: `EX-${Date.now()}`,
      appointmentId,
      patientId,
      reporterId: currentStaff.id,
      type: selectedType as Exception['type'],
      description,
      photos: [],
      status: 'pending',
      createdAt: new Date().toLocaleString('zh-CN'),
    })

    navigate(-1)
  }

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-warm-200 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-warm-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-800">异常上报</h1>
        <span className="ml-auto text-sm text-gray-500">
          {patient?.name ?? ''}
        </span>
      </header>

      <main className="flex-1 px-6 py-4 pb-32 overflow-y-auto">
        <h2 className="text-sm font-semibold text-gray-600 mb-3">
          异常类型
        </h2>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {exceptionTypes.map((item) => {
            const Icon = item.icon
            const isSelected = selectedType === item.value
            return (
              <motion.button
                key={item.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedType(item.value)}
                className={cn(
                  'flex flex-col items-center justify-center gap-2 p-5 rounded-xl2 border-2 transition-colors',
                  item.bgTint,
                  isSelected
                    ? 'border-primary-500 shadow-lg shadow-primary-500/20'
                    : 'border-transparent shadow-md'
                )}
              >
                <Icon className={cn('w-8 h-8', item.iconColor)} />
                <span
                  className={cn(
                    'text-sm font-semibold',
                    isSelected ? 'text-primary-600' : 'text-gray-700'
                  )}
                >
                  {item.label}
                </span>
              </motion.button>
            )
          })}
        </div>

        <h2 className="text-sm font-semibold text-gray-600 mb-3">
          详细描述
        </h2>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="请详细描述异常情况..."
          className="w-full p-4 bg-white rounded-xl2 border border-warm-200 text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          rows={3}
        />

        <h2 className="text-sm font-semibold text-gray-600 mt-6 mb-3">
          拍照上传
        </h2>
        <div className="flex items-center gap-3">
          <button className="flex flex-col items-center justify-center w-20 h-20 bg-white rounded-xl2 border-2 border-dashed border-warm-300 hover:border-primary-400 transition-colors">
            <Camera className="w-6 h-6 text-gray-400" />
            <span className="text-[10px] text-gray-400 mt-1">拍照上传</span>
          </button>
          <div className="w-16 h-16 bg-warm-100 rounded-lg" />
          <div className="w-16 h-16 bg-warm-100 rounded-lg" />
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur border-t border-warm-200 px-6 py-4">
        <button
          disabled={!selectedType}
          onClick={handleSubmit}
          className={cn(
            'w-full py-4 rounded-xl2 text-lg font-bold transition-colors flex items-center justify-center gap-2',
            selectedType
              ? 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700'
              : 'bg-warm-200 text-gray-400 cursor-not-allowed'
          )}
        >
          <Send className="w-5 h-5" />
          提交上报
        </button>
      </div>
    </div>
  )
}
