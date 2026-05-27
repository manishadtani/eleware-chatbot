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

  let existing = localStorage.getItem(
    "eleware_chat_session"
  );

  if (!existing) {
    existing = crypto.randomUUID();

    localStorage.setItem(
      "eleware_chat_session",
      existing
    );
  }

  setSessionId(existing);
}, []);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Focus input safely on mobile
  useEffect(() => {
    if (open && started) {
      const timeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 350);

      return () => clearTimeout(timeout);
    }
  }, [open, started]);

  // Prevent body scrolling when chat open
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
  if (
    !details.name.trim() ||
    !details.email.trim() ||
    !details.phone.trim()
  ) {
    alert("Please fill in all fields");
    return;
  }

  try {
    // SAVE TO GOOGLE SHEETS
    await fetch("/api/save-lead", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(details),
    });

    // SAVE LOCALLY
    localStorage.setItem(
      "eleware_user",
      JSON.stringify(details)
    );

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

  // CREATE UPDATED HISTORY FIRST
  const updatedMessages: ChatMessage[] = [
    ...messages,
    {
      role: "user",
      text: userMessage,
    },
  ];

  // UPDATE UI IMMEDIATELY
  setMessages(updatedMessages);

  setMessage("");
  setLoading(true);

  try {
    // CONVERT TO OPENAI FORMAT
    const formattedMessages = updatedMessages.map((msg) => ({
      role: msg.role === "ai" ? "assistant" : "user",
      content: msg.text,
    }));

    console.log("FULL CHAT HISTORY:", formattedMessages);

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
  user: details,

  sessionId,

  messages: formattedMessages,

  meetingBooked: false,
}),
    });

    if (!response.ok) {
      throw new Error("API failed");
    }

    const data = await response.json();

    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text: data.reply,
      },
    ]);
  } catch (error) {
    console.error(error);

    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text: "Something went wrong. Please try again.",
      },
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
      {/* Floating Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="
          fixed
          bottom-5
          right-5
          md:bottom-6
          md:right-6

          bg-blue-600
          hover:bg-blue-700

          text-white
          font-medium
          text-sm
          md:text-base

          px-5
          py-3
          md:px-6
          md:py-3.5

          rounded-full

          shadow-lg
          hover:shadow-xl

          z-50

          transition-all
          duration-300
          ease-out

          hover:scale-105
          active:scale-95

          flex
          items-center
          gap-2
        "
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>

        <span>Ask an Expert</span>
      </button>

      {/* Chat */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="
              fixed
              inset-0
              bg-black/40
              z-40
            "
            onClick={() => setOpen(false)}
          />

          {/* Chat Panel */}
          <div
  className="
    fixed
    inset-x-3
    bottom-3

    sm:inset-x-auto
    sm:right-4

    md:right-6
    md:bottom-6

    w-auto

    min-h-[320px]
    h-auto

    max-h-[calc(100dvh-90px)]

    sm:w-[380px]
    sm:min-h-[360px]
    sm:max-h-[80dvh]

    md:w-[420px]
    md:min-h-[380px]
    md:max-h-[700px]

    bg-white
    shadow-2xl
    z-50

    flex
    flex-col

    rounded-2xl
    overflow-hidden

    border
    border-gray-200

    animate-slide-up
  "
>
            {/* Header */}
            <div
              className="
                bg-white
                border-b
                border-gray-100

                px-5
                py-4

                flex
                items-center
                justify-between

                shadow-sm
                flex-shrink-0
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    w-10
                    h-10
                    bg-blue-50
                    rounded-full
                    flex
                    items-center
                    justify-center
                  "
                >
                  <svg
                    className="w-6 h-6 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                <div>
                  <h2 className="font-semibold text-black">
                    Eleware Accounting
                  </h2>

                  <p className="text-xs text-black">
                    Online • Financial clarity, always
                  </p>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="
                  w-8
                  h-8
                  rounded-full

                  text-black
                  hover:text-black
                  hover:bg-gray-50

                  flex
                  items-center
                  justify-center

                  transition-all
                  duration-200
                "
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Form */}
            {!started ? (
              <div
                className="
                  flex-1
                  min-h-0
                  overflow-y-auto
                  p-6
                  bg-gray-50
                "
              >
                <div
                  className="
                    bg-white
                    rounded-xl
                    p-6
                    shadow-sm
                    border
                    border-gray-100
                  "
                >
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-black">
                      Talk to our AI assistant
                    </h3>

                    <p className="text-sm text-black mt-1">
                      Quick intro and we&apos;ll get you the answers you need
                    </p>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Full name"
                      value={details.name}
                      onChange={(e) =>
                        setDetails({
                          ...details,
                          name: e.target.value,
                        })
                      }
                      className="
                        w-full
                        border
                        border-gray-200
                        rounded-xl
                        px-4
                        py-3
                        text-sm
                        text-black
                        placeholder-black
                        outline-none
                        focus:border-blue-400
                        focus:ring-2
                        focus:ring-blue-100
                      "
                    />

                    <input
                      type="email"
                      placeholder="Email address"
                      value={details.email}
                      onChange={(e) =>
                        setDetails({
                          ...details,
                          email: e.target.value,
                        })
                      }
                      className="
                        w-full
                        border
                        border-gray-200
                        rounded-xl
                        px-4
                        py-3
                        text-sm
                        text-black
                        placeholder-black
                        outline-none
                        focus:border-blue-400
                        focus:ring-2
                        focus:ring-blue-100
                      "
                    />

                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={details.phone}
                      onChange={(e) =>
                        setDetails({
                          ...details,
                          phone: e.target.value,
                        })
                      }
                      className="
                        w-full
                        border
                        border-gray-200
                        rounded-xl
                        px-4
                        py-3
                        text-sm
                        text-black
                        placeholder-black
                        outline-none
                        focus:border-blue-400
                        focus:ring-2
                        focus:ring-blue-100
                      "
                    />
                  </div>

                  <button
                    onClick={handleStart}
                    className="
                      mt-6
                      w-full
                      bg-blue-600
                      hover:bg-blue-700
                      text-white
                      font-medium
                      py-3
                      rounded-xl
                    "
                  >
                    Get Started
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div
                  className="
                    flex-1
                    min-h-0
                    overflow-y-auto
                    overflow-x-hidden
                    p-4
                    bg-gray-50
                    space-y-3
                  "
                >
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        msg.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`
                          max-w-[85%]
                          px-4
                          py-2.5
                          rounded-2xl
                          text-sm
                          break-words

                          ${
                            msg.role === "user"
                              ? "bg-blue-600 text-white rounded-br-sm"
                              : "bg-white border border-gray-100 text-black shadow-sm rounded-bl-sm"
                          }
                        `}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="flex justify-start">
                      <div
                        className="
                          bg-white
                          border
                          border-gray-100
                          shadow-sm
                          px-4
                          py-2.5
                          rounded-2xl
                          rounded-bl-sm
                        "
                      >
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-black rounded-full animate-bounce" />
                          <div
                            className="w-2 h-2 bg-black rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          />
                          <div
                            className="w-2 h-2 bg-black rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div
                  className="
                    p-3
                    bg-white
                    border-t
                    border-gray-100
                    flex-shrink-0
                    pb-[max(12px,env(safe-area-inset-bottom))]
                  "
                >
                  <div className="flex gap-2 items-end">
                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Type your message..."
                        className="
                          w-full
                          border
                          border-gray-200
                          rounded-xl
                          px-4
                          py-3
                          pr-12
                          text-sm
                          text-black
                          placeholder-black
                          outline-none
                          focus:border-blue-400
                          focus:ring-2
                          focus:ring-blue-100
                        "
                      />
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={!message.trim()}
                      className="
                        bg-blue-600
                        hover:bg-blue-700
                        disabled:opacity-40
                        disabled:cursor-not-allowed

                        text-white

                        w-11
                        h-11

                        rounded-xl

                        flex
                        items-center
                        justify-center

                        transition-all
                        duration-200
                      "
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}