"use client";

import AppShell from "@/components/AppShell";
import { useEffect, useState } from "react";
import {
  getSimulationEvents,
  clearSimulationEvents,
} from "@/lib/api";
import {
  Activity,
  AlertTriangle,
  RefreshCcw,
  Radio,
  ShieldAlert,
  Globe2,
  CreditCard,
  Trash2,
  CheckCircle2,
  Clock,
} from "lucide-react";

type SimulationEvent = {
  event_id: string;
  event_type: string;
  customer_id: string;
  customer_name: string;
  transaction_type: string;
  amount: number;
  currency: string;
  receiver_country: string;
  purpose: string;
  risk_score: number;
  risk_level: string;
  risk_reasons: string[];
  recommended_action: string;
  status: string;
  created_at: string;
};

type SimulationResponse = {
  total_events: number;
  events: SimulationEvent[];
};

export default function LiveSimulationPage() {
  const [events, setEvents] = useState<SimulationEvent[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  async function loadEvents() {
    try {
      const data: SimulationResponse = await getSimulationEvents();

      setEvents(data.events || []);
      setTotalEvents(data.total_events || 0);
    } catch (error) {
      console.error("Failed to load simulation events:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleClearEvents() {
    try {
      await clearSimulationEvents();
      await loadEvents();
    } catch (error) {
      console.error("Failed to clear simulation events:", error);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadEvents();
    }, 3000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const highRiskCount = events.filter(
    (event) => event.risk_level === "HIGH"
  ).length;

  const mediumRiskCount = events.filter(
    (event) => event.risk_level === "MEDIUM"
  ).length;

  const lowRiskCount = events.filter(
    (event) => event.risk_level === "LOW"
  ).length;

  const escalatedCount = events.filter(
    (event) => event.status === "Escalated"
  ).length;

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          Loading live simulation dashboard...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-black text-white p-8">
        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6 mb-8">
          <div>
            <p className="text-sm text-gray-500 mb-2">
              Real-Time Risk Monitoring
            </p>

            <h1 className="text-4xl font-bold">
              Live Simulation Dashboard
            </h1>

            <p className="text-gray-400 mt-3 max-w-3xl">
              Monitor simulated financial transactions as they flow into
              FINGUARD Sentinel AI. High-risk SWIFT and AML-style anomalies are
              scored, classified, and escalated in real time.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-xl px-5 py-3 font-semibold hover:bg-zinc-800"
            >
              <Radio size={18} />
              {autoRefresh ? "Auto Refresh On" : "Auto Refresh Off"}
            </button>

            <button
              onClick={loadEvents}
              className="inline-flex items-center gap-2 bg-white text-black rounded-xl px-5 py-3 font-semibold hover:bg-gray-200"
            >
              <RefreshCcw size={18} />
              Refresh
            </button>

            <button
              onClick={handleClearEvents}
              className="inline-flex items-center gap-2 bg-black border border-zinc-700 rounded-xl px-5 py-3 font-semibold hover:bg-zinc-800"
            >
              <Trash2 size={18} />
              Clear
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
          <MetricCard
            title="Total Live Events"
            value={totalEvents}
            icon={<Activity />}
          />

          <MetricCard
            title="High Risk"
            value={highRiskCount}
            icon={<ShieldAlert />}
          />

          <MetricCard
            title="Medium Risk"
            value={mediumRiskCount}
            icon={<AlertTriangle />}
          />

          <MetricCard
            title="Low Risk"
            value={lowRiskCount}
            icon={<CheckCircle2 />}
          />

          <MetricCard
            title="Escalated"
            value={escalatedCount}
            icon={<Clock />}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="xl:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-11 w-11 rounded-xl bg-black border border-zinc-800 flex items-center justify-center text-gray-400">
                <Activity />
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  Live Transaction Event Feed
                </h2>
                <p className="text-gray-500 text-sm">
                  Latest simulated events from the transaction simulator
                </p>
              </div>
            </div>

            {events.length === 0 ? (
              <div className="bg-black border border-zinc-800 rounded-xl p-6 text-gray-400">
                No live simulation events yet. Start the Python simulator to
                begin streaming transactions.
              </div>
            ) : (
              <div className="space-y-4">
                {events.slice(0, 12).map((event) => (
                  <LiveEventCard key={event.event_id} event={event} />
                ))}
              </div>
            )}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-11 w-11 rounded-xl bg-black border border-zinc-800 flex items-center justify-center text-gray-400">
                <Radio />
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  Simulation Flow
                </h2>
                <p className="text-gray-500 text-sm">
                  Original Level 11 demo sequence
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <FlowStep
                number="1"
                title="Normal Transactions"
                description="Most events are low-risk domestic transfers."
              />

              <FlowStep
                number="2"
                title="AML Anomaly Appears"
                description="Some events become high-value SWIFT transfers."
              />

              <FlowStep
                number="3"
                title="AI Risk Detection"
                description="Backend assigns risk score, level, and reasons."
              />

              <FlowStep
                number="4"
                title="Incident Escalation"
                description="High-risk events are marked as escalated."
              />

              <FlowStep
                number="5"
                title="Human Review"
                description="Compliance teams can approve, reject, or investigate."
              />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-2">
            How to Run the Live Simulator
          </h2>

          <p className="text-gray-400 mb-5">
            Keep the backend and frontend running, then start the Python
            simulator from the project root.
          </p>

          <div className="bg-black border border-zinc-800 rounded-xl p-5 overflow-x-auto">
            <pre className="text-sm text-gray-300">
{`cd backend
uvicorn app.main:app --reload

# In another terminal from project root:
venv\\Scripts\\activate
python data/simulation/live_transaction_simulator.py`}
            </pre>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function MetricCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-400 text-sm">{title}</p>
        <div className="text-gray-400 w-5 h-5">{icon}</div>
      </div>

      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function LiveEventCard({ event }: { event: SimulationEvent }) {
  return (
    <div className="bg-black border border-zinc-800 rounded-xl p-5">
      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full border border-zinc-700 text-xs">
              {event.risk_level}
            </span>

            <span className="px-3 py-1 rounded-full border border-zinc-700 text-xs text-gray-300">
              {event.status}
            </span>

            <span className="text-xs text-gray-500">
              {event.created_at}
            </span>
          </div>

          <h3 className="text-lg font-semibold">
            {event.customer_id} — {event.customer_name}
          </h3>

          <p className="text-gray-400 text-sm mt-1">
            {event.transaction_type} • {event.amount} {event.currency} •{" "}
            {event.receiver_country}
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 min-w-[150px]">
          <p className="text-gray-500 text-xs">Risk Score</p>
          <p className="text-2xl font-bold mt-1">{event.risk_score}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
        <InfoBlock
          icon={<CreditCard />}
          label="Purpose"
          value={event.purpose}
        />

        <InfoBlock
          icon={<Globe2 />}
          label="Receiver Country"
          value={event.receiver_country}
        />

        <InfoBlock
          icon={<ShieldAlert />}
          label="Recommended Action"
          value={event.recommended_action}
        />
      </div>

      <div className="mt-5">
        <p className="text-gray-500 text-sm mb-2">Risk Reasons</p>

        <div className="flex flex-wrap gap-2">
          {event.risk_reasons.map((reason, index) => (
            <span
              key={index}
              className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-xs text-gray-300"
            >
              {reason}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoBlock({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center gap-2 text-gray-500 mb-2">
        <div className="w-4 h-4">{icon}</div>
        <p className="text-xs">{label}</p>
      </div>

      <p className="text-sm text-gray-300">{value}</p>
    </div>
  );
}

function FlowStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-black border border-zinc-800 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-sm shrink-0">
          {number}
        </div>

        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-gray-400 text-sm mt-1 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}