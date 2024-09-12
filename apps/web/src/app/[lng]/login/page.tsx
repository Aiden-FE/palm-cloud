'use client';

import { getLoginUrl } from '@/api';
import AppLoading from '@/components/app-loading/app-loading';
import { PageProps } from '@/interfaces';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function Login({ params: { lng } }: PageProps) {
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirectPath');

  async function goToLogin() {
    const targetUrl = await getLoginUrl(`${window.location.origin}/login-callback`);
    window.location.href = targetUrl;
  }

  useEffect(() => {
    if (redirectPath) {
      localStorage.setItem('redirectPath', redirectPath);
    }
    goToLogin();
  }, [lng]);

  return (
    <div className="w-full h-full">
      <AppLoading loadingProps={{ label: 'Login...' }} />
    </div>
  );
}
