import React, { useState, useEffect, useRef, useMemo, useDeferredValue } from 'react';
import { Search, X, Users, CornerDownLeft, Sparkles } from 'lucide-react';
import { getChampionIconUrl } from '../services/riotApi';
import { CHAMPION_ROLES, LANE_ROLES } from '../data/championRoles';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ChampionSearchModal({ 
  isOpen, 
  onClose, 
  champions, 
  onSelectChampion, 
  currentChampionId,
  patch,
  title = "Select Champion"
}) {
  const [query, setQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Vercel Best Practice: rerender-use-deferred-value
  const deferredQuery = useDeferredValue(query);

  const inputRef = useRef(null);
  const itemRefs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setFocusedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [isOpen]);

  // Optimized memoized search filter with lane role filtering (supports multi-role champions)
  const filtered = useMemo(() => {
    if (!champions || champions.length === 0) return [];
    const q = deferredQuery.trim().toLowerCase();
    
    return champions.filter(champ => {
      const champId = champ.id;
      const champName = champ.name.toLowerCase();
      const matchesQuery = !q || champName.includes(q) || champId.toLowerCase().includes(q);
      
      if (!matchesQuery) return false;
      if (selectedRole === 'All') return true;

      // Check assigned lane roles
      const laneRoles = CHAMPION_ROLES[champId] || [];
      return laneRoles.includes(selectedRole);
    });
  }, [champions, deferredQuery, selectedRole]);

  // Reset focused item to 0 on search query or role change
  useEffect(() => {
    setFocusedIndex(0);
  }, [query, selectedRole]);

  // Ensure active keyboard-selected item is visible in scroll container
  useEffect(() => {
    if (itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [focusedIndex]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }

    if (filtered.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => (prev < filtered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const targetChamp = filtered[focusedIndex] || filtered[0];
      if (targetChamp) {
        onSelectChampion(targetChamp.id);
        onClose();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="max-w-[1000px] w-[95vw] bg-card border-border text-foreground p-0 overflow-hidden shadow-2xl rounded-2xl gap-0"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Search and filter champions by lane role (Top, Jungle, Mid, ADC, Support)</DialogDescription>
        </DialogHeader>

        {/* Search Header Bar */}
        <div className="p-4 border-b border-border bg-card/95 flex items-center gap-3">
          <Search className="w-5 h-5 text-primary shrink-0 ml-1" />
          <Input 
            ref={inputRef}
            type="text"
            placeholder="Search champion (e.g. Sett, Diana, Ahri)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:outline-none p-0 h-auto shadow-none font-medium"
          />
          {query && (
            <Button 
              variant="ghost"
              size="icon-xs"
              onClick={() => setQuery('')}
              className="text-muted-foreground hover:text-foreground h-7 w-7"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <kbd className="px-2 py-1 text-xs bg-secondary/80 border border-border rounded text-muted-foreground font-mono">
              Ctrl+K
            </kbd>
            <kbd className="px-2 py-1 text-xs bg-secondary/80 border border-border rounded text-muted-foreground font-mono">
              Esc
            </kbd>
          </div>
        </div>

        {/* Roles Filter Bar (Lanes: Top, Jungle, Mid, ADC, Support) */}
        <div className="px-4 py-2.5 bg-secondary/40 border-b border-border flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider mr-1">
              Role:
            </span>
            {LANE_ROLES.map((role) => {
              const isSelected = selectedRole === role;
              return (
                <Button
                  key={role}
                  variant={isSelected ? 'default' : 'outline'}
                  size="xs"
                  onClick={() => setSelectedRole(role)}
                  className={`h-7 px-3 text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs'
                      : 'border-border bg-background/60 text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  {role}
                </Button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <span>Wyniki:</span>
            <span className="text-primary font-bold">{filtered.length}</span>
            <span>bohaterów</span>
          </div>
        </div>

        {/* Champions Grid List - Expanded to 1000px modal */}
        <div className="p-4 max-h-[520px] overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 scrollbar-thin">
          {filtered.length === 0 ? (
            <div className="col-span-full py-16 text-center text-muted-foreground flex flex-col items-center justify-center">
              <Users className="w-10 h-10 text-muted-foreground/30 mb-2" />
              <p className="text-sm font-semibold">Nie znaleziono bohatera</p>
              <p className="text-xs text-muted-foreground/80 mt-1">
                Brak wyników dla zapytania "{query}" w roli "{selectedRole}"
              </p>
            </div>
          ) : (
            filtered.map((champ, index) => {
              const isSelected = champ.id === currentChampionId;
              const isKeyboardFocused = index === focusedIndex;
              const laneRoles = CHAMPION_ROLES[champ.id] || [];

              return (
                <button
                  key={champ.id}
                  ref={(el) => (itemRefs.current[index] = el)}
                  onClick={() => {
                    onSelectChampion(champ.id);
                    onClose();
                  }}
                  onMouseEnter={() => setFocusedIndex(index)}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all ${
                    isKeyboardFocused
                      ? 'bg-primary/15 border-primary ring-1 ring-primary/40 shadow-xs'
                      : isSelected 
                        ? 'bg-secondary/90 border-primary/40' 
                        : 'bg-card/70 border-border/70 hover:bg-secondary/70 hover:border-border'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg overflow-hidden border border-border bg-muted shrink-0 relative">
                    <img 
                      src={getChampionIconUrl(champ.id, patch)} 
                      alt={champ.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/29.jpg';
                      }}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-xs font-bold truncate ${
                        isKeyboardFocused ? 'text-primary' : 'text-foreground'
                      }`}>
                        {champ.name}
                      </span>
                      {isKeyboardFocused && (
                        <CornerDownLeft className="w-3 h-3 text-primary shrink-0 opacity-80" />
                      )}
                    </div>

                    {/* Assigned Roles Tags */}
                    <div className="flex items-center gap-1 mt-0.5 overflow-hidden">
                      {laneRoles.slice(0, 2).map((r) => (
                        <span 
                          key={r}
                          className="text-[9px] font-semibold px-1 py-0 rounded bg-secondary/80 text-muted-foreground border border-border/80"
                        >
                          {r}
                        </span>
                      ))}
                      {laneRoles.length > 2 && (
                        <span className="text-[8px] text-muted-foreground font-mono">
                          +{laneRoles.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Modal Footer hint */}
        <div className="px-4 py-2 bg-secondary/60 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-mono">
          <div className="flex items-center gap-2">
            <span>Używaj roli lub wpisz nazwę</span>
          </div>
          <div className="flex items-center gap-3">
            <span>↓↑ poruszaj się</span>
            <span>↵ zatwierdź wybór</span>
            <span>Esc zamknij</span>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
