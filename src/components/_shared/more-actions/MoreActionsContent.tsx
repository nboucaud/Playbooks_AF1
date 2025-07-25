import { invalidToken } from '@/application/session/token';
import CacheClearingDialog from '@/components/_shared/modal/CacheClearingDialog';
import { AFConfigContext } from '@/components/main/app.hooks';
import { ThemeModeContext } from '@/components/main/useAppThemeMode';
import { openUrl } from '@/utils/url';
import React, { useCallback, useContext, useMemo } from 'react';
import { ReactComponent as MoonIcon } from '@/assets/icons/moon.svg';
import { ReactComponent as SunIcon } from '@/assets/icons/sun.svg';
import { ReactComponent as LoginIcon } from '@/assets/icons/logout.svg';
import { ReactComponent as ReportIcon } from '@/assets/icons/feedback.svg';
import { ReactComponent as TrashIcon } from '@/assets/icons/delete.svg';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

function MoreActionsContent({
  itemClicked,
}: {
  itemClicked: (item: {
    Icon: React.ElementType;
    label: string;
    onClick: () => void;
  }) => void;

}) {
  const { isDark, setDark } = useContext(ThemeModeContext) || {};
  const isAuthenticated = useContext(AFConfigContext)?.isAuthenticated || false;
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogin = useCallback(() => {
    invalidToken();
    navigate('/login?redirectTo=' + encodeURIComponent(window.location.href));
  }, [navigate]);
  const [openConfirm, setOpenConfirm] = React.useState(false);

  const actions = useMemo(() => {
    const items = [

      {
        Icon: LoginIcon,
        label: isAuthenticated ? t('button.logout') : t('web.login'),
        onClick: handleLogin,
      },

      {
        Icon: TrashIcon,
        label: t('settings.files.clearCache'),
        onClick: () => {
          setOpenConfirm(true);
        },
      },
    ];

    return items;
  }, [t, isAuthenticated, handleLogin, isDark, setDark]);

  const actionsContent = useMemo(() => {
    return <div className={'flex w-[240px] flex-col gap-2 px-2 py-2 max-md:w-full'}>

      {actions.map((action, index) => (
        <button
          onClick={() => {
            action.onClick();
            itemClicked(action);
          }}
          key={index}
          className={
            'flex items-center gap-2 rounded-[8px] p-1.5 hover:bg-fill-list-hover focus:bg-fill-list-hover focus:outline-none'
          }
        >
          <action.Icon className={'w-[1.25em] h-[1.25em]'} />
          <span>{action.label}</span>
        </button>
      ))}

    </div>;
  }, [actions, itemClicked]);

  return (
    <>
      {actionsContent}
      <CacheClearingDialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
      />
    </>
  );
}

export default MoreActionsContent;