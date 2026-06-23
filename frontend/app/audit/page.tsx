"use client";

import AppShell from "@/components/AppShell";
import { useEffect, useState } from "react";
import { getAuditLogs } from "@/lib/api";
import { Activity, FileClock, ShieldCheck, Search } from "lucide-react";
import Link from "next/link";

type AuditLog = {
  id: number;
  event_type: string;
  customer_id: string | null;
  performed_by: string | null;
  event_status: string;
  remarks: string | null;
  created_at: string;
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [eventFilter, setEventFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAuditLogs() {
      try {
        const data = await getAuditLogs();
        setLogs(data.logs || []);
        setFilteredLogs(data.logs || []);
      } catch (error) {
        console.error("Failed to load audit logs:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAuditLogs();
  }, []);

  useEffect(() => {
    let result = logs;

    if (searchTerm.trim() !== "") {
      const keyword = searchTerm.toLowerCase();

      result = result.filter((item) => {
        return (
          item.event_type?.toLowerCase().includes(keyword) ||
          item.customer_id?.toLowerCase().includes(keyword) ||
          item.performed_by?.toLowerCase().includes(keyword) ||
          item.event_status?.toLowerCase().includes(keyword) ||
          item.remarks?.toLowerCase().includes(keyword)
        );
      });
    }

    if (eventFilter !== "ALL") {
      result = result.filter((item) => item.event_type === eventFilter);
    }

    setFilteredLogs(result);
  }, [searchTerm, eventFilter, logs]);

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          Loading audit logs...
        </div>
      </AppShell>
    );
  }

  const successCount = logs.filter(
    (item) => item.event_status === "SUCCESS"
  ).length;

  const complianceEventCount = logs.filter(
    (item) => item.event_type === "compliance_action_recorded"
  ).length;

  const uniqueCustomers = new Set(
    logs
      .filter((item) => item.customer_id)
      .map((item) => item.customer_id)
  ).size;

  const eventTypes = Array.from(
    new Set(logs.map((item) => item.event_type).filter(Boolean))
  );

  return (
    <AppShell>
      <div className="min-h-screen bg-black text-white p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Audit Log Center</h1>
          <p className="text-gray-400 mt-2">
            Traceable record of compliance actions and backend system events.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            title="Total Audit Logs"
            value={logs.length}
            icon={<FileClock />}
          />

          <SummaryCard
            title="Successful Events"
            value={successCount}
            icon={<ShieldCheck />}
          />

          <SummaryCard
            title="Compliance Events"
            value={complianceEventCount}
            icon={<Activity />}
          />

          <SummaryCard
            title="Customers Touched"
            value={uniqueCustomers}
            icon={<Search />}
          />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm text-gray-400">Search Audit Logs</label>
              <input
                type="text"
                placeholder="Search by customer, event, officer, status, or remarks..."
                className="mt-2 w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-zinc-600"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <div className="w-full md:w-80">
              <label className="text-sm text-gray-400">Event Type Filter</label>
              <select
                className="mt-2 w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-zinc-600"
                value={eventFilter}
                onChange={(event) => setEventFilter(event.target.value)}
              >
                <option value="ALL">All Event Types</option>

                {eventTypes.map((eventType) => (
                  <option key={eventType} value={eventType}>
                    {eventType}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">System Audit Trail</h2>

          {filteredLogs.length === 0 ? (
            <div className="bg-black border border-zinc-800 rounded-xl p-6 text-gray-400">
              No audit logs found. Trigger a compliance action from a customer detail page first.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-gray-400">
                    <th className="text-left py-3">ID</th>
                    <th className="text-left py-3">Event Type</th>
                    <th className="text-left py-3">Customer</th>
                    <th className="text-left py-3">Performed By</th>
                    <th className="text-left py-3">Status</th>
                    <th className="text-left py-3">Created At</th>
                    <th className="text-left py-3">Remarks</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLogs.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-zinc-800 hover:bg-zinc-800"
                    >
                      <td className="py-3">{item.id}</td>

                      <td className="py-3 font-medium">
                        {item.event_type}
                      </td>

                      <td className="py-3">
                        {item.customer_id ? (
                          <Link
                            href={`/customers/${item.customer_id}`}
                            className="underline hover:text-gray-300"
                          >
                            {item.customer_id}
                          </Link>
                        ) : (
                          "Not linked"
                        )}
                      </td>

                      <td className="py-3">
                        {item.performed_by || "System"}
                      </td>

                      <td className="py-3">
                        <span className="px-3 py-1 rounded-full bg-black border border-zinc-700 text-xs">
                          {item.event_status}
                        </span>
                      </td>

                      <td className="py-3">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleString()
                          : "Not available"}
                      </td>

                      <td className="py-3 max-w-md text-gray-400">
                        {item.remarks || "No remarks"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-400 text-sm">{title}</p>
        <div className="text-gray-400 w-5 h-5">{icon}</div>
      </div>

      <p className="text-3xl font-bold">
        {Number(value).toLocaleString("en-IN")}
      </p>
    </div>
  );
}