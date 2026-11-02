import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import Header from './components/Header';
import ChampionBanner from './components/ChampionBanner';
import HasteControls from './components/HasteControls';
import SpellCard from './components/SpellCard';
import PassiveCard from './components/PassiveCard';
import MatchupCompare from './components/MatchupCompare';
import ChampionSearchModal from './components/ChampionSearchModal';
import Footer from './components/Footer';
import { 
  getLatestPatch, 
  getChampionList, 
  getChampionDetails 
} from './services/riotApi';
import { Loader2, AlertCircle, RefreshCw, LayoutGrid, Rows } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Vercel Best Practice: bundle-dynamic-imports
// Lazy-load the heavy secondary Explanation tab to reduce initial bundle size
const ExplanationPage = lazy(() => import('./components/ExplanationPage'));

export default function App() {
  const [patch, setPatch] = useState('');
  const [champions, setChampions] = useState([]);
  const [selectedChampId, setSelectedChampId] = useState('Aatrox');
  const [championData, setChampionData] = useState(null);
  
  // Navigation: 'calculator' | 'explanation'
  const [activeTab, setActiveTab] = useState('calculator');

  // Spells layout view: 'list' | 'grid'
  const [spellsLayout, setSpellsLayout] = useState('list');

  // Haste state
  const [abilityHaste, setAbilityHaste] = useState(0);
  const [ultHaste, setUltHaste] = useState(0);

  // Matchup Mode state
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [champBId, setChampBId] = useState('Zed');
  const [champBData, setChampBData] = useState(null);
  const [hasteB, setHasteB] = useState(0);

  // Modals & UI status
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchBModalOpen, setSearchBModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Keyboard shortcut: Ctrl + K (or Cmd + K on macOS) to trigger champion search
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initial App Load
  const initApp = useCallback(async (force = false) => {
    try {
      setError(null);
      if (force) setIsRefreshing(true);
      else setIsLoading(true);

      const latestPatch = await getLatestPatch();
      setPatch(latestPatch);

      const champList = await getChampionList(latestPatch);
      setChampions(champList);

      const details = await getChampionDetails(selectedChampId, latestPatch);
      setChampionData(details);

      if (isCompareMode && champBId) {
        const detailsB = await getChampionDetails(champBId, latestPatch);
        setChampBData(detailsB);
      }
    } catch (err) {
      console.error("Failed to load Riot data:", err);
      setError("Nie udało się pobrać danych z Riot Games Data Dragon API. Sprawdź połączenie z internetem.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedChampId, champBId, isCompareMode]);

  useEffect(() => {
    initApp();
  }, [initApp]);

  // Fetch Champion A when selected
  const handleSelectChampion = async (champId) => {
    setSelectedChampId(champId);
    try {
      const details = await getChampionDetails(champId, patch);
      setChampionData(details);
    } catch (err) {
      console.error(`Failed to load champion ${champId}:`, err);
    }
  };

  // Fetch Champion B when selected in compare mode
  const handleSelectChampB = async (champId) => {
    setChampBId(champId);
    try {
      const details = await getChampionDetails(champId, patch);
      setChampBData(details);
    } catch (err) {
      console.error(`Failed to load comparison champion ${champId}:`, err);
    }
  };

  // When opening compare mode, make sure champ B data exists
  const handleToggleCompareMode = async (enable) => {
    setIsCompareMode(enable);
    if (enable && !champBData && champBId && patch) {
      try {
        const details = await getChampionDetails(champBId, patch);
        setChampBData(details);
      } catch (err) {
        console.error("Failed to load champ B:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-foreground">
      
      {/* Top Navigation */}
      <Header 
        patch={patch}
        onRefresh={() => initApp(true)}
        isRefreshing={isRefreshing}
        isCompareMode={isCompareMode}
        setIsCompareMode={handleToggleCompareMode}
        onOpenSearch={() => setSearchModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main App Container - Max Width 1200px */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-3">
        
        {/* Loading State */}
        {isLoading && (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
            <h2 className="text-sm font-semibold text-foreground">
              Łączenie z Riot Data Dragon API...
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Pobieranie najnowszych patchów i cooldownów bohaterów
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-foreground flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
              <p className="text-xs font-medium">{error}</p>
            </div>
            <Button 
              variant="outline"
              size="xs"
              onClick={() => initApp(true)}
              className="border-destructive/40 bg-destructive/20 hover:bg-destructive/30 text-destructive-foreground text-xs font-semibold gap-1.5"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Spróbuj ponownie</span>
            </Button>
          </div>
        )}

        {/* Loaded Content */}
        {!isLoading && !error && championData ? (
          <>
            {activeTab === 'explanation' ? (
              <Suspense fallback={
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <Loader2 className="w-7 h-7 text-primary animate-spin mb-3" />
                  <p className="text-xs text-muted-foreground">Loading Architecture & Documentation...</p>
                </div>
              }>
                <ExplanationPage 
                  championData={championData}
                  patch={patch}
                  champions={champions}
                  onBackToCalculator={() => setActiveTab('calculator')}
                />
              </Suspense>
            ) : (
              /* Compact Dashboard */
              <div className="space-y-2">
                
                {/* Compact Champion Banner */}
                <ChampionBanner 
                  champion={championData}
                  patch={patch}
                  onOpenSearch={() => setSearchModalOpen(true)}
                  onSelectQuickChamp={handleSelectChampion}
                />

                {/* Matchup Comparison (Versus 1v1) */}
                {isCompareMode ? (
                  <MatchupCompare 
                    champA={championData}
                    champB={champBData}
                    hasteA={abilityHaste}
                    hasteB={hasteB}
                    setHasteB={setHasteB}
                    patch={patch}
                    onOpenSearchB={() => setSearchBModalOpen(true)}
                    onClose={() => setIsCompareMode(false)}
                  />
                ) : null}

                {/* Compact Haste Controller */}
                <HasteControls 
                  haste={abilityHaste}
                  setHaste={setAbilityHaste}
                  ultHaste={ultHaste}
                  setUltHaste={setUltHaste}
                />

                {/* Slim Innate Passive Strip */}
                {championData.passive ? (
                  <PassiveCard 
                    passive={championData.passive} 
                    patch={patch} 
                  />
                ) : null}

                {/* Spells Header with Layout Toggle (List vs 2x2 Grid) */}
                <div className="flex items-center justify-between px-1 pt-1 pb-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Abilities Q, W, E, R
                    </span>
                    <Badge variant="outline" className="text-[10px] tabular-nums text-primary bg-primary/10 border-primary/30 px-1.5 py-0">
                      {abilityHaste} AH Active
                    </Badge>
                  </div>

                  {/* Grid vs List toggle */}
                  <div className="flex items-center gap-1 bg-secondary/80 p-0.5 rounded border border-border">
                    <Button
                      variant={spellsLayout === 'list' ? 'secondary' : 'ghost'}
                      size="icon-xs"
                      onClick={() => setSpellsLayout('list')}
                      className={`h-6 w-6 transition ${
                        spellsLayout === 'list' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title="Single column list view"
                    >
                      <Rows className="w-3 h-3" />
                    </Button>
                    <Button
                      variant={spellsLayout === 'grid' ? 'secondary' : 'ghost'}
                      size="icon-xs"
                      onClick={() => setSpellsLayout('grid')}
                      className={`h-6 w-6 transition ${
                        spellsLayout === 'grid' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title="2x2 Compact Grid view"
                    >
                      <LayoutGrid className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Compact Spells */}
                <div className={spellsLayout === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-2" : "space-y-2"}>
                  {championData.spells?.map((spell, index) => (
                    <SpellCard 
                      key={spell.id || index}
                      spell={spell}
                      index={index}
                      patch={patch}
                      abilityHaste={abilityHaste}
                      ultHaste={ultHaste}
                    />
                  ))}
                </div>

              </div>
            )}
          </>
        ) : null}

      </main>

      {/* Footer - Max Width 1200px */}
      <Footer patch={patch} />

      {/* Primary Champion Search Modal */}
      <ChampionSearchModal 
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        champions={champions}
        onSelectChampion={handleSelectChampion}
        currentChampionId={selectedChampId}
        patch={patch}
        title="Select Champion"
      />

      {/* Opponent Champion Search Modal */}
      <ChampionSearchModal 
        isOpen={searchBModalOpen}
        onClose={() => setSearchBModalOpen(false)}
        champions={champions}
        onSelectChampion={handleSelectChampB}
        currentChampionId={champBId}
        patch={patch}
        title="Select Opponent Champion"
      />

    </div>
  );
}
