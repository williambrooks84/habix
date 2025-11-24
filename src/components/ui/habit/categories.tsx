"use client";

import React from 'react';
import clsx from 'clsx';
import { CategoryProps, CategoryItem } from '@/types/ui';
import { pickIconByName } from '@/app/lib/pick-icon-by-name';

export default function Categories({ items, categories, onSelect, className, selectedId = null, id }: CategoryProps) {
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
        }));
    }, [items, categories]);

    const itemRefs = React.useRef<Record<string, HTMLButtonElement | null>>({});
    const [maxWidth, setMaxWidth] = React.useState<number | null>(null);

    React.useEffect(() => {
        function measure() {
            const widths = resolved.map((it) => {
                const el = itemRefs.current[String(it.id)];
                return el ? el.offsetWidth : 0;
            });
            const mw = widths.length ? Math.max(...widths) : 0;
            setMaxWidth(mw || null);
        }

        const id = window.requestAnimationFrame(() => measure());
        const onResize = () => measure();
        window.addEventListener('resize', onResize);

        return () => {
            window.cancelAnimationFrame(id);
            window.removeEventListener('resize', onResize);
        };
    }, [resolved]);

     return (
         <div
             id={id}
             className={clsx('flex flex-wrap justify-center gap-6', className)}
             style={maxWidth ? { ['--cat-min-w' as any]: `${maxWidth}px` } : undefined}
         >
             {resolved.map((it) => {
                 const { id, label, Icon, selected } = it;
                 const ResolvedIcon = Icon ?? (() => <span className="w-5 h-5" />);
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
                             'flex flex-col items-center gap-2 px-7 py-11 rounded-xl border-3 transition-colors focus:outline-none min-w-[var(--cat-min-w)]',
                             isSelected
                                 ? 'text-foreground border-primary'
                                 : 'bg-transparent text-foreground border-grey'
                         )}
                         ref={(el) => { itemRefs.current[String(id)] = el; }}
                     >
                         <ResolvedIcon className="w-5 h-5" />
                         <span className="text-base font-medium">{label}</span>
                     </button>
                 );
             })}
         </div>
     );
}