import React from 'react';
import { ExternalLink, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Footer({ patch }) {
  return (
    <footer className="mt-8 border-t border-border/80 bg-background/95 py-5 text-xs text-muted-foreground">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Left: Branding & Disclaimer */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-center sm:text-left">
          <span className="font-semibold text-foreground">
            lol<span className="text-primary">cooldowns</span>
          </span>
          <span className="hidden sm:inline text-border">•</span>
          <span className="text-[11px] text-muted-foreground/80">
            Ability Haste & Matchup Tool • Patch {patch || 'Live'}
          </span>
        </div>

        {/* Right: Links & Credits */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="xs"
            asChild
            className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1.5"
          >
            <a 
              href="https://github.com/andkz/lolcooldowns" 
              target="_blank" 
              rel="noreferrer"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          </Button>

          <Button
            variant="ghost"
            size="xs"
            asChild
            className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1.5"
          >
            <a 
              href="https://developer.riotgames.com" 
              target="_blank" 
              rel="noreferrer"
            >
              <span>Data Dragon</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </Button>
        </div>

      </div>
    </footer>
  );
}
