import React from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface UserProfileProps {
  collapsed?: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({ collapsed }) => {
  const profile = useUserProfile();

  if (!profile) return null;

  const initials = profile.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const roleLabel = profile.role === 'owner' ? 'Proprietário' : 
                   profile.role === 'professional' ? 'Profissional' : 
                   'Assistente';

  const content = (
    <div className={`user-profile ${collapsed ? 'collapsed' : ''}`}>
      <Avatar className="user-avatar">
        <AvatarFallback className="user-avatar-fallback">
          {initials}
        </AvatarFallback>
      </Avatar>
      {!collapsed && (
        <div className="user-info">
          <div className="user-name">{profile.full_name}</div>
          <div className="user-role">{roleLabel}</div>
        </div>
      )}
    </div>
  );

  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-zinc-900 text-white border-zinc-700">
            <div>
              <div className="font-semibold">{profile.full_name}</div>
              <div className="text-xs text-zinc-400">{roleLabel}</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
};
