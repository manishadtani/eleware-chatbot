import { NextResponse } from "next/server";
import { google } from "googleapis";

import credentials from "@/app/credentials.json";

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets",
  ],
});

const sheets = google.sheets({
  version: "v4",
  auth,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, email, phone } = body;

    await sheets.spreadsheets.values.append({
      spreadsheetId: "1LAkg0DIC-6JYFZPFIbJPKWWGmzX558A4v2vhEQ6p1AI",

      range: "Sheet1!A:D",

      valueInputOption: "USER_ENTERED",

      requestBody: {
        values: [
          [
            name,
            email,
            phone,
            new Date().toLocaleString(),
          ],
        ],
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}