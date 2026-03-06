"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface QubeAnalysis {
  frameControl: { score: number; moment: string; verdict: string };
  discovery: { score: number; painReal: boolean; evidence: string };
  objectionHandling: { score: number; moment: string; verdict: string };
  silenceDiscipline: { score: number; moment: string; verdict: string };
  nextStep: { exists: boolean; committed: boolean; verdict: string };
  languageMap: { score: number; verdict: string };
  leftOnTable: string;
  dealVerdict: "real" | "hope" | "dead";
  overallScore: number;
  topPriority: string;
  prospectName?: string;
  callStage?: string;
}

const CALENDLY_URL = "https://calendly.com/PLACEHOLDER";

function scoreColor(score: number, max: number) {
  const pct = (score / max) * 100;
  if (pct < 50) return "#ff4444";
  if (pct < 75) return "#f0b429";
  return "#00d7a3";
}

function verdictColor(verdict: string) {
  const v = verdict.toLowerCase();
  if (v === "real") return "#00d7a3";
  if (v === "hope") return "#f0b429";
  return "#ff4444";
}

export default function DebriefPage() {
  const router = useRouter();
  const [data, setData] = useState<QubeAnalysis | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("qube-analysis");
    if (!raw) {
      router.push("/upload");
      return;
    }
    try {
      setData(JSON.parse(raw));
    } catch {
      router.push("/upload");
    }
  }, [router]);

  if (!data) return null;

  const ruleCards: {
    label: string;
    score: number;
    verdict: string;
    moment: string;
  }[] = [
    {
      label: "Frame Control",
      score: data.frameControl.score,
      verdict: data.frameControl.verdict,
      moment: data.frameControl.moment,
    },
    {
      label: "Discovery Quality",
      score: data.discovery.score,
      verdict: data.discovery.evidence,
      moment: data.discovery.painReal
        ? "Pain confirmed real"
        : "Pain not validated",
    },
    {
      label: "Objection Handling",
      score: data.objectionHandling.score,
      verdict: data.objectionHandling.verdict,
      moment: data.objectionHandling.moment,
    },
    {
      label: "Silence Discipline",
      score: data.silenceDiscipline.score,
      verdict: data.silenceDiscipline.verdict,
      moment: data.silenceDiscipline.moment,
    },
    {
      label: "Next Step",
      score: data.nextStep.exists ? (data.nextStep.committed ? 10 : 5) : 1,
      verdict: data.nextStep.verdict,
      moment: data.nextStep.committed
        ? "Committed next step"
        : data.nextStep.exists
          ? "Next step exists but not committed"
          : "No next step set",
    },
    {
      label: "Language Map",
      score: data.languageMap.score,
      verdict: data.languageMap.verdict,
      moment: "",
    },
  ];

  const cardStyle: React.CSSProperties = {
    backgroundColor: "#0a0a0a",
    border: "1px solid #1a1a1a",
    borderRadius: "16px",
    padding: "28px",
  };

  const labelStyle: React.CSSProperties = {
    color: "#00d7a3",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    marginBottom: "8px",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000000",
        color: "#ffffff",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        padding: "80px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: "880px" }}>
        {/* Header */}
        <p style={{ ...labelStyle, textAlign: "center" }}>Qube Debrief</p>

        <h1
          style={{
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.2,
            marginBottom: "48px",
          }}
        >
          {data.prospectName || "Call"} — {data.callStage || "Analysis"}
        </h1>

        {/* Score + Verdict row */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "40px",
            marginBottom: "56px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <p style={labelStyle}>Overall Score</p>
            <p
              style={{
                fontSize: "72px",
                fontWeight: 800,
                lineHeight: 1,
                color: scoreColor(data.overallScore, 100),
                margin: 0,
              }}
            >
              {data.overallScore}
            </p>
            <p
              style={{
                color: "#555555",
                fontSize: "14px",
                margin: "4px 0 0",
              }}
            >
              out of 100
            </p>
          </div>

          <div style={{ textAlign: "center" }}>
            <p style={labelStyle}>Deal Verdict</p>
            <span
              style={{
                display: "inline-block",
                padding: "10px 32px",
                borderRadius: "999px",
                fontSize: "18px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: verdictColor(data.dealVerdict),
                backgroundColor: `${verdictColor(data.dealVerdict)}15`,
                border: `1px solid ${verdictColor(data.dealVerdict)}30`,
              }}
            >
              {data.dealVerdict}
            </span>
          </div>
        </div>

        {/* Rule cards grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          {ruleCards.map((rule) => (
            <div key={rule.label} style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <p
                  style={{
                    ...labelStyle,
                    marginBottom: 0,
                  }}
                >
                  {rule.label}
                </p>
                <span
                  style={{
                    fontSize: "28px",
                    fontWeight: 700,
                    color: scoreColor(rule.score, 10),
                  }}
                >
                  {rule.score}
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#555555",
                      fontWeight: 400,
                    }}
                  >
                    /10
                  </span>
                </span>
              </div>

              <p
                style={{
                  fontSize: "14px",
                  color: "#cccccc",
                  lineHeight: 1.5,
                  margin: "0 0 12px",
                }}
              >
                {rule.verdict}
              </p>

              {rule.moment && (
                <p
                  style={{
                    fontSize: "12px",
                    color: "#666666",
                    lineHeight: 1.4,
                    margin: 0,
                    fontStyle: "italic",
                  }}
                >
                  {rule.moment}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Left on table */}
        <div style={{ ...cardStyle, marginBottom: "16px" }}>
          <p style={labelStyle}>What You Left on the Table</p>
          <p
            style={{
              fontSize: "17px",
              color: "#00d7a3",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {data.leftOnTable}
          </p>
        </div>

        {/* Top priority */}
        <div style={{ ...cardStyle, marginBottom: "48px" }}>
          <p style={labelStyle}>Top Priority</p>
          <p
            style={{
              fontSize: "17px",
              color: "#ffffff",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {data.topPriority}
          </p>
        </div>

        {/* CTAs */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "14px 32px",
              backgroundColor: "#00d7a3",
              color: "#000000",
              fontSize: "15px",
              fontWeight: 600,
              border: "none",
              borderRadius: "10px",
              textDecoration: "none",
              cursor: "pointer",
              transition: "opacity 0.15s ease",
            }}
          >
            Book a Call Review with Jake
          </a>

          <a
            href="/upload"
            style={{
              padding: "14px 32px",
              fontSize: "15px",
              fontWeight: 600,
              borderRadius: "10px",
              border: "1px solid #333333",
              backgroundColor: "transparent",
              color: "#ffffff",
              textDecoration: "none",
              cursor: "pointer",
              transition: "border-color 0.15s ease",
            }}
          >
            Analyze Another Call
          </a>
        </div>
      </div>
    </div>
  );
}
