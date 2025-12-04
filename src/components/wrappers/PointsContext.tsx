"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PointsContextType } from '@/types/ui';

const PointsContext = createContext<PointsContextType | undefined>(undefined);

export function PointsProvider({ children }: { children: ReactNode }) {
  const [pointsVersion, setPointsVersion] = useState(0);

  const refreshPoints = () => {
    setPointsVersion(prev => prev + 1);
  };

  return (
    <PointsContext.Provider value={{ pointsVersion, refreshPoints }}>
      {children}
    </PointsContext.Provider>
  );
}

export function usePoints() {
  const context = useContext(PointsContext);
  if (context === undefined) {
    throw new Error('usePoints must be used within a PointsProvider');
  }
  return context;
}
