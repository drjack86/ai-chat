"use client"

import React, { useState } from 'react';

interface Message {
    sender: 'user' | 'assistant';
    text: string;
}

const Chat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'assistant', text: `${process.env.NEXT_PUBLIC_INITIAL_ASSISTANT_MESSAGE}` }
    ]);
    const [input, setInput] = useState('');

    const sendMessage = async () => {
        if (input.trim() === '') return;

        const userMessage: Message = { sender: 'user', text: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages: newMessages.map(msg => ({ role: msg.sender, content: msg.text })) }),
        });

        const { assistantMessage } = await response.json();

        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: 'assistant', text: assistantMessage },
        ]);
    };

    const handleReset = () => {
        setMessages([{ sender: 'assistant', text: `${process.env.NEXT_PUBLIC_INITIAL_ASSISTANT_MESSAGE}` }]);
        setInput('');
    };

    return (
        <div className="flex flex-col justify-between h-screen max-w-[600px] mx-auto bg-gray-200 rounded-lg overflow-hidden">
            <div className="p-2 flex-grow overflow-y-auto bg-[#e5ddd5] flex flex-col">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`my-2 p-2 rounded-lg max-w-[70%] ${message.sender === 'user' ? 'bg-[#dcf8c6] self-end' : 'bg-white self-start'}`}
                    >

                        <div dangerouslySetInnerHTML={{ __html: message.text }} />
                    </div>
                ))}
            </div>

            <div className="flex p-2 bg-white border-t border-gray-300">
                <input
                    className="flex-grow p-2 border border-gray-300 rounded-lg"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Scrivi un messaggio..."
                    onKeyDown={(event) => { if (event.key === 'Enter') { sendMessage() } }}
                />
                <button className="ml-1 p-2 rounded-lg bg-[#075e54] text-white cursor-pointer text-sm font-bold" onClick={sendMessage}>Invia</button>
                <button className="ml-1 p-2 rounded-lg bg-[#075e54] text-white cursor-pointer text-sm font-bold" onClick={handleReset}>Reset</button>
            </div>

        </div>
    );
};

export default Chat;
