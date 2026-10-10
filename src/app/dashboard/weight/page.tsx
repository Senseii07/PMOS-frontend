"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { createApiClient } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import type { WeightLog } from "@/lib/api";
import toast from "react-hot-toast";

export default function WeightPage() {
  const { data: session } = useSession();
  const api = createApiClient(session?.accessToken);

  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [weight, setWeight] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loaded && session) {
    api.health
      .listWeight()
      .then((res) => { setLogs(res.results); setLoaded(true); })
      .catch(() => toast.error("Failed to load weight logs."));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const kg = parseFloat(weight);
    if (!kg || kg <= 0) return;
    setSubmitting(true);
    try {
      const log = await api.health.createWeight({ weight_kg: kg });
      setLogs((prev) => [log, ...prev]);
      setWeight("");
      toast.success(`${kg} kg logged.`);
    } catch {
      toast.error("Failed to log weight.");
    } finally {
      setSubmitting(false);
    }
  }

  const latest = logs[0];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display text-headline-lg-mobile md:text-headline-lg text-on-surface mb-stack-lg">
        Weight log
      </h1>

      {latest && (
        <div className="rounded-xl bg-surface-container border border-outline-variant/40 px-6 py-5 mb-stack-md">
          <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">
            Latest reading
          </p>
          <p className="font-display text-headline-lg text-on-surface">
            {latest.weight_kg} kg
          </p>
          <p className="text-label-sm text-on-surface-variant mt-0.5">
            {formatDate(latest.timestamp)}
          </p>
        </div>
      )}

      <Card className="mb-stack-md">
        <CardHeader><CardTitle>Log weight</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex gap-3">
            <label htmlFor="weight-kg" className="sr-only">Weight in kg</label>
            <input
              id="weight-kg" type="number" step="0.1" min="1" max="500"
              value={weight} onChange={(e) => setWeight(e.target.value)}
              placeholder="Weight (kg)"
              className="flex-1 rounded-md border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-surface-tint"
              aria-required="true"
            />
            <Button type="submit" isLoading={submitting} disabled={!weight || parseFloat(weight) <= 0}>
              Log
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>History</CardTitle></CardHeader>
        <CardContent>
          {!loaded ? (
            <p className="text-body-md text-on-surface-variant py-4 text-center">Loading…</p>
          ) : logs.length === 0 ? (
            <p className="text-body-md text-on-surface-variant py-4 text-center">No entries yet.</p>
          ) : (
            <ul className="divide-y divide-outline-variant/30" role="list">
              {logs.map((l) => (
                <li key={l.id} className="flex items-center justify-between py-3">
                  <p className="text-label-sm text-on-surface-variant">{formatDate(l.timestamp)}</p>
                  <span className="text-label-md font-semibold text-secondary">{l.weight_kg} kg</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
