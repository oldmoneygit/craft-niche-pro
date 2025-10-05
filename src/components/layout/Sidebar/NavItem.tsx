import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  to: string;
  badge?: number;
  collapsed?: boolean;
}

export const NavItem: React.FC<NavItemProps> = React.memo(({ 
  icon: Icon, 
  label, 
  to, 
  badge, 
  collapsed 
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  const content = (
    <Link
      to={to}
      className={`nav-item ${isActive ? 'active' : ''} ${collapsed ? 'collapsed' : ''}`}
      aria-label={label}
    >
      <div className="nav-item-icon">
        <Icon className="w-5 h-5" />
      </div>
      {!collapsed && (
        <span className="nav-item-label">{label}</span>
      )}
      {!collapsed && badge !== undefined && badge > 0 && (
        <span className="nav-item-badge">{badge}</span>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-zinc-900 text-white border-zinc-700">
            <div className="flex items-center gap-2">
              <span>{label}</span>
              {badge !== undefined && badge > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary rounded-full">
                  {badge}
                </span>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
});

NavItem.displayName = 'NavItem';
