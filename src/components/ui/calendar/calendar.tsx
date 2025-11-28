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

export function CalendarHijri() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [dayMap, setDayMap] = React.useState<Record<string, Array<{ id: number; name: string; done: boolean; category?: string | null }>>>(() => ({}))

  function toYmd(d?: Date | null) {
    if (!d) return null
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${dd}`
  }

  const [selectedYmd, setSelectedYmd] = React.useState<string | null>(() => {
    return toYmd(new Date())
  })

  const [monthLoading, setMonthLoading] = React.useState(false)

  const isSelectedInCurrentMonth = React.useMemo(() => {
    if (!selectedYmd) return false
    const parts = selectedYmd.split('-')
    if (parts.length < 2) return false
    const y = Number(parts[0])
    const m = Number(parts[1])
    const d = date ?? new Date()
    return y === d.getFullYear() && m === d.getMonth() + 1
  }, [selectedYmd, date])

  React.useEffect(() => {
    const d = date ?? new Date()
    const year = d.getFullYear()
    const month = d.getMonth() + 1
      const abort = new AbortController()
      setMonthLoading(true)
    fetch(`/api/habits/calendar?year=${year}&month=${month}`, { signal: abort.signal })
      .then((res) => res.json())
      .then((json) => {
        if (json?.days) setDayMap(json.days)
      })
      .catch((err) => {
        if ((err as any)?.name !== 'AbortError') console.error('Failed to load calendar habits', err)
      })
        .finally(() => setMonthLoading(false))
      return () => {
        abort.abort()
        setMonthLoading(false)
      }
  }, [date])

  React.useEffect(() => {
    if (!date) return
    setSelectedYmd(toYmd(date))
  }, [date])

  const itemsForSelected: Array<{ id: number; name: string; done: boolean; category?: string | null }> = selectedYmd ? (dayMap[selectedYmd] ?? []) : []
  const [togglingIds, setTogglingIds] = React.useState<number[]>([])

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
      } else {
        const res = await fetch(`/api/habits/${id}/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ runDate: selectedYmd }),
          credentials: 'same-origin',
        })
        if (!res.ok) throw new Error('Failed to add completion')
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

              const isPastOrToday = (() => {
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
          {monthLoading && isSelectedInCurrentMonth ? (
            <p className="text-sm text-center text-muted-foreground">Chargement...</p>
          ) : (selectedYmd ? (dayMap[selectedYmd] ?? []) : []).length === 0 ? (
            <p className="text-sm text-center text-muted-foreground">Aucune habitude pour cette date n'a été créée.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {itemsForSelected.map((it: { id: number; name: string; done: boolean; category?: string | null }) => {
                const Icon = pickIconByName(it.category ?? it.name ?? '')
                const toggling = togglingIds.includes(it.id)
                const isSelectedToday = selectedYmd === toYmd(new Date())
                return (
                  <div key={`${selectedYmd}-${it.id}`} className="flex items-center gap-3">
                    <span className="flex items-center justify-center">
                      <Icon />
                    </span>
                    <span className="flex-1 truncate">{it.name}</span>
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
