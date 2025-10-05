import React from 'react';

interface NavSectionProps {
  title: string;
  collapsed?: boolean;
  children: React.ReactNode;
}

export const NavSection: React.FC<NavSectionProps> = ({ title, collapsed, children }) => {
  return (
    <div className="nav-section">
      {!collapsed && (
        <div className="nav-section-title">{title}</div>
      )}
      {collapsed && (
        <div className="nav-section-divider" />
      )}
      <div className="nav-section-items">
        {children}
      </div>
    </div>
  );
};
