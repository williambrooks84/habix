import React from 'react';
import { MenuItemProps } from '@/types/ui';

export default function MenuItem({ children, className = '', href, onClick }: MenuItemProps) {
  const content = (
    <div className="flex items-center justify-between w-full" onClick={onClick}>
      {children}
    </div>
  );

  return (
    <li className={`pt-4 ${className}`}>
      {href ? (
        <a href={href} className="block w-full">
          {content}
        </a>
      ) : (
        content
      )}
    </li>
  );
}
