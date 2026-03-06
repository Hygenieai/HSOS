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
  const [callStage, setCallStage] = useState<string>("");
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;900&family=Lato:wght@400;500;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#0A0A0A",
          color: "#FFFFFF",
          fontFamily: '"Lato", sans-serif',
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "80px 24px",
        }}
      >
        <p
          style={{
            color: "#00989E",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: "16px",
            fontFamily: '"Lato", sans-serif',
          }}
        >
          Qube Analysis Engine
        </p>

        <h1
          style={{
            fontSize: "clamp(32px, 5vw, 56px)",
            fontWeight: 900,
            fontFamily: '"Poppins", sans-serif',
            letterSpacing: "0.04em",
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
            color: "rgba(255,255,255,0.65)",
            maxWidth: "520px",
            textAlign: "center",
            lineHeight: 1.6,
            marginBottom: "48px",
            fontFamily: '"Lato", sans-serif',
          }}
        >
          Drop in any recorded call and Qube will analyze every moment against a
          proven sales framework.
        </p>

        <div
          style={{
            width: "100%",
            maxWidth: "560px",
            backgroundColor: "#0F0F0F",
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
                  borderTopColor: "#00989E",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <p
                style={{
                  color: "rgba(255,255,255,0.65)",
                  fontSize: "15px",
                  fontFamily: '"Lato", sans-serif',
                }}
              >
                Qube is analyzing your call...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    color: "#00989E",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                    fontFamily: '"Lato", sans-serif',
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
                    backgroundColor: "#262626",
                    border: "1px solid #333333",
                    borderRadius: "8px",
                    color: "#FFFFFF",
                    fontSize: "15px",
                    fontFamily: '"Lato", sans-serif',
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    color: "#00989E",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                    fontFamily: '"Lato", sans-serif',
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
                    backgroundColor: "#262626",
                    border: "1px solid #333333",
                    borderRadius: "8px",
                    color: "#FFFFFF",
                    fontSize: "15px",
                    fontFamily: '"Lato", sans-serif',
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    color: "#00989E",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                    fontFamily: '"Lato", sans-serif',
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
                            ? "1px solid #00989E"
                            : "1px solid #333333",
                        backgroundColor:
                          callStage === stage
                            ? "rgba(0, 152, 158, 0.1)"
                            : "#262626",
                        color: callStage === stage ? "#00989E" : "rgba(255,255,255,0.65)",
                        fontSize: "13px",
                        fontWeight: 500,
                        fontFamily: '"Lato", sans-serif',
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
                    color: "#00989E",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                    fontFamily: '"Lato", sans-serif',
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
                      ? "2px dashed #00989E"
                      : file
                        ? "2px solid #1a1a1a"
                        : "2px dashed #333333",
                    borderRadius: "12px",
                    padding: "40px 24px",
                    textAlign: "center",
                    cursor: "pointer",
                    backgroundColor: dragOver
                      ? "rgba(0, 152, 158, 0.05)"
                      : "#141414",
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
                      <p style={{ color: "#FFFFFF", fontSize: "15px", margin: 0, fontFamily: '"Lato", sans-serif' }}>
                        {file.name}
                      </p>
                      <p
                        style={{
                          color: "rgba(255,255,255,0.65)",
                          fontSize: "13px",
                          margin: "4px 0 0",
                          fontFamily: '"Lato", sans-serif',
                        }}
                      >
                        {(file.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p
                        style={{
                          color: "rgba(255,255,255,0.65)",
                          fontSize: "15px",
                          margin: 0,
                          fontFamily: '"Lato", sans-serif',
                        }}
                      >
                        Drag & drop your recording here, or{" "}
                        <span style={{ color: "#00989E" }}>browse</span>
                      </p>
                      <p
                        style={{
                          color: "rgba(255,255,255,0.4)",
                          fontSize: "12px",
                          margin: "8px 0 0",
                          fontFamily: '"Lato", sans-serif',
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
                    fontFamily: '"Lato", sans-serif',
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
                  backgroundColor: "#00989E",
                  color: "#0A0A0A",
                  fontSize: "15px",
                  fontWeight: 600,
                  fontFamily: '"Lato", sans-serif',
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
    </>
  );
}
