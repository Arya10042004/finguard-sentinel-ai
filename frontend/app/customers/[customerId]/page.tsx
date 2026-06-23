"use client";

import AppShell from "@/components/AppShell";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  getCustomerRiskProfile,
  getCustomerExplanation,
  createComplianceAction,
  getComplianceActions,
  getAuditLogs,
} from "@/lib/api";
import {
  ArrowLeft,
  ShieldAlert,
  Activity,
  Brain,
  FileWarning,
  CheckCircle2,
  User,
  Globe2,
  Landmark,
  Fingerprint,
  AlertTriangle,
  FileText,
  History,
  FileClock,
} from "lucide-react";
import Link from "next/link";

type RiskProfile = {
  customer_id: string;
  customer_name: string;
  account_type: string;
  country: string;
  risk_score: number;
  risk_level: string;
  ml_anomaly_status: string;
  risk_reasons: string;
};

type Explanation = {
  customer_id: string;
  customer_name: string;
  account_type: string;
  country: string;
  hybrid_risk_score: number;
  hybrid_risk_level: string;
  ml_anomaly_status: string;
  top_risk_factors: string;
  recommended_action: string;
  priority: string;
  case_required: boolean;
};

type ComplianceAction = {
  id: number;
  customer_id: string;
  action: string;
  performed_by: string;
  remarks: string;
  status: string;
  created_at: string;
};

type AuditLog = {
  id: number;
  event_type: string;
  customer_id: string | null;
  performed_by: string | null;
  event_status: string;
  remarks: string | null;
  created_at: string;
};

