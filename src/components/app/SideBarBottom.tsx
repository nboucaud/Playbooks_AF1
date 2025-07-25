import { IconButton, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as TrashIcon } from '@/assets/icons/delete.svg';
import { ReactComponent as AskAIIcon } from '@/assets/icons/ai.svg';
import { QuickNote } from '@/components/quick-note';

function SideBarBottom() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div
      className={'px-4 sticky bottom-0 bg-bg-base'}
    >
      <div
        className={'flex py-4  border-t border-line-divider gap-1 justify-around items-center'}

      >
        <Tooltip title={t('document.slashMenu.name.askAIAnything')}>
          <IconButton
            size={'small'}
            onClick={() => {
              navigate('/app/ai');
            }}

          >
            <AskAIIcon />
          </IconButton>
        </Tooltip>


        <Tooltip title={t('trash.text')}>
          <IconButton
            size={'small'}
            onClick={() => {
              navigate('/app/trash');
            }}
          >
            <TrashIcon />
          </IconButton>
        </Tooltip>

        <QuickNote />
      </div>

    </div>
  );
}

export default SideBarBottom;