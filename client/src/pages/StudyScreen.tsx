import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useCards, useUpdateCard } from "@/hooks/use-cards";
import { useDeck } from "@/hooks/use-decks";
import { useSession, useSaveSession, useDeleteSession } from "@/hooks/use-sessions";
import { Flashcard } from "@/components/Flashcard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Trophy, Send, Sparkles, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@shared/schema";
import confetti from "canvas-confetti";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function StudyScreen() {
  const [, setLocation] = useLocation();
  const { id } = useParams();
  const deckId = parseInt(id || "0");
  
  const { data: deck } = useDeck(deckId);
  const { data: allCards, isLoading: cardsLoading } = useCards(deckId);
  const { data: session, isLoading: sessionLoading } = useSession(deckId);
  
  const updateCard = useUpdateCard();
  const saveSession = useSaveSession();
  const deleteSession = useDeleteSession();

  const [queue, setQueue] = useState<Card[]>([]);
  const [stats, setStats] = useState({ easy: 0, good: 0, again: 0 });
  const [initialized, setInitialized] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // AI State
  const [aiActive, setAiActive] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, aiLoading]);

  // Initialize session
  useEffect(() => {
    if (cardsLoading || sessionLoading || initialized || !allCards) return;

    if (session && session.state) {
      const state = session.state as any;
      if (confirm("是否恢复上次的学习进度？")) {
        setQueue(state.queue || []);
        setStats(state.stats || { easy: 0, good: 0, again: 0 });
        setInitialized(true);
        return;
      } else {
        deleteSession.mutate(deckId);
      }
    }

    const freshQueue = [...allCards].sort(() => Math.random() - 0.5);
    setQueue(freshQueue);
    setInitialized(true);
  }, [allCards, session, cardsLoading, sessionLoading, initialized]);

  // Save session
  useEffect(() => {
    if (!initialized || isFinished || queue.length === 0) return;
    
    const timeout = setTimeout(() => {
      saveSession.mutate({ deckId, state: { queue, stats } });
    }, 2000);

    return () => clearTimeout(timeout);
  }, [queue, stats, initialized, isFinished]);

  const handleSwipe = async (direction: "left" | "right" | "up", card: Card) => {
    if (direction === "left") {
      // "Easy" - normal next card
      completeCard(direction, card);
    } else {
      // "Again" (right) or "Good/Blurry" (up) - trigger AI
      setAiActive(true);
      setMessages([]);
    }
  };

  const completeCard = (direction: "left" | "right" | "up", card: Card) => {
    const nextQueue = [...queue];
    nextQueue.shift();

    let newStatus = card.status;
    const newStats = { ...stats };

    if (direction === "left") {
      newStatus = "easy";
      newStats.easy++;
    } else if (direction === "up") {
      newStatus = "good";
      newStats.good++;
    } else {
      newStatus = "again";
      newStats.again++;
      nextQueue.splice(Math.floor(nextQueue.length / 2) + 1, 0, card);
    }

    updateCard.mutate({ id: card.id, deckId, status: newStatus });
    
    setStats(newStats);
    setQueue(nextQueue);
    setAiActive(false);
    setMessages([]);

    if (nextQueue.length === 0) {
      setIsFinished(true);
      deleteSession.mutate(deckId);
      triggerConfetti();
    }
  };

  const triggerAi = (type: "analyze" | "memory") => {
    setAiLoading(true);
    setTimeout(() => {
      setAiLoading(false);
      const response = type === "analyze" 
        ? `这是关于“${queue[0].front}”的深度解析。这个词常用于...` 
        : `为了帮你记住“${queue[0].front}”，你可以联想...`;
      setMessages([{ role: "ai", content: response }]);
    }, 3000);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const userMsg = inputValue;
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInputValue("");
    setAiLoading(true);
    
    setTimeout(() => {
      setAiLoading(false);
      setMessages(prev => [...prev, { role: "ai", content: `针对你问的“${userMsg}”，我的回答是：这是一个模拟的AI追问回复。` }]);
    }, 2000);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#007AFF', '#5E5CE6', '#34C759']
    });
  };

  if (!initialized) return <div className="h-screen flex items-center justify-center bg-background">加载中...</div>;

  return (
    <div className="mobile-app-container bg-secondary/30 overflow-hidden">
      {/* Top Bar */}
      <div className="pt-12 px-6 pb-4 flex items-center justify-between z-10 relative">
        <Button variant="ghost" size="icon" className="rounded-full bg-background/50 backdrop-blur" onClick={() => setLocation(`/decks/${deckId}`)}>
          <X className="w-5 h-5" />
        </Button>
        <div className="font-medium text-sm text-muted-foreground bg-background/50 px-4 py-1.5 rounded-full backdrop-blur">
          剩余 {queue.length} 张
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <AnimatePresence mode="popLayout">
          {!isFinished && queue.length > 0 && (
            <motion.div
              key={queue[0].id + queue.length}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                y: aiActive ? "-25%" : "0%"
              }}
              exit={{ scale: 1.05, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 pb-24 pointer-events-none"
            >
              <div className="pointer-events-auto w-full max-w-sm">
                <Flashcard card={queue[0]} onSwipe={handleSwipe} />
              </div>
            </motion.div>
          )}

          {isFinished && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center bg-card p-8 rounded-[2rem] shadow-xl border border-border/50 max-w-sm w-full"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold font-display mb-2">太棒了！</h2>
              <p className="text-muted-foreground mb-8">你已经完成了本次学习。</p>
              
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-green-500">{stats.easy}</span>
                  <span className="text-xs font-medium text-muted-foreground uppercase">简单</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-yellow-500">{stats.good}</span>
                  <span className="text-xs font-medium text-muted-foreground uppercase">掌握</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-red-500">{stats.again}</span>
                  <span className="text-xs font-medium text-muted-foreground uppercase">重来</span>
                </div>
              </div>

              <Button onClick={() => setLocation(`/decks/${deckId}`)} className="w-full h-14 rounded-2xl text-lg">
                完成
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Interaction Area */}
        <AnimatePresence>
          {aiActive && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border p-6 rounded-t-[2.5rem] shadow-2xl z-20 flex flex-col max-h-[60%]"
            >
              {messages.length === 0 && !aiLoading ? (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-center mb-2">
                    <div className="w-12 h-1.5 bg-muted rounded-full" />
                  </div>
                  <h3 className="text-center font-medium text-muted-foreground mb-2 flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500" /> 需要帮助吗？
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      onClick={() => triggerAi("analyze")}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12"
                    >
                      分析含义
                    </Button>
                    <Button 
                      onClick={() => triggerAi("memory")}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12"
                    >
                      辅助记忆
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full overflow-hidden">
                  <div className="flex-1 overflow-y-auto mb-4 pr-2 space-y-4 min-h-[100px]">
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${
                          msg.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-br-none' 
                          : 'bg-secondary text-foreground rounded-bl-none'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {aiLoading && (
                      <div className="flex justify-start">
                        <div className="bg-secondary text-muted-foreground px-4 py-2 rounded-2xl rounded-bl-none text-sm animate-pulse">
                          生成中...
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  
                  <div className="flex gap-2 mb-4">
                    <Input 
                      placeholder="发送追问..." 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="rounded-xl bg-secondary/50 border-none focus-visible:ring-blue-500"
                    />
                    <Button 
                      size="icon" 
                      onClick={handleSendMessage}
                      className="rounded-xl bg-blue-600 hover:bg-blue-700 shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              <Button 
                variant="ghost" 
                onClick={() => completeCard("up", queue[0])}
                className="w-full text-muted-foreground hover:text-foreground mt-auto"
              >
                继续下一张 <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
