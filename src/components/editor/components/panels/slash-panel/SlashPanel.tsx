import { YjsEditor } from '@/application/slate-yjs';
import { CustomEditor } from '@/application/slate-yjs/command';
import { isEmbedBlockTypes } from '@/application/slate-yjs/command/const';
import { findSlateEntryByBlockId, getBlockEntry } from '@/application/slate-yjs/utils/editor';
import {
  AlignType,
  BlockData,
  BlockType,
  CalloutBlockData,
  HeadingBlockData,
  ImageBlockData,
  SubpageNodeData,
  ToggleListBlockData,
  VideoBlockData,
  ViewLayout,
} from '@/application/types';
import { ReactComponent as DocumentIcon } from '@/assets/icons/page.svg';
// import { ReactComponent as AIWriterIcon } from '@/assets/slash_menu_icon_ai_writer.svg';
import { ReactComponent as BulletedListIcon } from '@/assets/icons/bulleted_list.svg';
import { ReactComponent as CalloutIcon } from '@/assets/icons/callout.svg';
import { ReactComponent as TodoListIcon } from '@/assets/icons/todo.svg';
import { ReactComponent as CodeIcon } from '@/assets/icons/inline_code.svg';
import { ReactComponent as DividerIcon } from '@/assets/icons/divider.svg';
import { ReactComponent as RefDocumentIcon } from '@/assets/icons/ref_page.svg';
import { ReactComponent as EmojiIcon } from '@/assets/icons/add_emoji.svg';
import { ReactComponent as FileIcon } from '@/assets/icons/file.svg';
// import { ReactComponent as GridIcon } from '@/assets/slash_menu_icon_grid.svg';
// import { ReactComponent as BoardIcon } from '@/assets/slash_menu_icon_kanban.svg';
// import { ReactComponent as CalendarIcon } from '@/assets/slash_menu_icon_calendar.svg';
import { ReactComponent as Heading1Icon } from '@/assets/icons/h1.svg';
import { ReactComponent as Heading2Icon } from '@/assets/icons/h2.svg';
import { ReactComponent as Heading3Icon } from '@/assets/icons/h3.svg';
import { ReactComponent as ImageIcon } from '@/assets/icons/image.svg';
import { ReactComponent as NumberedListIcon } from '@/assets/icons/numbered_list.svg';
import { ReactComponent as OutlineIcon } from '@/assets/icons/doc.svg';
import { ReactComponent as QuoteIcon } from '@/assets/icons/quote.svg';
import { ReactComponent as TextIcon } from '@/assets/icons/text.svg';
import { ReactComponent as ToggleListIcon } from '@/assets/icons/toggle_list.svg';
import { ReactComponent as ToggleHeading1Icon } from '@/assets/icons/toggle_h1.svg';
import { ReactComponent as ToggleHeading2Icon } from '@/assets/icons/toggle_h2.svg';
import { ReactComponent as ToggleHeading3Icon } from '@/assets/icons/toggle_h3.svg';
import { ReactComponent as AskAIIcon } from '@/assets/icons/ai.svg';
import { ReactComponent as ContinueWritingIcon } from '@/assets/icons/continue_writing.svg';
import { ReactComponent as FormulaIcon } from '@/assets/icons/formula.svg';
import { ReactComponent as VideoIcon } from '@/assets/icons/video.svg';

import { notify } from '@/components/_shared/notify';
import { calculateOptimalOrigins, Popover } from '@/components/_shared/popover';
import { usePopoverContext } from '@/components/editor/components/block-popover/BlockPopoverContext';
import { usePanelContext } from '@/components/editor/components/panels/Panels.hooks';
import { PanelType } from '@/components/editor/components/panels/PanelsContext';
import { getRangeRect } from '@/components/editor/components/toolbar/selection-toolbar/utils';
import { useEditorContext } from '@/components/editor/EditorContext';
import { getCharacters } from '@/utils/word';
import { useAIWriter } from '@appflowyinc/ai-chat';
import { Button } from '@mui/material';
import { PopoverOrigin } from '@mui/material/Popover/Popover';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactEditor, useSlateStatic } from 'slate-react';

