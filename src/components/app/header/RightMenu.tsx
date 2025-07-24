import MoreActions from './MoreActions';
import { useAppViewId } from '@/components/app/app.hooks';
import { openOrDownload } from '@/utils/open_schema';
import { Divider, Tooltip } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ShareButton from 'src/components/app/share/ShareButton';
import logo from '@/assets/icons/logo.png';

function RightMenu() {
  const { t } = useTranslation();
  const viewId = useAppViewId();

  return (
    <div className={'flex items-center gap-2'}>
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
