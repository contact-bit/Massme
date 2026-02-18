"use client";
import { useMemo, useState } from "react";

export function useSelection() {
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const selectedIds = useMemo(
    () => Object.keys(selected).filter((id) => selected[id]),
    [selected]
  );

  const toggleOne = (id: string) =>
    setSelected((s) => ({ ...s, [id]: !s[id] }));

  const clearSelection = () => setSelected({});

  return { selected, setSelected, selectedIds, toggleOne, clearSelection };
}
