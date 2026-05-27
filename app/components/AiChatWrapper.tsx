// components/AiChatWrapper.tsx
"use client";

import { useEffect, useState, useRef } from "react";

type UserDetails = {
  name: string;
  email: string;
  phone: string;
};

type ChatMessage = {
  role: "user" | "ai";
  text: string;
};

export default function AiChatWrapper() {
  const [open, setOpen] = useState(false);
  const [started, setStarted] = useState(false);

  const [details, setDetails] = useState<UserDetails>({
    name: "",
    email: "",
    phone: "",
  });

  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    let existing = localStorage.getItem("eleware_chat_session");

    if (!existing) {
      existing = crypto.randomUUID();
      localStorage.setItem("eleware_chat_session", existing);
    }

    setSessionId(existing);
  }, []);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (open && started) {
      const timeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 350);
      return () => clearTimeout(timeout);
    }
  }, [open, started]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [open]);

  // Load saved user
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedUser = localStorage.getItem("eleware_user");

    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setDetails(parsed);
      setStarted(true);
      setMessages([
        {
          role: "ai",
          text: `Welcome back, ${parsed.name}! How can I help you with your accounting or tax queries today?`,
        },
      ]);
    }
  }, []);

  const handleStart = async () => {
    if (!details.name.trim() || !details.email.trim() || !details.phone.trim()) {
      alert("Please fill in all fields");
      return;
    }

    try {
      await fetch("/api/save-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details),
      });

      localStorage.setItem("eleware_user", JSON.stringify(details));
      setStarted(true);

      setMessages([
        {
          role: "ai",
          text: `Hi ${details.name}! I'm the Eleware Accounting assistant. Ask me anything about GST, tax filing, bookkeeping, company registration, or any financial query.`,
        },
      ]);
    } catch (error) {
      console.error(error);
      alert("Failed to save lead");
    }
  };

  const handleSubmit = async () => {
    if (!message.trim() || loading || !sessionId) return;

    const userMessage = message.trim();

    const updatedMessages: ChatMessage[] = [
      ...messages,
      { role: "user", text: userMessage },
    ];

    setMessages(updatedMessages);
    setMessage("");
    setLoading(true);

    try {
      const formattedMessages = updatedMessages.map((msg) => ({
        role: msg.role === "ai" ? "assistant" : "user",
        content: msg.text,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: details,
          sessionId,
          messages: formattedMessages,
          meetingBooked: false,
        }),
      });

      if (!response.ok) throw new Error("API failed");

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: data.reply },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Something went wrong. Please try again." },
      ]);
    }

    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      {/* ===== FLOATING BUTTON ===== */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 9998,
          background: "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
          color: "#fff",
          border: "none",
          borderRadius: "60px",
          padding: "14px 24px",
          fontSize: "14px",
          fontWeight: 600,
          fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          boxShadow: "0 8px 32px rgba(5, 150, 105, 0.4), 0 2px 8px rgba(0,0,0,0.1)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: open ? "scale(0)" : "scale(1)",
          opacity: open ? 0 : 1,
          letterSpacing: "0.3px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow = "0 12px 40px rgba(5, 150, 105, 0.5), 0 4px 12px rgba(0,0,0,0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = open ? "scale(0)" : "scale(1)";
          e.currentTarget.style.boxShadow = "0 8px 32px rgba(5, 150, 105, 0.4), 0 2px 8px rgba(0,0,0,0.1)";
        }}
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span>Need help? Chat with us</span>

        {/* Pulse ring */}
        <span
          style={{
            position: "absolute",
            top: "-3px",
            right: "-3px",
            width: "14px",
            height: "14px",
            background: "#fbbf24",
            borderRadius: "50%",
            border: "2px solid #fff",
            animation: "elw-pulse 2s infinite",
          }}
        />
      </button>

      {/* ===== CHAT PANEL ===== */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.35)",
              backdropFilter: "blur(4px)",
              zIndex: 9998,
              animation: "elw-fadeIn 0.2s ease",
            }}
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div
            style={{
              position: "fixed",
              bottom: "24px",
              right: "24px",
              width: "min(420px, calc(100vw - 32px))",
              maxHeight: "min(680px, calc(100dvh - 48px))",
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 25px 80px rgba(0,0,0,0.2), 0 10px 30px rgba(0,0,0,0.1)",
              border: "1px solid rgba(0,0,0,0.08)",
              animation: "elw-slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
              fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
            }}
          >
            {/* ===== HEADER ===== */}
            <div
              style={{
                background: "linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%)",
                padding: "18px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(8px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  <svg width="22" height="22" fill="none" stroke="#fff" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#fff", margin: 0, letterSpacing: "-0.2px" }}>
                    Eleware Accounting
                  </h2>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" }}>
                    <span
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background: "#4ade80",
                        display: "inline-block",
                        animation: "elw-pulse 2s infinite",
                      }}
                    />
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)", fontWeight: 400 }}>
                      Online now • Typically replies instantly
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* ===== FORM ===== */}
            {!started ? (
              <div style={{ flex: 1, overflow: "auto", background: "#f8faf9", padding: "24px 20px" }}>
                {/* Welcome card */}
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "16px",
                    padding: "28px 24px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
                    border: "1px solid #f0f0f0",
                  }}
                >
                  {/* Icon */}
                  <div style={{ textAlign: "center", marginBottom: "20px" }}>
                    <div
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "16px",
                        background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "14px",
                      }}
                    >
                      <svg width="26" height="26" fill="none" stroke="#059669" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3
                      style={{
                        fontSize: "17px",
                        fontWeight: 700,
                        color: "#111827",
                        margin: "0 0 6px",
                        letterSpacing: "-0.3px",
                      }}
                    >
                      Talk to our AI assistant
                    </h3>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#6b7280",
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      Quick intro and we&apos;ll get you the answers you need
                    </p>
                  </div>

                  {/* Inputs */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {[
                      { type: "text", placeholder: "Full name", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", key: "name" as const },
                      { type: "email", placeholder: "Email address", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", key: "email" as const },
                      { type: "tel", placeholder: "Phone number", icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z", key: "phone" as const },
                    ].map((field) => (
                      <div key={field.key} style={{ position: "relative" }}>
                        <div
                          style={{
                            position: "absolute",
                            left: "14px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#9ca3af",
                            display: "flex",
                          }}
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={field.icon} />
                          </svg>
                        </div>
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          value={details[field.key]}
                          onChange={(e) =>
                            setDetails({ ...details, [field.key]: e.target.value })
                          }
                          style={{
                            width: "100%",
                            border: "1.5px solid #e5e7eb",
                            borderRadius: "12px",
                            padding: "13px 16px 13px 40px",
                            fontSize: "13.5px",
                            fontFamily: "inherit",
                            color: "#111827",
                            background: "#fafafa",
                            outline: "none",
                            transition: "all 0.2s",
                            boxSizing: "border-box",
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = "#059669";
                            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(5,150,105,0.1)";
                            e.currentTarget.style.background = "#fff";
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = "#e5e7eb";
                            e.currentTarget.style.boxShadow = "none";
                            e.currentTarget.style.background = "#fafafa";
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleStart}
                    style={{
                      width: "100%",
                      marginTop: "18px",
                      padding: "14px",
                      borderRadius: "12px",
                      border: "none",
                      background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: 600,
                      fontFamily: "inherit",
                      cursor: "pointer",
                      transition: "all 0.25s",
                      boxShadow: "0 4px 14px rgba(5,150,105,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      letterSpacing: "0.2px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 6px 20px rgba(5,150,105,0.4)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 4px 14px rgba(5,150,105,0.3)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    Start Conversation
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>

                  {/* Trust */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      marginTop: "16px",
                    }}
                  >
                    <svg width="13" height="13" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span style={{ fontSize: "11px", color: "#9ca3af" }}>
                      Your information is secure & private
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* ===== MESSAGES ===== */}
                <div
                  style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    overflowX: "hidden",
                    padding: "16px",
                    background: "#f8faf9",
                  }}
                >
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                        marginBottom: "12px",
                        alignItems: "flex-end",
                        gap: "8px",
                        animation: "elw-msgIn 0.3s ease",
                      }}
                    >
                      {/* AI avatar */}
                      {msg.role === "ai" && (
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "8px",
                            background: "linear-gradient(135deg, #059669, #0d9488)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <svg width="14" height="14" fill="none" stroke="#fff" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}

                      <div
                        style={{
                          maxWidth: "78%",
                          padding: "12px 16px",
                          fontSize: "13.5px",
                          lineHeight: "1.55",
                          wordBreak: "break-word",
                          ...(msg.role === "user"
                            ? {
                                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                                color: "#fff",
                                borderRadius: "16px 16px 4px 16px",
                                boxShadow: "0 2px 8px rgba(5,150,105,0.2)",
                              }
                            : {
                                background: "#fff",
                                color: "#1f2937",
                                borderRadius: "16px 16px 16px 4px",
                                border: "1px solid #e5e7eb",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                              }),
                        }}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {loading && (
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", marginBottom: "12px" }}>
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "8px",
                          background: "linear-gradient(135deg, #059669, #0d9488)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <svg width="14" height="14" fill="none" stroke="#fff" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div
                        style={{
                          background: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "16px 16px 16px 4px",
                          padding: "14px 18px",
                          display: "flex",
                          gap: "5px",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                        }}
                      >
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              background: "#059669",
                              opacity: 0.5,
                              animation: `elw-bounce 1.4s infinite ease-in-out both`,
                              animationDelay: `${i * 0.16}s`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* ===== INPUT ===== */}
                <div
                  style={{
                    padding: "14px 16px",
                    paddingBottom: "max(14px, env(safe-area-inset-bottom))",
                    background: "#fff",
                    borderTop: "1px solid #f0f0f0",
                    flexShrink: 0,
                  }}
                >
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <div
                      style={{
                        flex: 1,
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <input
                        ref={inputRef}
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Type your message..."
                        style={{
                          width: "100%",
                          border: "1.5px solid #e5e7eb",
                          borderRadius: "14px",
                          padding: "13px 16px",
                          fontSize: "13.5px",
                          fontFamily: "inherit",
                          color: "#111827",
                          background: "#fafafa",
                          outline: "none",
                          transition: "all 0.2s",
                          boxSizing: "border-box",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "#059669";
                          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(5,150,105,0.08)";
                          e.currentTarget.style.background = "#fff";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "#e5e7eb";
                          e.currentTarget.style.boxShadow = "none";
                          e.currentTarget.style.background = "#fafafa";
                        }}
                      />
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={!message.trim()}
                      style={{
                        width: "46px",
                        height: "46px",
                        borderRadius: "14px",
                        border: "none",
                        background: message.trim()
                          ? "linear-gradient(135deg, #059669 0%, #047857 100%)"
                          : "#e5e7eb",
                        color: message.trim() ? "#fff" : "#9ca3af",
                        cursor: message.trim() ? "pointer" : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.25s",
                        flexShrink: 0,
                        boxShadow: message.trim() ? "0 4px 12px rgba(5,150,105,0.25)" : "none",
                      }}
                    >
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>

                  {/* Powered by */}
                  <div
                    style={{
                      textAlign: "center",
                      marginTop: "10px",
                      fontSize: "10px",
                      color: "#c0c0c0",
                      letterSpacing: "0.3px",
                    }}
                  >
                    Powered by Eleware AI
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* ===== ANIMATIONS ===== */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        @keyframes elw-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }

        @keyframes elw-fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes elw-slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes elw-msgIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes elw-bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        #elw-chat-panel::-webkit-scrollbar {
          width: 4px;
        }
        #elw-chat-panel::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
        }
      `}</style>
    </>
  );
}