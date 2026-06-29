import { useState, useEffect, useRef } from 'react';
import { Pencil } from 'lucide-react';
import { useStaff } from '../context/StaffContext';

/**
 * InlineEdit — renders value as plain text for visitors.
 * In staff mode: clicking the text opens an input/textarea.
 * Enter (or Ctrl+Enter for multiline) / blur → save.
 * Escape → cancel.
 */
interface Props {
  value: string;
  onSave: (v: string) => void;
  multiline?: boolean;
  /** Extra classes applied to both the display element and the input */
  className?: string;
  placeholder?: string;
  /** HTML element used for the display wrapper (default: span) */
  as?: keyof React.JSX.IntrinsicElements;
}

export default function InlineEdit({
  value,
  onSave,
  multiline = false,
  className = '',
  placeholder = 'Click to edit…',
  as: Tag = 'span',
}: Props) {
  const { isStaff } = useStaff();
  const [editing, setEditing]   = useState(false);
  const [draft,   setDraft]     = useState(value);
  const inputRef    = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Keep draft in sync when value changes externally (e.g. on Blob load)
  useEffect(() => { if (!editing) setDraft(value); }, [value, editing]);

  // Auto-focus when entering edit mode
  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      textareaRef.current?.focus();
    }
  }, [editing]);

  const commit = () => {
    const next = draft.trim();
    onSave(next || value); // don't allow blanking out
    setEditing(false);
  };
  const cancel = () => { setDraft(value); setEditing(false); };

  // ── Visitor mode ──────────────────────────────────────────────────────────
  if (!isStaff) {
    // @ts-expect-error dynamic tag
    return <Tag className={className}>{value}</Tag>;
  }

  // ── Edit mode ─────────────────────────────────────────────────────────────
  if (editing) {
    const sharedCls =
      `border-b-2 border-[var(--teal)] bg-transparent outline-none w-full ${className}`;

    return multiline ? (
      <textarea
        ref={textareaRef}
        value={draft}
        rows={3}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Escape') cancel();
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) commit();
        }}
        className={`resize-none ${sharedCls}`}
      />
    ) : (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') cancel();
        }}
        className={sharedCls}
      />
    );
  }

  // ── Staff view mode (click to start editing) ─────────────────────────────
  return (
    // @ts-expect-error dynamic tag
    <Tag
      onClick={() => setEditing(true)}
      title="Click to edit"
      className={`group/ie cursor-text inline-flex items-center gap-1.5 ${className}`}
    >
      <span className="border-b border-dashed border-current/30 hover:border-[var(--teal)]/60 transition-colors">
        {value || <span className="opacity-40 italic text-sm">{placeholder}</span>}
      </span>
      <Pencil
        size={11}
        className="opacity-0 group-hover/ie:opacity-50 text-[var(--teal)] shrink-0 transition-opacity"
      />
    </Tag>
  );
}
