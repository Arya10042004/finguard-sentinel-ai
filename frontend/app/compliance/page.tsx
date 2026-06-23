"use client";

import { useEffect, useState } from "react";
import { getComplianceActions } from "@/lib/api";
import { ClipboardCheck, ShieldCheck, UserCheck } from "lucide-react";
import Link from "next/link";
import AppShell from "@/components/AppShell";

type ComplianceAction = {
  id: number;
  customer_id: string;
  action: string;
  performed_by: string;
  remarks: string;
  status: string;
  created_at: string;
};

export default function CompliancePage() {
  const [actions, setActions] = useState<ComplianceAction[]>([]);
  const [filteredActions, setFilteredActions] = useState<ComplianceAction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadComplianceActions() {
      try {
        const data = await getComplianceActions();
        setActions(data.actions || []);
        setFilteredActions(data.actions || []);
      } catch (error) {
        console.error("Failed to load compliance actions:", error);
      } finally {
        setLoading(false);
      }
    }

    loadComplianceActions();
  }, []);

  useEffect(() => {
    let result = actions;

    if (searchTerm.trim() !== "") {
      const keyword = searchTerm.toLowerCase();

      result = result.filter((item) => {
        return (
          item.customer_id?.toLowerCase().includes(keyword) ||
          item.action?.toLowerCase().includes(keyword) ||
          item.performed_by?.toLowerCase().includes(keyword) ||
          item.remarks?.toLowerCase().includes(keyword)
        );
      });
    }

    if (actionFilter !== "ALL") {
      result = result.filter((item) => item.action === actionFilter);
    }

    setFilteredActions(result);
  }, [searchTerm, actionFilter, actions]);

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          Loading compliance actions...
        </div>
      </AppShell>
    );
  }

  const escalateCount = actions.filter(
    (item) => item.action === "Escalate Case"
  ).length;

  const kycUpdateCount = actions.filter(
    (item) => item.action === "Request KYC Update"
  ).length;

  const freezeCount = actions.filter(
    (item) => item.action === "Freeze Transaction"
  ).length;

  return (
    <AppShell>
      <div className="min-h-screen bg-black text-white p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Compliance Action Center</h1>
          <p className="text-gray-400 mt-2">
            Human-in-the-loop compliance decisions recorded from customer risk reviews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            title="Total Actions"
            value={actions.length}
            icon={<ClipboardCheck />}
          />

          <SummaryCard
            title="Escalated Cases"
            value={escalateCount}
            icon={<ShieldCheck />}
          />

          <SummaryCard
            title="KYC Updates"
            value={kycUpdateCount}
            icon={<UserCheck />}
          />

          <SummaryCard
            title="Frozen Transactions"
            value={freezeCount}
            icon={<ShieldCheck />}
          />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm text-gray-400">Search Actions</label>
              <input
                type="text"
                placeholder="Search by customer, action, officer, or remarks..."
                className="mt-2 w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-zinc-600"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <div className="w-full md:w-72">
              <label className="text-sm text-gray-400">Action Filter</label>
              <select
                className="mt-2 w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-zinc-600"
                value={actionFilter}
                onChange={(event) => setActionFilter(event.target.value)}
              >
                <option value="ALL">All Actions</option>
                <option value="Escalate Case">Escalate Case</option>
                <option value="Request KYC Update">Request KYC Update</option>
                <option value="Freeze Transaction">Freeze Transaction</option>
                <option value="Mark False Positive">Mark False Positive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">
            Recorded Compliance Actions
          </h2>

          {filteredActions.length === 0 ? (
            <div className="bg-black border border-zinc-800 rounded-xl p-6 text-gray-400">
              No compliance actions found. Open a customer detail page and trigger an action first.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-gray-400">
                    <th className="text-left py-3">ID</th>
                    <th className="text-left py-3">Customer</th>
                    <th className="text-left py-3">Action</th>
                    <th className="text-left py-3">Performed By</th>
                    <th className="text-left py-3">Status</th>
                    <th className="text-left py-3">Created At</th>
                    <th className="text-left py-3">Remarks</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredActions.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-zinc-800 hover:bg-zinc-800"
                    >
                      <td className="py-3">{item.id}</td>

                      <td className="py-3 font-medium">
                        <Link
                          href={`/customers/${item.customer_id}`}
                          className="underline hover:text-gray-300"
                        >
                          {item.customer_id}
                        </Link>
                      </td>

                      <td className="py-3">{item.action}</td>

                      <td className="py-3">{item.performed_by}</td>

                      <td className="py-3">
                        <span className="px-3 py-1 rounded-full bg-black border border-zinc-700 text-xs">
                          {item.status}
                        </span>
                      </td>

                      <td className="py-3">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleString()
                          : "Not available"}
                      </td>

                      <td className="py-3 max-w-md text-gray-400">
                        {item.remarks}
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