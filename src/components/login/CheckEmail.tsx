import { Button } from '@/components/ui/button';
import React, { useContext, useState } from 'react';
import logo from '@/assets/icons/logo.png';
import { useTranslation } from 'react-i18next';

function CheckEmail({ email, redirectTo }: {
  email: string;
  redirectTo: string;
}) {
  const { t } = useTranslation();

  return (
    <div className={'flex text-text-primary flex-col gap-5 items-center justify-center w-full px-4'}>
      <div
        onClick={() => {
          window.location.href = '/';
        }}
        className={'flex cursor-pointer'}
      >
        <img className={'h-10 w-10'} src={logo} alt="Logo" />
      </div>
      <div className={'text-xl text-text-primary font-semibold'}>
        {t('checkYourEmail')}
      </div>
      <div className={'flex text-sm w-[320px] text-center items-center flex-col justify-center'}>
        <div className={'font-normal'}>{t('checkEmailTip')}</div>
        <div className={'font-semibold'}>
          {email}
        </div>
      </div>

      <Button
        variant={'link'}
        onClick={() => {
          window.location.href = `/login?redirectTo=${redirectTo}`;
        }}
        className={'w-[320px]'}
      >
        {t('backToLogin')}
      </Button>
    </div>
  );
}

export default CheckEmail;