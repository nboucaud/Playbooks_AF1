import MoreActions from './MoreActions';
import { useAppViewId } from '@/components/app/app.hooks';
import { openOrDownload } from '@/utils/open_schema';
import { Button, Divider, Tooltip } from '@mui/material';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import ShareButton from 'src/components/app/share/ShareButton';
import logo from '@/assets/icons/logo.png';

import { ReactComponent as MoonIcon } from '@/assets/icons/moon.svg';
import { ReactComponent as SunIcon } from '@/assets/icons/sun.svg';
import { ThemeModeContext } from '@/components/main/useAppThemeMode';
function RightMenu() {
  const { t } = useTranslation();
  const viewId = useAppViewId();
  const { isDark, setDark } = useContext(ThemeModeContext) || {};

  return (
    <div className={'flex items-center gap-2'}>
      <Button
        color={'inherit'}
        variant={'text'}
        className={'justify-start'}
        startIcon={isDark ? <SunIcon /> : <MoonIcon />}
        onClick={() => setDark?.(!isDark)}
      >
        {isDark ? t('settings.appearance.themeMode.light') : t('settings.appearance.themeMode.dark')}
      </Button>
      {viewId && <ShareButton viewId={viewId} />}
      {viewId && <MoreActions viewId={viewId} />}


      <Divider orientation={'vertical'} className={'mx-2'} flexItem />
      <button onClick={() => openOrDownload()}>
        <img className={'h-6 w-6'} src={logo} alt="Logo" />

      </button>
    </div>
  );
}

export default RightMenu;
