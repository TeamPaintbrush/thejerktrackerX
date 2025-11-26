import { redirect } from 'next/navigation';

export function generateStaticParams() {
  return [];
}

export default function AdminUserEditPage() {
  // For static builds, redirect to users list
  redirect('/admin/users');
}
