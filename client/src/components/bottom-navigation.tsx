import { useLocation } from "wouter";
import { Home, BookOpen, PlayCircle, BarChart3, Calendar, FolderOpen, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/dashboard", label: "Home", icon: Home },
  { path: "/chapters", label: "Study", icon: BookOpen },
  { path: "/quiz", label: "Quiz", icon: PlayCircle },
  { path: "/calendar", label: "Calendar", icon: Calendar },
  { path: "/storage", label: "Files", icon: FolderOpen },
  { path: "/chat", label: "Chat", icon: MessageCircle },
];

export function BottomNavigation() {
  const [location, setLocation] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-4 mb-4">
        <div className="glass-morphism">
          <div className="flex items-center justify-around py-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path || (location === "/" && item.path === "/dashboard");
              
              return (
                <button
                  key={item.path}
                  onClick={() => setLocation(item.path)}
                  className={cn(
                    "flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 nav-btn",
                    "hover:bg-white/5 active:scale-95",
                    isActive ? "text-white" : "text-gray-400"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg transition-all duration-200",
                    isActive && "bg-white/10 ios-shadow-sm"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={cn(
                    "text-xs mt-1 transition-all duration-200",
                    isActive ? "font-semibold text-white" : "text-gray-400"
                  )}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
