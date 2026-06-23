"use client";

import AppShell from "@/components/AppShell";
import { useEffect, useState } from "react";
import {
  getDashboardSummary,
  getHighRiskCustomers,
} from "@/lib/api";
import {
  ShieldAlert,
  Users,
  AlertTriangle,
  Activity,
  TrendingUp,
  Globe2,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DashboardSummary = {
  total_customers: number;
  high_risk_customers: number;
  medium_risk_customers: number;
  low_risk_customers: number;
  ml_anomalies_detected: number;
  average_risk_score: number;
  total_swift_exposure: number;
};

type HighRiskCustomer = {
  normalized_customer_id: string;
  customer_name: string;
  account_type: string;
  normalized_country: string;
  hybrid_risk_score: number;
  hybrid_risk_level: string;
  ml_anomaly_status: string;
  hybrid_risk_reasons: string;
};

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [highRiskCustomers, setHighRiskCustomers] = useState<HighRiskCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const summaryData = await getDashboardSummary();
        const highRiskData = await getHighRiskCustomers();

        setSummary(summaryData);
        setHighRiskCustomers(highRiskData.customers || []);
      } catch (error) {
        console.error("Dashboard data loading failed:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          Loading FINGUARD dashboard...
        </div>
      </AppShell>
    );
  }

  if (!summary) {
    return (
      <AppShell>
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          Dashboard data not available. Please check backend.
        </div>
      </AppShell>
    );
  }

  const riskDistributionData = [
    {
      name: "High Risk",
      value: summary.high_risk_customers,
    },
    {
      name: "Medium Risk",
      value: summary.medium_risk_customers,
    },
    {
      name: "Low Risk",
      value: summary.low_risk_customers,
    },
  ];

  return (
    <AppShell>
      <div className="min-h-screen bg-black text-white p-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold">
            FINGUARD Sentinel AI
          </h1>
          <p className="text-gray-400 mt-2">
            Autonomous Financial Risk & Compliance Intelligence Platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <MetricCard
            title="Total Customers"
            value={summary.total_customers}
            icon={<Users />}
          />

          <MetricCard
            title="High Risk"
            value={summary.high_risk_customers}
            icon={<ShieldAlert />}
          />

          <MetricCard
            title="Medium Risk"
            value={summary.medium_risk_customers}
            icon={<AlertTriangle />}
          />

          <MetricCard
            title="Low Risk"
            value={summary.low_risk_customers}
            icon={<Activity />}
          />

          <MetricCard
            title="ML Anomalies"
            value={summary.ml_anomalies_detected}
            icon={<TrendingUp />}
          />

          <MetricCard
            title="Avg Risk Score"
            value={summary.average_risk_score}
            icon={<Globe2 />}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 xl:col-span-1">
            <h2 className="text-xl font-semibold mb-4">
              Risk Distribution
            </h2>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistributionData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 xl:col-span-2">
            <h2 className="text-xl font-semibold mb-4">
              Enterprise Risk Exposure
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black border border-zinc-800 rounded-xl p-5">
                <p className="text-gray-400 text-sm">
                  Total SWIFT Exposure
                </p>
                <p className="text-3xl font-bold mt-2">
                  ₹{Number(summary.total_swift_exposure).toLocaleString("en-IN")}
                </p>
              </div>

              <div className="bg-black border border-zinc-800 rounded-xl p-5">
                <p className="text-gray-400 text-sm">
                  ML Anomaly Rate
                </p>
                <p className="text-3xl font-bold mt-2">
                  {(
                    (summary.ml_anomalies_detected / summary.total_customers) *
                    100
                  ).toFixed(2)}
                  %
                </p>
              </div>
            </div>

            <p className="text-gray-400 mt-6 leading-relaxed">
              This dashboard combines customer profiles, AML/KYC signals,
              international transfer exposure, CRM risk notes, audit events,
              and machine learning anomaly detection into a unified enterprise
              risk view.
            </p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">
            High-Risk Customers
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-gray-400">
                  <th className="text-left py-3">Customer ID</th>
                  <th className="text-left py-3">Name</th>
                  <th className="text-left py-3">Account Type</th>
                  <th className="text-left py-3">Country</th>
                  <th className="text-left py-3">Risk Score</th>
                  <th className="text-left py-3">ML Status</th>
                </tr>
              </thead>

              <tbody>
                {highRiskCustomers.slice(0, 10).map((customer) => (
                  <tr
                    key={customer.normalized_customer_id}
                    className="border-b border-zinc-800 hover:bg-zinc-800"
                  >
                    <td className="py-3">
                      {customer.normalized_customer_id}
                    </td>
                    <td className="py-3">
                      {customer.customer_name}
                    </td>
                    <td className="py-3">
                      {customer.account_type}
                    </td>
                    <td className="py-3">
                      {customer.normalized_country}
                    </td>
                    <td className="py-3 font-semibold">
                      {customer.hybrid_risk_score}
                    </td>
                    <td className="py-3">
                      {customer.ml_anomaly_status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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