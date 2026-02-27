import { MobileLayout } from "@/components/MobileLayout";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Moon, Sun, Info, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [isDark, setIsDark] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check initial theme state
    setIsDark(document.documentElement.classList.contains('dark'));
    
    // Load DeepSeek API Key
    const savedKey = localStorage.getItem('deepseek_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setIsConfigured(true);
    }
  }, []);

  const toggleTheme = (checked: boolean) => {
    setIsDark(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('deepseek_api_key', apiKey);
      setIsConfigured(true);
      toast({
        title: "保存成功",
        description: "DeepSeek API Key 已安全存储。",
      });
    } else {
      localStorage.removeItem('deepseek_api_key');
      setIsConfigured(false);
      toast({
        title: "已清除",
        description: "API Key 已从存储中移除。",
      });
    }
  };

  return (
    <MobileLayout>
      <div className="px-6 pt-12 w-full flex flex-col pb-24">
        <h1 className="text-3xl font-bold font-display mb-8">设置</h1>
        
        <div className="space-y-8 flex-1">
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 ml-2">DeepSeek AI 配置</h2>
            <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Key className="w-4 h-4 text-primary" />
                  <Label htmlFor="deepseek-key" className="text-sm font-medium">API Key</Label>
                </div>
                <Input
                  id="deepseek-key"
                  type="password"
                  placeholder="请输入你的 DeepSeek API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-secondary/30 border-border/50 focus-visible:ring-primary"
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">状态:</span>
                  {isConfigured ? (
                    <span className="text-sm text-green-500 font-medium flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      已配置
                    </span>
                  ) : (
                    <span className="text-sm text-yellow-500 font-medium flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                      未配置 API Key
                    </span>
                  )}
                </div>
                <Button onClick={handleSaveKey} size="sm" className="rounded-xl px-4">
                  保存 Key
                </Button>
              </div>
            </div>
          </section>

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
