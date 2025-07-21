import { Divider } from '@mui/material';
import React from 'react';
import { ReactComponent as AppFlowyLogo } from '@/assets/icons/appflowy.svg';

function AppFlowyPower({ divider, width }: { divider?: boolean; width?: number }) {
  return (
    <div
      style={{
        width,
      }}
      className={
        'sticky bottom-[-0.5px] flex w-full transform-gpu flex-col items-center justify-center rounded-[16px] bg-bg-body'
      }
    >
      {divider && <Divider className={'my-0 w-full'} />}


    </div>
  );
}

export default AppFlowyPower;
