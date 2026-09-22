"use client";

import { createContext, useContext } from "react";

export type ShellApi = { requestExit: () => void };

export const ShellContext = createContext<ShellApi | null>(null);

export function useShell(): ShellApi | null {
  return useContext(ShellContext);
}
