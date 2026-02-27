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
  const [promptCase, setPromptCase] = useState("你是法学/知识解释专家，用典型案例帮助用户理解这个知识点的具体含义和应用。正面：{front}，核心答案：{back}，请举1-2个生动案例说明，不要直接复述答案。");
  const [promptMemory, setPromptMemory] = useState("你是记忆 method 专家，用口诀、联想故事、拆解技巧帮助用户记住这个知识点。正面：{front}，核心答案：{back}，生成有趣的记忆方法。");
  const [isConfigured, setIsConfigured] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check initial theme state
    setIsDark(document.documentElement.classList.contains('dark'));
    
    // Load DeepSeek API Key and Prompts
    const savedKey = localStorage.getItem('deepseek_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setIsConfigured(true);
    }
    const savedPromptCase = localStorage.getItem('prompt_case');
    if (savedPromptCase) setPromptCase(savedPromptCase);
    const savedPromptMemory = localStorage.getItem('prompt_memory');
    if (savedPromptMemory) setPromptMemory(savedPromptMemory);
  }, []);

  const toggleTheme = (checked: boolean) => {
    setIsDark(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSaveConfig = () => {
    if (apiKey.trim()) {
      localStorage.setItem('deepseek_api_key', apiKey);
      setIsConfigured(true);
    } else {
      localStorage.removeItem('deepseek_api_key');
      setIsConfigured(false);
    }
    
    localStorage.setItem('prompt_case', promptCase);
    localStorage.setItem('prompt_memory', promptMemory);

    toast({
      title: "保存成功",
      description: "配置已更新。",
    });
  };

  return (
    <MobileLayout>
      <div className="px-6 pt-12 w-full flex flex-col pb-24">
        <h1 className="text-3xl font-bold font-display mb-8">设置</h1>
        
        <div className="space-y-8 flex-1">
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 ml-2">DeepSeek AI 配置</h2>
            <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm space-y-6">
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

              <div className="space-y-2">
                <Label className="text-sm font-medium">案例分析自定义提示词</Label>
                <Input
                  value={promptCase}
                  onChange={(e) => setPromptCase(e.target.value)}
                  className="bg-secondary/30 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">辅助记忆自定义提示词</Label>
                <Input
                  value={promptMemory}
                  onChange={(e) => setPromptMemory(e.target.value)}
                  className="bg-secondary/30 border-border/50"
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
                <Button onClick={handleSaveConfig} size="sm" className="rounded-xl px-4">
                  保存配置
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
