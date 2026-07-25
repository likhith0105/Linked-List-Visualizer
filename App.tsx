/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Send, Bot, User, Loader2 } from "lucide-react";

// Initialize the Gemini AI client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setResponse('');

    try {
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setResponse(result.text || "No response received.");
    } catch (err) {
      console.error("AI Error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100">
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-24">
        {/* Header */}
        <header className="mb-12 text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-2 bg-indigo-50 text-indigo-600 rounded-2xl mb-4"
          >
            <Sparkles size={24} />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-bold tracking-tight text-slate-900 mb-4"
          >
            Gemini Explorer
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600"
          >
            Interact with Google's most capable AI models directly from your workspace.
          </motion.p>
        </header>

        {/* Interaction Area */}
        <main className="space-y-8">
          {/* Input Panel */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl shadow-xl shadow-indigo-500/5 p-2 border border-slate-200"
          >
            <div className="flex items-center gap-2 px-4 py-2">
              <textarea
                id="prompt-input"
                rows={3}
                className="flex-1 bg-transparent border-none focus:ring-0 text-lg resize-none py-4 outline-none"
                placeholder="What's on your mind? Ask Gemini something..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
              />
              <button
                id="send-button"
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
              >
                {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
              </button>
            </div>
          </motion.div>

          {/* Response Panel */}
          <AnimatePresence mode="wait">
            {(response || error || isLoading) && (
              <motion.div
                key={isLoading ? 'loading' : response ? 'response' : 'error'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`rounded-3xl p-8 border ${
                  error ? 'bg-red-50 border-red-100' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-xl mt-1 ${
                    error ? 'bg-red-100 text-red-600' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    {error ? <Bot size={20} /> : <Bot size={20} />}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-semibold text-slate-900 mb-2">
                      {error ? 'Something went wrong' : 'Gemini AI'}
                    </h3>
                    <div className="prose prose-slate max-w-none">
                      {isLoading ? (
                        <div className="flex gap-1 py-2">
                          <motion.div
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                            className="w-2 h-2 bg-indigo-400 rounded-full"
                          />
                          <motion.div
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ repeat: Infinity, duration: 1.5, delay: 0.2, ease: "easeInOut" }}
                            className="w-2 h-2 bg-indigo-400 rounded-full"
                          />
                          <motion.div
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ repeat: Infinity, duration: 1.5, delay: 0.4, ease: "easeInOut" }}
                            className="w-2 h-2 bg-indigo-400 rounded-full"
                          />
                        </div>
                      ) : (
                        <p className={`whitespace-pre-wrap leading-relaxed ${error ? 'text-red-700' : 'text-slate-700 font-mono tracking-tight'}`}>
                          {error || response}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer info */}
        <footer className="mt-16 text-center text-sm text-slate-400">
          <p>Powered by Google Gemini Models • API Key managed via AI Studio Secrets</p>
        </footer>
      </div>
    </div>
  );
}
