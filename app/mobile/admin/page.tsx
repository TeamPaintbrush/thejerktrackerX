import MobileAdminDashboard from '@/mobile-android/shared/components/dashboards/MobileAdminDashboard'
import BackButton from '@/mobile-android/shared/components/BackButton'

export default function AdminPage() {
  console.log('🎛️ ADMIN PAGE - Rendering /mobile/admin page');
  
  return (
    <div>
      <BackButton href="/mobile/dashboard" />
      <MobileAdminDashboard />
    </div>
  )
}
