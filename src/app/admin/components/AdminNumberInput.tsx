"use client";

import {
  type InputHTMLAttributes,
  useEffect,
  useRef,
  useState,
} from "react";

type Props = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange" | "inputMode"
> & {
  value: number | string | null | undefined;
  onValueChange: (value: number | null) => void;
  integer?: boolean;
};

function displayValue(value: Props["value"]) {
  if (value === null || value === undefined || value === "") return "";
  return String(value).replace(".", ",");
}

function parseDraft(value: string) {
  if (!value || value === "-" || value === "," || value === ".") {
    return null;
  }

  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

export default function AdminNumberInput({
  value,
  onValueChange,
  integer = false,
  min,
  max,
  onBlur,
  onFocus,
  onKeyDown,
  ...props
}: Props) {
  const [draft, setDraft] = useState(() => displayValue(value));
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setDraft(displayValue(value));
  }, [value]);

  const commit = (raw: string) => {
    const parsed = parseDraft(raw);

    if (parsed === null) {
      setDraft("");
      onValueChange(null);
      return;
    }

    const minValue = min === undefined ? null : Number(min);
    const maxValue = max === undefined ? null : Number(max);
    let next = integer ? Math.round(parsed) : parsed;

    if (minValue !== null && Number.isFinite(minValue)) {
      next = Math.max(minValue, next);
    }
    if (maxValue !== null && Number.isFinite(maxValue)) {
      next = Math.min(maxValue, next);
    }

    setDraft(displayValue(next));
    onValueChange(next);
  };

  return (
    <input
      {...props}
      type="text"
      inputMode={integer ? "numeric" : "decimal"}
      value={draft}
      onFocus={(event) => {
        focused.current = true;
        onFocus?.(event);
      }}
      onChange={(event) => {
        const next = event.target.value
          .replace(/\s/g, "")
          .replace(".", ",");
        const pattern = integer ? /^-?\d*$/ : /^-?\d*(?:,\d*)?$/;

        if (!pattern.test(next)) return;

        setDraft(next);

        const parsed = parseDraft(next);
        if (parsed !== null) {
          onValueChange(integer ? Math.round(parsed) : parsed);
        }
      }}
      onBlur={(event) => {
        focused.current = false;
        commit(draft);
        onBlur?.(event);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
        onKeyDown?.(event);
      }}
      onWheel={(event) => event.currentTarget.blur()}
    />
  );
}
