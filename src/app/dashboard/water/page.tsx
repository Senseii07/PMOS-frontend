"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { createApiClient } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatDate, formatTime } from "@/lib/utils";
import type { WaterLog } from "@/lib/api";
import toast from "react-hot-toast";

export default function WaterPage() {
  const { data: session } = useSession();
  const api = createApiClient(session?.accessToken);

  const [logs, setLogs] = useState<WaterLog[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loaded && session) {
    api.health
      .listWater()
      .then((res) => { setLogs(res.results); setLoaded(true); })
      .catch(() => toast.error("Failed to load water logs."));
  }

  const todayTotal = logs
    .filter((l) => new Date(l.timestamp).toDateString() === new Date().toDateString())
    .reduce((sum, l) => sum + l.amount_ml, 0);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const ml = parseInt(amount, 10);
    if (!ml || ml <= 0) return;
    setSubmitting(true);
    try {
      const log = await api.health.createWater({ amount_ml: ml });
      setLogs((prev) => [log, ...prev]);
      setAmount("");
      toast.success(`${ml} ml logged.`);
    } catch {
      toast.error("Failed to log water intake.");
    } finally {
      setSubmitting(false);
    }
  }

  const QUICK_AMOUNTS = [150, 250, 350, 500];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display text-headline-lg-mobile md:text-headline-lg text-on-surface mb-stack-lg">
        Water intake
      </h1>

      {/* Today summary */}
      <div className="rounded-xl bg-surface-container border border-outline-variant/40 px-6 py-5 mb-stack-md flex items-center justify-between">
        <div>
          <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Today</p>
          <p className="font-display text-headline-lg text-on-surface">{todayTotal} ml</p>
        </div>
        <div className="text-right">
          <p className="text-label-sm text-on-surface-variant">Daily target</p>
          <p className="text-body-lg text-on-surface font-semibold">2 000 ml</p>
        </div>
      </div>

      <Card className="mb-stack-md">
        <CardHeader><CardTitle>Log intake</CardTitle></CardHeader>
        <CardContent>
          {/* Quick-add buttons */}
          <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Quick amounts">
            {QUICK_AMOUNTS.map((ml) => (
              <button
                key={ml}
                type="button"
                onClick={() => setAmount(String(ml))}
                className="px-4 py-2 rounded-full border border-outline-variant text-label-md text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                {ml} ml
              </button>
            ))}
          </div>

          <form onSubmit={handleAdd} className="flex gap-3">
            <label htmlFor="water-amount" className="sr-only">Amount in ml</label>
            <input
              id="water-amount" type="number" min="1" max="5000"
              value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount (ml)"
              className="flex-1 rounded-md border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-surface-tint"
              aria-required="true"
            />
            <Button type="submit" isLoading={submitting} disabled={!amount || parseInt(amount) <= 0}>
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
                  <p className="text-label-sm text-on-surface-variant">
                    {formatDate(l.timestamp)} · {formatTime(l.timestamp)}
                  </p>
                  <span className="text-label-md font-semibold text-secondary">{l.amount_ml} ml</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
