import { Link, useLocation } from "wouter";
import { Home, Folder, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="mobile-app-container">
      <main className="flex-1 overflow-y-auto no-scrollbar pb-20">
        {children}
      </main>
      
      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 w-full bg-background/80 backdrop-blur-xl border-t border-border z-50 px-6 py-4 flex justify-between items-center pb-safe">
        <NavItem href="/" icon={<Home className="w-6 h-6" />} label="Home" active={location === "/"} />
        <NavItem href="/decks" icon={<Folder className="w-6 h-6" />} label="Decks" active={location.startsWith("/decks")} />
        <NavItem href="/settings" icon={<SettingsIcon className="w-6 h-6" />} label="Settings" active={location === "/settings"} />
      </nav>
    </div>
  );
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Link href={href} className={cn(
      "flex flex-col items-center gap-1 transition-colors duration-200",
      active ? "text-primary" : "text-muted-foreground hover:text-foreground"
    )}>
      <div className={cn(
        "p-1.5 rounded-xl transition-all duration-300",
        active && "bg-primary/10"
      )}>
        {icon}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