export default function CustomerDetailPage() {
  const params = useParams();
  const customerId = params.customerId as string;

  const [profile, setProfile] = useState<RiskProfile | null>(null);
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [customerActions, setCustomerActions] = useState<ComplianceAction[]>([]);
  const [customerAuditLogs, setCustomerAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    async function loadCustomerData() {
      try {
        const profileData = await getCustomerRiskProfile(customerId);
        const explanationData = await getCustomerExplanation(customerId);
        const actionsData = await getComplianceActions();
        const auditData = await getAuditLogs();

        const allActions: ComplianceAction[] = actionsData.actions || [];
        const allAuditLogs: AuditLog[] = auditData.logs || [];

        const matchedActions = allActions.filter(
          (item) => item.customer_id === customerId
        );

        const matchedAuditLogs = allAuditLogs.filter(
          (item) => item.customer_id === customerId
        );

        setProfile(profileData);
        setExplanation(explanationData);
        setCustomerActions(matchedActions);
        setCustomerAuditLogs(matchedAuditLogs);
      } catch (error) {
        console.error("Failed to load customer detail:", error);
      } finally {
        setLoading(false);
      }
    }

    if (customerId) {
      loadCustomerData();
    }
  }, [customerId]);

  async function reloadCustomerActionsAndAuditLogs() {
    try {
      const actionsData = await getComplianceActions();
      const auditData = await getAuditLogs();

      const allActions: ComplianceAction[] = actionsData.actions || [];
      const allAuditLogs: AuditLog[] = auditData.logs || [];

      const matchedActions = allActions.filter(
        (item) => item.customer_id === customerId
      );

      const matchedAuditLogs = allAuditLogs.filter(
        (item) => item.customer_id === customerId
      );

      setCustomerActions(matchedActions);
      setCustomerAuditLogs(matchedAuditLogs);
    } catch (error) {
      console.error("Failed to reload customer actions/audit logs:", error);
    }
  }

  async function handleComplianceAction(action: string) {
    try {
      setActionLoading(true);
      setActionMessage("");

      const result = await createComplianceAction({
        customer_id: customerId,
        action: action,
        performed_by: "Compliance Officer",
        remarks: `${action} triggered from FINGUARD customer risk profile page`,
      });

      setActionMessage(`Action recorded successfully: ${result.action}`);

      await reloadCustomerActionsAndAuditLogs();
    } catch (error) {
      console.error("Compliance action failed:", error);
      setActionMessage("Failed to record compliance action.");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          Loading customer risk profile...
        </div>
      </AppShell>
    );
  }

  if (!profile || !explanation) {
    return (
      <AppShell>
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
          <p>Customer risk profile not found.</p>
          <Link href="/customers" className="text-gray-400 mt-4 underline">
            Back to customers
          </Link>
        </div>
      </AppShell>
    );
  }

  const factorList = explanation.top_risk_factors
    ? explanation.top_risk_factors.split(" | ")
    : [];

  return (
    <AppShell>
      <div className="min-h-screen bg-black text-white p-8">
        <div className="mb-8">
          <Link
            href="/customers"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6"
          >
            <ArrowLeft size={18} />
            Back to Customer Registry
          </Link>

          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-2">Customer Risk Profile</p>
              <h1 className="text-4xl font-bold">{profile.customer_name}</h1>

              <p className="text-gray-400 mt-2">
                {profile.customer_id} • {profile.account_type} • {profile.country}
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4">
              <p className="text-gray-400 text-sm">Overall Risk Score</p>
              <p className="text-4xl font-bold mt-1">{profile.risk_score}</p>
              <p className="text-gray-500 text-sm mt-1">{profile.risk_level}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatusCard
            title="Risk Level"
            value={profile.risk_level}
            icon={<ShieldAlert />}
          />

          <StatusCard
            title="ML Anomaly"
            value={profile.ml_anomaly_status}
            icon={<Brain />}
          />

          <StatusCard
            title="Case Required"
            value={explanation.case_required ? "YES" : "NO"}
            icon={<Activity />}
          />

          <StatusCard
            title="Priority"
            value={explanation.priority}
            icon={<FileWarning />}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <SectionHeader title="Customer Overview" icon={<User />} />

            <InfoRow label="Customer ID" value={profile.customer_id} />
            <InfoRow label="Customer Name" value={profile.customer_name} />
            <InfoRow label="Account Type" value={profile.account_type} />
            <InfoRow label="Country" value={profile.country} />
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <SectionHeader title="KYC & AML Risk" icon={<Fingerprint />} />

            <InfoRow label="KYC/AML Status" value="Derived from AML-KYC dataset" />
            <InfoRow label="Risk Level" value={profile.risk_level} />
            <InfoRow
              label="Case Required"
              value={explanation.case_required ? "YES" : "NO"}
            />
            <InfoRow label="Priority" value={explanation.priority} />
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <SectionHeader title="Geography & Exposure" icon={<Globe2 />} />

            <InfoRow label="Country" value={profile.country} />
            <InfoRow label="Exposure Source" value="SWIFT / cross-border activity" />
            <InfoRow label="Monitoring Mode" value="Hybrid rule + ML detection" />
            <InfoRow label="Review Status" value="Open for compliance decision" />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 xl:col-span-2">
            <SectionHeader title="AI Explainability: Top Risk Factors" icon={<Brain />} />

            {factorList.length === 0 ? (
              <div className="bg-black border border-zinc-800 rounded-xl p-4 text-gray-400">
                No explainability factors available.
              </div>
            ) : (
              <div className="space-y-4">
                {factorList.map((factor, index) => (
                  <div
                    key={index}
                    className="bg-black border border-zinc-800 rounded-xl p-4 flex gap-3"
                  >
                    <AlertTriangle
                      size={18}
                      className="text-gray-500 shrink-0 mt-0.5"
                    />
                    <p className="text-sm text-gray-300">{factor}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <SectionHeader title="Compliance Recommendation" icon={<Landmark />} />

            <div className="bg-black border border-zinc-800 rounded-xl p-5 mb-4">
              <p className="text-gray-400 text-sm">Recommended Action</p>
              <p className="text-2xl font-bold mt-2">
                {explanation.recommended_action}
              </p>
            </div>

            <div className="bg-black border border-zinc-800 rounded-xl p-5 mb-4">
              <p className="text-gray-400 text-sm">Priority</p>
              <p className="text-2xl font-bold mt-2">{explanation.priority}</p>
            </div>

            <div className="flex items-start gap-3 text-gray-400 text-sm leading-relaxed">
              <CheckCircle2 size={20} />
              <p>
                Recommendation generated from hybrid risk score, ML anomaly status,
                and explainability factors.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
          <SectionHeader title="Compliance Actions" icon={<FileWarning />} />

          <p className="text-gray-400 mb-6">
            Take a human-in-the-loop compliance decision for this customer.
            The action will be recorded in PostgreSQL and audit logs.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              disabled={actionLoading}
              onClick={() => handleComplianceAction("Escalate Case")}
              className="bg-white text-black rounded-xl px-4 py-3 font-semibold hover:bg-gray-200 disabled:opacity-50"
            >
              Escalate Case
            </button>

            <button
              disabled={actionLoading}
              onClick={() => handleComplianceAction("Request KYC Update")}
              className="bg-black border border-zinc-700 rounded-xl px-4 py-3 font-semibold hover:bg-zinc-800 disabled:opacity-50"
            >
              Request KYC Update
            </button>

            <button
              disabled={actionLoading}
              onClick={() => handleComplianceAction("Freeze Transaction")}
              className="bg-black border border-zinc-700 rounded-xl px-4 py-3 font-semibold hover:bg-zinc-800 disabled:opacity-50"
            >
              Freeze Transaction
            </button>

            <button
              disabled={actionLoading}
              onClick={() => handleComplianceAction("Mark False Positive")}
              className="bg-black border border-zinc-700 rounded-xl px-4 py-3 font-semibold hover:bg-zinc-800 disabled:opacity-50"
            >
              Mark False Positive
            </button>
          </div>

          {actionMessage && (
            <div className="mt-6 bg-black border border-zinc-800 rounded-xl p-4">
              <p className="text-gray-300">{actionMessage}</p>
            </div>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
          <SectionHeader title="Customer Action History" icon={<History />} />

          {customerActions.length === 0 ? (
            <div className="bg-black border border-zinc-800 rounded-xl p-5 text-gray-400">
              No compliance actions have been recorded for this customer yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-gray-400">
                    <th className="text-left py-3">Action ID</th>
                    <th className="text-left py-3">Action</th>
                    <th className="text-left py-3">Performed By</th>
                    <th className="text-left py-3">Status</th>
                    <th className="text-left py-3">Created At</th>
                    <th className="text-left py-3">Remarks</th>
                  </tr>
                </thead>

                <tbody>
                  {customerActions.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-zinc-800 hover:bg-zinc-800"
                    >
                      <td className="py-3">{item.id}</td>
                      <td className="py-3 font-medium">{item.action}</td>
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

          <div className="mt-5">
            <Link
              href="/compliance"
              className="text-sm text-gray-400 underline hover:text-white"
            >
              View all compliance actions
            </Link>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
          <SectionHeader title="Customer Audit History" icon={<FileClock />} />

          {customerAuditLogs.length === 0 ? (
            <div className="bg-black border border-zinc-800 rounded-xl p-5 text-gray-400">
              No audit logs have been recorded for this customer yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-gray-400">
                    <th className="text-left py-3">Log ID</th>
                    <th className="text-left py-3">Event Type</th>
                    <th className="text-left py-3">Performed By</th>
                    <th className="text-left py-3">Status</th>
                    <th className="text-left py-3">Created At</th>
                    <th className="text-left py-3">Remarks</th>
                  </tr>
                </thead>

                <tbody>
                  {customerAuditLogs.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-zinc-800 hover:bg-zinc-800"
                    >
                      <td className="py-3">{item.id}</td>
                      <td className="py-3 font-medium">{item.event_type}</td>
                      <td className="py-3">{item.performed_by || "System"}</td>
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

          <div className="mt-5">
            <Link
              href="/audit"
              className="text-sm text-gray-400 underline hover:text-white"
            >
              View all audit logs
            </Link>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <SectionHeader title="Raw Risk Evidence" icon={<FileText />} />

          <p className="text-gray-300 leading-relaxed">
            {profile.risk_reasons}
          </p>
        </div>
      </div>
    </AppShell>
  );
}

function SectionHeader({
  title,
  icon,
}: {
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="h-10 w-10 rounded-xl bg-black border border-zinc-800 flex items-center justify-center text-gray-400">
        {icon}
      </div>
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-zinc-800 py-3">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-gray-200 text-sm text-right">{value}</p>
    </div>
  );
}

function StatusCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
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