export function SlashPanel({
  setEmojiPosition,
}: {
  setEmojiPosition: (position: { top: number; left: number }) => void;
}) {
  const { isPanelOpen, panelPosition, closePanel, searchText, removeContent } = usePanelContext();
  const { addPage, openPageModal, viewId, loadViewMeta } = useEditorContext();
  const [viewName, setViewName] = useState('');

  const editor = useSlateStatic() as YjsEditor;

  const { t } = useTranslation();
  const optionsRef = useRef<HTMLDivElement>(null);
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null);
  const [transformOrigin, setTransformOrigin] = React.useState<PopoverOrigin | undefined>(undefined);
  const selectedOptionRef = React.useRef<string | null>(null);
  const { openPopover } = usePopoverContext();
  const open = useMemo(() => {
    return isPanelOpen(PanelType.Slash);
  }, [isPanelOpen]);

  useEffect(() => {
    if (viewId && open) {
      void loadViewMeta?.(viewId).then((view) => {
        setViewName(view.name);
      });
    }
  }, [viewId, loadViewMeta, open]);

  const getBeforeContent = useCallback(() => {
    const { selection } = editor;

    if (!selection) return '';

    const start = {
      path: [0],
      offset: 0,
    };

    const end = editor.end(selection);

    return (
      viewName +
      '\n' +
      CustomEditor.getSelectionContent(editor, {
        anchor: start,
        focus: end,
      })
    );
  }, [editor, viewName]);

  const chars = useMemo(() => {
    if (!open) return 0;

    return getCharacters(getBeforeContent());
  }, [open, getBeforeContent]);

  const handleSelectOption = useCallback(
    (option: string) => {
      setSelectedOption(option);
      removeContent();
      closePanel();
      editor.flushLocalChanges();
    },
    [closePanel, removeContent, editor]
  );

  const turnInto = useCallback(
    (type: BlockType, data: BlockData) => {
      const block = getBlockEntry(editor);
      const blockId = block[0].blockId as string;
      const isEmpty = !CustomEditor.getBlockTextContent(block[0], 2);
      let newBlockId: string | undefined;

      if (isEmpty) {
        newBlockId = CustomEditor.turnToBlock(editor, blockId, type, data);
      } else {
        newBlockId = CustomEditor.addBelowBlock(editor, blockId, type, data);
      }

      if (newBlockId && isEmbedBlockTypes(type)) {
        const [, path] = findSlateEntryByBlockId(editor, newBlockId);

        editor.select(editor.start(path));
      }

      if ([BlockType.FileBlock, BlockType.ImageBlock, BlockType.EquationBlock, BlockType.VideoBlock].includes(type)) {
        setTimeout(() => {
          if (!newBlockId) return;
          const entry = findSlateEntryByBlockId(editor, newBlockId);

          if (!entry) return;
          const [node] = entry;
          const dom = ReactEditor.toDOMNode(editor, node);

          openPopover(newBlockId, type, dom);
        }, 50);
      }
    },
    [editor, openPopover]
  );

  const { openPanel } = usePanelContext();

  const { askAIAnything, continueWriting } = useAIWriter();

  const options: {
    label: string;
    key: string;
    icon: React.ReactNode;
    keywords: string[];
    onClick?: () => void;
  }[] = useMemo(() => {
    return [
      {
        label: t('document.slashMenu.name.askAIAnything'),
        key: 'askAIAnything',
        icon: <AskAIIcon />,
        keywords: ['ai', 'writer', 'ask', 'anything', 'askAIAnything', 'askai'],
        onClick: () => {
          const content = getBeforeContent();

          askAIAnything(content);
        },
      },
      {
        label: t('document.slashMenu.name.continueWriting'),
        key: 'continueWriting',
        disabled: chars < 2,
        icon: <ContinueWritingIcon />,
        keywords: ['ai', 'writing', 'continue'],
        onClick: () => {
          const content = getBeforeContent();

          void continueWriting(content);
        },
      },
      {
        label: t('document.slashMenu.name.text'),
        key: 'text',
        icon: <TextIcon />,
        onClick: () => {
          turnInto(BlockType.Paragraph, {});
        },
        keywords: ['text', 'paragraph'],
      },
      {
        label: t('document.slashMenu.name.heading1'),
        key: 'heading1',
        icon: <Heading1Icon />,
        keywords: ['heading1', 'h1', 'heading'],
        onClick: () => {
          turnInto(BlockType.HeadingBlock, {
            level: 1,
          } as HeadingBlockData);
        },
      },
      {
        label: t('document.slashMenu.name.heading2'),
        key: 'heading2',
        icon: <Heading2Icon />,
        keywords: ['heading2', 'h2', 'subheading', 'heading'],
        onClick: () => {
          turnInto(BlockType.HeadingBlock, {
            level: 2,
          } as HeadingBlockData);
        },
      },
      {
        label: t('document.slashMenu.name.heading3'),
        key: 'heading3',
        icon: <Heading3Icon />,
        keywords: ['heading3', 'h3', 'subheading', 'heading'],
        onClick: () => {
          turnInto(BlockType.HeadingBlock, {
            level: 3,
          } as HeadingBlockData);
        },
      },
      {
        label: t('document.slashMenu.name.image'),
        key: 'image',
        icon: <ImageIcon />,
        keywords: ['image', 'img'],
        onClick: () => {
          turnInto(BlockType.ImageBlock, {
            url: '',
            align: AlignType.Center,
          } as ImageBlockData);
        },
      },
      {
        label: t('embedVideo'),
        key: 'video',
        icon: <VideoIcon />,
        keywords: ['video', 'youtube', 'embed'],
        onClick: () => {
          turnInto(BlockType.VideoBlock, {
            url: '',
            align: AlignType.Center,
          } as VideoBlockData);
        },
      },
      {
        label: t('document.slashMenu.name.bulletedList'),
        key: 'bulletedList',
        icon: <BulletedListIcon />,
        keywords: ['bulleted', 'list'],
        onClick: () => {
          turnInto(BlockType.BulletedListBlock, {});
        },
      },
      {
        label: t('document.slashMenu.name.numberedList'),
        key: 'numberedList',
        icon: <NumberedListIcon />,
        keywords: ['numbered', 'list'],
        onClick: () => {
          turnInto(BlockType.NumberedListBlock, {});
        },
      },
      {
        label: t('document.slashMenu.name.todoList'),
        key: 'todoList',
        icon: <TodoListIcon />,
        keywords: ['todo', 'list'],
        onClick: () => {
          turnInto(BlockType.TodoListBlock, {});
        },
      },
      {
        label: t('document.slashMenu.name.divider'),
        key: 'divider',
        icon: <DividerIcon />,
        keywords: ['divider', 'line'],
        onClick: () => {
          turnInto(BlockType.DividerBlock, {});
        },
      },
      {
        label: t('document.slashMenu.name.quote'),
        key: 'quote',
        icon: <QuoteIcon />,
        keywords: ['quote'],
        onClick: () => {
          turnInto(BlockType.QuoteBlock, {});
        },
      },
      {
        label: t('document.slashMenu.name.linkedDoc'),
        key: 'linkedDoc',
        icon: <RefDocumentIcon />,
        keywords: ['linked', 'doc', 'page', 'document'],
        onClick: () => {
          const rect = getRangeRect();

          if (!rect) return;
          openPanel(PanelType.PageReference, { top: rect.top, left: rect.left });
        },
      },
      {
        label: t('document.menuName'),
        key: 'document',
        icon: <DocumentIcon />,
        keywords: ['document', 'doc', 'page', 'create', 'add'],
        onClick: async () => {
          if (!viewId || !addPage || !openPageModal) return;
          try {
            const newViewId = await addPage(viewId, {
              layout: ViewLayout.Document,
            });

            turnInto(BlockType.SubpageBlock, {
              view_id: newViewId,
            } as SubpageNodeData);

            openPageModal(newViewId);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (e: any) {
            notify.error(e.message);
          }
        },
      },
      //   {
      //   label: t('document.slashMenu.name.grid'),
      //   key: 'grid',
      //   icon: <GridIcon />,
      //   keywords: ['grid', 'table'],
      //   onClick: async () => {
      //     if (!viewId || !addPage || !openPageModal) return;
      //     try {
      //       const newViewId = await addPage(viewId, {
      //         layout: ViewLayout.Grid,
      //         name: 'Table',
      //       });
      //
      //       turnInto(BlockType.GridBlock, {
      //         view_id: newViewId,
      //       } as DatabaseNodeData);
      //
      //       openPageModal(newViewId);
      //       // eslint-disable-next-line @typescript-eslint/no-explicit-any
      //     } catch (e: any) {
      //       notify.error(e.message);
      //     }
      //   },
      // }, {
      //   label: t('document.slashMenu.name.linkedGrid'),
      //   key: 'linkedGrid',
      //   icon: <GridIcon />,
      //   keywords: ['linked', 'grid', 'table'],
      // }, {
      //   label: t('document.slashMenu.name.kanban'),
      //   key: 'board',
      //   icon: <BoardIcon />,
      //   keywords: ['board', 'kanban'],
      //   onClick: async () => {
      //     if (!viewId || !addPage || !openPageModal) return;
      //     try {
      //       const newViewId = await addPage(viewId, {
      //         layout: ViewLayout.Board,
      //         name: 'Board',
      //       });
      //
      //       turnInto(BlockType.BoardBlock, {
      //         view_id: newViewId,
      //       } as DatabaseNodeData);
      //
      //       openPageModal(newViewId);
      //       // eslint-disable-next-line @typescript-eslint/no-explicit-any
      //     } catch (e: any) {
      //       notify.error(e.message);
      //     }
      //   },
      // }, {
      //   label: t('document.slashMenu.name.linkedKanban'),
      //   key: 'linkedKanban',
      //   icon: <BoardIcon />,
      //   keywords: ['linked', 'kanban', 'board'],
      // }, {
      //   label: t('document.slashMenu.name.calendar'),
      //   key: 'calendar',
      //   icon: <CalendarIcon />,
      //   keywords: ['calendar', 'date'],
      //   onClick: async () => {
      //     if (!viewId || !addPage || !openPageModal) return;
      //     try {
      //       const newViewId = await addPage(viewId, {
      //         layout: ViewLayout.Calendar,
      //         name: 'Calendar',
      //       });
      //
      //       turnInto(BlockType.BoardBlock, {
      //         view_id: newViewId,
      //       } as DatabaseNodeData);
      //
      //       openPageModal(newViewId);
      //       // eslint-disable-next-line @typescript-eslint/no-explicit-any
      //     } catch (e: any) {
      //       notify.error(e.message);
      //     }
      //   },
      // }, {
      //   label: t('document.slashMenu.name.linkedCalendar'),
      //   key: 'linkedCalendar',
      //   icon: <CalendarIcon />,
      //   keywords: ['linked', 'calendar', 'date'],
      // },
      {
        label: t('document.slashMenu.name.callout'),
        key: 'callout',
        icon: <CalloutIcon />,
        keywords: ['callout'],
        onClick: () => {
          turnInto(BlockType.CalloutBlock, {
            icon: '📌',
          } as CalloutBlockData);
        },
      },
      {
        label: t('document.slashMenu.name.outline'),
        key: 'outline',
        icon: <OutlineIcon />,
        keywords: ['outline', 'table', 'contents'],
        onClick: () => {
          turnInto(BlockType.OutlineBlock, {});
        },
      },
      {
        label: t('document.slashMenu.name.mathEquation'),
        key: 'math',
        icon: <FormulaIcon />,
        keywords: ['math', 'equation', 'formula'],
        onClick: () => {
          turnInto(BlockType.EquationBlock, {});
        },
      },
      {
        label: t('document.slashMenu.name.code'),
        key: 'code',
        icon: <CodeIcon />,
        keywords: ['code', 'block'],
        onClick: () => {
          turnInto(BlockType.CodeBlock, {});
        },
      },
      {
        label: t('document.slashMenu.name.toggleList'),
        key: 'toggleList',
        icon: <ToggleListIcon />,
        keywords: ['toggle', 'list'],
        onClick: () => {
          turnInto(BlockType.ToggleListBlock, {
            collapsed: false,
          } as ToggleListBlockData);
        },
      },
      {
        label: t('document.slashMenu.name.toggleHeading1'),
        key: 'toggleHeading1',
        icon: <ToggleHeading1Icon />,
        keywords: ['toggle', 'heading1', 'h1', 'heading'],
        onClick: () => {
          turnInto(BlockType.ToggleListBlock, {
            collapsed: false,
            level: 1,
          } as ToggleListBlockData);
        },
      },
      {
        label: t('document.slashMenu.name.toggleHeading2'),
        key: 'toggleHeading2',
        icon: <ToggleHeading2Icon />,
        keywords: ['toggle', 'heading2', 'h2', 'subheading', 'heading'],
        onClick: () => {
          turnInto(BlockType.ToggleListBlock, {
            collapsed: false,
            level: 2,
          } as ToggleListBlockData);
        },
      },
      {
        label: t('document.slashMenu.name.toggleHeading3'),
        key: 'toggleHeading3',
        icon: <ToggleHeading3Icon />,
        keywords: ['toggle', 'heading3', 'h3', 'subheading', 'heading'],
        onClick: () => {
          turnInto(BlockType.ToggleListBlock, {
            collapsed: false,
            level: 3,
          } as ToggleListBlockData);
        },
      },
      {
        label: t('document.slashMenu.name.emoji'),
        key: 'emoji',
        icon: <EmojiIcon />,
        keywords: ['emoji'],
        onClick: () => {
          setTimeout(() => {
            const rect = getRangeRect();

            if (!rect) return;
            setEmojiPosition({
              top: rect.top,
              left: rect.left,
            });
          }, 50);
        },
      },
      {
        label: t('document.slashMenu.name.file'),
        key: 'file',
        icon: <FileIcon />,
        keywords: ['file', 'upload'],
        onClick: () => {
          turnInto(BlockType.FileBlock, {});
        },
      },
    ].filter((option) => {
      if (option.disabled) return false;
      if (!searchText) return true;
      return option.keywords.some((keyword: string) => {
        return keyword.toLowerCase().includes(searchText.toLowerCase());
      });
    });
  }, [
    t,
    chars,
    getBeforeContent,
    askAIAnything,
    continueWriting,
    turnInto,
    openPanel,
    viewId,
    addPage,
    openPageModal,
    setEmojiPosition,
    searchText,
  ]);

  const resultLength = options.length;

  useEffect(() => {
    selectedOptionRef.current = selectedOption;
    if (!selectedOption) return;
    const el = optionsRef.current?.querySelector(`[data-option-key="${selectedOption}"]`) as HTMLButtonElement | null;

    el?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }, [selectedOption]);

  useEffect(() => {
    if (!open || options.length === 0) return;
    setSelectedOption(options[0].key);
  }, [open, options]);

  const countRef = useRef(0);

  useEffect(() => {
    if (!open) return;

    if (searchText && resultLength === 0) {
      countRef.current += 1;
    } else {
      countRef.current = 0;
    }

    if (countRef.current > 1) {
      closePanel();
      countRef.current = 0;
      return;
    }
  }, [closePanel, open, resultLength, searchText]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      const { key } = e;

      switch (key) {
        case 'Enter':
          e.stopPropagation();
          e.preventDefault();
          if (selectedOptionRef.current) {
            handleSelectOption(selectedOptionRef.current);
            const item = options.find((option) => option.key === selectedOptionRef.current);

            item?.onClick?.();
          }

          break;
        case 'ArrowUp':
        case 'ArrowDown': {
          e.stopPropagation();
          e.preventDefault();
          const index = options.findIndex((option) => option.key === selectedOptionRef.current);
          const nextIndex =
            key === 'ArrowDown' ? (index + 1) % options.length : (index - 1 + options.length) % options.length;

          setSelectedOption(options[nextIndex].key);
          break;
        }

        default:
          break;
      }
    };

    const slateDom = ReactEditor.toDOMNode(editor, editor);

    slateDom.addEventListener('keydown', handleKeyDown);

    return () => {
      slateDom.removeEventListener('keydown', handleKeyDown);
    };
  }, [closePanel, editor, open, options, handleSelectOption]);

  useEffect(() => {
    if (options.length > 0) return;
    setSelectedOption(null);
  }, [options.length]);

  useEffect(() => {
    if (open && panelPosition) {
      const origins = calculateOptimalOrigins(panelPosition, 320, 400, undefined, 16);
      const isAlignBottom = origins.transformOrigin.vertical === 'bottom';

      setTransformOrigin(
        isAlignBottom
          ? origins.transformOrigin
          : {
            vertical: -30,
            horizontal: origins.transformOrigin.horizontal,
          }
      );
    }
  }, [open, panelPosition]);

  return (
    <Popover
      adjustOrigins={false}
      data-testid={'slash-panel'}
      open={open}
      onClose={closePanel}
      anchorReference={'anchorPosition'}
      anchorPosition={panelPosition}
      disableAutoFocus={true}
      disableRestoreFocus={true}
      disableEnforceFocus={true}
      transformOrigin={transformOrigin}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div
        ref={optionsRef}
        className={'appflowy-scroller flex max-h-[400px] w-[320px] flex-col gap-2 overflow-y-auto overflow-x-hidden p-2'}
      >
        {options.length > 0 ? (
          options.map((option) => (
            <Button
              size={'small'}
              color={'inherit'}
              startIcon={option.icon}
              key={option.key}
              data-option-key={option.key}
              onClick={() => {
                handleSelectOption(option.key);
                option.onClick?.();
              }}
              className={`scroll-m-2 justify-start hover:bg-content-blue-50 ${selectedOption === option.key ? 'bg-fill-list-hover' : ''
                }`}
            >
              {option.label}
            </Button>
          ))
        ) : (
          <div className={'flex items-center justify-center py-4 text-sm text-text-caption'}>
            {t('findAndReplace.noResult')}
          </div>
        )}
      </div>
    </Popover>
  );
}

export default SlashPanel;
