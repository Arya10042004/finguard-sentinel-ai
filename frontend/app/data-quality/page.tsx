"use client";

import AppShell from "@/components/AppShell";
import { useEffect, useState } from "react";
import {
  getDataQualitySummary,
  getEntityResolutionReport,
} from "@/lib/api";
import {
  Database,
  ShieldCheck,
  AlertTriangle,
  Users,
  FileWarning,
  Fingerprint,
  RefreshCcw,
} from "lucide-react";

type QualityIssue = {
  issue_type: string;
  severity: string;
  count: number;
  description: string;
};

type DataQualitySummary = {
  data_quality_score: number;
  total_records: number;
  missing_values: number;
  duplicate_customers: number;
  unresolved_entities: number;
  stale_kyc_records: number;
  entity_resolution_confidence: number;
  quality_issues: QualityIssue[];
};

type EntityResolutionRecord = {
  normalized_customer_id: string;
  raw_references: string[];
  reference_count: number;
  resolution_status: string;
  confidence_score: number;
};

type EntityResolutionReport = {
  total_records: number;
  records: EntityResolutionRecord[];
};

export default function DataQualityPage() {
  const [summary, setSummary] = useState<DataQualitySummary | null>(null);
  const [entityReport, setEntityReport] =
    useState<EntityResolutionReport | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadDataQualitySummary() {
    try {
      setLoading(true);

      const data = await getDataQualitySummary();
      const entityData = await getEntityResolutionReport();

      setSummary(data);
      setEntityReport(entityData);
    } catch (error) {
      console.error("Failed to load data quality summary:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDataQualitySummary();
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          Loading data quality dashboard...
        </div>
      </AppShell>
    );
  }

  if (!summary) {
    return (
      <AppShell>
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          Unable to load data quality report.
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
              Enterprise Data Trust Layer
            </p>

            <h1 className="text-4xl font-bold">
              Data Quality & Entity Resolution
            </h1>

            <p className="text-gray-400 mt-3 max-w-3xl">
              This dashboard checks whether fragmented banking, KYC, SWIFT,
              CRM, audit, and market data can be trusted before AI risk
              decisions are generated.
            </p>
          </div>

          <button
            onClick={loadDataQualitySummary}
            className="inline-flex items-center gap-2 bg-white text-black rounded-xl px-5 py-3 font-semibold hover:bg-gray-200"
          >
            <RefreshCcw size={18} />
            Refresh Report
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="xl:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-xl bg-black border border-zinc-800 flex items-center justify-center text-gray-400">
                <ShieldCheck />
              </div>

              <div>
                <h2 className="text-2xl font-semibold">Data Quality Score</h2>
                <p className="text-gray-500 text-sm">
                  Overall trust score for processed customer risk data
                </p>
              </div>
            </div>

            <p className="text-6xl font-bold">
              {summary.data_quality_score}
              <span className="text-2xl text-gray-500">/100</span>
            </p>

            <p className="text-gray-400 mt-4">
              Entity Resolution Confidence:{" "}
              <span className="text-white font-semibold">
                {summary.entity_resolution_confidence}%
              </span>
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Why This Matters</h2>

            <p className="text-gray-400 text-sm leading-relaxed">
              Bad fragmented data creates unreliable AI risk intelligence. This
              page checks the trust level of your processed customer risk file
              before compliance teams act on the results.
            </p>

            <div className="mt-5 bg-black border border-zinc-800 rounded-xl p-4">
              <p className="text-sm text-gray-400">Enterprise Principle</p>
              <p className="font-semibold mt-1">
                AI risk decisions are only as reliable as the data foundation.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <MetricCard
            title="Total Records"
            value={summary.total_records}
            icon={<Database />}
          />

          <MetricCard
            title="Missing Values"
            value={summary.missing_values}
            icon={<FileWarning />}
          />

          <MetricCard
            title="Duplicate Customers"
            value={summary.duplicate_customers}
            icon={<Users />}
          />

          <MetricCard
            title="Unresolved Entities"
            value={summary.unresolved_entities}
            icon={<Fingerprint />}
          />

          <MetricCard
            title="Stale KYC"
            value={summary.stale_kyc_records}
            icon={<AlertTriangle />}
          />

          <MetricCard
            title="Resolution"
            value={`${summary.entity_resolution_confidence}%`}
            icon={<ShieldCheck />}
          />
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-2">Data Quality Issues</h2>

          <p className="text-gray-400 mb-6">
            Detected issues in processed customer risk data.
          </p>

          {summary.quality_issues.length === 0 ? (
            <div className="bg-black border border-zinc-800 rounded-xl p-5 text-gray-400">
              No data quality issues found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-gray-400">
                    <th className="text-left py-3">Issue Type</th>
                    <th className="text-left py-3">Severity</th>
                    <th className="text-left py-3">Count</th>
                    <th className="text-left py-3">Description</th>
                  </tr>
                </thead>

                <tbody>
                  {summary.quality_issues.map((issue, index) => (
                    <tr
                      key={index}
                      className="border-b border-zinc-800 hover:bg-zinc-800"
                    >
                      <td className="py-3 font-medium">{issue.issue_type}</td>

                      <td className="py-3">
                        <span className="px-3 py-1 rounded-full bg-black border border-zinc-700 text-xs">
                          {issue.severity}
                        </span>
                      </td>

                      <td className="py-3">{issue.count}</td>

                      <td className="py-3 text-gray-400">
                        {issue.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mt-8">
          <h2 className="text-xl font-semibold mb-2">
            Entity Resolution Drilldown
          </h2>

          <p className="text-gray-400 mb-6">
            This table shows how fragmented customer references are mapped into
            a unified customer identity before risk scoring.
          </p>

          {!entityReport || entityReport.records.length === 0 ? (
            <div className="bg-black border border-zinc-800 rounded-xl p-5 text-gray-400">
              No entity resolution records available.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-gray-400">
                    <th className="text-left py-3">Unified Customer ID</th>
                    <th className="text-left py-3">Raw References</th>
                    <th className="text-left py-3">Reference Count</th>
                    <th className="text-left py-3">Resolution Status</th>
                    <th className="text-left py-3">Confidence</th>
                  </tr>
                </thead>

                <tbody>
                  {entityReport.records.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-zinc-800 hover:bg-zinc-800"
                    >
                      <td className="py-3 font-medium">
                        {item.normalized_customer_id}
                      </td>

                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          {item.raw_references.map((ref, refIndex) => (
                            <span
                              key={refIndex}
                              className="px-3 py-1 rounded-full bg-black border border-zinc-700 text-xs text-gray-300"
                            >
                              {ref}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3">{item.reference_count}</td>

                      <td className="py-3">
                        <span className="px-3 py-1 rounded-full bg-black border border-zinc-700 text-xs">
                          {item.resolution_status}
                        </span>
                      </td>

                      <td className="py-3">{item.confidence_score}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mt-8">
          <h2 className="text-xl font-semibold mb-2">
            Entity Resolution Logic
          </h2>

          <p className="text-gray-400 mb-6">
            Example mapping logic used by FINGUARD to convert fragmented
            references into one customer identity.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            <ResolutionExample raw="CUST_1001" normalized="CUST_1001" />
            <ResolutionExample raw="CUSTOMER_1001" normalized="CUST_1001" />
            <ResolutionExample raw="CUST-A-1001" normalized="CUST_1001" />
            <ResolutionExample raw="CUSTOMER-1001" normalized="CUST_1001" />
            <ResolutionExample raw="ACC_5001" normalized="Mapped via account" />
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

function ResolutionExample({
  raw,
  normalized,
}: {
  raw: string;
  normalized: string;
}) {
  return (
    <div className="bg-black border border-zinc-800 rounded-xl p-4">
      <p className="text-gray-500 text-xs mb-1">Raw Reference</p>
      <p className="font-medium">{raw}</p>

      <p className="text-gray-500 text-xs mt-3 mb-1">Normalized Entity</p>
      <p className="text-gray-300">{normalized}</p>
    </div>
  );
}