"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";

type Role = "user" | "assistant";
interface Message { role: Role; content: string; }

const SUGGESTIONS = [
  "Pokaż wszystkich reklamodawców",
  "Lista aktywnych kampanii reklamodawcy 1",
  "Znajdź kreacje z wymiarem 300",
  "Wyszukaj line items zawierające 'display'",
  "Utwórz kampanię 'Q4 2025' dla reklamodawcy 2",
  "Zatrzymaj line item o ID 3",
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [dots, setDots]         = useState(".");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => setDots(d => d.length >= 3 ? "." : d + "."), 400);
    return () => clearInterval(id);
  }, [loading]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages(m => [...m, { role: "assistant", content: data.content }]);
    } catch (err) {
      setMessages(m => [...m, {
        role: "assistant",
        content: `⚠️ Błąd: ${err instanceof Error ? err.message : "Nieznany błąd"}`,
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [messages, loading]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const isEmpty = messages.length === 0;

  return (
    <div style={styles.shell}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>
            <span style={styles.logoMark}>DV</span>
            <span style={styles.logoSub}>360</span>
            <span style={styles.logoDivider}>|</span>
            <span style={styles.logoAgent}>AGENT</span>
          </div>
          <div style={styles.statusPill}>
            <span style={styles.statusDot} />
            mock api · live
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {isEmpty ? (
          <div style={styles.hero}>
            <div style={styles.heroGlow} />
            <h1 style={styles.heroTitle}>
              Zarządzaj kampaniami<br />
              <span style={styles.heroAccent}>przez rozmowę</span>
            </h1>
            <p style={styles.heroSub}>
              Pytaj po polsku lub angielsku. Agent wywoła odpowiednie metody DV360 API automatycznie.
            </p>
            <div style={styles.suggestions}>
              {SUGGESTIONS.map((s) => (
                <button key={s} style={styles.suggestion} onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={styles.messages}>
            {messages.map((m, i) => (
              <div key={i} style={m.role === "user" ? styles.userRow : styles.assistantRow}>
                <div style={m.role === "user" ? styles.userBubble : styles.assistantBubble}>
                  {m.role === "user" ? (
                    <span style={styles.userText}>{m.content}</span>
                  ) : (
                    <div className="prose">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div style={styles.assistantRow}>
                <div style={styles.assistantBubble}>
                  <span style={styles.thinking}>Przetwarzam{dots}</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      <footer style={styles.footer}>
        <div style={styles.inputWrap}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Napisz polecenie lub pytanie…"
            rows={1}
            style={styles.textarea}
            disabled={loading}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            style={{
              ...styles.sendBtn,
              ...((!input.trim() || loading) ? styles.sendBtnDisabled : {}),
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p style={styles.hint}>Enter — wyślij · Shift+Enter — nowa linia</p>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: { display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)", overflow: "hidden" },
  header: { borderBottom: "1px solid var(--border)", background: "rgba(10,10,15,0.85)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 10 },
  headerInner: { maxWidth: 800, margin: "0 auto", padding: "0.9rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { display: "flex", alignItems: "baseline", gap: "0.3rem", fontFamily: "var(--font-ui)", fontWeight: 800, letterSpacing: "-0.02em" },
  logoMark: { fontSize: "1.25rem", color: "var(--accent-hi)" },
  logoSub:  { fontSize: "1.25rem", color: "var(--text)" },
  logoDivider: { color: "var(--text-dim)", margin: "0 0.2rem", fontWeight: 300 },
  logoAgent:   { fontSize: "0.7rem", color: "var(--text-muted)", letterSpacing: "0.15em", fontWeight: 600 },
  statusPill: { display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontWeight: 400, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "0.25rem 0.75rem" },
  statusDot: { width: 6, height: 6, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 6px var(--green)", display: "inline-block" },
  main: { flex: 1, overflow: "hidden auto", padding: "1.5rem" },
  hero: { maxWidth: 640, margin: "4vh auto 0", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", position: "relative" },
  heroGlow: { position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 400, height: 200, background: "radial-gradient(ellipse, rgba(91,108,255,0.15) 0%, transparent 70%)", pointerEvents: "none" },
  heroTitle: { fontSize: "clamp(1.8rem, 5vw, 2.8rem)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: "1rem" },
  heroAccent: { color: "var(--accent-hi)" },
  heroSub: { fontSize: "0.88rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontWeight: 300, lineHeight: 1.7, maxWidth: 480, marginBottom: "2.5rem" },
  suggestions: { display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center" },
  suggestion: { background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.75rem", padding: "0.45rem 0.9rem", borderRadius: 20, cursor: "pointer", transition: "all 0.15s", outline: "none" },
  messages: { maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", gap: "1rem" },
  userRow: { display: "flex", justifyContent: "flex-end" },
  assistantRow: { display: "flex", justifyContent: "flex-start" },
  userBubble: { background: "var(--user-bg)", border: "1px solid var(--border-hi)", borderRadius: "var(--radius) var(--radius) 2px var(--radius)", padding: "0.75rem 1rem", maxWidth: "75%" },
  assistantBubble: { background: "transparent", maxWidth: "90%", padding: "0.25rem 0" },
  userText: { fontFamily: "var(--font-ui)", fontSize: "0.88rem", color: "var(--text)", lineHeight: 1.6, whiteSpace: "pre-wrap" },
  thinking: { fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 300 },
  footer: { borderTop: "1px solid var(--border)", background: "rgba(10,10,15,0.9)", backdropFilter: "blur(12px)", padding: "1rem 1.5rem 1.25rem" },
  inputWrap: { maxWidth: 800, margin: "0 auto", display: "flex", gap: "0.75rem", alignItems: "flex-end", background: "var(--surface)", border: "1px solid var(--border-hi)", borderRadius: "var(--radius)", padding: "0.5rem 0.5rem 0.5rem 1rem" },
  textarea: { flex: 1, background: "transparent", border: "none", outline: "none", color: "var(--text)", fontFamily: "var(--font-ui)", fontSize: "0.88rem", lineHeight: 1.6, resize: "none", minHeight: 28, maxHeight: 160, overflowY: "auto" },
  sendBtn: { background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all 0.15s" },
  sendBtnDisabled: { background: "var(--border-hi)", color: "var(--text-dim)", cursor: "default" },
  hint: { maxWidth: 800, margin: "0.5rem auto 0", fontSize: "0.68rem", color: "var(--text-dim)", fontFamily: "var(--font-mono)", textAlign: "center" },
};
