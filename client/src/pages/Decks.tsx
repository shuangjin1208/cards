import { useState } from "react";
import { Link } from "wouter";
import { MobileLayout } from "@/components/MobileLayout";
import { useDecks, useCreateDeck, useDeleteDeck } from "@/hooks/use-decks";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical, Trash2, Import } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Decks() {
  const { data: decks, isLoading } = useDecks();
  const createDeck = useCreateDeck();
  const deleteDeck = useDeleteDeck();
  
  const [newDeckName, setNewDeckName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreate = async () => {
    if (!newDeckName.trim()) return;
    await createDeck.mutateAsync({ name: newDeckName });
    setNewDeckName("");
    setIsDialogOpen(false);
  };

  return (
    <MobileLayout>
      <div className="px-6 pt-12 pb-6 sticky top-0 bg-background/90 backdrop-blur-xl z-10">
        <h1 className="text-3xl font-bold font-display">我的卡组</h1>
        <div className="flex gap-3 mt-6">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 rounded-xl" variant="default">
                <Plus className="w-4 h-4 mr-2" /> 新建卡组
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl sm:rounded-[2rem]">
              <DialogHeader>
                <DialogTitle>创建新卡组</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Input 
                  placeholder="例如：西班牙语词汇" 
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  className="rounded-xl h-12 text-lg px-4"
                  autoFocus
                />
              </div>
              <Button onClick={handleCreate} disabled={createDeck.isPending} className="w-full rounded-xl h-12 text-lg">
                {createDeck.isPending ? "创建中..." : "创建"}
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="px-4 pb-4">
        {isLoading ? (
          <div className="flex justify-center p-8 text-muted-foreground animate-pulse">加载中...</div>
        ) : decks?.length === 0 ? (
          <div className="text-center p-12 text-muted-foreground">
            <div className="bg-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Folder className="w-8 h-8 opacity-50" />
            </div>
            <p>还没有卡组。创建一个开始学习吧！</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {decks?.map((deck, i) => (
                <motion.div
                  key={deck.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow relative group"
                >
                  <Link href={`/decks/${deck.id}`}>
                    <div className="block cursor-pointer pr-8">
                      <h3 className="font-semibold text-lg text-foreground truncate">{deck.name}</h3>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="bg-secondary px-2 py-1 rounded-md">{deck.cardCount} 张卡片</span>
                        {deck.lastStudiedAt && (
                          <span>上次学习于 {formatDistanceToNow(new Date(deck.lastStudiedAt))} 前</span>
                        )}
                      </div>
                      
                      {/* Mini progress bar */}
                      <div className="w-full bg-secondary h-1.5 rounded-full mt-4 overflow-hidden">
                        <div 
                          className="bg-primary h-full rounded-full transition-all duration-500" 
                          style={{ width: `${deck.cardCount ? (deck.masteredCount / deck.cardCount) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </Link>

                  <div className="absolute top-4 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive cursor-pointer"
                          onClick={() => {
                            if(confirm("确定要删除这个卡组吗？")) {
                              deleteDeck.mutate(deck.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> 删除卡组
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}

// Ensure Folder icon is imported if used in fallback
import { Folder } from "lucide-react";
