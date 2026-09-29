"use client"

import { useEffect, type ReactNode } from "react"
import { useReportStore } from "@/stores/reportStore"
import { useNuiActions } from "@/hooks/useNui"
import { EmptyState, IconButton, PriorityGlyph, Segmented, Spinner } from "@/components/ui"
import { getCategoryLabel, getPriorityMeta } from "@/lib/reportMeta"
import { formatDateTime, formatDuration, formatNumber } from "@/lib/time"
import { cn } from "@/lib/utils"
import type { StatsRange } from "@/types"
import { Delta, KpiTile } from "./KpiTile"
import { TrendChart } from "./TrendChart"
import { HourChart } from "./HourChart"
import { BarList } from "./BarList"
import { DotPlot } from "./DotPlot"
import { StaffTable } from "./StaffTable"
import { seriesValues } from "./format"

// Below this many measurements a median says little, the tile greys out
const MIN_SAMPLE = 5

function Section({ title, subtitle, children, className }: { title: string; subtitle?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-lg border border-line bg-panel", className)}>
      <header className="px-5 pt-4 pb-3">
        <h3 className="text-base font-semibold text-fg">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-fg-subtle">{subtitle}</p>}
      </header>
      <div className="px-5 pb-5">{children}</div>
    </section>
  )
}

