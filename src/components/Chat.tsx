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
                />
                <button onClick={sendMessage}>Invia</button>
                <button onClick={handleReset}>Reset</button>
            </div>

            <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100vh;
          max-width: 600px;
          margin: 0 auto;
          background-color: #f0f0f0;
          border-radius: 10px;
          overflow: hidden;
        }
        .chat-box {
          padding: 10px;
          flex-grow: 1;
          overflow-y: auto;
          background-color: #e5ddd5;
        }
        .message {
          margin: 10px 0;
          padding: 10px;
          border-radius: 20px;
          max-width: 70%;
        }
        .user-message {
          background-color: #dcf8c6;
          align-self: flex-end;
        }
        .assistant-message {
          background-color: #ffffff;
          align-self: flex-start;
        }
        .input-box {
          display: flex;
          padding: 10px;
          background-color: white;
          border-top: 1px solid #ddd;
        }
        input {
          flex-grow: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 20px;
        }
        button {
          margin-left: 10px;
          padding: 10px 20px;
          border: none;
          border-radius: 20px;
          background-color: #075e54;
          color: white;
          cursor: pointer;
        }
      `}</style>
        </div>
    );
};

export default Chat;
