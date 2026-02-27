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
      <div className="px-6 pt-12 w-full flex flex-col">
        <h1 className="text-3xl font-bold font-display mb-8">设置</h1>
        
        <div className="space-y-6 flex-1">
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 ml-2">外观</h2>
            <div className="bg-card border border-border/50 rounded-2xl p-1 shadow-sm">
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary rounded-lg">
                    {isDark ? <Moon className="w-5 h-5 text-foreground" /> : <Sun className="w-5 h-5 text-foreground" />}
                  </div>
                  <Label htmlFor="dark-mode" className="text-base cursor-pointer">深色模式</Label>
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
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 ml-2">关于</h2>
            <div className="bg-card border border-border/50 rounded-2xl p-1 shadow-sm">
              <div className="flex items-center gap-3 p-3 text-foreground">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Info className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-base font-medium">闪卡应用</p>
                  <p className="text-sm text-muted-foreground">简约 iOS 风格 v1.0</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </MobileLayout>
  );
}
