import { GreetingCard } from "@/components/greeting-card";
import { StatsCards } from "@/components/stats-cards";
import { QuickTasks } from "@/components/quick-tasks";
import { CalendarWidget } from "@/components/calendar-widget";
import { RecentProjects } from "@/components/recent-projects";
import { ActivityMap } from "@/components/activity-map";
import { Insights } from "@/components/insights";
import { RevenueAnalytics } from "@/components/revenue-analytics";
import { PerformanceMetrics } from "@/components/performance-metrics";
import { PerformanceAnalytics } from "@/components/performance-analytics";
import { PageHeader } from "@/components/header";
import { getCurrentUser } from "@/actions/auth";
import { ChartPieDonutText } from "@/components/piechart";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-[1600px] mx-auto p-4 lg:p-6">
        <div className="animate-stagger animate-fade-in-up delay-0">
          <PageHeader />
        </div>

        {/* Main two-column layout */}
        <div className="flex flex-col xl:flex-row gap-5">
          {/* Left / center content */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Greeting */}
            <div className="animate-stagger animate-fade-in-up delay-75">
              <GreetingCard userName={user?.full_name ?? undefined} schoolName={(user?.schools as { name?: string } | null)?.name ?? undefined} />
            </div>

            {/* Stats */}
            <div className="animate-stagger animate-fade-in-up delay-150">
              <StatsCards />
            </div>

            {/* Recent Projects */}
            <div className="animate-stagger animate-fade-in-up delay-300">
              <RecentProjects />
            </div>

            {/* Tasks + Calendar side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-stagger animate-fade-in-up delay-200">
              <QuickTasks />
              <CalendarWidget />
            </div>

            {/* Activity Map */}
            {/* <div className="animate-stagger animate-fade-in-up delay-400">
              <ActivityMap />
            </div> */}
          </div>

          {/* Right sidebar */}
          <div className="xl:w-72 shrink-0 space-y-5">
            <div className="animate-stagger animate-slide-in-right delay-200">
              {/* <Insights /> */}
              <ChartPieDonutText/>
            </div>
            <div className="animate-stagger animate-slide-in-right delay-300">
              <RevenueAnalytics />
            </div>
            <div className="animate-stagger animate-slide-in-right delay-400">
              <PerformanceMetrics />
            </div>
            {/* <div className="animate-stagger animate-slide-in-right delay-500">
              <PerformanceAnalytics />
            </div> */}
          </div>
        </div>
      </div>
    </main>
  );
}
