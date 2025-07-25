import { invalidToken } from '@/application/session/token';
import { Workspace } from '@/application/types';
import Import from '@/components/_shared/more-actions/importer/Import';
import { notify } from '@/components/_shared/notify';
import { Popover } from '@/components/_shared/popover';
import { useAppHandlers, useCurrentWorkspaceId, useUserWorkspaceInfo } from '@/components/app/app.hooks';
import CreateWorkspace from '@/components/app/workspaces/CreateWorkspace';
import CurrentWorkspace from '@/components/app/workspaces/CurrentWorkspace';
import WorkspaceList from '@/components/app/workspaces/WorkspaceList';
import { useCurrentUser } from '@/components/main/app.hooks';
import { openUrl } from '@/utils/url';
import { Button, Divider, IconButton, Tooltip } from '@mui/material';
import React, { useCallback, useEffect } from 'react';
import { ReactComponent as ArrowDown } from '@/assets/icons/alt_arrow_down.svg';
import { ReactComponent as ImportIcon } from '@/assets/icons/save_as.svg';
import { ReactComponent as TipIcon } from '@/assets/icons/help.svg';
import { useTranslation } from 'react-i18next';
import { ReactComponent as LogoutIcon } from '@/assets/icons/logout.svg';
import { ReactComponent as UpgradeIcon } from '@/assets/icons/upgrade.svg';
import { ReactComponent as UpgradeAIMaxIcon } from '@/assets/icons/ai.svg';
import { useNavigate, useSearchParams } from 'react-router-dom';
import InviteMember from '@/components/app/workspaces/InviteMember';
import UpgradePlan from '@/components/billing/UpgradePlan';
import UpgradeAIMax from '@/components/billing/UpgradeAIMax';

export function Workspaces() {
  const { t } = useTranslation();
  const userWorkspaceInfo = useUserWorkspaceInfo();
  const currentWorkspaceId = useCurrentWorkspaceId();
  const currentUser = useCurrentUser();
  const [openUpgradePlan, setOpenUpgradePlan] = React.useState(false);
  const [openUpgradeAIMax, setOpenUpgradeAIMax] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [hoveredHeader, setHoveredHeader] = React.useState<boolean>(false);
  const ref = React.useRef<HTMLButtonElement | null>(null);
  const navigate = useNavigate();
  const [changeLoading, setChangeLoading] = React.useState<string | null>(null);
  const handleSignOut = useCallback(() => {
    invalidToken();
    navigate('/login?redirectTo=' + encodeURIComponent(window.location.href));
  }, [navigate]);

  const { onChangeWorkspace: handleSelectedWorkspace } = useAppHandlers();
  const [currentWorkspace, setCurrentWorkspace] = React.useState<Workspace | undefined>(undefined);

  const isOwner = currentWorkspace?.owner?.uid.toString() === currentUser?.uid.toString();

  useEffect(() => {
    setCurrentWorkspace(userWorkspaceInfo?.workspaces.find((workspace) => workspace.id === currentWorkspaceId));
  }, [currentWorkspaceId, userWorkspaceInfo]);

  const handleChange = useCallback(async (selectedId: string) => {
    setChangeLoading(selectedId);
    try {
      await handleSelectedWorkspace?.(selectedId);
      setOpen(false);
    } catch (e) {
      notify.error('Failed to change workspace');
    }

    setChangeLoading(null);
  },
    [handleSelectedWorkspace]
  );
  const [, setSearchParams] = useSearchParams();

  const handleOpenImport = useCallback(() => {
    setSearchParams((prev) => {
      prev.set('action', 'import');
      prev.set('source', 'notion');
      return prev;
    });
  }, [setSearchParams]);

  return <>
    <Button
      ref={ref}
      onMouseLeave={() => setHoveredHeader(false)}
      onMouseEnter={() => setHoveredHeader(true)}
      onClick={() => setOpen(true)}
      className={'mx-2 flex w-full cursor-pointer items-center justify-start gap-1 px-1 py-1 text-text-title'}
    >
      <div className={'flex items-center gap-1.5 overflow-hidden text-[15px] text-text-title'}>
        <CurrentWorkspace
          userWorkspaceInfo={userWorkspaceInfo}
          selectedWorkspace={currentWorkspace}
          onChangeWorkspace={handleChange}
          avatarSize={24}
        />

        {hoveredHeader && <ArrowDown className={'h-5 w-5'} />}
      </div>
    </Button>
    <Popover
      open={open}
      keepMounted={true}
      anchorEl={ref.current}
      onClose={() => setOpen(false)}
    >
      <div
        className={'flex text-[14px] w-[288px] flex-col gap-2 p-2 min-h-[303px] overflow-hidden'}
      >
        <div className={'flex p-2 text-text-caption items-center justify-between'}>
          <span className={'font-medium flex-1 text-sm'}>{currentUser?.email}</span>
        </div>
        <div className={'flex max-h-[236px] flex-1 flex-col gap-1 overflow-y-auto appflowy-scroller'}>
          {open && <WorkspaceList
            defaultWorkspaces={userWorkspaceInfo?.workspaces}
            currentWorkspaceId={currentWorkspaceId}
            onChange={handleChange}
            changeLoading={changeLoading || undefined}
            onUpdateCurrentWorkspace={(name) => {
              setCurrentWorkspace(prev => {
                if (!prev) return prev;
                return {
                  ...prev,
                  name,
                };
              });
            }}
          />}
        </div>
        <CreateWorkspace />
        <Divider className={'w-full mt-1'} />
        {currentWorkspace && <InviteMember
          onClick={() => {
            setOpen(false);
          }}
          workspace={currentWorkspace}
        />}
        <Button
          size={'small'}
          component={'div'}
          startIcon={<ImportIcon />}
          color={'inherit'}
          className={'justify-start px-2'}
          onClick={handleOpenImport}
        >
          <div className={'flex-1 text-left'}>{t('web.importNotion')}</div>

        </Button>
        <Divider className={'w-full'} />
        <Button
          size={'small'}
          className={'justify-start px-2'}
          color={'inherit'}
          onClick={handleSignOut}
          startIcon={<LogoutIcon />}
        >{t('button.logout')}</Button>


        {isOwner && <>
          <Divider className={'w-full'} />

        </>}
      </div>

    </Popover>
    {isOwner &&
      <>
        <UpgradePlan
          onOpen={
            () => {
              setOpenUpgradePlan(true);
            }
          }
          open={openUpgradePlan}
          onClose={() => setOpenUpgradePlan(false)}
        />
        <UpgradeAIMax
          onOpen={
            () => {
              setOpenUpgradeAIMax(true);
            }
          }
          open={openUpgradeAIMax}
          onClose={() => setOpenUpgradeAIMax(false)}
        />
      </>

    }

    <Import />
  </>;
}

export default Workspaces;
