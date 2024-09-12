'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppLoading from '@/components/app-loading/app-loading';
import { useContextStore } from '@/providers/context-store';
import { setCookieOnClient } from '@/utils';
import { PageProps } from '@/interfaces';
import { getAuthToken } from '@/api';

export default function LoginCallback({ params: { lng } }: PageProps) {
  const searchParams = useSearchParams();
  const { setToken } = useContextStore((state) => state);
  const router = useRouter();

  useEffect(() => {
    getAuthToken(searchParams.get('code') || '')
      .then(async (res: any) => {
        setCookieOnClient('access_token', res.access_token, {
          expiresIn: 1000 * 60 * 60 * 24 * 7 - 1000 * 30,
        });
        setCookieOnClient('refresh_token', res.refresh_token, {
          expiresIn: 1000 * 60 * 60 * 24 * 7 - 1000 * 30,
        });
        setToken({
          access_token: res.access_token,
          refresh_token: res.refresh_token,
        });
        const redirectPath = localStorage.getItem('redirectPath');
        if (redirectPath) {
          localStorage.removeItem('redirectPath');
          window.location.href = redirectPath;
        } else {
          window.location.href = '/';
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Debug: ', err);
      });
  }, [lng, router, setToken]);

  return (
    <div className="w-full h-full">
      <AppLoading loadingProps={{ label: 'Login...' }} />
    </div>
  );
}
