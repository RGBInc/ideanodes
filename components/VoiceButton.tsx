
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { audio } from '../services/audioService';

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  size?: number;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({ onTranscript, className = "", size = 18 }) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isSupported = typeof window !== 'undefined' && 
    (('SpeechRecognition' in window) || ('webkitSpeechRecognition' in window));

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, []);

  const toggleListening = () => {
    if (!isSupported) {
      alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    audio.playClick();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    
    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      
      if (finalTranscript) {
        // Normalize spacing
        const cleaned = finalTranscript.trim();
        if (cleaned) {
          onTranscript(cleaned);
        }
      }
    };

    recognition.onerror = (event: any) => {
      // 'no-speech' is common when the user pauses; just ignore it or stop silently
      if (event.error === 'no-speech') {
        return; 
      }
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start recognition", e);
      setIsListening(false);
    }
  };

  if (!isSupported) return null;

  return (
    <button
      onClick={toggleListening}
      className={`rounded-full transition-all flex items-center justify-center ${
        isListening 
          ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/40' 
          : 'text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800'
      } ${className}`}
      style={{ width: size * 2, height: size * 2 }}
      title={isListening ? "Stop Recording" : "Start Voice Input"}
      type="button"
    >
      {isListening ? <MicOff size={size} /> : <Mic size={size} />}
    </button>
  );
};

export default VoiceButton;
