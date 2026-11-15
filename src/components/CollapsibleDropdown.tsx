import { useEffect, useRef, useState, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';

type Option = { value: string; label: string };

type Props = {
  label: string;
  options: Option[];
  multi?: boolean;
  selected: string | string[];
  onChange: (value: string | string[]) => void;
  error?: string;
  placeholder?: string;
};

export default function CollapsibleDropdown({
  label,
  options,
  multi = false,
  selected,
  onChange,
  error,
  placeholder,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listId = useId();
  const buttonId = useId();

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [open]);

  const displayValue = () => {
    if (multi) {
      const arr = selected as string[];
      if (!arr || arr.length === 0) return placeholder ?? label;
      if (arr.length === 1) {
        const opt = options.find((o) => o.value === arr[0]);
        return opt ? opt.label : `${arr.length} seleccionados`;
      }
      return `${arr.length} seleccionados`;
    }
    const val = selected as string;
    if (!val) return placeholder ?? label;
    const opt = options.find((o) => o.value === val);
    return opt ? opt.label : val;
  };

  const isSelected = (val: string) => {
    if (multi) return (selected as string[]).includes(val);
    return selected === val;
  };

  const handleOptionClick = (val: string) => {
    if (multi) {
      const arr = selected as string[];
      if (arr.includes(val)) {
        onChange(arr.filter((v) => v !== val));
      } else {
        onChange([...arr, val]);
      }
    } else {
      onChange(val);
      setOpen(false);
    }
  };

  return (
    <div className="lead-field cual-dropdown-field" ref={ref}>
      <span id={label.replace(/\s/g, '-') + '-label'}>{label}</span>
      <button
        type="button"
        id={buttonId}
        className={`cual-dropdown-trigger ${error ? 'has-error' : ''}`}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        onClick={() => setOpen(!open)}
      >
        <span className={multi && (selected as string[]).length === 0 ? 'is-placeholder' : !multi && !selected ? 'is-placeholder' : ''}>
          {displayValue()}
        </span>
        <ChevronDown size={18} className={`cual-chevron ${open ? 'rotated' : ''}`} aria-hidden="true" />
      </button>
      {open && (
        <ul className="cual-dropdown-list" role="listbox" id={listId} aria-labelledby={buttonId}>
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={isSelected(opt.value)}
              tabIndex={0}
              className="cual-dropdown-option"
              onClick={() => handleOptionClick(opt.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOptionClick(opt.value);
                }
              }}
            >
              {multi && <span className={`cual-checkbox ${isSelected(opt.value) ? 'checked' : ''}`}>{isSelected(opt.value) && <Check size={12} />}</span>}
              <span>{opt.label}</span>
              {!multi && isSelected(opt.value) && <Check size={15} className="cual-check-single" />}
            </li>
          ))}
        </ul>
      )}
      {error && <span className="cual-field-error">{error}</span>}
    </div>
  );
}
