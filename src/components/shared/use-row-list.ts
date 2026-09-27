"use client";

import { useState } from "react";

let nextRowKey = 0;

export function useRowList<T extends Record<string, unknown>>(
  makeEmptyRow: () => T,
  initial: T[] = [],
) {
  const [rows, setRows] = useState<Array<T & { _key: number }>>(() =>
    initial.map((row) => ({ ...row, _key: nextRowKey++ })),
  );

  function addRow() {
    setRows((prev) => [...prev, { ...makeEmptyRow(), _key: nextRowKey++ }]);
  }

  function removeRow(key: number) {
    setRows((prev) => prev.filter((row) => row._key !== key));
  }

  function updateRow(key: number, patch: Partial<T>) {
    setRows((prev) => prev.map((row) => (row._key === key ? { ...row, ...patch } : row)));
  }

  return { rows, addRow, removeRow, updateRow };
}
