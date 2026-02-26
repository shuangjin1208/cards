import { MobileLayout } from "@/components/MobileLayout";
import { ProgressRing } from "@/components/ProgressRing";
import { useDecks } from "@/hooks/use-decks";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

export default function Home() {
  const { data: decks, isLoading } = useDecks();

  const totalCards = decks?.reduce((acc, deck) => acc + deck.cardCount, 0) || 0;
  const masteredCards = decks?.reduce((acc, deck) => acc + deck.masteredCount, 0) || 0;
  const progress = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;

  // Find a deck that was recently studied to recommend
  const recentDeck = decks?.sort((a, b) => {
    if (!a.lastStudiedAt) return 1;
    if (!b.lastStudiedAt) return -1;
    return new Date(b.lastStudiedAt).getTime() - new Date(a.lastStudiedAt).getTime();
  })[0];

  return (
    <MobileLayout>
      <div className="px-6 pt-12 pb-8 h-full flex flex-col">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold font-display">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your memory journey</p>
        </motion.header>

        <div className="flex-1 flex flex-col items-center justify-center -mt-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <ProgressRing 
              progress={progress} 
              label={`${progress}%`} 
              subLabel="Mastered" 
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center"
          >
            <p className="text-muted-foreground mb-1">Total Cards: <span className="font-semibold text-foreground">{totalCards}</span></p>
            <p className="text-muted-foreground">Today's Goal: <span className="font-semibold text-primary">0/50</span></p>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-auto"
        >
          {recentDeck && recentDeck.cardCount > 0 ? (
            <Link href={`/decks/${recentDeck.id}/study`}>
              <Button size="lg" className="w-full rounded-2xl h-14 text-lg font-semibold shadow-lg shadow-primary/25">
                Continue Studying
              </Button>
            </Link>
          ) : (
            <Link href="/decks">
              <Button size="lg" variant="secondary" className="w-full rounded-2xl h-14 text-lg font-semibold">
                <BookOpen className="mr-2 w-5 h-5" />
                Browse Decks
              </Button>
            </Link>
          )}
        </motion.div>
      </div>
    </MobileLayout>
  );
}
