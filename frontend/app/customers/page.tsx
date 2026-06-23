"use client";

import AppShell from "@/components/AppShell";
import { useEffect, useState } from "react";
import { getCustomers } from "@/lib/api";
import { Search, Users, ShieldAlert } from "lucide-react";
import Link from "next/link";

type Customer = {
  normalized_customer_id: string;
  customer_name: string;
  account_type: string;
  normalized_country: string;
  kyc_status: string;
  hybrid_risk_score: number;
  hybrid_risk_level: string;
  ml_anomaly_status: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomers() {
      try {
        const data = await getCustomers();
        setCustomers(data.customers || []);
        setFilteredCustomers(data.customers || []);
      } catch (error) {
        console.error("Failed to load customers:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCustomers();
  }, []);

  useEffect(() => {
    let result = customers;

    if (searchTerm.trim() !== "") {
      result = result.filter((customer) => {
        const keyword = searchTerm.toLowerCase();

        return (
          customer.normalized_customer_id?.toLowerCase().includes(keyword) ||
          customer.customer_name?.toLowerCase().includes(keyword) ||
          customer.normalized_country?.toLowerCase().includes(keyword) ||
          customer.account_type?.toLowerCase().includes(keyword)
        );
      });
    }

    if (riskFilter !== "ALL") {
      result = result.filter(
        (customer) => customer.hybrid_risk_level === riskFilter
      );
    }

    setFilteredCustomers(result);
  }, [searchTerm, riskFilter, customers]);

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          Loading customers...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-black text-white p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Customer Risk Registry</h1>
          <p className="text-gray-400 mt-2">
            Unified customer profiles with AI-driven risk scoring and anomaly status.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <SummaryCard
            title="Total Customers"
            value={customers.length}
            icon={<Users />}
          />

          <SummaryCard
            title="Visible Customers"
            value={filteredCustomers.length}
            icon={<Search />}
          />

          <SummaryCard
            title="High Risk"
            value={
              customers.filter((customer) => customer.hybrid_risk_level === "HIGH")
                .length
            }
            icon={<ShieldAlert />}
          />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm text-gray-400">Search Customer</label>
              <input
                type="text"
                placeholder="Search by ID, name, country, or account type..."
                className="mt-2 w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-zinc-600"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <div className="w-full md:w-64">
              <label className="text-sm text-gray-400">Risk Filter</label>
              <select
                className="mt-2 w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-zinc-600"
                value={riskFilter}
                onChange={(event) => setRiskFilter(event.target.value)}
              >
                <option value="ALL">All Risk Levels</option>
                <option value="HIGH">High Risk</option>
                <option value="MEDIUM">Medium Risk</option>
                <option value="LOW">Low Risk</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Customers</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-gray-400">
                  <th className="text-left py-3">Customer ID</th>
                  <th className="text-left py-3">Name</th>
                  <th className="text-left py-3">Account Type</th>
                  <th className="text-left py-3">Country</th>
                  <th className="text-left py-3">KYC</th>
                  <th className="text-left py-3">Risk Score</th>
                  <th className="text-left py-3">Risk Level</th>
                  <th className="text-left py-3">ML Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.slice(0, 100).map((customer) => (
                  <tr
                    key={customer.normalized_customer_id}
                    className="border-b border-zinc-800 hover:bg-zinc-800"
                  >
                    <td className="py-3 font-medium">
                      <Link
                        href={`/customers/${customer.normalized_customer_id}`}
                        className="underline hover:text-gray-300"
                      >
                        {customer.normalized_customer_id}
                      </Link>
                    </td>

                    <td className="py-3">{customer.customer_name}</td>
                    <td className="py-3">{customer.account_type}</td>
                    <td className="py-3">{customer.normalized_country}</td>
                    <td className="py-3">{customer.kyc_status}</td>

                    <td className="py-3 font-semibold">
                      {customer.hybrid_risk_score}
                    </td>

                    <td className="py-3">
                      <RiskBadge level={customer.hybrid_risk_level} />
                    </td>

                    <td className="py-3">{customer.ml_anomaly_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-gray-500 text-sm mt-4">
            Showing first 100 matching customers.
          </p>
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

function RiskBadge({ level }: { level: string }) {
  return (
    <span className="px-3 py-1 rounded-full bg-black border border-zinc-700 text-xs">
      {level}
    </span>
  );
}