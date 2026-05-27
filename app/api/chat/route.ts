// app/api/chat/route.ts

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

import { google } from "googleapis";

// ===== OPENAI (commented — switch back anytime) =====
// const client = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// ===== GROQ (active) =====
const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets",
  ],
});

const sheets = google.sheets({
  version: "v4",
  auth,
});

const SPREADSHEET_ID =
  process.env.GOOGLE_SHEET_ID || "";

const SYSTEM_PROMPT = `
You are the Eleware Accounting AI assistant — a helpful, professional, and approachable financial consultant.

Your personality:
- Professional yet warm and approachable
- Knowledgeable about Indian accounting, tax, and compliance
- Speaks clearly — avoids unnecessary jargon
- Confident and reassuring (finances stress people out — be calming)
- Concise and to the point

Rules:
- Never repeat greetings
- Never restart the conversation
- Never ignore the latest user message
- Never sound robotic or salesy
- Keep replies under 3-4 sentences
- Ask at most ONE follow-up question per reply
- If you don't know something specific, suggest booking a free consultation
- Give exact, helpful answers — not vague marketing talk

ABOUT ELEWARE ACCOUNTING:

Eleware Accounting is a CA-qualified accounting & advisory firm based in Delhi NCR, serving 75+ businesses across India, US & UK.

Tagline: "Financial Clarity. Business Confidence."

SERVICES WE PROVIDE:

📊 Bookkeeping & Accounting
- Day-to-day bookkeeping, bank reconciliation, AP/AR management
- Financial statement preparation (P&L, Balance Sheet, Cash Flow)
- Audit-ready books using Tally, Zoho Books & QuickBooks

🧾 GST Registration & Filing
- GST registration, monthly/quarterly filing, reconciliation
- GST audit support and annual returns (GSTR-9/9C)

💰 Income Tax Filing & Advisory
- ITR filing for individuals, businesses & companies
- Strategic tax planning to maximize savings
- TDS return filing and compliance

🏢 Company Incorporation & Compliance
- Pvt Ltd, LLP, OPC registration
- ROC filings, annual compliance, board resolutions
- MSME, FSSAI, trademark registration

👔 Virtual CFO Services
- MIS reporting, budgeting, cash flow forecasting
- Investor-ready financial models and VC reporting packs
- Strategic financial planning for growth

📋 Payroll Management
- Salary processing, payslips, TDS on salary
- PF, ESI compliance and returns
- Full HR compliance support

🔍 Compliance & Audit Support
- Internal audits, statutory audits
- Regulatory compliance monitoring
- Risk assessment and mitigation

📈 Business Advisory & Cash Flow
- Profitability analysis and cost optimization
- Working capital management
- Business restructuring advisory

🏭 Staffing Industry Expertise
- Specialized accounting for staffing companies
- Multi-state compliance management
- PF/ESI for contract employees

🌍 Global Accounting Services
- US/UK accounting and bookkeeping (GAAP/IFRS)
- Cross-border tax advisory
- Multi-currency accounting

TARGET CLIENTS:
- Startups & Founders
- SMEs & Growing Businesses
- E-commerce & D2C Brands
- Professional Firms
- Corporate Clients
- Staffing Companies

LOCATIONS: Delhi NCR, Chandigarh, Lucknow + remote clients across India, US & UK

KEY STATS:
- 75+ businesses served
- 8+ service verticals
- 98% client retention rate
- 5+ years of experience
- CA-qualified team

CONTACT:
- Phone: +91 98914 64160
- Email: info@elewareaccounting.com
- Website: www.elewareaccounting.com

CONVERSATION APPROACH:
1. Understand what the visitor needs (tax help? bookkeeping? company registration?)
2. Give a clear, specific answer
3. If complex, suggest booking a free consultation
4. Never discuss specific pricing — say "it depends on your business size and needs, let's discuss on a quick call"

GOOD RESPONSES:
"GST filing deadlines depend on your turnover — monthly for 5cr+ and quarterly for others. Are you currently filing or need to start fresh?"
"Company registration as Pvt Ltd typically takes 7-10 working days. Do you already have DSC and DIN, or need those too?"

BAD RESPONSES:
"How can I help you with your accounting needs today?"
"We offer many financial services."

Current User:
Name: {{USER_NAME}}
Email: {{USER_EMAIL}}
Phone: {{USER_PHONE}}
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      messages = [],
      user,
      sessionId,
      meetingBooked = false,
    } = body;

    // =========================
    // SYSTEM PROMPT
    // =========================

    const meetingContext = `
Meeting Status:
${
  meetingBooked
    ? "User already booked a meeting/call. Do NOT ask to book another one unless rescheduling."
    : "User has NOT booked a meeting yet."
}
`;

    const systemPrompt = `
${SYSTEM_PROMPT}

