"use client";

import { createContext, useContext, useState } from "react";
import FilterSidebar from "./FilterSidebar";

type FilterSidebarContextType = {
  open: () => void;
  close: () => void;
};

const FilterSidebarContext = createContext<FilterSidebarContextType | null>(null);

export function FilterSidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <FilterSidebarContext.Provider
      value={{
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
      }}
    >
      {children}
      <FilterSidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </FilterSidebarContext.Provider>
  );
}

export function useFilterSidebar() {
  const ctx = useContext(FilterSidebarContext);
  if (!ctx) {
    throw new Error("useFilterSidebar must be used inside FilterSidebarProvider");
  }
  return ctx;
}
