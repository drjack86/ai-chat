"use client";

import { faPaperPlane, faSpinner, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import React, { useState, useEffect, useRef } from 'react';

interface Message {
    sender: 'user' | 'assistant';
    text: string;
}

const Chat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'assistant', text: `${process.env.NEXT_PUBLIC_INITIAL_ASSISTANT_MESSAGE}` }
    ]);
    const [input, setInput] = useState('');
    const [waiting, setWaiting] = useState(false);

    // Riferimenti per il contenitore dei messaggi e l'icona di attesa
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const waitingIconRef = useRef<HTMLDivElement>(null);

    // Funzione per fare scroll fino all'icona di attesa
    const scrollToWaitingIcon = () => {
        waitingIconRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Funzione per fare scroll fino all'inizio dell'ultimo messaggio
    const scrollToLastMessage = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    useEffect(() => {
        if (waiting) {
            // Se in attesa, scrolla fino all'icona di attesa
            scrollToWaitingIcon();
        } else {
            // Se non in attesa e ci sono nuovi messaggi, scrolla fino all'ultimo messaggio
            scrollToLastMessage();
        }
    }, [waiting, messages]);

    const sendMessage = async () => {
        setWaiting(true);

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

        setWaiting(false);

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
                        className={`my-2 p-2 rounded-lg max-w-[70%] text-gray-800 ${message.sender === 'user' ? 'bg-[#dcf8c6] self-end' : 'bg-white self-start'}`}
                    >
                        <div dangerouslySetInnerHTML={{ __html: message.text }} />
                    </div>
                ))}
                {/* Riferimento per l'icona di attesa */}
                <div ref={waitingIconRef} className={clsx('mx-auto', { 'hidden': !waiting }, { 'block': waiting })}>
                    <FontAwesomeIcon icon={faSpinner} spinPulse className="text-green-800 text-2xl" />
                </div>
                {/* Riferimento per l'inizio dell'ultimo messaggio */}
                <div ref={messagesEndRef} />
            </div>

            <div className="flex p-2 bg-white border-t border-gray-300">
                <input
                    className="flex-grow p-2 border border-gray-300 rounded-lg text-gray-800"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Scrivi un messaggio..."
                    onKeyDown={(event) => { if (event.key === 'Enter') { sendMessage(); } }}
                />
                <button className="ml-1 p-2 px-4 rounded-lg bg-green-700 text-white cursor-pointer text-xl font-bold" onClick={sendMessage}>
                    <FontAwesomeIcon icon={faPaperPlane} />
                </button>
                <button className="ml-1 p-2 px-4 rounded-lg bg-red-900 text-white cursor-pointer text-xl font-bold" onClick={handleReset}>
                    <FontAwesomeIcon icon={faTrashCan} />
                </button>
            </div>
        </div>
    );
};

export default Chat;
