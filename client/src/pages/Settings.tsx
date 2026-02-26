import { MobileLayout } from "@/components/MobileLayout";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { Moon, Sun, Info } from "lucide-react";

export default function Settings() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial state
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = (checked: boolean) => {
    setIsDark(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <MobileLayout>
      <div className="px-6 pt-12">
        <h1 className="text-3xl font-bold font-display mb-8">Settings</h1>
        
        <div className="space-y-6">
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 ml-2">Appearance</h2>
            <div className="bg-card border border-border/50 rounded-2xl p-1 shadow-sm">
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary rounded-lg">
                    {isDark ? <Moon className="w-5 h-5 text-foreground" /> : <Sun className="w-5 h-5 text-foreground" />}
                  </div>
                  <Label htmlFor="dark-mode" className="text-base cursor-pointer">Dark Mode</Label>
                </div>
                <Switch 
                  id="dark-mode" 
                  checked={isDark} 
                  onCheckedChange={toggleTheme} 
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 ml-2">About</h2>
            <div className="bg-card border border-border/50 rounded-2xl p-1 shadow-sm">
              <div className="flex items-center gap-3 p-3 text-foreground">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Info className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-base font-medium">Flashcards App</p>
                  <p className="text-sm text-muted-foreground">Minimalist iOS Style v1.0</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </MobileLayout>
  );
}
