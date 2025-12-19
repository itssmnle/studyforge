import { createContext, useContext, useState } from "react";

const AuthModalContext = createContext();

export function AuthModalProvider({ children }) {
  const [isLoginOpen, setLoginOpen] = useState(false);

  return (
    <AuthModalContext.Provider
      value={{
        openLogin: () => setLoginOpen(true),
        closeLogin: () => setLoginOpen(false),
        isLoginOpen
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  return useContext(AuthModalContext);
}
