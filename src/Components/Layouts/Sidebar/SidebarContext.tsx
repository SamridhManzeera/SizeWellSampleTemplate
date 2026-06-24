import { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarCtx {
  open: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
}

const Ctx = createContext<SidebarCtx>({ open: false, openSidebar: () => {}, closeSidebar: () => {} });

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Ctx.Provider value={{ open, openSidebar: () => setOpen(true), closeSidebar: () => setOpen(false) }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSidebar() { return useContext(Ctx); }
