// 📱 Mobile Order Details Page
// Shows detailed order information with QR code functionality

import BackButton from '../../../../mobile-android/shared/components/BackButton';
import ClientWrapper from './ClientWrapper';

// Required for static export
export async function generateStaticParams() {
  return [{ id: 'placeholder' }]; // Provide at least one static param
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MobileOrderDetailsPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%)' }}>
      <div style={{ padding: '1rem', paddingTop: '0.5rem' }}>
        <BackButton href="/mobile/orders" label="Orders" />
      </div>
      
      <ClientWrapper orderId={id} />
    </div>
  );
}