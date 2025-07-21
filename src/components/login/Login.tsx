import MagicLink from '@/components/login/MagicLink';
import React from 'react';
import logo from '@/assets/icons/logo.png';
import { useTranslation } from 'react-i18next';

export function Login({ redirectTo }: { redirectTo: string }) {
  const { t } = useTranslation();

  return (
    <div className={'py-10  text-text-primary flex flex-col h-full items-center justify-between gap-5 px-4'}>
      <div className={'flex flex-1 flex-col items-center justify-center w-full gap-5'}>
        <div
          onClick={() => {
            window.location.href = '/';
          }}
          className={'flex w-full cursor-pointer flex-col items-center justify-center gap-5'}
        >
          <img className={'h-9 w-9'} src={logo} alt="Logo" />

          <div className={'text-xl font-semibold'}>{t('welcomeTo')} AppFlowy</div>
        </div>
        <MagicLink redirectTo={redirectTo} />
      </div>
    </div>
  );
}

export default Login;
