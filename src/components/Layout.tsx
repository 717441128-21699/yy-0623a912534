import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ClipboardCheck, CalendarDays, AlertTriangle, FileCheck, LogOut, ArrowLeftRight, FileText } from 'lucide-react'
import useStore from '@/store/useStore'
import type { Room } from '@/types'
import { cn } from '@/lib/utils'

const roomNames: Record<Room, string> = {
  skin_treatment: '皮肤科治疗室',
  photoelectric: '光电室',
  injection: '注射室',
}

const roleNames: Record<string, string> = {
  nurse: '护士',
  therapist: '治疗师',
  doctor: '医生',
  supervisor: '主管',
  front_desk: '前台',
}

const navItems = [
  { path: '/', label: '今日排台', icon: CalendarDays, roles: ['nurse', 'therapist', 'doctor', 'supervisor'] },
  { path: '/front-desk', label: '前台工作台', icon: ArrowLeftRight, roles: ['front_desk', 'supervisor'] },
  { path: '/exceptions', label: '异常列表', icon: AlertTriangle, roles: ['supervisor'] },
  { path: '/unverified', label: '未核销清单', icon: FileCheck, roles: ['supervisor'] },
  { path: '/review-summary', label: '复核记录汇总', icon: FileText, roles: ['supervisor'] },
]

export default function Layout() {
  const currentStaff = useStore((s) => s.currentStaff)
  const currentRoom = useStore((s) => s.currentRoom)
  const logout = useStore((s) => s.logout)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!currentStaff) {
      navigate('/login')
    }
  }, [currentStaff, navigate])

  if (!currentStaff) return null

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const visibleNavItems = navItems.filter(
    (item) => item.roles === null || item.roles.includes(currentStaff.role)
  )

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-[220px] flex flex-col bg-primary-800 text-white shrink-0">
        <div className="p-5 border-b border-primary-700">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-7 h-7 text-primary-300" />
            <div>
              <h1 className="text-base font-bold leading-tight">诊疗核销台</h1>
              {currentRoom && (
                <p className="text-xs text-primary-300 mt-0.5">{roomNames[currentRoom]}</p>
              )}
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon
            const active = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                  active
                    ? 'bg-primary-500 text-white'
                    : 'text-primary-200 hover:bg-primary-700 hover:text-white'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-primary-700">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{currentStaff.name}</p>
              <p className="text-xs text-primary-300">{roleNames[currentStaff.role]}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-primary-700 text-primary-300 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 bg-warm-50 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
