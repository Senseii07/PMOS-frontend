"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { createApiClient } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatDate, formatTime } from "@/lib/utils";
import type { MealLog } from "@/lib/api";
import toast from "react-hot-toast";

export default function MealsPage() {
  const { data: session } = useSession();
  const api = createApiClient(session?.accessToken);

  const [meals, setMeals] = useState<MealLog[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      const res = await api.health.listMeals();
      setMeals(res.results);
      setLoaded(true);
    } catch {
      toast.error("Failed to load meals.");
    }
  }

  // Load on first render via useEffect equivalent (client component, manual trigger on mount)
  if (!loaded && session) {
    load();
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSubmitting(true);
    try {
      const meal = await api.health.createMeal({ food_query: query.trim() });
      setMeals((prev) => [meal, ...prev]);
      setQuery("");
      toast.success("Meal logged.");
    } catch {
      toast.error("Failed to log meal. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await api.health.deleteMeal(id);
      setMeals((prev) => prev.filter((m) => m.id !== id));
      toast.success("Meal removed.");
    } catch {
      toast.error("Failed to remove meal.");
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display text-headline-lg-mobile md:text-headline-lg text-on-surface mb-stack-lg">
        Meal log
      </h1>

      {/* Log form */}
      <Card className="mb-stack-md">
        <CardHeader>
          <CardTitle>Log a meal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex gap-3">
            <label htmlFor="food-query" className="sr-only">
              Food description
            </label>
            <input
              id="food-query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. 2 scrambled eggs with toast"
              className="flex-1 rounded-md border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-surface-tint"
              disabled={submitting}
              maxLength={500}
              aria-required="true"
            />
            <Button type="submit" isLoading={submitting} disabled={!query.trim()}>
              Log
            </Button>
          </form>
          <p className="mt-2 text-label-sm text-on-surface-variant">
            Nutritional data is fetched automatically via Edamam.
          </p>
        </CardContent>
      </Card>

      {/* Meal list */}
      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          {!loaded ? (
            <p className="text-body-md text-on-surface-variant py-4 text-center">
              Loading…
            </p>
          ) : meals.length === 0 ? (
            <p className="text-body-md text-on-surface-variant py-4 text-center">
              No meals logged yet.
            </p>
          ) : (
            <ul className="divide-y divide-outline-variant/30" role="list">
              {meals.map((meal) => (
                <li
                  key={meal.id}
                  className="flex items-start justify-between py-4 gap-4"
                >
                  <div className="min-w-0">
                    <p className="text-body-md text-on-surface capitalize truncate">
                      {meal.food_query}
                    </p>
                    <p className="text-label-sm text-on-surface-variant mt-0.5">
                      {formatDate(meal.timestamp)} · {formatTime(meal.timestamp)}
                    </p>
                    {meal.calories != null && (
                      <div className="flex flex-wrap gap-3 mt-1.5 text-label-sm text-on-surface-variant">
                        <span>{meal.calories} kcal</span>
                        {meal.protein_g != null && <span>P {meal.protein_g}g</span>}
                        {meal.carbs_g != null && <span>C {meal.carbs_g}g</span>}
                        {meal.fat_g != null && <span>F {meal.fat_g}g</span>}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(meal.id)}
                    className="shrink-0 text-label-sm text-on-surface-variant hover:text-error transition-colors"
                    aria-label={`Delete meal: ${meal.food_query}`}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
