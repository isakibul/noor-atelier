"use client";

import { useEffect, useState } from "react";

type BespokeRequest = {
  id: string;
  name: string;
  email: string;
  phone: string;
  dressType: string;
  occasion: string;
  preferredColor: string;
  notes: string;
  status: "new" | "contacted" | "in_progress" | "completed";
  createdAt: string;
};

const STATUS_LABELS: Record<BespokeRequest["status"], string> = {
  new: "New",
  contacted: "Contacted",
  in_progress: "In progress",
  completed: "Completed",
};

const STATUS_STYLES: Record<BespokeRequest["status"], string> = {
  new: "bg-blush text-wine",
  contacted: "bg-[#e7eef9] text-[#1d4d8f]",
  in_progress: "bg-[#fbf1dc] text-[#8a5a00]",
  completed: "bg-[#e6f3ea] text-[#1f6236]",
};

export default function AdminBespokePage() {
  const [requests, setRequests] = useState<BespokeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/bespoke")
      .then(async res => (res.ok ? res.json() : []))
      .then((data: BespokeRequest[]) => { if (active) setRequests(data); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const updateStatus = async (id: string, status: BespokeRequest["status"]) => {
    setBusyId(id);
    try {
      const response = await fetch(`/api/admin/bespoke/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        const updated = await response.json();
        setRequests(current => current.map(item => (item.id === id ? updated : item)));
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-stone-500">Atelier Consultations</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Made-to-Measure Requests</h1>
      </div>

      {loading ? (
        <p className="mt-8 text-xs text-stone-500">Loading bespoke inquiries…</p>
      ) : requests.length ? (
        <div className="mt-8 space-y-4">
          {requests.map(item => (
            <article key={item.id} className="border border-line bg-white p-6 text-xs">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-semibold text-ink">
                      Bespoke #{item.id.padStart(4, "0")} · {item.dressType}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${STATUS_STYLES[item.status]}`}>
                      {STATUS_LABELS[item.status]}
                    </span>
                  </div>
                  <p className="mt-1.5 text-stone-600">
                    {item.name} · {item.email}
                    {item.phone ? ` · ${item.phone}` : ""}
                  </p>
                  <p className="mt-1 text-[11px] text-stone-500">
                    {new Date(item.createdAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {item.occasion ? ` · Occasion: ${item.occasion}` : ""}
                    {item.preferredColor ? ` · Palette: ${item.preferredColor}` : ""}
                  </p>
                </div>

                <select
                  aria-label={`Update status for bespoke request ${item.id}`}
                  value={item.status}
                  disabled={busyId === item.id}
                  onChange={e => updateStatus(item.id, e.target.value as BespokeRequest["status"])}
                  className="self-start border border-line bg-[#faf7f3] px-3 py-2 text-xs font-medium outline-wine"
                >
                  {(Object.keys(STATUS_LABELS) as BespokeRequest["status"][]).map(status => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-4 border-t border-line pt-4 leading-6 text-stone-700">{item.notes}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-8 border border-line bg-white p-10 text-center text-xs text-stone-500">
          No made-to-measure requests yet. Submissions from /made-to-measure will appear here.
        </div>
      )}
    </>
  );
}
