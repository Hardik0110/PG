import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  Users, Home, Wrench, ArrowRight, Activity, BedDouble,
  TrendingUp, TrendingDown, IndianRupee, AlertTriangle, CheckCircle2,
  CalendarDays, UserPlus,
} from "lucide-react"
import { apiRequest, unwrapData } from "@/lib/api"
import { cn } from "@/lib/utils"
import Loader from "@/components/ui/Loader"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Separator } from "@/components/ui/separator"



function relativeTime(dateString?: string) {
  if (!dateString) return ""
  const now = new Date()
  const then = new Date(dateString)
  const diffMs = now.getTime() - then.getTime()
  const mins = Math.floor(diffMs / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m`
  if (hours < 24) return `${hours}h`
  if (days < 7) return `${days}d`
  return then.toLocaleDateString()
}

function getInitial(name?: string) {
  if (!name) return "?"
  return name.charAt(0).toUpperCase()
}

const STATUS_BADGE = {
  open: "destructive",
  in_progress: "warning",
  resolved: "success",
  closed: "neutral",
} as const

const PRIORITY_TONE = {
  high: "bg-red-500",
  medium: "bg-amber-400",
  low: "bg-brand-400",
} as const

const CATEGORY_TONE = {
  plumbing: "bg-blue-500/15 text-blue-400",
  electrical: "bg-orange-500/15 text-orange-400",
  furniture: "bg-purple-500/15 text-purple-400",
  cleaning: "bg-brand-500/15 text-brand-400",
  other: "bg-muted text-muted-foreground",
} as const



interface StatCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  value: React.ReactNode
  delta?: number | null
  deltaUnit?: string
  footer?: React.ReactNode
}

function StatCard({ icon: Icon, label, value, delta, deltaUnit, footer }: StatCardProps) {
  const positive = (delta ?? 0) >= 0
  return (
    <Card className="flex h-[88px] items-center p-4">
      {/* Left: icon + label + value */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-[10.5px] font-semibold uppercase tracking-wider leading-tight text-muted-foreground">
            {label}
          </p>
          <p className="mt-0.5 text-2xl font-bold leading-tight tabular-nums text-foreground">
            {value}
          </p>
        </div>
      </div>

      {/* Right: trend chip + sub-info */}
      <div className="ml-3 flex shrink-0 flex-col items-end gap-1 text-right">
        {delta != null ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
              positive
                ? "border-brand-500/30 bg-brand-500/10 text-brand-400"
                : "border-red-500/30 bg-red-500/10 text-red-400"
            )}
          >
            {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {positive ? `+${delta}` : delta}
            {deltaUnit ?? ""}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
            <CheckCircle2 size={11} className="text-brand-400" />
            stable
          </span>
        )}
        <p className="line-clamp-1 max-w-[140px] text-[11px] leading-tight text-muted-foreground">
          {footer}
        </p>
      </div>

    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Inline mini-metric (used in second strip)                          */
/* ------------------------------------------------------------------ */

interface MiniMetricProps {
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  icon?: React.ComponentType<{ size?: number; className?: string }>
}

function MiniMetric({ label, value, hint, icon: Icon }: MiniMetricProps) {
  return (
    <div className="flex flex-1 items-center gap-3 px-4 py-3">
      {Icon ? (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Icon size={14} />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-semibold tabular-nums text-foreground">{value}</p>
      </div>
      {hint != null ? (
        <span className="shrink-0 text-[11px] text-muted-foreground">{hint}</span>
      ) : null}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Section card with header                                           */
/* ------------------------------------------------------------------ */

function SectionCard({
  title,
  icon: Icon,
  action,
  children,
  className,
}: {
  title: string
  icon?: React.ComponentType<{ size?: number; className?: string }>
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={cn("flex flex-col overflow-hidden", className)}>
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-2">
          {Icon ? <Icon size={15} className="text-muted-foreground" /> : null}
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        {action}
      </div>
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Activity timeline grouping                                         */
/* ------------------------------------------------------------------ */

const TIMELINE_DOT = {
  ticket: "bg-red-500",
  tenant: "bg-brand-500",
  general: "bg-muted-foreground",
} as const

function buildTimeline(tenants: any[], tickets: any[]) {
  const items: any[] = []
  tenants.forEach((t) =>
    items.push({
      id: `tn-${t.id}`,
      type: "tenant",
      time: t.move_in_date,
      description: `${t.name || "New tenant"} moved into Room ${t.room_number || "?"}`,
    })
  )
  tickets.forEach((t) =>
    items.push({
      id: `tk-${t.id}`,
      type: "ticket",
      time: t.created_at,
      description: `Ticket: "${t.title || "Untitled"}"`,
    })
  )
  items
    .filter((i) => i.time)
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  return items.slice(0, 8)
}

/* ------------------------------------------------------------------ */
/*  Room status mini-card                                              */
/* ------------------------------------------------------------------ */

function RoomStatusBar({
  label,
  count,
  total,
  tone,
}: {
  label: string
  count: number
  total: number
  tone: string
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-semibold tabular-nums text-foreground">
          {count}
          <span className="text-muted-foreground"> / {total}</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", tone)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Dashboard                                                     */
/* ------------------------------------------------------------------ */

function Dashboard() {
  const [tenants, setTenants] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [priorityFilter, setPriorityFilter] = useState<"all" | "high" | "medium">("all")

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const [, tenantsPayload, ticketsPayload, roomsPayload] =
          await Promise.all([
            apiRequest("/api/v1/pg-facilities/"),
            apiRequest("/api/v1/tenants/"),
            apiRequest("/api/v1/tickets/my"),
            apiRequest("/api/v1/rooms/"),
          ])
        if (!mounted) return
        setTenants(unwrapData<any[]>(tenantsPayload, []) || [])
        setRooms(unwrapData<any[]>(roomsPayload, []) || [])
        const tk = unwrapData<any[]>(ticketsPayload, []) || []
        setTickets(Array.isArray(tk) ? tk.filter((x) => !x.detail) : [])
      } catch {
        /* noop */
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const totalTenants = tenants.length
  const totalRooms = rooms.length
  const vacantRooms = rooms.filter((r) => r.status === "vacant").length
  const occupiedRooms = rooms.filter((r) => r.status === "occupied").length
  const maintRooms = rooms.filter((r) => r.status === "maintenance").length
  const reservedRooms = rooms.filter((r) => r.status === "reserved").length
  const openTickets = tickets.filter((t) => t.status !== "resolved" && t.status !== "closed")
  const highPriorityTickets = openTickets.filter((t) => t.priority === "high").length
  const todayCount = openTickets.filter(
    (t) => t.created_at && new Date(t.created_at).toDateString() === new Date().toDateString()
  ).length
  const occupancy = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

  // Mock revenue/payments (no API yet)
  const revenueMTD = totalTenants * 8500
  const dueThisWeek = Math.max(0, Math.round(totalTenants * 0.15))
  const avgRent = totalTenants > 0
    ? Math.round(tenants.reduce((s, t) => s + (t.rent || 0), 0) / totalTenants)
    : 0

  const recentTenants = [...tenants]
    .filter((t) => t.move_in_date)
    .sort((a, b) => new Date(b.move_in_date).getTime() - new Date(a.move_in_date).getTime())
    .slice(0, 5)
  const filteredTickets = openTickets
    .filter((t) => priorityFilter === "all" || t.priority === priorityFilter)
    .slice(0, 5)
  const timeline = buildTimeline(tenants, tickets)

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <Loader size={28} />
          <span className="text-sm">Loading dashboard…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto pr-1 flex flex-col gap-4">
      {/* Header strip — greeting + date + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}{" "}
            · {totalTenants} tenants · {occupancy}% occupied
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/transactions">
              <IndianRupee size={14} /> Transactions
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/maintenance">
              <Wrench size={14} /> Tickets
              {openTickets.length > 0 ? (
                <Badge variant="destructive" className="ml-1 h-4 px-1 text-[10px]">
                  {openTickets.length}
                </Badge>
              ) : null}
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/tenants">
              <Users size={14} /> Add tenant
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat cards — 4 columns, all uniform h-[140px], identical inner rhythm */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Tenants"
          value={totalTenants}
          delta={2}
          footer={`${totalTenants}/${totalRooms} capacity used`}
        />
        <StatCard
          icon={Home}
          label="Occupancy"
          value={`${occupancy}%`}
          delta={5}
          deltaUnit="%"
          footer={`${occupiedRooms} occupied · ${vacantRooms} vacant`}
        />
        <StatCard
          icon={BedDouble}
          label="Vacant Rooms"
          value={vacantRooms}
          delta={null}
          footer={vacantRooms > 0 ? `${vacantRooms} ready to book` : "fully booked"}
        />
        <StatCard
          icon={Wrench}
          label="Open Tickets"
          value={openTickets.length}
          delta={openTickets.length === 0 ? null : -1}
          footer={todayCount > 0 ? `${todayCount} new today` : "no new today"}
        />
      </div>

      {/* Inline mini-metrics strip — extra info, very compact */}
      <Card className="grid grid-cols-2 divide-x divide-y divide-border md:grid-cols-4 md:divide-y-0">
        <MiniMetric
          icon={IndianRupee}
          label="Revenue MTD"
          value={`₹${(revenueMTD / 1000).toFixed(1)}K`}
          hint={
            <span className="text-brand-400">
              <TrendingUp size={11} className="inline" /> 8%
            </span>
          }
        />
        <MiniMetric
          icon={CalendarDays}
          label="Due this week"
          value={`${dueThisWeek} payments`}
          hint={<span>₹{((dueThisWeek * 8500) / 1000).toFixed(1)}K</span>}
        />
        <MiniMetric
          icon={UserPlus}
          label="Avg rent"
          value={`₹${(avgRent / 1000).toFixed(1)}K`}
          hint={
            <span className="text-brand-400">
              <TrendingUp size={11} className="inline" /> 4%
            </span>
          }
        />
        <MiniMetric
          icon={AlertTriangle}
          label="Action needed"
          value={`${highPriorityTickets} items`}
          hint={
            <span className={highPriorityTickets > 0 ? "text-red-400" : "text-muted-foreground"}>
              {highPriorityTickets > 0 ? "High" : "None"}
            </span>
          }
        />
      </Card>

      {/* 2-col: Recent Tenants | Tickets */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <SectionCard
          title="Recent Tenants"
          icon={Users}
          className="h-[340px]"
          action={
            <Link
              to="/tenants"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              View all <ArrowRight size={12} />
            </Link>
          }
        >
          {recentTenants.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No tenants yet
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recentTenants.map((t, idx) => (
                <li
                  key={t.id || idx}
                  className="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/50"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                    {getInitial(t.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="truncate text-sm font-medium text-foreground">
                      {t.name || "Tenant"}
                    </span>
                    <p className="truncate text-xs text-muted-foreground">
                      Room {t.room_number || "—"}
                      {t.rent ? ` · ₹${t.rent.toLocaleString("en-IN")}/mo` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-0.5">
                    <span className="text-[10.5px] text-muted-foreground">
                      {relativeTime(t.move_in_date)}
                    </span>
                    <Badge variant="success" className="h-4 px-1.5 text-[10px]">
                      moved in
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Open Tickets"
          icon={Wrench}
          className="h-[340px]"
          action={
            <div className="flex items-center gap-1">
              {(["all", "high", "medium"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className={cn(
                    "h-6 rounded-md px-2 text-[11px] font-medium transition-colors",
                    priorityFilter === p
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          }
        >
          {filteredTickets.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No tickets
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {filteredTickets.map((t) => {
                const tone =
                  (CATEGORY_TONE as any)[t.category] || CATEGORY_TONE.other
                return (
                  <li
                    key={t.id}
                    className="flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/50"
                  >
                    <span
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        (PRIORITY_TONE as any)[t.priority] || "bg-muted-foreground"
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {t.title || "Untitled"}
                      </p>
                      <span
                        className={cn(
                          "mt-0.5 inline-flex h-4 items-center rounded px-1.5 text-[10px] font-medium",
                          tone
                        )}
                      >
                        {(t.category || "other").charAt(0).toUpperCase() +
                          (t.category || "other").slice(1)}
                      </span>
                    </div>
                    <Badge
                      variant={(STATUS_BADGE as any)[t.status] || "neutral"}
                      dot
                      className="h-4 px-1.5 text-[10px]"
                    >
                      {(t.status || "open").replace("_", " ")}
                    </Badge>
                  </li>
                )
              })}
            </ul>
          )}
        </SectionCard>
      </div>

      {/* Bottom: Activity Timeline (2/3) | Room status (1/3) */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <SectionCard
          title="Recent Activity"
          icon={Activity}
          className="h-[300px] lg:col-span-2"
        >
          {timeline.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No recent activity
            </div>
          ) : (
            <ul className="space-y-1 px-4 py-3">
              {timeline.map((item) => (
                <li key={item.id} className="flex items-start gap-3 py-1.5">
                  <span
                    className={cn(
                      "mt-1.5 size-1.5 shrink-0 rounded-full",
                      (TIMELINE_DOT as any)[item.type] || TIMELINE_DOT.general
                    )}
                  />
                  <p className="flex-1 truncate text-sm text-foreground/90">
                    {item.description}
                  </p>
                  <span className="shrink-0 text-[10.5px] text-muted-foreground">
                    {relativeTime(item.time)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Room Status" icon={BedDouble} className="h-[300px]">
          <div className="flex flex-col gap-3 p-4">
            <RoomStatusBar
              label="Occupied"
              count={occupiedRooms}
              total={totalRooms}
              tone="bg-brand-500"
            />
            <RoomStatusBar
              label="Vacant"
              count={vacantRooms}
              total={totalRooms}
              tone="bg-blue-500"
            />
            <RoomStatusBar
              label="Reserved"
              count={reservedRooms}
              total={totalRooms}
              tone="bg-amber-500"
            />
            <RoomStatusBar
              label="Maintenance"
              count={maintRooms}
              total={totalRooms}
              tone="bg-red-500"
            />
            <Separator className="my-1" />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Total beds</span>
              <span className="font-mono font-semibold tabular-nums">
                {totalRooms}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Net occupancy</span>
              <span className="inline-flex items-center gap-1 font-mono font-semibold tabular-nums">
                {occupancy}%
                <CheckCircle2 size={11} className="text-brand-400" />
              </span>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}

export default Dashboard
