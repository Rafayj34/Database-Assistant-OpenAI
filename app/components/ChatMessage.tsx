'use client';

import React from 'react';

type Part = any;
type Message = any;

export default function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className="max-w-[85%]">
        <div className={`flex items-end gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-linear-to-br from-zinc-200 to-zinc-100 dark:from-zinc-800 dark:to-zinc-700 text-xl">
            {isUser ? '💁🏻' : '🤖'}
          </div>

          <div
            className={`rounded-lg p-3 shadow-sm leading-relaxed ${isUser ? 'bg-blue-600 text-white' : 'bg-white dark:bg-zinc-900 dark:border-zinc-800 border'} `}
          >
            {message.parts.map((part: Part, i: number) => {
              switch (part.type) {
                case 'text':
                  return (
                    <div key={i} className="whitespace-pre-wrap">
                      {part.text}
                    </div>
                  );

                case 'tool-db':
                  return (
                    <div key={i} className="mt-2 p-3 bg-zinc-50 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700">
                      <div className="font-semibold text-sm mb-2">🔍 Database Query</div>
                      {(part.input?.query || part.input?.text) && (
                        <div className="relative">
                          <pre className="text-xs bg-white dark:bg-zinc-900 p-2 rounded mb-2 overflow-x-auto">{part.input.query || part.input.text}</pre>
                          <button
                            onClick={() => navigator.clipboard?.writeText(part.input.query || part.input.text)}
                            className="absolute right-2 top-1 text-xs text-zinc-500 hover:text-zinc-700"
                            aria-label="Copy SQL"
                          >
                            Copy
                          </button>
                        </div>
                      )}
                      {part.state === 'output-available' && (
                        <div className="text-sm text-green-700 dark:text-green-300">✅ Returned {part.output?.rows?.length || 0} rows</div>
                      )}
                    </div>
                  );

                case 'tool-schema':
                  return (
                    <div key={i} className="mt-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800">
                      <div className="font-semibold text-sm">📋 Schema</div>
                      {part.state === 'output-available' && <div className="text-sm text-green-700 dark:text-green-300">✅ Schema loaded</div>}
                    </div>
                  );

                case 'step-start':
                  return (
                    <div key={i} className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">🔄 Processing...</div>
                  );

                default:
                  return null;
              }
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
