//Shadcn component

"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayButton, getDefaultClassNames } from "react-day-picker"
import { DayPicker } from "react-day-picker"
import { cn } from "@/app/lib/utils"
import { formatIsoForUi } from '@/app/lib/format-date'
import { pickIconByName } from '@/app/lib/pick-icon-by-name'
import { Button } from "@/components/ui/button"
import { CheckIconMute, CheckIconValid } from "../icons"
import { ToggleSpin } from "../ToggleSpin"
import LoadingSpin from "@/components/ui/loading/loading-spin";
import Loading from "@/components/ui/loading/loading";
import { usePoints } from '@/components/wrappers/PointsContext';

export type CalendarHijriProps = {
  initialData?: Record<string, Array<any>>;
};

export function CalendarHijri({ initialData }: CalendarHijriProps) {
  const { refreshPoints } = usePoints();
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [dayMap, setDayMap] = React.useState<Record<string, Array<any>>>(initialData ?? {});
  const [togglingIds, setTogglingIds] = React.useState<number[]>([]);
  const [selectedYmd, setSelectedYmd] = React.useState<string | null>(() => toYmd(new Date()));
  const [loading, setLoading] = React.useState(true);

  function toYmd(d?: Date | null) {
    if (!d) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  }

  React.useEffect(() => {
    if (!date) return;
    setSelectedYmd(toYmd(date));
  }, [date]);

  React.useEffect(() => {
    setLoading(true);
    const d = date ?? new Date();
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const months = [month - 1, month, month + 1].map((m) => {
      let y = year, mm = m;
      if (mm < 1) { mm = 12; y = year - 1; }
      else if (mm > 12) { mm = 1; y = year + 1; }
      return { y, mm };
    });
    Promise.all(
      months.map(({ y, mm }) =>
        fetch(`/api/habits/calendar?year=${y}&month=${mm}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((json) => json?.days ?? {})
          .catch(() => ({}))
      )
    ).then((results) => {
      const merged: Record<string, Array<any>> = {};
      results.forEach((days) => {
        Object.entries(days).forEach(([ymd, items]) => {
          merged[ymd] = (merged[ymd] ?? []).concat(items as any[]);
        });
      });
      setDayMap(merged);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] py-8">
        <LoadingSpin size={48} />
        <span className="mt-2 text-lg text-muted-foreground">Chargement du calendrier…</span>
      </div>
    );
  }

  const itemsForSelected: Array<{ id: number; name: string; done: boolean; category?: string | null; color?: string | null }> = selectedYmd ? (dayMap[selectedYmd] ?? []) : []

  async function toggleCompletion(item: { id: number; name: string; done: boolean }) {
    if (!selectedYmd) return
    if (selectedYmd !== toYmd(new Date())) return
    const id = item.id
    setTogglingIds((s) => Array.from(new Set([...s, id])))
    try {
      if (item.done) {
        const res = await fetch(`/api/habits/${id}/complete`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ runDate: selectedYmd }),
          credentials: 'same-origin',
        })
        if (!res.ok) throw new Error('Failed to remove completion')
        refreshPoints();
      } else {
        const res = await fetch(`/api/habits/${id}/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ runDate: selectedYmd }),
          credentials: 'same-origin',
        })
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error('Failed to add completion')
        try {
          const awarded = json?.pointsAwarded?.awardedBadges ?? json?.awardedBadges ?? [];
          if (Array.isArray(awarded) && awarded.length > 0) {
            window.dispatchEvent(new CustomEvent('badge:awarded', { detail: awarded }));
          }
        } catch {}
        refreshPoints();
      }

      setDayMap((prev) => {
        const next = { ...prev }
        const arr = (next[selectedYmd] ?? []).map((it: any) => (it.id === id ? { ...it, done: !it.done } : it))
        next[selectedYmd] = arr
        return next
      })
    } catch (err) {
      console.error('Toggle completion error', err)
    } finally {
      setTogglingIds((s) => s.filter((x) => x !== id))
    }
  }

  return (
    <>
      <div className="mx-auto w-fit">
        <Calendar
          mode="single"
          defaultMonth={date}
          selected={date}
          onSelect={setDate}
          className="w-full md:w-auto"
          components={{
            DayButton: (props: any) => {
              const day: Date | undefined = props?.day?.date
              const ymd = toYmd(day)
              const items = ymd ? dayMap[ymd] ?? [] : []

              const allDone = items.length > 0 && items.every((it: any) => it.done)
              const someNotDone = items.length > 0 && !allDone

              const isPastOrToday: boolean = (() => {
                if (!day) return false
                const d = new Date(day.getFullYear(), day.getMonth(), day.getDate())
                const t = new Date()
                const today = new Date(t.getFullYear(), t.getMonth(), t.getDate())
                return d.getTime() <= today.getTime()
              })()

              const statusColor =
                allDone
                  ? "!text-emerald-400"
                  : someNotDone && isPastOrToday
                  ? "!text-rose-400"
                  : "text-inherit"

              const dayButtonBase =
                "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-xs [&>span]:opacity-70 data-[today=true]:ring-2 data-[today=true]:ring-gray-300 data-[today=true]:ring-offset-2 data-[selected-single=true]:ring-0"

              return (
                <Button
                  variant="transparent"
                  size="icon"
                  data-today={props?.day?.isToday ?? props?.day?.today ?? props?.modifiers?.today ?? false}
                  className={cn(dayButtonBase, props.className)}
                  {...props}
                >
                  {typeof props.children === "string" ? (
                    <span className={cn("text-base leading-none", statusColor)}>{props.children}</span>
                  ) : (
                    props.children
                  )}
                </Button>
              )
            },
          }}
        />
      </div>
      <div className="flex flex-col gap-2 mb-4">
        <h2 className="text-lg font-medium text-center">{selectedYmd ? ` ${formatIsoForUi(selectedYmd)}` : 'Sélectionnez une date'}</h2>
        <div className="flex flex-col gap-4">
          {selectedYmd === toYmd(new Date()) && (
            <p className="text-sm text-primary text-center mt-1">N'oubliez pas de réaliser vos habitudes du jour</p>
          )}
          {Object.keys(dayMap ?? {}).length === 0 ? (
            <Loading/>
          ) : (selectedYmd ? (dayMap[selectedYmd] ?? []) : []).length === 0 ? (
            <p className="text-sm text-center text-muted-foreground">Aucune habitude pour cette date n'a été créée.</p>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 mb-18">
              {itemsForSelected.map((it: { id: number; name: string; done: boolean; category?: string | null; color?: string | null }) => {
                const Icon = pickIconByName(it.category ?? it.name ?? '')
                const toggling = togglingIds.includes(it.id)
                const isSelectedToday = selectedYmd === toYmd(new Date())
                const nameStyle = it.color ? ({ ['--habit-color' as any]: it.color } as React.CSSProperties) : undefined;
                return (
                    <div key={`${selectedYmd}-${it.id}`} className="flex items-center gap-3 w-full max-w-md" style={nameStyle}>
                      <span className="flex items-center justify-center">
                        <Icon />
                      </span>
                      <span className="flex-1 truncate text-[color:var(--habit-color,var(--primary))]">{it.name}</span>
                    <button
                      type="button"
                      onClick={() => toggleCompletion(it)}
                      disabled={toggling || !isSelectedToday}
                      aria-pressed={it.done}
                      title={!isSelectedToday ? "Modifier uniquement aujourd\'hui" : it.done ? 'Annuler' : 'Valider'}
                      className={cn(
                        'inline-flex items-center justify-center rounded-md p-1',
                        toggling || !isSelectedToday
                          ? 'opacity-60 pointer-events-none cursor-not-allowed'
                          : 'hover:bg-muted/10'
                      )}
                    >
                      {toggling ? (
                        <ToggleSpin />
                      ) : it.done ? (
                        <CheckIconValid />
                      ) : (
                        <CheckIconMute/>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  variant = "transparent",
  formatters,
  components,
  ...props
}: any) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      fixedWeeks={true}
      locale="fr"
      className={cn(
        "bg-background group/calendar px-1 py-3 [--cell-size:56px] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent mx-auto",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date: Date) =>
          date.toLocaleString("fr", { month: "short" }),
        formatMonthCaption: (date: Date) =>
          date.toLocaleString("fr", { month: "long", year: "numeric" }),
        formatWeekdayName: (date: Date, options?: any) =>
          date.toLocaleDateString("fr", { weekday: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("mx-auto w-full", defaultClassNames.root),
        months: cn("flex gap-6 flex-col md:flex-row relative w-full justify-center", defaultClassNames.months),
        month: cn("flex flex-col items-start w-full max-w-2xl gap-6", defaultClassNames.month),
        nav: cn(
          "flex items-center w-full justify-between",
          defaultClassNames.nav
        ),
        button_previous: cn(
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn("absolute inset-0 opacity-0", defaultClassNames.dropdown),
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "label"
            ? "text-lg"
            : "rounded-md pl-2 pr-1 flex items-center gap-1 text-lg h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none",
          defaultClassNames.weekday
        ),
        week: cn("grid grid-cols-7 w-full mt-2 gap-2 md:gap-4 mb-3", defaultClassNames.week),
        week_number_header: cn(
          "select-none w-(--cell-size)",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-[0.8rem] select-none text-muted-foreground",
          defaultClassNames.week_number
        ),
        day: cn(
          "relative p-0 text-center aspect-square select-none",
          defaultClassNames.day
        ),
        range_start: cn(
          "rounded-l-md bg-accent",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("rounded-r-md bg-accent", defaultClassNames.range_end),
        today: cn(
          "bg-accent text-accent-foreground rounded-primary rounded-md data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4", className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          )
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: any) {
  const defaultClassNames = getDefaultClassNames()

  React.useEffect(() => {
    if (modifiers?.focused && day?.date) {
      const selector = `[data-day="${day.date.toLocaleDateString()}"]`
      const el = document.querySelector<HTMLButtonElement>(selector)
      el?.focus()
    }
  }, [modifiers?.focused, day])

  return (
    <Button
      variant="transparent"
      size="icon"
      data-day={day?.date?.toLocaleDateString()}
      data-today={modifiers?.today}
      data-selected-single={
        modifiers?.selected &&
        !modifiers?.range_start &&
        !modifiers?.range_end &&
        !modifiers?.range_middle
      }
      data-range-start={modifiers?.range_start}
      data-range-end={modifiers?.range_end}
      data-range-middle={modifiers?.range_middle}
      className={cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-xs [&>span]:opacity-70 data-[today=true]:ring-2 data-[today=true]:ring-ring data-[today=true]:ring-offset-2 data-[today=true]:z-20",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}
