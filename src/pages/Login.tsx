import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Stethoscope, Zap, Syringe, LogIn, ShieldCheck, User } from 'lucide-react'
import useStore from '@/store/useStore'
import type { Room } from '@/types'
import { cn } from '@/lib/utils'

const rooms: { value: Room; label: string; icon: React.ReactNode }[] = [
  { value: 'skin_treatment', label: '皮肤科治疗室', icon: <Stethoscope className="w-6 h-6" /> },
  { value: 'photoelectric', label: '光电室', icon: <Zap className="w-6 h-6" /> },
  { value: 'injection', label: '注射室', icon: <Syringe className="w-6 h-6" /> },
]

export default function Login() {
  const [staffId, setStaffId] = useState('')
  const [password, setPassword] = useState('')
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [error, setError] = useState('')
  const [isFrontDesk, setIsFrontDesk] = useState(false)

  const login = useStore((s) => s.login)
  const navigate = useNavigate()

  useEffect(() => {
    const id = staffId.trim().toUpperCase()
    setIsFrontDesk(id.startsWith('S007') || id.startsWith('S008'))
  }, [staffId])

  const handleLogin = () => {
    setError('')
    if (!staffId.trim()) {
      setError('请输入工号')
      return
    }
    if (!password.trim()) {
      setError('请输入密码')
      return
    }
    if (!isFrontDesk && !selectedRoom) {
      setError('请选择诊室')
      return
    }
    const success = login(staffId, password, isFrontDesk ? undefined : selectedRoom ?? undefined)
    if (!success) {
      setError('工号或密码错误')
      return
    }
    if (isFrontDesk) {
      navigate('/front-desk')
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary-900 to-primary-700 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white tracking-wide">诊疗核销台</h1>
        <p className="mt-2 text-primary-200 text-sm">卡券核销 · 治疗确认 · 术后管理</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-xl2 p-8 border border-white/20"
      >
        <div className="space-y-4">
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-300" />
            <input
              type="text"
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              placeholder="请输入工号"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-primary-300 focus:outline-none focus:border-primary-400 transition"
            />
          </div>

          <div className="relative">
            <LogIn className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-300" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-primary-300 focus:outline-none focus:border-primary-400 transition"
            />
          </div>

          <div className="flex gap-3 pt-2">
            {!isFrontDesk && rooms.map((room) => (
              <button
                key={room.value}
                onClick={() => setSelectedRoom(room.value)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-2 py-4 rounded-lg border-2 transition-all',
                  selectedRoom === room.value
                    ? 'border-primary-500 bg-primary-500/20 text-white'
                    : 'border-white/20 bg-white/5 text-primary-200 hover:border-white/40'
                )}
              >
                {room.icon}
                <span className="text-xs font-medium">{room.label}</span>
              </button>
            ))}
            {isFrontDesk && (
              <div className="w-full flex flex-col items-center gap-2 py-4 rounded-lg border-2 border-primary-500 bg-primary-500/20 text-white">
                <User className="w-6 h-6" />
                <span className="text-xs font-medium">前台工作台</span>
              </div>
            )}
          </div>

          {error && (
            <p className="text-coral-500 text-sm text-center">{error}</p>
          )}

          <button
            onClick={handleLogin}
            className="w-full py-3 rounded-lg bg-primary-500 text-white font-semibold hover:bg-primary-600 active:bg-primary-700 transition-colors"
          >
            登录
          </button>
        </div>
      </motion.div>
    </div>
  )
}
