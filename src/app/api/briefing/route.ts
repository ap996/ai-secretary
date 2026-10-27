import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { memories } = await req.json();

    const completion =
      await openai.chat.completions.create({
        model: "gpt-4o-mini",

        messages: [
          {
            role: "system",
            content: `
You are a personal AI secretary.

Review the user's tasks, projects, notes and priorities.

Write a SHORT daily briefing.

Keep it under 150 words.

Format:

Good Morning Alexander

Focus Today:
- item
- item

Projects Needing Attention:
- project

Recent Wins:
- item
`
          },

          {
            role: "user",
            content: JSON.stringify(memories)
          }
        ]
      });

    return NextResponse.json({
      briefing:
        completion.choices[0].message.content
    });

  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to generate briefing"
      },
      {
        status: 500
      }
    );
  }
}