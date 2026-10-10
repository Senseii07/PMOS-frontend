"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { createApiClient } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import type { SymptomLog } from "@/lib/api";
import toast from "react-hot-toast";

const SEVERITY_LABELS = { 1: "Mild", 2: "Moderate", 3: "Severe" } as const;
const SEVERITY_COLOURS = {
  1: "text-secondary",
  2: "text-tertiary-container",
  3: "text-error",
} as const;

export default function SymptomsPage() {
  const { data: session } = useSession();
  const api = createApiClient(session?.accessToken);

  const [symptoms, setSymptoms] = useState<SymptomLog[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [symptom, setSymptom] = useState("");
  const [severity, setSeverity] = useState<1 | 2 | 3>(1);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loaded && session) {
    api.health
      .listSymptoms()
      .then((res) => { setSymptoms(res.results); setLoaded(true); })
      .catch(() => toast.error("Failed to load symptoms."));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!symptom.trim()) return;
    setSubmitting(true);
    try {
      const log = await api.health.createSymptom({
        symptom: symptom.trim(),
        severity,
        notes: notes.trim(),
      });
      setSymptoms((prev) => [log, ...prev]);
      setSymptom(""); setNotes(""); setSeverity(1);
      toast.success("Symptom logged.");
    } catch (err: unknown) {
      const msg =
        (err as { detail?: string })?.detail ??
        "Failed to log. Check consent settings in your profile.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display text-headline-lg-mobile md:text-headline-lg text-on-surface mb-stack-lg">
        Symptom log
      </h1>

      <Card className="mb-stack-md">
        <CardHeader><CardTitle>Log a symptom</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label htmlFor="symptom-name" className="block text-label-md text-on-surface-variant mb-1">
                Symptom
              </label>
              <input
                id="symptom-name" type="text" value={symptom}
                onChange={(e) => setSymptom(e.target.value)}
                placeholder="e.g. headache, fatigue…"
                className="w-full rounded-md border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-surface-tint"
                maxLength={200} aria-required="true"
              />
            </div>

            <fieldset>
              <legend className="text-label-md text-on-surface-variant mb-2">Severity</legend>
              <div className="flex gap-3">
                {([1, 2, 3] as const).map((s) => (
                  <label key={s} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="severity" value={s}
                      checked={severity === s} onChange={() => setSeverity(s)}
                      className="accent-primary"
                    />
                    <span className="text-label-md text-on-surface">{SEVERITY_LABELS[s]}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label htmlFor="symptom-notes" className="block text-label-md text-on-surface-variant mb-1">
                Notes <span className="font-normal text-label-sm">(optional)</span>
              </label>
              <textarea
                id="symptom-notes" value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-surface-tint resize-none"
              />
            </div>

            <Button type="submit" isLoading={submitting} disabled={!symptom.trim()}>
              Log symptom
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>History</CardTitle></CardHeader>
        <CardContent>
          {!loaded ? (
            <p className="text-body-md text-on-surface-variant py-4 text-center">Loading…</p>
          ) : symptoms.length === 0 ? (
            <p className="text-body-md text-on-surface-variant py-4 text-center">No symptoms logged yet.</p>
          ) : (
            <ul className="divide-y divide-outline-variant/30" role="list">
              {symptoms.map((s) => (
                <li key={s.id} className="py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-body-md text-on-surface capitalize">{s.symptom}</p>
                    <span className={`text-label-sm font-semibold ${SEVERITY_COLOURS[s.severity]}`}>
                      {SEVERITY_LABELS[s.severity]}
                    </span>
                  </div>
                  <p className="text-label-sm text-on-surface-variant mt-0.5">{formatDate(s.timestamp)}</p>
                  {s.notes && (
                    <p className="mt-1.5 text-body-md text-on-surface-variant">{s.notes}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
