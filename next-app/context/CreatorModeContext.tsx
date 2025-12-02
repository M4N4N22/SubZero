"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

interface CreatorModeContextType {
  creatorMode: boolean;
  transitioning: boolean;
  toggleCreatorMode: () => void;
  setCreatorMode: (value: boolean) => void;
}

const CreatorModeContext = createContext<CreatorModeContextType>({
  creatorMode: false,
  transitioning: false,
  toggleCreatorMode: () => {},
  setCreatorMode: () => {},
});

export const CreatorModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [creatorMode, setCreatorModeState] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Load initial mode
  useEffect(() => {
    const saved = localStorage.getItem("creatorMode");
    const mode = saved === "true";
    setCreatorModeState(mode);

    if (mode) router.replace("/creator/dashboard");
    else router.replace("/discover");
  }, []);

  const setCreatorMode = (value: boolean) => {
    // prevent rapid toggles
    if (debounceRef.current) return;

    setTransitioning(true);

    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
    }, 600);

    // apply the mode after fade-out begins
    setTimeout(() => {
      setCreatorModeState(value);
      localStorage.setItem("creatorMode", value.toString());
    }, 150);

    // redirect after mode change
    setTimeout(() => {
      if (value) router.replace("/creator/dashboard");
      else router.replace("/discover");

      // fade in
      setTimeout(() => setTransitioning(false), 200);
    }, 200);
  };

  const toggleCreatorMode = () => setCreatorMode(!creatorMode);

  // Prevent staying in creator routes when mode turns off
  useEffect(() => {
    if (!creatorMode && pathname.startsWith("/creator")) {
      router.replace("/discover");
    }
  }, [creatorMode, pathname]);

  return (
    <CreatorModeContext.Provider
      value={{ creatorMode, transitioning, toggleCreatorMode, setCreatorMode }}
    >
      {children}
    </CreatorModeContext.Provider>
  );
};

export const useCreatorMode = () => useContext(CreatorModeContext);
