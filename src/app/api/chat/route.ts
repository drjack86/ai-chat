import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json(); // Recepisce la conversazione completa

        // Verifica che i messaggi siano un array e che non siano vuoti
        if (!Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json(
                { error: "Invalid messages format or empty messages array" },
                { status: 400 }
            );
        }

        // Verifica che tutti i messaggi abbiano i campi 'role' e 'content'
        for (const message of messages) {
            if (!message.role || !message.content) {
                return NextResponse.json(
                    { error: "Each message must have a role and content" },
                    { status: 400 }
                );
            }
            if (
                message.role !== "user" &&
                message.role !== "assistant" &&
                message.role !== "system"
            ) {
                return NextResponse.json(
                    { error: "Invalid role in message" },
                    { status: 400 }
                );
            }
        }

        const openaiResponse = await fetch(`${process.env.ENDPOINT}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: `${process.env.MODEL}`,
                messages: [
                    { role: "system", content: `${process.env.PROMPT}` },
                    ...messages, // Includi tutti i messaggi precedenti
                ],
                max_tokens: `${process.env.MAX_TOKEN}`,
            }),
        });

        if (!openaiResponse.ok) {
            const errorText = await openaiResponse.text();
            return NextResponse.json(
                { error: `OpenAI API error: ${errorText}` },
                { status: openaiResponse.status }
            );
        }

        const data = await openaiResponse.json();
        const assistantMessage =
            data.choices[0]?.message?.content || "Sorry, there was an issue.";

        return NextResponse.json({ assistantMessage });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json(
                { error: `Server error: ${error.message}` },
                { status: 500 }
            );
        } else {
            return NextResponse.json(
                { error: "Unknown error occurred" },
                { status: 500 }
            );
        }
    }
}
