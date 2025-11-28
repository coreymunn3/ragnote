"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

interface MobileHeaderConfig {
  leftContent?: React.ReactNode;
  centerContent?: React.ReactNode;
  rightContent?: React.ReactNode;
}

interface MobileHeaderContextValue {
  headerConfig: MobileHeaderConfig;
  setHeaderConfig: (config: MobileHeaderConfig) => void;
  resetHeaderConfig: () => void;
}

const MobileHeaderContext = createContext<MobileHeaderContextValue | undefined>(
  undefined
);

export const MobileHeaderProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [headerConfig, setHeaderConfigState] = useState<MobileHeaderConfig>({});

  const setHeaderConfig = useCallback((config: MobileHeaderConfig) => {
    setHeaderConfigState(config);
  }, []);

  const resetHeaderConfig = useCallback(() => {
    setHeaderConfigState({});
  }, []);

  return (
    <MobileHeaderContext.Provider
      value={{ headerConfig, setHeaderConfig, resetHeaderConfig }}
    >
      {children}
    </MobileHeaderContext.Provider>
  );
};

export const useMobileHeader = () => {
  const context = useContext(MobileHeaderContext);
  if (context === undefined) {
    throw new Error("useMobileHeader must be used within MobileHeaderProvider");
  }
  return context;
};
