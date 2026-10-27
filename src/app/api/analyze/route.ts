import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are an AI secretary.

Today's date is 2026-10-22.

Analyze the user's memory and return ONLY valid JSON.

Rules:

- memory_type should be one of:
  task, note, idea, event

- priority should be 0 to 100

- project should be a broad category such as:
  School
  Truck Drawer System
  3D Printing
  Personal
  Maintenance

- due_date should be converted into YYYY-MM-DD

Examples:

"Calc HW due Friday"

{
  "memory_type": "task",
  "priority": 90,
  "project": "School",
  "due_date": "2026-10-23"
}

"Need plywood for drawer build"

{
  "memory_type": "task",
  "priority": 70,
  "project": "Truck Drawer System",
  "due_date": null
}

"Calc HW due Friday"

{
  "title": "Calc HW",
  "memory_type": "task",
  "priority": 90,
  "project": "School",
  "due_date": "2026-10-23"
}


Return ONLY JSON.

Format:

{
  "title": "short title",
  "memory_type": "task|note|idea|event",
  "priority": 0-100,
  "project": "project name or empty",
  "due_date": "YYYY-MM-DD or null"
}


`
        },
        {
          role: "user",
          content
        }
      ]
    });

    return NextResponse.json({
      result: completion.choices[0].message.content
    });

  } catch (error: any) {
  console.error(error);

  return NextResponse.json(
    {
      error: error?.message || "Failed to analyze"
    },
    { status: 500 }
  );
}
}