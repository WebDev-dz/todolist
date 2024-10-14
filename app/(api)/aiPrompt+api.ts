import { zodResponseFormat } from "openai/helpers/zod";

import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { TaskSchema } from "@/lib/schema";
import { z } from "zod";

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// IMPORTANT! Set the runtime to edge
// export const runtime = 'edge';

export async function POST(req: Request, res: Response) {
  // Extract the `prompt` from the body of the request
  const { messages } = await req.json();

  const completion  = await openai.beta.chat.completions.parse({
    model: "gpt-4o-2024-08-06",
    messages,
    response_format: zodResponseFormat(z.array(TaskSchema), "task")
  });
  const tasks = completion.choices[0].message.parsed;
   console.log({tasks})
    return Response.json({ data : tasks});
  
}