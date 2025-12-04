// src/pages/PregnancyCare.tsx
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart,
  Send,
  Loader2,
  Sparkles,
  MessageCircle,
  Lightbulb,
  Baby,
  User,
  Bot,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/config/firebase";
import Header from "@/components/Header";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const fadeIn = { 
  initial: { opacity: 0, y: 8 }, 
  animate: { opacity: 1, y: 0 }, 
  transition: { duration: 0.45 } 
};

const PregnancyCare = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userMessage, setUserMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  
  const [affirmation, setAffirmation] = useState<string>("");
  const [affirmationLoading, setAffirmationLoading] = useState(false);

  const [selectedTopic, setSelectedTopic] = useState<string>("general");
  const [tips, setTips] = useState<string>("");
  const [tipsLoading, setTipsLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // Redirect if not logged in
  if (!user) {
    navigate("/auth");
    return null;
  }

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Don't auto-load affirmation to save API quota
  // Users can click refresh button to load it manually
  useEffect(() => {
    // Optional: Load from localStorage if available
    const savedAffirmation = localStorage.getItem('daily_affirmation');
    const savedDate = localStorage.getItem('affirmation_date');
    const today = new Date().toDateString();
    
    if (savedAffirmation && savedDate === today) {
      setAffirmation(savedAffirmation);
    } else {
      setAffirmation("Click the refresh button to get your daily affirmation! 💕");
    }
  }, []);

  const fetchAffirmation = async () => {
    setAffirmationLoading(true);
    try {
      const response = await fetch("http://localhost:8002/pregnancy/affirmation", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to fetch affirmation");
      const result = await response.json();
      setAffirmation(result.affirmation);
      
      // Save to localStorage for daily caching
      localStorage.setItem('daily_affirmation', result.affirmation);
      localStorage.setItem('affirmation_date', new Date().toDateString());
    } catch (err: any) {
      console.error("Error fetching affirmation:", err);
      setAffirmation("You are strong, capable, and creating a beautiful life. Trust your journey. 💕");
    } finally {
      setAffirmationLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;

    const newUserMessage: ChatMessage = {
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, newUserMessage]);
    setUserMessage("");
    setChatLoading(true);
    setChatError(null);

    try {
      const formData = new FormData();
      formData.append("message", userMessage);

      const response = await fetch("http://localhost:8002/pregnancy/chat", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Server error" }));
        throw new Error(errorData.error || `Failed to get response (${response.status})`);
      }
      
      const result = await response.json();
      
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: result.reply,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setChatError(err.message || "Unable to connect to the server. Please check if the backend is running.");
    } finally {
      setChatLoading(false);
      messageInputRef.current?.focus();
    }
  };

  const handleGetTips = async () => {
    setTipsLoading(true);
    setTips(""); // Clear previous tips
    
    try {
      const formData = new FormData();
      formData.append("topic", selectedTopic);

      const response = await fetch("http://localhost:8002/pregnancy/tips", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
      
      const result = await response.json();
      setTips(result.tips);
    } catch (err: any) {
      console.error("Error fetching tips:", err);
      setTips(`**Unable to load tips right now.**\n\nPlease make sure:\n- The backend server is running on port 8002\n- Your internet connection is stable\n\nError: ${err.message}`);
    } finally {
      setTipsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPrompts = [
    "What foods should I eat in my first trimester?",
    "How can I manage morning sickness?",
    "Safe exercises during pregnancy?",
    "Tips for better sleep while pregnant?",
  ];

  const topicOptions = [
    { value: "general", label: "General Wellness" },
    { value: "nutrition", label: "Nutrition" },
    { value: "exercise", label: "Exercise" },
    { value: "mental-health", label: "Mental Health" },
    { value: "trimester1", label: "First Trimester" },
    { value: "trimester2", label: "Second Trimester" },
    { value: "trimester3", label: "Third Trimester" },
  ];

  const MarkdownComponents = {
    h1: ({ node, ...props }: any) => <h1 className="text-lg font-bold text-slate-900 mt-4 mb-2 first:mt-0" {...props} />,
    h2: ({ node, ...props }: any) => <h2 className="text-md font-semibold text-slate-800 mt-3 mb-2" {...props} />,
    h3: ({ node, ...props }: any) => <h3 className="text-sm font-semibold text-slate-700 mt-2 mb-1" {...props} />,
    p: ({ node, ...props }: any) => <p className="text-sm text-slate-700 mb-3 leading-relaxed" {...props} />,
    ul: ({ node, ...props }: any) => <ul className="list-disc list-inside space-y-1 mb-3 text-sm text-slate-700" {...props} />,
    ol: ({ node, ...props }: any) => <ol className="list-decimal list-inside space-y-1 mb-3 text-sm text-slate-700" {...props} />,
    li: ({ node, ...props }: any) => <li className="text-sm text-slate-700 mb-1" {...props} />,
    strong: ({ node, ...props }: any) => <strong className="font-semibold text-slate-900" {...props} />,
    em: ({ node, ...props }: any) => <em className="italic text-slate-800" {...props} />,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f6ff] via-[#fffaf7] to-[#f7fbff] text-slate-900 antialiased font-sans">
      {/* Decorative blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <svg className="absolute -left-56 -top-40 w-[640px] opacity-40" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="g1" x1="0%" x2="100%">
              <stop offset="0%" stopColor="#f0abfc" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
          </defs>
          <g transform="translate(300,300)">
            <path d="M120,-150C161,-114,186,-62,189,-6C192,50,173,102,133,148C93,194,33,234,-31,241C-95,248,-179,222,-214,170C-249,118,-235,40,-208,-24C-181,-88,-142,-124,-98,-157C-54,-190,-27,-220,16,-238C59,-256,118,-186,120,-150Z" fill="url(#g1)" opacity="0.14"/>
          </g>
        </svg>

        <svg className="absolute -right-56 -bottom-40 w-[520px] opacity-30" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="g2" x1="0%" x2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
          </defs>
          <g transform="translate(300,300)">
            <path d="M120,-150C161,-114,186,-62,189,-6C192,50,173,102,133,148C93,194,33,234,-31,241C-95,248,-179,222,-214,170C-249,118,-235,40,-208,-24C-181,-88,-142,-124,-98,-157C-54,-190,-27,-220,16,-238C59,-256,118,-186,120,-150Z" fill="url(#g2)" opacity="0.12"/>
          </g>
        </svg>
      </div>

      <Header />

      <main className="container mx-auto px-4 py-10 mt-24">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeIn} className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">
              <span role="img" aria-label="baby">👶</span>{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7c3aed] via-[#ec4899] to-[#06b6d4]">
                Pregnancy Care & Support
              </span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Your AI companion for a healthy, happy pregnancy journey with personalized tips and caring support.
            </p>
          </motion.div>

          {/* Daily Affirmation */}
          <motion.div {...fadeIn} className="mb-8">
            <Card className="rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Heart className="h-5 w-5 text-pink-500" />
                      <h3 className="text-lg font-semibold text-slate-800">Daily Affirmation</h3>
                    </div>
                    {affirmationLoading ? (
                      <div className="flex items-center gap-2 text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Loading your daily inspiration...</span>
                      </div>
                    ) : (
                      <p className="text-md text-slate-700 italic leading-relaxed">{affirmation}</p>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={fetchAffirmation}
                    disabled={affirmationLoading}
                    className="text-pink-600 hover:text-pink-700"
                  >
                    <RefreshCw className={`h-4 w-4 ${affirmationLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Chat Section - Takes 2 columns */}
            <motion.div 
              whileHover={{ y: -6 }} 
              transition={{ type: "spring", stiffness: 300 }} 
              className="md:col-span-2 transform-gpu"
            >
              <Card className="rounded-2xl overflow-hidden shadow-2xl h-[600px] flex flex-col">
                <CardHeader className="bg-white/60 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <span className="p-2 rounded-lg bg-gradient-to-br from-[#ec4899] to-[#60a5fa] text-white shadow">
                          <MessageCircle className="h-4 w-4" />
                        </span>
                        Pregnancy Support Chat
                      </CardTitle>
                      <CardDescription>
                        Ask me anything about your pregnancy journey
                      </CardDescription>
                    </div>
                    <div className="hidden md:block">
                      <div className="w-20 h-12 rounded-lg bg-gradient-to-br from-[#fff] to-[#f3f4f6] border border-white/20 shadow-inner flex items-center justify-center text-xs text-slate-500">
                        AI • Chat
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {/* Chat Messages */}
                <CardContent className="flex-1 overflow-y-auto p-6 bg-white/40 backdrop-blur-sm space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <Baby className="h-16 w-16 text-pink-300 mb-4" />
                      <h3 className="text-lg font-semibold text-slate-700 mb-2">
                        Start Your Conversation
                      </h3>
                      <p className="text-sm text-slate-500 mb-6 max-w-md">
                        I'm here to support you with tips, advice, and answers to your pregnancy questions.
                      </p>
                      <div className="grid grid-cols-1 gap-2 w-full max-w-md">
                        {quickPrompts.map((prompt, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            onClick={() => setUserMessage(prompt)}
                            className="text-left justify-start text-xs hover:bg-pink-50"
                          >
                            <Sparkles className="h-3 w-3 mr-2 text-pink-400" />
                            {prompt}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      {chatMessages.map((msg, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          {msg.role === "assistant" && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                              <Bot className="h-4 w-4 text-white" />
                            </div>
                          )}
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                              msg.role === "user"
                                ? "bg-gradient-to-br from-pink-500 to-purple-500 text-white"
                                : "bg-white border border-slate-200 text-slate-800"
                            }`}
                          >
                            {msg.role === "assistant" ? (
                              <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                                {msg.content}
                              </ReactMarkdown>
                            ) : (
                              <p className="text-sm leading-relaxed">{msg.content}</p>
                            )}
                          </div>
                          {msg.role === "user" && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                              <User className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </motion.div>
                      ))}
                      {chatLoading && (
                        <div className="flex gap-3 justify-start">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
                            <Loader2 className="h-4 w-4 animate-spin text-pink-500" />
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </>
                  )}
                </CardContent>

                {/* Chat Input */}
                <CardContent className="p-4 bg-white/60 border-t border-white/10">
                  {chatError && (
                    <Alert variant="destructive" className="mb-3">
                      <AlertDescription>{chatError}</AlertDescription>
                    </Alert>
                  )}
                  <div className="flex gap-2">
                    <Textarea
                      ref={messageInputRef}
                      value={userMessage}
                      onChange={(e) => setUserMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me about nutrition, exercises, tips, or how you're feeling..."
                      className="flex-1 resize-none rounded-xl"
                      rows={2}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={chatLoading || !userMessage.trim()}
                      className="rounded-xl shadow-md bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tips Section - Takes 1 column */}
            <motion.div 
              whileHover={{ y: -6 }} 
              transition={{ type: "spring", stiffness: 300 }} 
              className="transform-gpu"
            >
              <Card className="rounded-2xl overflow-hidden shadow-2xl">
                <CardHeader className="bg-white/60 border-b border-white/10">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <span className="p-2 rounded-lg bg-gradient-to-br from-[#10b981] to-[#06b6d4] text-white shadow">
                      <Lightbulb className="h-4 w-4" />
                    </span>
                    Pregnancy Tips
                  </CardTitle>
                  <CardDescription>
                    Get curated advice for your journey
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6 bg-white/60 backdrop-blur-sm">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="topic">Choose a Topic</Label>
                      <select
                        id="topic"
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                      >
                        {topicOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Button
                      onClick={handleGetTips}
                      disabled={tipsLoading}
                      className="w-full rounded-xl shadow-md transform-gpu hover:-translate-y-1 transition-all"
                    >
                      {tipsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Get Tips
                    </Button>

                    {tips && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-xl p-4 border border-emerald-200 max-h-[400px] overflow-y-auto"
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                          {tips}
                        </ReactMarkdown>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PregnancyCare;