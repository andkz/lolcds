import React from 'react';
import { Swords, RefreshCw, Search, BookOpen, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Header({ 
  patch, 
  onRefresh, 
  isRefreshing, 
  isCompareMode, 
  setIsCompareMode,
  onOpenSearch,
  activeTab = 'calculator',
  setActiveTab
}) {
  return (
    <header className="border-b border-border/80 bg-background/90 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
        
        {/* Brand & Tabs */}
        <div className="flex items-center gap-4">
          <div 
            onClick={() => setActiveTab('calculator')}
            className="flex items-center cursor-pointer select-none"
          >
            <span className="font-bold tracking-tight text-foreground text-xs sm:text-sm">
              lol<span className="text-primary">cooldowns</span>
            </span>
          </div>

          {/* Navigation Tabs styled with shadcn buttons */}
          <div className="flex items-center bg-secondary/80 p-0.5 rounded-lg border border-border">
            <Button
              variant={activeTab === 'calculator' ? 'secondary' : 'ghost'}
              size="xs"
              onClick={() => setActiveTab('calculator')}
              className={`h-7 px-2.5 text-[11px] font-semibold gap-1.5 transition ${
                activeTab === 'calculator'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutDashboard className="w-3 h-3" />
              <span>Calculator</span>
            </Button>

            <Button
              variant={activeTab === 'explanation' ? 'default' : 'ghost'}
              size="xs"
              onClick={() => setActiveTab('explanation')}
              className={`h-7 px-2.5 text-[11px] font-semibold gap-1.5 transition ${
                activeTab === 'explanation'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BookOpen className="w-3 h-3" />
              <span>How it works</span>
            </Button>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Search Shortcut Trigger with Ctrl+K */}
          <Button
            variant="outline"
            size="xs"
            onClick={onOpenSearch}
            className="h-7 px-2.5 hidden sm:flex items-center gap-2 bg-secondary/60 hover:bg-secondary border-border text-muted-foreground hover:text-foreground text-xs"
          >
            <Search className="w-3 h-3" />
            <span>Search champ</span>
            <kbd className="px-1.5 py-0.5 text-[10px] bg-background/80 border border-border rounded text-muted-foreground font-mono">
              Ctrl+K
            </kbd>
          </Button>

          {/* Matchup Compare Toggle Button */}
          <Button
            variant={isCompareMode ? 'default' : 'outline'}
            size="xs"
            onClick={() => setIsCompareMode(!isCompareMode)}
            className={`h-7 px-2.5 text-xs font-semibold gap-1.5 transition ${
              isCompareMode 
                ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90' 
                : 'bg-secondary/60 hover:bg-secondary text-foreground border-border'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Matchup</span>
          </Button>

          {/* Patch Badge & Sync */}
          <div className="flex items-center gap-1.5 pl-1.5 border-l border-border/80">
            <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0.5 border-border bg-secondary/50 text-muted-foreground">
              v{patch || '..'}
            </Badge>

            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Odśwież dane z Riot API"
              className="text-muted-foreground hover:text-foreground h-7 w-7"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
            </Button>
          </div>
        </div>

      </div>
    </header>
  );
}
