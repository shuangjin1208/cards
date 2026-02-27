import { useState, useEffect } from "react";
import { motion, useAnimation, useMotionValue, useTransform, PanInfo, AnimatePresence } from "framer-motion";
import { Card } from "@shared/schema";
import { RefreshCw, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FlashcardProps {
  card: Card;
  onSwipe: (direction: "left" | "right" | "up", card: Card) => void;
}

export function Flashcard({ card, onSwipe }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAiOptions, setShowAiOptions] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [pendingDirection, setPendingDirection] = useState<"right" | "up" | null>(null);
  
  const controls = useAnimation();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Reset state when card changes
  useEffect(() => {
    setIsFlipped(false);
    setShowAiOptions(false);
    setAiLoading(false);
    setPendingDirection(null);
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
    const threshold = 50; // Further reduced threshold for easier triggering
    const velocityThreshold = 200; // Further reduced velocity threshold
    
    // Check vibration setting
    const vibrationEnabled = localStorage.getItem('vibration_enabled') !== 'false';

    // Calculate which direction is dominant
    const isHorizontal = Math.abs(info.offset.x) > Math.abs(info.offset.y);
    
    if (isHorizontal) {
      // Horizontal swipes (Left/Right)
      if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
        // Swipe Left -> Easy (简单)
        if (vibrationEnabled && window.navigator.vibrate) {
          window.navigator.vibrate(50); // Increased duration
        }
        await controls.start({ x: -500, opacity: 0, transition: { duration: 0.2, ease: "easeOut" } });
        onSwipe("left", card);
        return;
      } else if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
        // Swipe Right -> Again (重来)
        if (vibrationEnabled && window.navigator.vibrate) {
          window.navigator.vibrate(50); // Increased duration
        }
        // Animate out to the right
        await controls.start({ x: 500, opacity: 0, transition: { duration: 0.2, ease: "easeOut" } });
        onSwipe("right", card);
        return;
      }
    } else {
      // Vertical swipes (Up/Down)
      if (info.offset.y < -threshold || info.velocity.y < -velocityThreshold) {
        // Swipe Up -> Good (掌握)
        if (vibrationEnabled && window.navigator.vibrate) {
          window.navigator.vibrate(50); // Increased duration
        }
        // Animate out upwards
        await controls.start({ y: -500, opacity: 0, transition: { duration: 0.2, ease: "easeOut" } });
        onSwipe("up", card);
        return;
      }
    }

    // Reset if thresholds not met
    controls.start({ x: 0, y: 0, transition: { type: "spring", stiffness: 500, damping: 30 } });
  };

  return (
    <div className="relative w-full max-w-[500px] h-[60vh] max-h-[600px] perspective-1000 mx-auto flex flex-col items-center">
      <motion.div
        className="w-full h-full transform-style-3d cursor-grab active:cursor-grabbing touch-none"
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        style={{ x, y, rotate, opacity }}
        animate={controls}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
          className="w-full h-full relative transform-style-3d shadow-xl rounded-[2rem] border border-border/50"
        >
          {/* FRONT FACE */}
          <div 
            className="absolute inset-0 backface-hidden bg-card dark:bg-zinc-800 rounded-[2rem] p-0 flex flex-col items-center text-center overflow-hidden"
            onClick={() => !isFlipped && setIsFlipped(true)}
          >
            <span className="text-sm font-medium text-muted-foreground shrink-0 mb-2 mt-4">点击翻面</span>
            <div className="flex-1 w-full overflow-y-auto">
              <div className="min-h-full flex items-center justify-center p-6">
                <h2 
                  className="font-display font-semibold text-card-foreground break-words w-full"
                  style={{ fontSize: `24px`, lineHeight: 1.6 }}
                >
                  {card.front}
                </h2>
              </div>
            </div>
          </div>

          {/* BACK FACE */}
          <motion.div 
            className="absolute inset-0 backface-hidden bg-card dark:bg-zinc-800 rounded-[2rem] p-0 flex flex-col items-center text-center rotate-y-180 overflow-hidden"
            style={{ backgroundColor }}
          >
            <div className="flex-1 w-full overflow-y-auto mt-4 mb-4">
              <div className="min-h-full flex items-center justify-center p-6">
                <h3 
                  className="font-display font-medium text-card-foreground whitespace-pre-wrap break-words w-full"
                  style={{ fontSize: `20px`, lineHeight: 1.6 }}
                >
                  {card.back}
                </h3>
              </div>
            </div>
            
            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between opacity-0 transition-opacity duration-200"
                 style={{ opacity: useTransform(x, [-50, -100], [0, 1]) as any }}>
              <div className="flex justify-start">
                <div className="border-4 border-green-500 text-green-500 font-bold text-2xl px-4 py-1 rounded-xl rotate-[-15deg]">简单</div>
              </div>
            </div>
            
            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between opacity-0 transition-opacity duration-200"
                 style={{ opacity: useTransform(x, [50, 100], [0, 1]) as any }}>
              <div className="flex justify-end">
                <div className="border-4 border-red-500 text-red-500 font-bold text-2xl px-4 py-1 rounded-xl rotate-[15deg]">重来</div>
              </div>
            </div>
            
            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-end items-center opacity-0 transition-opacity duration-200"
                 style={{ opacity: useTransform(y, [-50, -100], [0, 1]) as any }}>
              <div className="border-4 border-yellow-500 text-yellow-500 font-bold text-2xl px-4 py-1 rounded-xl">掌握</div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
