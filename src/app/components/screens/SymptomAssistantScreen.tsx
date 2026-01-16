import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Bot, User, Mic, AlertTriangle, Stethoscope, Pill } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card } from '@/app/components/ui/card';
import { BottomNav } from '@/app/components/BottomNav';
import { diseaseKnowledgeBase, Disease } from '@/app/data/diseaseKnowledgeBase';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: React.ReactNode;
}

// Web Speech API Types
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

export function SymptomAssistantScreen() {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your Symptom Assistant. Describe your symptoms in detail (e.g., "I have a throbbing headache and nausea"), and I will analyze them for you.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // --- LOGIC: TEXT TO SPEECH ---
  const startListening = () => {
    const windowObj = window as unknown as IWindow;
    const SpeechRecognition = windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Try Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; // Can be made dynamic based on user.language
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      // Optional: Auto-send? No, let user confirm.
    };

    recognition.onerror = () => {
      setIsListening(false);
      alert("Could not hear you. Please try again.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);



  const analyzeSymptoms = (text: string): { matches: Disease[], generalAdvice?: string } => {
    const lowerText = text.toLowerCase();

    // Scoring system
    const scores = diseaseKnowledgeBase.map(disease => {
      let score = 0;
      disease.common_symptoms.forEach(symptom => {
        if (lowerText.includes(symptom.toLowerCase())) score += 3; // Boost score for symptoms
      });
      // Also check if disease name itself is mentioned (or common aliases like 'piles')
      if (lowerText.includes(disease.name.toLowerCase())) score += 10;
      if (disease.id === 'hemorrhoids' && lowerText.includes('piles')) score += 10;

      return { disease, score };
    });

    const matches = scores
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.disease);

    return { matches };
  };

  const handleSend = () => {
    if (!input.trim()) return;

    // User Message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulated Analysis
    setTimeout(() => {
      const { matches } = analyzeSymptoms(userMessage.content as string);

      let content: React.ReactNode;

      if (matches.length > 0) {
        // Take the top match, or if scores are close, maybe show multiple? 
        // For simplicity, let's focus on the top match but mention others if ambiguous.
        // User logic: "If symptoms match multiple diseases -> Say 'possible conditions' + advise doctor"

        const topMatch = matches[0];
        const isAmbiguous = matches.length > 1;

        content = (
          <div className="space-y-4">
            {isAmbiguous ? (
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                <p className="text-sm text-yellow-800 font-medium">Multiple conditions share these symptoms. Top possibilities:</p>
                <ul className="list-disc list-inside text-sm text-yellow-700 mt-1">
                  {matches.slice(0, 2).map((d) => <li key={d.id}>{d.name}</li>)}
                </ul>
              </div>
            ) : (
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold text-purple-900">Possible Condition</span>
                </div>
                <p className="text-lg font-bold text-purple-800">{topMatch.name}</p>
                <p className="text-sm text-purple-600 capitalize">Category: {topMatch.category}</p>
                <p className="text-sm text-purple-700 mt-2">{topMatch.short_description}</p>
              </div>
            )}

            {/* Treatment Knowledge - Safe */}
            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <Pill className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-green-800">General Treatment Approach</span>
              </div>
              <div className="space-y-2">
                {topMatch.treatment_knowledge.filter(t => t.type === 'lifestyle').length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-green-700 uppercase mb-1">Lifestyle & Home Care</p>
                    <ul className="list-disc list-inside text-sm text-green-700">
                      {topMatch.treatment_knowledge.filter(t => t.type === 'lifestyle').map((t, i) => (
                        <li key={i}>{t.description}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {topMatch.treatment_knowledge.filter(t => t.type === 'medication_class').length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-bold text-green-700 uppercase mb-1">Typical Medication Classes (Consult Doctor)</p>
                    <ul className="list-disc list-inside text-sm text-green-700">
                      {topMatch.treatment_knowledge.filter(t => t.type === 'medication_class').map((t, i) => (
                        <li key={i}>{t.description}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Doctor & Emergency Triggers */}
            <div className="grid grid-cols-1 gap-2">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-blue-800">When to see a doctor</span>
                </div>
                <p className="text-sm text-blue-700">{topMatch.doctor_visit_trigger}</p>
              </div>

              <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="font-semibold text-red-800">Red Flag Symptoms (Emergency)</span>
                </div>
                <p className="text-sm text-red-700 font-medium">{topMatch.emergency_trigger}</p>
              </div>
            </div>

            <p className="text-xs text-gray-400 italic text-center mt-2">
              This is educational information only, not a medical diagnosis.
            </p>
          </div>
        );

      } else {
        content = (
          <div className="space-y-3">
            <p>I couldn't match your symptoms to a specific condition in my database. However, here is some general advice:</p>
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <h4 className="font-semibold text-blue-800 mb-2">General Recommendations</h4>
              <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                <li>Stay hydrated and rest.</li>
                <li>Monitor your temperature and symptoms.</li>
                <li>If symptoms persist for more than 2-3 days, consult a physician.</li>
              </ul>
            </div>
            <p className="text-xs text-gray-500 italic mt-2">
              For accurate diagnosis, please visit a doctor.
            </p>
          </div>
        );
      }

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: content
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#7C4DFF] to-[#651FFF] text-white p-6 rounded-b-[2rem] shadow-lg flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Symptom Check</h1>
            <p className="text-purple-100 text-sm opacity-90">AI-powered Analysis</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start max-w-[90%]'}`}
          >
            {message.type === 'bot' && (
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center shadow-sm mt-1">
                <Bot className="w-5 h-5 text-[#651FFF]" />
              </div>
            )}

            <div
              className={`rounded-2xl p-4 shadow-sm ${message.type === 'user'
                ? 'bg-[#651FFF] text-white rounded-tr-none'
                : 'bg-white border border-gray-100 rounded-tl-none'
                }`}
            >
              <div className={message.type === 'user' ? 'text-white' : 'text-gray-800'}>
                {message.content}
              </div>
            </div>

            {message.type === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center shadow-sm mt-1">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 max-w-[90%] animate-pulse">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5 text-[#651FFF]" />
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none p-4 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-purple-100">
        <div className="max-w-md mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe your symptoms..."
            className="flex-1 h-12 rounded-xl border-purple-100 focus:ring-[#651FFF] focus:border-[#651FFF]"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim()}
            className="h-12 w-12 rounded-xl bg-[#651FFF] hover:bg-[#5e1ce6] shadow-lg shadow-purple-200 p-0 transition-all active:scale-95"
          >
            <Send className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            className={`h-12 w-12 rounded-xl p-0 border-purple-100 ${isListening ? 'bg-red-100 text-red-600 animate-pulse border-red-200' : 'hover:bg-purple-50 text-purple-600'}`}
            onClick={startListening}
          >
            <Mic className={`w-5 h-5 ${isListening ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="max-w-md mx-auto mt-2">
          <p className="text-[10px] text-center text-gray-400">
            Consult a doctor for proper diagnosis.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
