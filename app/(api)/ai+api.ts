// /api/chat

// ./app/api/chat/route.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// IMPORTANT! Set the runtime to edge

export async function POST(req: Request, res: Response) {
  // Extract the `prompt` from the body of the request
  const  form = await req.formData();
  const file = form.get("audio")

  if (file) {

      const transcription = await openai.audio.transcriptions.create({
          file: file,
          model: "whisper-1",
        });
      
        // Ask OpenAI for a streaming chat completion given the prompt
        
    
        return Response.json({ data: transcription.text });
  }
  return Response.json({data: ""}, {status: 400, statusText: "no audio provided"})
}