import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    // 1. Initialize the model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "You are the SmartClinics AI Assistant. You help clinic owners understand the platform. You are professional, medical-focused, and concise. SmartClinics features: Secure Auth, Smart Analytics, HIPAA compliance, and Multi-role portals.",
    });

    const chat = model.startChat({
      history: history,
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ error: "Failed to fetch AI response" }, { status: 500 });
  }
}