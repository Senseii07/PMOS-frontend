import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createApiClient } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const api = createApiClient(session?.accessToken);

  // Fetch in parallel — gracefully fall back to empty if an endpoint errors
  const [mealsRes, waterRes, weightRes] = await Promise.allSettled([
    api.health.listMeals(),
    api.health.listWater(),
    api.health.listWeight(),
  ]);

  const meals =
    mealsRes.status === "fulfilled" ? mealsRes.value.results.slice(0, 5) : [];
  const water =
    waterRes.status === "fulfilled" ? waterRes.value.results.slice(0, 1) : [];
  const weights =
    weightRes.status === "fulfilled"
      ? weightRes.value.results.slice(0, 1)
      : [];

  const totalCaloriesToday = meals
    .filter(
      (m) =>
        new Date(m.timestamp).toDateString() === new Date().toDateString()
    )
    .reduce((sum, m) => sum + m.calories, 0);

  const latestWeight = weights[0]?.weight_kg ?? null;
  const totalWaterToday = water
    .filter(
      (w) =>
        new Date(w.timestamp).toDateString() === new Date().toDateString()
    )
    .reduce((sum, w) => sum + w.amount_ml, 0);

  const greeting = getGreeting();
  const displayName =
    session?.user?.full_name ??
    session?.user?.name ??
    session?.user?.email ??
    "there";

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-stack-lg">
        <h1 className="font-display text-headline-lg-mobile md:text-headline-lg text-on-surface">
          {greeting},{" "}
          <span className="text-secondary">{displayName.split(" ")[0]}</span>
        </h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          {new Date().toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-stack-lg">
        <StatCard
          label="Calories today"
          value={totalCaloriesToday > 0 ? `${totalCaloriesToday} kcal` : "—"}
          sub="from logged meals"
        />
        <StatCard
          label="Water today"
          value={totalWaterToday > 0 ? `${totalWaterToday} ml` : "—"}
          sub="total intake"
        />
        <StatCard
          label="Latest weight"
          value={latestWeight ? `${latestWeight} kg` : "—"}
          sub={
            weights[0]
              ? `logged ${formatDate(weights[0].timestamp)}`
              : "not yet logged"
          }
        />
      </div>

      {/* Recent meals */}
      <Card>
        <CardHeader>
          <CardTitle>Recent meals</CardTitle>
        </CardHeader>
        <CardContent>
          {meals.length === 0 ? (
            <p className="text-body-md text-on-surface-variant py-4 text-center">
              No meals logged yet.
            </p>
          ) : (
            <ul className="divide-y divide-outline-variant/30" role="list">
              {meals.map((meal) => (
                <li
                  key={meal.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-body-md text-on-surface capitalize">
                      {meal.food_query}
                    </p>
                    <p className="text-label-sm text-on-surface-variant">
                      {formatDate(meal.timestamp)}
                    </p>
                  </div>
                  <span className="text-label-md text-secondary font-semibold">
                    {meal.calories} kcal
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-lg bg-surface-container-low border border-outline-variant/40 shadow-card px-5 py-4">
      <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="font-display text-headline-md text-on-surface">{value}</p>
      <p className="text-label-sm text-on-surface-variant mt-0.5">{sub}</p>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getUTCHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
