
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen pb-20 max-w-md mx-auto relative bg-zinc-50 dark:bg-zinc-950 overflow-x-hidden">
      {children}
    </div>
  );
};

