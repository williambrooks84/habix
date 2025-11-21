"use client";

import React from 'react';
import clsx from 'clsx';
import { CategoryProps, CategoryItem } from '@/types/ui';
import {
    HealthIcon,
    LearningIcon,
    ProductivityIcon,
    ActivityIcon,
} from '@/components/ui/icons';


function pickIconByName(name: string) {
    const n = name.toLowerCase();
    if (n.includes('sant') || n.includes('health') || n.includes('santé')) return HealthIcon;
    if (n.includes('learn') || n.includes('study') || n.includes('appr')) return LearningIcon;
    if (n.includes('prod') || n.includes('work') || n.includes('task') || n.includes('tâche') || n.includes('travail')) return ProductivityIcon;
    if (n.includes('sport') || n.includes('activité') || n.includes('move') || n.includes('activity')) return ActivityIcon;
    return ActivityIcon;
}

export default function Categories({ items, categories, onSelect, className, selectedId = null }: CategoryProps) {
    const [localSelectedId, setLocalSelectedId] = React.useState<number | string | null>(selectedId ?? null);
    React.useEffect(() => {
        setLocalSelectedId(selectedId ?? null);
    }, [selectedId]);
    const resolved: CategoryItem[] = React.useMemo(() => {
        if (items && items.length > 0) return items;
        if (!categories) return [];
        return categories.map((c) => ({
            id: c.id,
            label: c.name,
            Icon: pickIconByName(c.name),
            // don't rely solely on this.selected — selection is derived at render time
        }));
    }, [items, categories]);

     return (
         <div className={clsx('flex flex-wrap gap-3', className)}>
             {resolved.map((it) => {
                 const { id, label, Icon, selected } = it;
                 const ResolvedIcon = Icon ?? (() => <span className="w-5 h-5" />);
                 // decide selection: prop-controlled selectedId takes precedence, otherwise local state
                 const isSelected = selectedId != null
                     ? String(selectedId) === String(id)
                     : localSelectedId != null && String(localSelectedId) === String(id);
                 return (
                     <button
                         key={String(id)}
                         type="button"
                         onClick={() => {
                             setLocalSelectedId(id);
                             onSelect?.(id);
                         }}
                         aria-pressed={isSelected ? 'true' : 'false'}
                         className={clsx(
                             'flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors focus:outline-none',
                             isSelected
                                 ? 'bg-primary text-foreground border-primary'
                                 : 'bg-transparent text-foreground border-grey'
                         )}
                     >
                         <ResolvedIcon className="w-5 h-5" />
                         <span className="text-sm font-medium">{label}</span>
                     </button>
                 );
             })}
         </div>
     );
}