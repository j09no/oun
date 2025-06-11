import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { DigitalClock } from "@/components/digital-clock";
import { SettingsOverlay } from "@/components/settings-overlay";
import { BottomNavigation } from "@/components/bottom-navigation";
import Dashboard from "@/pages/dashboard";
import Chapters from "@/pages/chapters";
import Quiz from "./pages/quiz";
import Analytics from "./pages/analytics";
import Storage from "./pages/storage";
import Chat from "./pages/chat";
import Calendar from "./pages/calendar";
import ChapterDetails from "./pages/chapter-details";
import NotFound from "./pages/not-found";
import { BrainCircuit } from "lucide-react";

function Router() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [location] = useLocation();

  // Check if current page is dashboard/home
  const isHomePage = location === "/" || location === "/dashboard";

  return (
    <div className="bg-[#18181b] text-white min-h-screen overflow-x-hidden">
      {/* Header - Only show on home/dashboard page */}
      {isHomePage && (
        <header className="fixed top-0 left-0 right-0 z-50">
          <div className="mx-4 mt-4">
            <div className="glass-morphism">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center ios-shadow-sm backdrop-blur-lg">
                    <BrainCircuit className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold gradient-text">NEET Prep Pro</h1>
                    <p className="text-xs text-gray-400">
                      Today is {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                <DigitalClock />
              </div>
            </div>
          </div>
        </header>
      )}

      <main className={`pb-32 px-4 ${isHomePage ? 'pt-28' : 'pt-4'}`}>
        <Switch>
          <Route path="/" component={() => <Dashboard />} />
          <Route path="/dashboard" component={() => <Dashboard />} />
          <Route path="/chapters" component={() => <Chapters />} />
          <Route path="/chapter/:id">
            {params => <ChapterDetails chapterId={params.id} />}
          </Route>
          <Route path="/quiz" component={Quiz} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/storage" component={Storage} />
          <Route path="/chat" component={Chat} />
          <Route path="/calendar" component={Calendar} />
          <Route component={NotFound} />
        </Switch>
      </main>

      <BottomNavigation />
      <SettingsOverlay />
    </div>
  );
}

function App() {
  useEffect(() => {
    // Set dark mode by default
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;