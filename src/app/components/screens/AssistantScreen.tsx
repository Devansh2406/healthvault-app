import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Paperclip, Loader2, AlertTriangle, Phone } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { BottomNav } from '@/app/components/BottomNav';
import { medicalAI } from '@/app/lib/ai-engine';
import { processDocument } from '@/app/lib/document-processor';
import { analyzeReport, AnalysisResult } from '@/app/lib/report-analyzer';
import { useNavigate } from 'react-router-dom';

type Message = {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    type?: 'text' | 'report-analysis' | 'emergency';
    timestamp: Date;
    sources?: string[];
    analysisResult?: AnalysisResult;
};

export function AssistantScreen() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hello! I'm Swasthya Sathi.\n\nI can analyze your medical reports (PDF/Image) locally on your device.\n\nTap the **Paperclip** icon to attach a report.",
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userText = inputValue;
        const userMsg: Message = {
            id: Date.now().toString(),
            text: userText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            const result = await medicalAI.processQuery(userText, {
                age: 35,
                gender: 'Male',
                conditions: ['Diabetes']
            });

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: result.response,
                sender: 'ai',
                type: result.isEmergency ? 'emergency' : 'text',
                timestamp: new Date(),
                sources: result.retrievedDocs.map(d => d.source)
            };

            setMessages(prev => [...prev, aiMsg]);

            if (result.suggestedAction === 'locate_hospital') {
                setTimeout(() => navigate('/nearby?emergency=true'), 2000);
            }

        } catch (error) {
            console.error(error);
        } finally {
            setIsTyping(false);
        }
    };

    const handleFileUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: `Uploaded: ${file.name}`,
            sender: 'user',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        try {
            const rawText = await processDocument(file);
            const analysis = analyzeReport(rawText);

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: analysis.summary,
                sender: 'ai',
                type: 'report-analysis',
                timestamp: new Date(),
                analysisResult: analysis
            };

            setMessages(prev => [...prev, aiMsg]);

            if (analysis.riskLevel === 'RED') {
                setTimeout(() => navigate('/nearby?emergency=true'), 3000);
            }

        } catch (error) {
            console.error(error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: "I couldn't read that file clearly. Please try a clearer Image or standard PDF.",
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // 7. Risk Level Output (Visual)
    const renderAnalysis = (analysis: AnalysisResult) => (
        <div className="flex flex-col gap-3 mt-2 w-full">
            <div className={`p-3 rounded-lg flex flex-col gap-1 ${analysis.riskLevel === 'RED' ? 'bg-red-50 border border-red-200' :
                    analysis.riskLevel === 'YELLOW' ? 'bg-yellow-50 border border-yellow-200' :
                        'bg-green-50 border border-green-200'
                }`}>
                <div className={`text-xs font-bold flex items-center gap-2 ${analysis.riskLevel === 'RED' ? 'text-red-700' :
                        analysis.riskLevel === 'YELLOW' ? 'text-yellow-700' :
                            'text-green-700'
                    }`}>
                    {analysis.riskLevel === 'RED' && <AlertTriangle className="w-4 h-4" />}
                    <span>RISK LEVEL: {analysis.riskLevel}</span>
                </div>

                {/* Mandatory Safety Instructions */}
                <p className="text-xs font-medium opacity-90">
                    {analysis.riskLevel === 'RED' ? 'Visit nearest hospital immediately.' :
                        analysis.riskLevel === 'YELLOW' ? 'Consult doctor soon.' :
                            'Monitor and consult doctor if needed.'}
                </p>

                {/* Call 108 Button for RED */}
                {analysis.riskLevel === 'RED' && (
                    <a href="tel:108" className="mt-2 text-decoration-none">
                        <Button variant="destructive" size="sm" className="w-full bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2">
                            <Phone className="w-4 h-4" />
                            Call 108
                        </Button>
                    </a>
                )}
            </div>

            {/* Findings Table without exact ranges */}
            {analysis.findings.length > 0 && (
                <div className="grid gap-0 border border-gray-100 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-2 bg-gray-50 p-2 text-[10px] font-bold text-gray-400">
                        <span>TEST FOUND</span>
                        <span className="text-right">RESULT</span>
                    </div>
                    {analysis.findings.map((finding, idx) => (
                        <div key={idx} className="grid grid-cols-2 p-2 text-xs border-t border-gray-100 items-center bg-white">
                            <span className="font-medium text-gray-700 truncate">{finding.originalName}</span>
                            <div className="flex justify-end gap-2 items-center">
                                {/* Only show extracted value, not reference range */}
                                <span className="font-mono text-gray-500">{finding.value} {finding.unit}</span>
                                <span className={`font-bold text-[9px] px-1.5 py-0.5 rounded-full ${finding.status === 'normal' ? 'bg-green-50 text-green-600' :
                                        finding.status.includes('critical') ? 'bg-red-50 text-red-600' :
                                            'bg-orange-50 text-orange-600'
                                    }`}>
                                    {finding.status === 'normal' ? 'NORMAL' :
                                        finding.status.includes('high') ? 'HIGH' : 'LOW'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 5. Contextual Question Flow */}
            {analysis.followUpQuestions.length > 0 && (
                <div className="mt-1 bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <p className="text-[10px] uppercase font-bold text-blue-500 mb-2">Relevant Questions</p>
                    <ul className="space-y-2">
                        {analysis.followUpQuestions.map((q, i) => (
                            <li key={i} className="text-xs text-blue-900 flex gap-2">
                                <span className="text-blue-400">•</span> {q}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* 9. Safety & Compliance Disclaimer */}
            <p className="text-[9px] text-gray-400 mt-1 italic text-center border-t border-gray-100 pt-2">
                This system provides health awareness only.<br />
                It does not give medical advice, diagnosis, or treatment.
            </p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans mb-16">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm flex items-center gap-3 sticky top-0 z-10 border-b border-gray-100">
                <div className="w-10 h-10 bg-gradient-to-tr from-[#00D66C] to-[#00E5FF] rounded-full flex items-center justify-center shadow-md">
                    <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="font-bold text-lg text-gray-800">Swasthya AI</h1>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <p className="text-xs text-green-600 font-medium tracking-wide">Offline Analysis Ready</p>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 space-y-5 overflow-y-auto pb-24">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[95%] sm:max-w-[85%] rounded-2xl p-4 shadow-sm flex flex-col gap-2 transition-all ${msg.sender === 'user'
                                ? 'bg-[#00D66C] text-white rounded-tr-none'
                                : msg.type === 'emergency'
                                    ? 'bg-red-50 border-red-200 text-gray-800 border'
                                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                                }`}
                        >
                            <div className="text-sm whitespace-pre-line leading-relaxed">
                                {msg.text}
                            </div>

                            {msg.type === 'report-analysis' && msg.analysisResult && renderAnalysis(msg.analysisResult)}

                            <p className={`text-[10px] self-end ${msg.sender === 'user' ? 'text-green-100' : 'text-gray-300'}`}>
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white rounded-2xl rounded-tl-none border border-gray-100 p-4 shadow-sm flex items-center gap-3">
                            <Loader2 className="w-4 h-4 text-[#00D66C] animate-spin" />
                            <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-semibold text-gray-700">Analyzing Document...</span>
                                <span className="text-[10px] text-gray-400">Processing locally...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="fixed bottom-20 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                />

                <div className="flex items-center gap-2 max-w-md mx-auto">
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full shrink-0 border-gray-200 text-gray-500 hover:text-[#00D66C] hover:bg-green-50 hover:border-green-200 transition-colors"
                        onClick={handleFileUploadClick}
                    >
                        <Paperclip className="w-5 h-5" />
                    </Button>
                    <div className="relative flex-1">
                        <Input
                            placeholder="Type symptoms or upload report..."
                            className="pr-4 pl-4 rounded-full border-gray-200 focus:ring-[#00D66C] focus:border-[#00D66C] py-6 shadow-sm bg-gray-50 focus:bg-white transition-all"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                    </div>
                    <Button
                        className="rounded-full w-12 h-12 shrink-0 bg-[#00D66C] hover:bg-[#00c462] shadow-lg shadow-green-200 transition-all hover:scale-105 active:scale-95"
                        onClick={handleSendMessage}
                    >
                        <Send className="w-5 h-5 text-white ml-0.5" />
                    </Button>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
