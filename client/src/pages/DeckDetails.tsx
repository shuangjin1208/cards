import { useState } from "react";
import { Link, useParams } from "wouter";
import { MobileLayout } from "@/components/MobileLayout";
import { useDeck } from "@/hooks/use-decks";
import { useCards, useCreateCard, useDeleteCard, useImportCards } from "@/hooks/use-cards";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Plus, Trash2, Download, Upload, MoreHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function DeckDetails() {
  const { id } = useParams();
  const deckId = parseInt(id || "0");
  
  const { data: deck, isLoading: deckLoading } = useDeck(deckId);
  const { data: cards, isLoading: cardsLoading } = useCards(deckId);
  
  const createCard = useCreateCard();
  const deleteCard = useDeleteCard();
  const importCards = useImportCards();

  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const [importText, setImportText] = useState("");
  const [isImportOpen, setIsImportOpen] = useState(false);

  const handleAddCard = async () => {
    if (!front.trim() || !back.trim()) return;
    await createCard.mutateAsync({ deckId, front, back });
    setFront("");
    setBack("");
    setIsAddOpen(false);
  };

  const handleImport = async () => {
    if (!importText.trim()) return;
    await importCards.mutateAsync({ deckId, text: importText });
    setImportText("");
    setIsImportOpen(false);
  };

  const handleExport = () => {
    if (!cards || cards.length === 0) return;
    const text = cards.map(c => `${c.front} | ${c.back}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deck?.name || 'deck'}_export.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (deckLoading) return <MobileLayout><div className="p-8 text-center">Loading...</div></MobileLayout>;
  if (!deck) return <MobileLayout><div className="p-8 text-center text-destructive">Deck not found</div></MobileLayout>;

  return (
    <MobileLayout>
      {/* Header */}
      <div className="sticky top-0 bg-background/90 backdrop-blur-xl z-20 px-4 py-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <Link href="/decks">
            <Button variant="ghost" size="icon" className="rounded-full -ml-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex gap-2">
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full px-4"><Upload className="w-4 h-4 mr-2"/> Import</Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl">
                <DialogHeader><DialogTitle>Import Cards</DialogTitle></DialogHeader>
                <p className="text-xs text-muted-foreground mb-2">Paste text. Format: <br/><code>Front | Back</code> per line.</p>
                <Textarea 
                  value={importText} 
                  onChange={e => setImportText(e.target.value)} 
                  className="h-48 rounded-xl"
                  placeholder="Hola | Hello&#10;Gato | Cat"
                />
                <Button onClick={handleImport} disabled={importCards.isPending} className="rounded-xl h-12 mt-2">Import</Button>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="icon" className="rounded-full" onClick={handleExport}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <h1 className="text-2xl font-bold font-display truncate pr-4">{deck.name}</h1>
        <p className="text-muted-foreground text-sm mt-1">{cards?.length || 0} cards</p>
      </div>

      {/* Main Action */}
      <div className="p-4">
        {cards && cards.length > 0 && (
          <Link href={`/decks/${deck.id}/study`}>
            <Button className="w-full h-14 rounded-2xl text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all">
              <Play className="fill-current w-5 h-5 mr-2" /> Start Study
            </Button>
          </Link>
        )}
      </div>

      {/* Cards List */}
      <div className="px-4 pb-24 space-y-3">
        <div className="flex items-center justify-between mt-4 mb-2">
          <h2 className="text-lg font-semibold">Cards</h2>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost" className="text-primary rounded-full">
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader><DialogTitle>New Card</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Front</label>
                  <Textarea value={front} onChange={e => setFront(e.target.value)} className="rounded-xl resize-none" rows={3} autoFocus />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Back</label>
                  <Textarea value={back} onChange={e => setBack(e.target.value)} className="rounded-xl resize-none" rows={3} />
                </div>
              </div>
              <Button onClick={handleAddCard} disabled={createCard.isPending} className="w-full rounded-xl h-12 text-lg">
                Save Card
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        {cardsLoading ? (
          <div className="animate-pulse space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-secondary rounded-2xl w-full" />)}
          </div>
        ) : cards?.length === 0 ? (
          <div className="text-center p-8 bg-secondary/50 rounded-3xl border border-dashed border-border/50">
            <p className="text-muted-foreground mb-4">This deck is empty.</p>
            <Button onClick={() => setIsAddOpen(true)} variant="outline" className="rounded-full">Add your first card</Button>
          </div>
        ) : (
          cards?.map(card => (
            <div key={card.id} className="bg-card border border-border/40 rounded-2xl p-4 flex justify-between items-center shadow-sm">
              <div className="flex-1 overflow-hidden pr-4">
                <p className="font-medium text-foreground truncate">{card.front}</p>
                <p className="text-sm text-muted-foreground truncate mt-1">{card.back}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-destructive shrink-0 rounded-full"
                onClick={() => {
                  if(confirm("Delete this card?")) deleteCard.mutate({ id: card.id, deckId });
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </MobileLayout>
  );
}
