'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function ChatInput({ onSend, sending }: { onSend: (text: string) => void; sending?: boolean }) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!value.trim() || sending) return;
    onSend(value.trim());
    setValue('');
  };

  return (
    <form onSubmit={submit} className="w-full flex items-center gap-2 p-4 bg-transparent">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
        placeholder={sending ? 'Sending...' : 'Ask about your database — try: "Top selling products last month"'}
        className="flex-1 rounded-full p-3 border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        disabled={sending}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            submit();
          }
        }}
      />

      <button
        type="submit"
        className="rounded-full px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
        disabled={sending}
      >
        {sending ? '...' : 'Send'}
      </button>
    </form>
  );
}
