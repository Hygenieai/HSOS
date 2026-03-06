"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const CALL_STAGES = ["Discovery", "Demo", "Follow-up", "Closing"] as const;
const ACCEPTED_TYPES = ".mp4,.mp3,.m4a,.wav,.webm";
const MAX_SIZE = 500 * 1024 * 1024; // 500MB

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [prospectName, setProspectName] = useState("");
  const [company, setCompany] = useState("");
  const [callStage, setCallStage] = useState<string>("Discovery");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((f: File) => {
    setError(null);
    if (f.size > MAX_SIZE) {
      setError("File exceeds 500MB limit.");
      return;
    }
    setFile(f);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an audio or video file.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Transcribe
      const formData = new FormData();
      formData.append("file", file);

      const transcribeRes = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!transcribeRes.ok) {
        const err = await transcribeRes.json();
        throw new Error(err.error || "Transcription failed");
      }

      const { transcript } = await transcribeRes.json();

      // Step 2: Analyze
      const analyzeRes = await fetch("/api/analyze-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          prospectName,
          callStage,
        }),
      });

      if (!analyzeRes.ok) {
        const err = await analyzeRes.json();
        throw new Error(err.error || "Analysis failed");
      }

      const analysis = await analyzeRes.json();

      localStorage.setItem("qube-analysis", JSON.stringify(analysis));
      router.push("/debrief");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000000",
        color: "#ffffff",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "80px 24px",
      }}
    >
      <p
        style={{
          color: "#00d7a3",
          fontSize: "12px",
          fontWeight: 600,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          marginBottom: "16px",
        }}
      >
        Qube Analysis Engine
      </p>

      <h1
        style={{
          fontSize: "clamp(32px, 5vw, 56px)",
          fontWeight: 700,
          marginBottom: "16px",
          textAlign: "center",
          lineHeight: 1.1,
        }}
      >
        Upload a call. Get coached.
      </h1>

      <p
        style={{
          fontSize: "17px",
          color: "#a0a0a0",
          maxWidth: "520px",
          textAlign: "center",
          lineHeight: 1.6,
          marginBottom: "48px",
        }}
      >
        Drop in any recorded call and Qube will analyze every moment against a
        proven sales framework.
      </p>

      <div
        style={{
          width: "100%",
          maxWidth: "560px",
          backgroundColor: "#0a0a0a",
          border: "1px solid #1a1a1a",
          borderRadius: "16px",
          padding: "40px",
        }}
      >
        {loading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "24px",
              padding: "60px 0",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                border: "3px solid #1a1a1a",
                borderTopColor: "#00d7a3",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <p style={{ color: "#a0a0a0", fontSize: "15px" }}>
              Qube is analyzing your call...
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  color: "#00d7a3",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                Prospect Name
              </label>
              <input
                type="text"
                value={prospectName}
                onChange={(e) => setProspectName(e.target.value)}
                placeholder="Jane Smith"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  backgroundColor: "#111111",
                  border: "1px solid #222222",
                  borderRadius: "8px",
                  color: "#ffffff",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  color: "#00d7a3",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                Company
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Corp"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  backgroundColor: "#111111",
                  border: "1px solid #222222",
                  borderRadius: "8px",
                  color: "#ffffff",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  display: "block",
                  color: "#00d7a3",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                Call Stage
              </label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {CALL_STAGES.map((stage) => (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => setCallStage(stage)}
                    style={{
                      padding: "8px 18px",
                      borderRadius: "999px",
                      border:
                        callStage === stage
                          ? "1px solid #00d7a3"
                          : "1px solid #222222",
                      backgroundColor:
                        callStage === stage
                          ? "rgba(0, 215, 163, 0.1)"
                          : "#111111",
                      color: callStage === stage ? "#00d7a3" : "#888888",
                      fontSize: "13px",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "32px" }}>
              <label
                style={{
                  display: "block",
                  color: "#00d7a3",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                Call Recording
              </label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: dragOver
                    ? "2px dashed #00d7a3"
                    : file
                      ? "2px solid #1a1a1a"
                      : "2px dashed #222222",
                  borderRadius: "12px",
                  padding: "40px 24px",
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor: dragOver
                    ? "rgba(0, 215, 163, 0.05)"
                    : "#0d0d0d",
                  transition: "all 0.15s ease",
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_TYPES}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                  style={{ display: "none" }}
                />
                {file ? (
                  <div>
                    <p style={{ color: "#ffffff", fontSize: "15px", margin: 0 }}>
                      {file.name}
                    </p>
                    <p
                      style={{
                        color: "#666666",
                        fontSize: "13px",
                        margin: "4px 0 0",
                      }}
                    >
                      {(file.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p
                      style={{
                        color: "#666666",
                        fontSize: "15px",
                        margin: 0,
                      }}
                    >
                      Drag & drop your recording here, or{" "}
                      <span style={{ color: "#00d7a3" }}>browse</span>
                    </p>
                    <p
                      style={{
                        color: "#444444",
                        fontSize: "12px",
                        margin: "8px 0 0",
                      }}
                    >
                      MP4, MP3, M4A, WAV, WebM — up to 500MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div
                style={{
                  backgroundColor: "rgba(255, 60, 60, 0.08)",
                  border: "1px solid rgba(255, 60, 60, 0.2)",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  marginBottom: "24px",
                  color: "#ff4444",
                  fontSize: "14px",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "#00d7a3",
                color: "#000000",
                fontSize: "15px",
                fontWeight: 600,
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                transition: "opacity 0.15s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.opacity = "0.9")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.opacity = "1")
              }
            >
              Run Qube Analysis
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
