'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef, useState } from 'react';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';

export default function Chat() {
    const { messages, sendMessage } = useChat();
    const [sending, setSending] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
        // reset sending state when new message arrives
        setSending(false);
    }, [messages]);

    const onSend = async (text: string) => {
        if (!text.trim()) return;
        try {
            setSending(true);
            // sendMessage may be sync or async depending on the SDK; call it and allow UI to show sending
            const res = sendMessage({ text });
            if (res && typeof (res as Promise<any>).then === 'function') {
                await res;
            }
            // fallback: keep sending state until messages update (handled by effect)
        } catch (err) {
            console.error('Send error', err);
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-linear-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950 py-12">
            <div className="w-full max-w-3xl px-4">
                <header className="flex items-start justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Database Assistant</h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Ask natural-language questions about your data.</p>
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">Connected • <span className="font-medium">Local DB</span></div>
                </header>

                <main className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center">DB</div>
                            <div>
                                <div className="font-semibold">Database Assistant</div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400">SQL-aware AI chat</div>
                            </div>
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">Tip: Try asking for top-selling products</div>
                    </div>

                    <div ref={containerRef} className="h-[60vh] overflow-y-auto px-6 py-6">
                        {messages.length === 0 && (
                            <div className="text-center text-zinc-500 dark:text-zinc-400 mt-16">Start the conversation — ask about your data.</div>
                        )}

                        {messages.map((m: any) => (
                            <ChatMessage key={m.id} message={m} />
                        ))}
                    </div>

                    <div className="border-t border-zinc-100 dark:border-zinc-800">
                        <ChatInput onSend={onSend} sending={sending} />
                    </div>
                </main>
            </div>
        </div>
    );
}