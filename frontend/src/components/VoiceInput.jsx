import { useState, useRef, useEffect } from 'react';

export default function VoiceInput({ onTranscript, language = 'en-IN' }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + ' ';
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => {
          const updated = prev + finalTranscript;
          onTranscript?.(updated);
          return updated;
        });
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone permission.');
      } else if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.');
      } else {
        setError(`Error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        // Auto-restart if still supposed to be listening
        try { recognition.start(); } catch {}
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [language]);

  const toggleListening = () => {
    if (!supported) {
      setError('Speech recognition not supported in this browser. Try Chrome.');
      return;
    }

    setError('');

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        setError('Could not start voice input. Please try again.');
      }
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    onTranscript?.('');
  };

  if (!supported) {
    return null; // Hide if not supported
  }

  return (
    <div className="space-y-2">
      {/* Mic Button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleListening}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 ${
            isListening
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30 animate-pulse'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          {isListening ? (
            <>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
              </span>
              Stop Recording
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Speak to type
            </>
          )}
        </button>

        {isListening && (
          <div className="flex items-center gap-2 text-sm text-red-600 font-semibold">
            <span className="flex gap-0.5">
              <span className="w-1 h-4 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-6 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-3 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
              <span className="w-1 h-5 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
              <span className="w-1 h-4 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '600ms' }} />
            </span>
            Listening...
          </div>
        )}

        {transcript && !isListening && (
          <button
            type="button"
            onClick={clearTranscript}
            className="text-xs text-gray-500 hover:text-red-600 font-semibold"
          >
            Clear
          </button>
        )}
      </div>

      {/* Language selector */}
      {isListening && (
        <p className="text-xs text-gray-400">
          Speaking in: {language === 'en-IN' ? 'English (India)' : language === 'hi-IN' ? 'Hindi' : language === 'te-IN' ? 'Telugu' : language}
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-red-600 font-semibold">{error}</p>
      )}
    </div>
  );
}
