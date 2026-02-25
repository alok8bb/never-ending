"use client";

import { createContext, useContext, useEffect, useState } from "react";

type View = "compact" | "expanded";

const ViewContext = createContext<{
  view: View;
  setView: (v: View) => void;
}>({ view: "compact", setView: () => {} });

export function ViewProvider({ children }: { children: React.ReactNode }) {
  const [view, setViewState] = useState<View>("compact");

  useEffect(() => {
    const stored = localStorage.getItem("view-mode");
    if (stored === "compact" || stored === "expanded") {
      setViewState(stored);
    }
  }, []);

  function setView(v: View) {
    setViewState(v);
    localStorage.setItem("view-mode", v);
  }

  return (
    <ViewContext.Provider value={{ view, setView }}>
      {children}
    </ViewContext.Provider>
  );
}

export function useView() {
  return useContext(ViewContext);
}
