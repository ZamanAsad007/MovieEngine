import { createContext, useContext, useMemo, useState } from "react";

const UiContext = createContext(null);

export const useUi = () => useContext(UiContext);

export function UiProvider({ children }) {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const openAuthModal = () => setAuthModalOpen(true);
  const closeAuthModal = () => setAuthModalOpen(false);

  const value = useMemo(
    () => ({
      authModalOpen,
      openAuthModal,
      closeAuthModal,
    }),
    [authModalOpen]
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}
