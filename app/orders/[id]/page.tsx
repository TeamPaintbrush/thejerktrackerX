import OrderPage from '../../../components/OrderPage';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateStaticParams() {
  // For static export, only generate the placeholder
  return [{ id: 'placeholder' }];
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <OrderPage orderId={id} />;
}