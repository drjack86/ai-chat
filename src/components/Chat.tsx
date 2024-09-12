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
        <div className="chat-container">
            <div className="chat-box">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`message ${message.sender === 'user' ? 'user-message' : 'assistant-message'}`}
                    >
                        {message.text}
                    </div>
                ))}
            </div>

            <div className="input-box">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Scrivi un messaggio..."
                    onKeyDown={(event) => { if (event.key === 'Enter') { sendMessage() } }}
                />
                <button onClick={sendMessage}>Invia</button>
                <button onClick={handleReset}>Reset</button>
            </div>

        </div>
    );
};

export default Chat;
