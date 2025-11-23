import MobileManagerDashboard from '@/mobile-android/shared/components/dashboards/MobileManagerDashboard'
import BackButton from '@/mobile-android/shared/components/BackButton'

export default function ManagerPage() {
  return (
    <div>
      <BackButton href="/mobile/dashboard" />
      <MobileManagerDashboard />
    </div>
  )
}