${meetingContext}
`
      .replace(
        "{{USER_NAME}}",
        user?.name || "Unknown"
      )
      .replace(
        "{{USER_EMAIL}}",
        user?.email || "Unknown"
      )
      .replace(
        "{{USER_PHONE}}",
        user?.phone || "Unknown"
      );

    // =========================
    // SANITIZE CHAT
    // =========================

    const formattedMessages = messages
      .filter(
        (msg: any) =>
          msg &&
          typeof msg.content === "string" &&
          ["user", "assistant"].includes(
            msg.role
          )
      )
      .slice(-30);

    const latestUserMessage =
      [...formattedMessages]
        .reverse()
        .find(
          (m: any) => m.role === "user"
        )?.content || "";

    // =========================
    // MAIN AI RESPONSE
    // =========================

    const completion =
      await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",  // GROQ
        // model: "gpt-4.1",               // OPENAI

        temperature: 0.9,

        messages: [
          {
            role: "system",
            content: systemPrompt,
          },

          ...formattedMessages,
        ],
      });

    let reply =
      completion.choices?.[0]?.message?.content?.trim() ||
      "";

    // =========================
    // FALLBACK
    // =========================

    if (
      reply
        .toLowerCase()
        .includes(
          "accounting needs today"
        ) ||
      reply
        .toLowerCase()
        .includes(
          "how can i assist"
        ) ||
      reply
        .toLowerCase()
        .includes("how can i help you")
    ) {
      if (
        latestUserMessage
          .toLowerCase()
          .includes("gst") ||
        latestUserMessage
          .toLowerCase()
          .includes("tax") ||
        latestUserMessage
          .toLowerCase()
          .includes("itr")
      ) {
        reply =
          "Sure! Are you looking for GST registration, monthly filing, or ITR filing? Also, is this for a business or individual? That'll help me guide you better.";
      }
    }

    if (!reply) {
      reply = "Hi! I'm here to help with accounting, tax, GST, compliance, or any financial query. What do you need help with?";
    }

    // =========================
    // FULL TRANSCRIPT
    // =========================

    const fullTranscript = [
      ...formattedMessages,
      {
        role: "assistant",
        content: reply,
      },
    ];

    // =========================
    // SECOND AI CALL
    // DETECT MEETING STATUS
    // =========================

    let aiDetectedMeetingBooked = false;

    try {
      const meetingDetection =
        await client.chat.completions.create({
          model: "llama-3.1-8b-instant",   // GROQ
          // model: "gpt-4.1-mini",          // OPENAI

          temperature: 0,

          messages: [
            {
              role: "system",
              content: `
You are a meeting detection system.

Your ONLY job:

Determine if a meeting/call/demo/interview has been CONFIRMED and BOOKED.

Return ONLY:
TRUE
or
FALSE

TRUE examples:
- "Let's book it"
- "Meeting confirmed"
- "Tomorrow 9 AM works"
- "See you on Zoom"
- "Booked"
- "Call scheduled"

FALSE examples:
- Asking about availability
- Considering a meeting
- Maybe later
- No final confirmation
`,
            },

            {
              role: "user",
              content: JSON.stringify(
                fullTranscript
              ),
            },
          ],
        });

      const detectionResult =
        meetingDetection.choices?.[0]?.message?.content
          ?.trim()
          ?.toUpperCase();

      aiDetectedMeetingBooked =
        detectionResult === "TRUE";
    } catch (meetingError) {
      console.error(
        "MEETING DETECTION ERROR:",
        meetingError
      );
    }

    // =========================
    // FINAL MEETING STATUS
    // =========================

    const finalMeetingBooked =
      meetingBooked ||
      aiDetectedMeetingBooked;

    // =========================
    // GOOGLE SHEETS
    // =========================

    try {
      const existingRows =
        await sheets.spreadsheets.values.get({
          spreadsheetId:
            SPREADSHEET_ID,

          range: "Sheet1!A:H",
        });

      const rows =
        existingRows.data.values || [];

      const existingRowIndex =
        rows.findIndex(
          (row) =>
            row[3] === sessionId
        );

      const now =
        new Date().toLocaleString();

      // =========================
      // NEW SESSION
      // =========================

      if (existingRowIndex === -1) {
        await sheets.spreadsheets.values.append({
          spreadsheetId:
            SPREADSHEET_ID,

          range: "Sheet1!A:H",

          valueInputOption:
            "USER_ENTERED",

          requestBody: {
            values: [
              [
                user?.name || "",
                user?.email || "",
                user?.phone || "",
                sessionId,
                now,
                now,

                finalMeetingBooked
                  ? "TRUE"
                  : "FALSE",

                JSON.stringify(
                  fullTranscript,
                  null,
                  2
                ),
              ],
            ],
          },
        });
      }

      // =========================
      // UPDATE SESSION
      // =========================

      else {
        const actualRow =
          existingRowIndex + 1;

        const existingMeetingStatus =
          rows[existingRowIndex]?.[6] ||
          "FALSE";

        // KEEP TRUE FOREVER
        const finalMeetingStatus =
          existingMeetingStatus ===
            "TRUE" ||
          finalMeetingBooked
            ? "TRUE"
            : "FALSE";

        await sheets.spreadsheets.values.update({
          spreadsheetId:
            SPREADSHEET_ID,

          range: `Sheet1!F${actualRow}:H${actualRow}`,

          valueInputOption:
            "USER_ENTERED",

          requestBody: {
            values: [
              [
                now,

                finalMeetingStatus,

                JSON.stringify(
                  fullTranscript,
                  null,
                  2
                ),
              ],
            ],
          },
        });
      }
    } catch (sheetError) {
      console.error(
        "GOOGLE SHEETS ERROR:",
        sheetError
      );
    }

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json({
      success: true,

      reply,

      meetingBooked:
        finalMeetingBooked,
    });
  } catch (error) {
    console.error(
      "CHAT API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        reply:
          "Something went wrong. Please try again in a moment.",
      },
      {
        status: 500,
      }
    );
  }
}

