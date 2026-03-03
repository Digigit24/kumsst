/**
 * HybridEditor Component
 * A WYSIWYG rich text editor powered by TipTap (ProseMirror).
 * - "full" variant: bold/italic/underline + alignment + table controls (for body content)
 * - "compact" variant: alignment + table controls only (for header/footer)
 */

import { Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import TiptapUnderline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Minus,
  Plus,
  Table as TableIcon,
  Trash2,
  Underline,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

interface HybridEditorProps {
  /** The HTML content value */
  value: string;
  /** Called when HTML content changes */
  onChange: (htmlContent: string) => void;
  /** Label for the editor */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Minimum height for the editor */
  minHeight?: string;
  /** Whether the editor is disabled */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
  /** Show label or not */
  showLabel?: boolean;
  /** Toolbar variant: "full" shows all buttons, "compact" hides B/I/U (for header/footer) */
  variant?: 'full' | 'compact';
}

/** Toolbar button component */
const ToolbarButton = ({
  icon: Icon,
  label,
  onClick,
  active = false,
  disabled = false,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) => (
  <TooltipProvider delayDuration={300}>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onClick();
          }}
          disabled={disabled}
          className={`inline-flex items-center justify-center h-8 w-8 rounded transition-colors
            ${active
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <Icon className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

// ── Notion-style floating table controls ──────────────────────────────

interface TablePosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

const TableOverlayControls = ({
  editor,
  containerRef,
}: {
  editor: Editor;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const [tablePosition, setTablePosition] = useState<TablePosition | null>(null);
  const [visible, setVisible] = useState(false);
  const activeTableRef = useRef<HTMLTableElement | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
      activeTableRef.current = null;
    }, 200);
  }, [clearHideTimer]);

  // Calculate the position of the entire table relative to the container
  const recalc = useCallback((table: HTMLTableElement) => {
    const container = containerRef.current;
    if (!container) return;

    const cRect = container.getBoundingClientRect();
    const tRect = table.getBoundingClientRect();

    setTablePosition({
      top: tRect.top - cRect.top,
      left: tRect.left - cRect.left,
      width: tRect.width,
      height: tRect.height,
    });
  }, [containerRef]);

  const showForTable = useCallback(
    (table: HTMLTableElement | null) => {
      if (!table) {
        scheduleHide();
        return;
      }
      clearHideTimer();
      activeTableRef.current = table;
      recalc(table);
      setVisible(true);
    },
    [scheduleHide, clearHideTimer, recalc],
  );

  // Track cursor position inside a table
  useEffect(() => {
    const handleSelectionUpdate = () => {
      const { from } = editor.state.selection;
      const dom = editor.view.domAtPos(from);
      const el = dom.node instanceof HTMLElement ? dom.node : dom.node.parentElement;
      const table = el?.closest('table') as HTMLTableElement | null;
      showForTable(table);
    };

    editor.on('selectionUpdate', handleSelectionUpdate);
    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor, showForTable]);

  // Track mouse hover over tables
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const table = target.closest('table') as HTMLTableElement | null;
      if (table && container.contains(table)) {
        showForTable(table);
      }
    };

    const handleMouseLeave = () => {
      scheduleHide();
    };

    container.addEventListener('mouseover', handleMouseOver);
    container.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      container.removeEventListener('mouseover', handleMouseOver);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [containerRef, showForTable, scheduleHide]);

  // Recalculate on editor content updates (row/col changes resize the table)
  useEffect(() => {
    const handleUpdate = () => {
      if (activeTableRef.current) {
        const container = containerRef.current;
        if (container && !container.contains(activeTableRef.current)) {
          activeTableRef.current = null;
          setVisible(false);
          return;
        }
        recalc(activeTableRef.current);
      }
    };
    editor.on('update', handleUpdate);
    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor, containerRef, recalc]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => clearHideTimer();
  }, [clearHideTimer]);

  if (!tablePosition) return null;

  // Clamp the "add column" button so it never floats past the container's right edge
  const container = containerRef.current;
  const containerWidth = container?.clientWidth ?? 9999;
  const rawColLeft = tablePosition.left + tablePosition.width + 4;
  // Button is 20px wide; keep it fully visible inside the container
  const colBtnLeft = Math.min(rawColLeft, containerWidth - 24);

  return (
    <>
      {/* Add Column – right edge of the table, vertically centered */}
      <button
        type="button"
        className={`absolute -translate-y-1/2 flex items-center justify-center w-5 h-5 bg-primary text-primary-foreground rounded shadow-sm z-50 cursor-pointer hover:scale-110 active:scale-95 transition-all ${visible ? 'opacity-80' : 'opacity-0 pointer-events-none'}`}
        style={{
          top: tablePosition.top + tablePosition.height / 2,
          left: colBtnLeft,
        }}
        title="Add column"
        onMouseEnter={clearHideTimer}
        onMouseLeave={scheduleHide}
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().addColumnAfter().run();
        }}
      >
        <Plus className="h-3 w-3" />
      </button>

      {/* Add Row – bottom edge of the table, horizontally centered */}
      <button
        type="button"
        className={`absolute -translate-x-1/2 flex items-center justify-center w-5 h-5 bg-primary text-primary-foreground rounded shadow-sm z-50 cursor-pointer hover:scale-110 active:scale-95 transition-all ${visible ? 'opacity-80' : 'opacity-0 pointer-events-none'}`}
        style={{
          top: tablePosition.top + tablePosition.height + 4,
          left: tablePosition.left + tablePosition.width / 2,
        }}
        title="Add row"
        onMouseEnter={clearHideTimer}
        onMouseLeave={scheduleHide}
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().addRowAfter().run();
        }}
      >
        <Plus className="h-3 w-3" />
      </button>
    </>
  );
};

// ── Main editor ───────────────────────────────────────────────────────

export const HybridEditor = ({
  value,
  onChange,
  label = 'Content',
  placeholder = 'Start typing here...',
  minHeight = '120px',
  disabled = false,
  className = '',
  showLabel = true,
  variant = 'full',
}: HybridEditorProps) => {
  const lastExternalValue = useRef(value);
  const editorWrapperRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapUnderline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: value || '',
    editable: !disabled,
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      lastExternalValue.current = html;
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'tiptap prose-editor',
        style: `min-height: ${minHeight}`,
        ...(placeholder ? { 'data-placeholder': placeholder } : {}),
      },
    },
  });

  // Sync external value changes into the editor
  useEffect(() => {
    if (editor && value !== lastExternalValue.current) {
      lastExternalValue.current = value;
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [value, editor]);

  // Sync disabled/editable state
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && (
        <Label className="text-sm font-medium">{label}</Label>
      )}

      <div className="border rounded-md overflow-visible">
        {/* Formatting Toolbar */}
        <div className="flex items-center gap-0.5 px-2 py-1 bg-muted/50 border-b flex-wrap">
          {/* Bold / Italic / Underline - only in full variant */}
          {variant === 'full' && (
            <>
              <ToolbarButton
                icon={Bold}
                label="Bold (Ctrl+B)"
                onClick={() => editor.chain().focus().toggleBold().run()}
                active={editor.isActive('bold')}
                disabled={disabled}
              />
              <ToolbarButton
                icon={Italic}
                label="Italic (Ctrl+I)"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                active={editor.isActive('italic')}
                disabled={disabled}
              />
              <ToolbarButton
                icon={Underline}
                label="Underline (Ctrl+U)"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                active={editor.isActive('underline')}
                disabled={disabled}
              />

              <Separator orientation="vertical" className="mx-1 h-6" />
            </>
          )}

          {/* Alignment */}
          <ToolbarButton
            icon={AlignLeft}
            label="Align Left"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            active={editor.isActive({ textAlign: 'left' })}
            disabled={disabled}
          />
          <ToolbarButton
            icon={AlignCenter}
            label="Align Center"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            active={editor.isActive({ textAlign: 'center' })}
            disabled={disabled}
          />
          <ToolbarButton
            icon={AlignRight}
            label="Align Right"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            active={editor.isActive({ textAlign: 'right' })}
            disabled={disabled}
          />

          <Separator orientation="vertical" className="mx-1 h-6" />

          {/* Table Controls */}
          <ToolbarButton
            icon={TableIcon}
            label="Insert Table (3×3)"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
            disabled={disabled}
          />
          <ToolbarButton
            icon={Plus}
            label="Add Row"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            disabled={disabled || !editor.can().addRowAfter()}
          />
          <ToolbarButton
            icon={Minus}
            label="Delete Row"
            onClick={() => editor.chain().focus().deleteRow().run()}
            disabled={disabled || !editor.can().deleteRow()}
          />
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().addColumnAfter().run();
                  }}
                  disabled={disabled || !editor.can().addColumnAfter()}
                  className={`inline-flex items-center justify-center h-8 px-1.5 rounded transition-colors text-xs font-medium
                    text-muted-foreground hover:bg-muted hover:text-foreground
                    ${disabled || !editor.can().addColumnAfter() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <Plus className="h-3 w-3 mr-0.5" />Col
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Add Column
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().deleteColumn().run();
                  }}
                  disabled={disabled || !editor.can().deleteColumn()}
                  className={`inline-flex items-center justify-center h-8 px-1.5 rounded transition-colors text-xs font-medium
                    text-muted-foreground hover:bg-muted hover:text-foreground
                    ${disabled || !editor.can().deleteColumn() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <Minus className="h-3 w-3 mr-0.5" />Col
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Delete Column
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <ToolbarButton
            icon={Trash2}
            label="Delete Table"
            onClick={() => editor.chain().focus().deleteTable().run()}
            disabled={disabled || !editor.can().deleteTable()}
          />
        </div>

        {/* TipTap Editor Content Area with overlay controls */}
        <div ref={editorWrapperRef} className="relative">
          <EditorContent editor={editor} />
          {!disabled && (
            <TableOverlayControls editor={editor} containerRef={editorWrapperRef} />
          )}
        </div>
      </div>
    </div>
  );
};

export default HybridEditor;
