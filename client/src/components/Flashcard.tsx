import { useState, useEffect } from "react";
import { motion, useAnimation, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Card } from "@shared/schema";
import { RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlashcardProps {
  card: Card;
  onSwipe: (direction: "left" | "right" | "up", card: Card) => void;
}

export function Flashcard({ card, onSwipe }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const controls = useAnimation();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Reset state when card changes
  useEffect(() => {
    setIsFlipped(false);
    x.set(0);
    y.set(0);
    controls.set({ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 });
  }, [card, x, y, controls]);

  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);
  
  // Color overlays based on swipe direction
  const backgroundColor = useTransform(
    x,
    [-150, 0, 150],
    ["rgba(34, 197, 94, 0.2)", "rgba(255, 255, 255, 0)", "rgba(239, 68, 68, 0.2)"]
  );

  const handleDragEnd = async (e: any, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x < -threshold) {
      // Swipe Left -> Easy
      await controls.start({ x: -500, opacity: 0, transition: { duration: 0.3 } });
      onSwipe("left", card);
    } else if (info.offset.x > threshold) {
      // Swipe Right -> Again
      await controls.start({ x: 500, opacity: 0, transition: { duration: 0.3 } });
      onSwipe("right", card);
    } else if (info.offset.y < -threshold) {
      // Swipe Up -> Good
      await controls.start({ y: -500, opacity: 0, transition: { duration: 0.3 } });
      onSwipe("up", card);
    } else {
      // Return to center
      controls.start({ x: 0, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
    }
  };

  return (
    <div className="relative w-full max-w-md h-[75vh] max-h-[800px] perspective-1000 mx-auto">
      <motion.div
        className="w-full h-full transform-style-3d cursor-grab active:cursor-grabbing"
        drag={isFlipped ? true : false}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.8}
        onDragEnd={handleDragEnd}
        style={{ x, y, rotate, opacity }}
        animate={controls}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
          className="w-full h-full relative transform-style-3d shadow-xl rounded-[2rem] border border-border/50"
        >
          {/* FRONT FACE */}
          <div 
            className="absolute inset-0 backface-hidden bg-card rounded-[2rem] p-6 flex flex-col items-center text-center"
            onClick={() => !isFlipped && setIsFlipped(true)}
          >
            <span className="text-sm font-medium text-muted-foreground shrink-0 mb-4 mt-2">Tap to flip</span>
            <div className="flex-1 w-full overflow-y-auto flex items-center justify-center pb-4">
              <h2 
                className="font-display font-semibold text-card-foreground break-words w-full"
                style={{ fontSize: `${Math.max(20, Math.min(36, 350 / Math.max(1, card.front.length)))}px`, lineHeight: 1.4 }}
              >
                {card.front}
              </h2>
            </div>
          </div>

          {/* BACK FACE */}
          <motion.div 
            className="absolute inset-0 backface-hidden bg-card rounded-[2rem] p-6 flex flex-col items-center text-center rotate-y-180 overflow-hidden"
            style={{ backgroundColor }}
          >
            <div className="flex-1 w-full overflow-y-auto flex items-center justify-center mt-4 mb-16">
              <h3 
                className="font-display font-medium text-card-foreground whitespace-pre-wrap break-words w-full"
                style={{ fontSize: `${Math.max(16, Math.min(28, 400 / Math.max(1, card.back.length)))}px`, lineHeight: 1.5 }}
              >
                {card.back}
              </h3>
            </div>
            
            {/* Swipe Indicators */}
            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between opacity-0 transition-opacity duration-200"
                 style={{ opacity: useTransform(x, [-50, -100], [0, 1]) as any }}>
              <div className="flex justify-start">
                <div className="border-4 border-green-500 text-green-500 font-bold text-2xl px-4 py-1 rounded-xl rotate-[-15deg]">EASY</div>
              </div>
            </div>
            
            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between opacity-0 transition-opacity duration-200"
                 style={{ opacity: useTransform(x, [50, 100], [0, 1]) as any }}>
              <div className="flex justify-end">
                <div className="border-4 border-red-500 text-red-500 font-bold text-2xl px-4 py-1 rounded-xl rotate-[15deg]">AGAIN</div>
              </div>
            </div>
            
            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-end items-center opacity-0 transition-opacity duration-200"
                 style={{ opacity: useTransform(y, [-50, -100], [0, 1]) as any }}>
              <div className="border-4 border-yellow-500 text-yellow-500 font-bold text-2xl px-4 py-1 rounded-xl">GOOD</div>
            </div>

            <div className="absolute bottom-8 flex gap-6 text-muted-foreground opacity-50">
              <div className="flex flex-col items-center"><CheckCircle2 className="w-6 h-6 mb-1"/> <span className="text-[10px]">Easy</span></div>
              <div className="flex flex-col items-center"><RefreshCw className="w-6 h-6 mb-1"/> <span className="text-[10px]">Good</span></div>
              <div className="flex flex-col items-center"><XCircle className="w-6 h-6 mb-1"/> <span className="text-[10px]">Again</span></div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