export function StatisticsPanel() {
  const { statistics, statsRange, setStatsRange, locale, language, categories, priorities } = useReportStore()
  const { getStatistics } = useNuiActions()

  useEffect(() => {
    getStatistics(statsRange)
  }, [getStatistics, statsRange])

  const t = (key: string, fallback: string) => locale[key] || fallback

  const rangeLabels: Record<StatsRange, string> = {
    today: t("stats_range_today", "Today"),
    "7d": t("stats_range_7d", "7 days"),
    "30d": t("stats_range_30d", "30 days"),
    "90d": t("stats_range_90d", "90 days"),
    all: t("stats_range_all", "All time")
  }

  const toolbar = (
    <div className="flex items-center gap-3">
      <Segmented
        value={statsRange}
        onChange={setStatsRange}
        options={(Object.keys(rangeLabels) as StatsRange[]).map((value) => ({ value, label: rangeLabels[value] }))}
        className="w-[34rem]"
      />
      <div className="ml-auto flex items-center gap-2 text-xs text-fg-faint">
        {statistics && statistics.range !== statsRange && <Spinner className="w-3.5 h-3.5" />}
        {statistics && <span>{t("stats_updated", "Updated %s").replace("%s", formatDateTime(statistics.generatedAt, language))}</span>}
        <IconButton icon="refresh" label={t("inventory_refresh", "Refresh")} size="sm" onClick={() => getStatistics(statsRange)} />
      </div>
    </div>
  )

  if (!statistics) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto p-6">
        {toolbar}
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-fg-subtle">
          <Spinner /> {t("loading", "Loading...")}
        </div>
      </div>
    )
  }

  const { current, previous, snapshot, series } = statistics
  const compareLabel = statsRange === "today" ? t("stats_vs_yesterday", "vs. yesterday") : t("stats_vs_previous", "vs. previous period")
  const num = (value: number) => formatNumber(Math.round(value), language)
  const waiting = snapshot.open + snapshot.claimed
  const empty = current.created === 0 && current.resolved === 0
  const per = { hour: t("stats_per_hour", "Per hour"), day: t("stats_per_day", "Per day"), week: t("stats_per_week", "Per week") }[statistics.bucket]
  const average = (value: number) =>
    t(`stats_avg_${statistics.bucket}`, `Ø %s per ${statistics.bucket}`).replace("%s", num(value / Math.max(1, series.length)))

  const durationTile = (key: "firstResponse" | "resolution", label: string, sparkKey: "firstResponseMedian" | "resolutionMedian") => {
    const summary = current[key]
    const weak = summary.count < MIN_SAMPLE
    return (
      <KpiTile
        label={label}
        value={formatDuration(summary.median)}
        weak={weak}
        detail={
          summary.median === null
            ? t("stats_no_measurements", "No measurements yet")
            : weak
              ? t("stats_low_sample", "Only %d measured").replace("%d", String(summary.count))
              : t("stats_p90", "90% within %s").replace("%s", formatDuration(summary.p90))
        }
        delta={
          previous !== null && previous !== undefined ? (
            <Delta current={summary.median} previous={previous[key].median} meaning="down-good" format={formatDuration} label={compareLabel} />
          ) : undefined
        }
        sparkline={seriesValues(series, sparkKey)}
      />
    )
  }

  const priorityTone = (priority: number) => {
    const meta = getPriorityMeta(priority, priorities, locale)
    return meta.tone === "red" ? "fill-red" : meta.tone === "orange" ? "fill-orange" : "fill-fg-faint"
  }

  return (
    <div className={cn("flex-1 min-h-0 overflow-y-auto p-6 space-y-5 transition-opacity", statistics.range !== statsRange && "opacity-60")}>
      {toolbar}

      <div className="grid grid-cols-5 rounded-lg border border-line bg-panel divide-x divide-line">
        <KpiTile
          label={t("kpi_waiting", "Waiting now")}
          value={num(waiting)}
          detail={
            waiting > 0
              ? t("kpi_waiting_detail", "%d unclaimed · oldest %s")
                  .replace("%d", String(snapshot.open))
                  .replace("%s", formatDuration(snapshot.oldestOpenAt ? statistics.generatedAt - snapshot.oldestOpenAt : null))
              : t("queue_empty", "Nothing waiting")
          }
          delta={<span className="text-xs text-fg-faint">{t("kpi_backlog_hint", "Open at the end of each period")}</span>}
          sparkline={seriesValues(series, "backlog")}
        />
        <KpiTile
          label={t("kpi_created", "Created")}
          value={num(current.created)}
          detail={average(current.created)}
          delta={previous ? <Delta current={current.created} previous={previous.created} meaning="neutral" format={num} label={compareLabel} /> : undefined}
          sparkline={seriesValues(series, "created")}
        />
        <KpiTile
          label={t("kpi_resolved", "Resolved")}
          value={num(current.resolved)}
          detail={current.created ? t("kpi_resolved_detail", "%d% of created").replace("%d", String(Math.round((current.resolved / current.created) * 100))) : per}
          delta={previous ? <Delta current={current.resolved} previous={previous.resolved} meaning="up-good" format={num} label={compareLabel} /> : undefined}
          sparkline={seriesValues(series, "resolved")}
        />
        {durationTile("firstResponse", t("kpi_first_response", "First response · median"), "firstResponseMedian")}
        {durationTile("resolution", t("kpi_resolution", "Resolution · median"), "resolutionMedian")}
      </div>

      {empty ? (
        <section className="rounded-lg border border-line bg-panel">
          <EmptyState icon="chart" title={t("stats_no_reports_period", "No reports in this period")} hint={t("stats_no_reports_hint", "Pick a longer range above.")} />
        </section>
      ) : (
        <>
          <Section title={t("chart_trend_title", "Created vs. resolved")} subtitle={`${per} · ${rangeLabels[statsRange]}`}>
            <TrendChart
              series={series}
              bucket={statistics.bucket}
              language={language}
              labels={{ created: t("kpi_created", "Created"), resolved: t("kpi_resolved", "Resolved"), backlog: t("kpi_backlog", "Still open") }}
            />
          </Section>

          <div className="grid grid-cols-5 gap-5">
            <Section className="col-span-3" title={t("chart_hours_title", "When reports come in")} subtitle={t("chart_hours_sub", "Reports per hour of day, strip below: median first response (darker = slower)")}>
              <HourChart
                hours={statistics.hours}
                language={language}
                labels={{ reports: t("stats_reports", "reports"), firstResponse: t("kpi_first_response_short", "first response") }}
              />
            </Section>

            <Section className="col-span-2" title={t("reports_by_category", "Reports by Category")} subtitle={rangeLabels[statsRange]}>
              <BarList
                total={current.created}
                language={language}
                items={statistics.categories.map((row) => ({
                  key: row.category,
                  label: getCategoryLabel(row.category, categories, locale),
                  value: row.count
                }))}
              />
            </Section>
          </div>

          <div className="grid grid-cols-5 gap-5">
            <Section className="col-span-3" title={t("chart_resolution_title", "Resolution times")} subtitle={t("chart_resolution_sub", "One dot per resolved report, urgent and high in color")}>
              <DotPlot
                points={statistics.resolutions}
                median={current.resolution.median}
                p90={current.resolution.p90}
                from={current.from || Math.min(...statistics.resolutions.map((p) => p.createdAt))}
                to={statistics.generatedAt}
                dotClass={priorityTone}
                labels={{ median: t("stats_median_short", "Median"), p90: "P90" }}
              />
            </Section>

            <Section className="col-span-2" title={t("priority", "Priority")} subtitle={t("chart_priority_sub", "Does urgent really get handled faster?")}>
              <BarList
                total={current.created}
                language={language}
                extraHeader={t("stats_median_short", "Median")}
                items={[...statistics.priorities]
                  .sort((a, b) => b.priority - a.priority)
                  .map((row) => {
                    const meta = getPriorityMeta(row.priority, priorities, locale)
                    return {
                      key: String(row.priority),
                      label: (
                        <span className="inline-flex items-center gap-2">
                          <PriorityGlyph meta={meta} />
                          {meta.label}
                        </span>
                      ),
                      value: row.count,
                      extra: formatDuration(row.resolutionMedian)
                    }
                  })}
              />
            </Section>
          </div>

          <Section title={t("staff_title", "Team")} subtitle={t("staff_sub", "Activity in this period. Message counts are easy to inflate, read them with the others.")}>
            {statistics.staff.length === 0 ? (
              <EmptyState icon="user" title={t("no_data", "No data available")} />
            ) : (
              <div className="-mx-5 -mb-5">
                <StaffTable
                  staff={statistics.staff}
                  language={language}
                  labels={{
                    adminName: t("col_staff", "Staff"),
                    handled: t("col_handled", "Handled"),
                    resolved: t("kpi_resolved", "Resolved"),
                    messages: t("col_messages", "Messages"),
                    firstResponseMedian: t("col_first_response", "First response"),
                    resolutionMedian: t("col_resolution", "Resolution"),
                    teamMedian: t("team_median", "Team median")
                  }}
                />
              </div>
            )}
          </Section>
        </>
      )}
    </div>
  )
}
