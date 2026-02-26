import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useCards, useUpdateCard } from "@/hooks/use-cards";
import { useDeck } from "@/hooks/use-decks";
import { useSession, useSaveSession, useDeleteSession } from "@/hooks/use-sessions";
import { Flashcard } from "@/components/Flashcard";
import { Button } from "@/components/ui/button";
import { X, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@shared/schema";
import confetti from "canvas-confetti";

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

  // Initialize session
  useEffect(() => {
    if (cardsLoading || sessionLoading || initialized || !allCards) return;

    if (session && session.state) {
      const state = session.state as any;
      if (confirm("Resume previous study session?")) {
        setQueue(state.queue || []);
        setStats(state.stats || { easy: 0, good: 0, again: 0 });
        setInitialized(true);
        return;
      } else {
        deleteSession.mutate(deckId);
      }
    }

    // Start fresh: prioritize 'again' and 'new' cards, but for simplicity here we just shuffle all or use simple logic
    // A robust app would sort by SRS logic. Here we just take all cards.
    const freshQueue = [...allCards].sort(() => Math.random() - 0.5);
    setQueue(freshQueue);
    setInitialized(true);
  }, [allCards, session, cardsLoading, sessionLoading, initialized]);

  // Save session periodically or on unmount
  useEffect(() => {
    if (!initialized || isFinished || queue.length === 0) return;
    
    const timeout = setTimeout(() => {
      saveSession.mutate({ deckId, state: { queue, stats } });
    }, 2000); // Debounced save

    return () => clearTimeout(timeout);
  }, [queue, stats, initialized, isFinished]);

  const handleSwipe = async (direction: "left" | "right" | "up", card: Card) => {
    const nextQueue = [...queue];
    nextQueue.shift(); // remove current card

    let newStatus = card.status;
    const newStats = { ...stats };

    if (direction === "left") { // Easy
      newStatus = "easy";
      newStats.easy++;
    } else if (direction === "up") { // Good
      newStatus = "good";
      newStats.good++;
    } else { // Again
      newStatus = "again";
      newStats.again++;
      // Put it back near the end of the queue
      nextQueue.splice(Math.floor(nextQueue.length / 2) + 1, 0, card);
    }

    // Update DB asynchronously without blocking UI
    updateCard.mutate({ id: card.id, deckId, status: newStatus });
    
    setStats(newStats);
    setQueue(nextQueue);

    if (nextQueue.length === 0) {
      setIsFinished(true);
      deleteSession.mutate(deckId);
      triggerConfetti();
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#007AFF', '#5E5CE6', '#34C759']
    });
  };

  if (!initialized) return <div className="h-screen flex items-center justify-center bg-background">Loading...</div>;

  return (
    <div className="mobile-app-container bg-secondary/30">
      {/* Top Bar */}
      <div className="pt-12 px-6 pb-4 flex items-center justify-between z-10 relative">
        <Button variant="ghost" size="icon" className="rounded-full bg-background/50 backdrop-blur" onClick={() => setLocation(`/decks/${deckId}`)}>
          <X className="w-5 h-5" />
        </Button>
        <div className="font-medium text-sm text-muted-foreground bg-background/50 px-4 py-1.5 rounded-full backdrop-blur">
          {queue.length} left
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <AnimatePresence mode="popLayout">
          {!isFinished && queue.length > 0 && (
            <motion.div
              key={queue[0].id + queue.length} // Force re-render on new card
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.05, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full absolute flex items-center justify-center px-6"
            >
              <Flashcard card={queue[0]} onSwipe={handleSwipe} />
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
              <h2 className="text-3xl font-bold font-display mb-2">Well Done!</h2>
              <p className="text-muted-foreground mb-8">You've completed this session.</p>
              
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-green-500">{stats.easy}</span>
                  <span className="text-xs font-medium text-muted-foreground uppercase">Easy</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-yellow-500">{stats.good}</span>
                  <span className="text-xs font-medium text-muted-foreground uppercase">Good</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-red-500">{stats.again}</span>
                  <span className="text-xs font-medium text-muted-foreground uppercase">Again</span>
                </div>
              </div>

              <Button onClick={() => setLocation(`/decks/${deckId}`)} className="w-full h-14 rounded-2xl text-lg">
                Finish
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
