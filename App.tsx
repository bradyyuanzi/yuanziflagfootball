
import React, { useState, useEffect } from 'react';
import { Player, PlayerStats, StatType, getStatType, QBStats, SkillStats, DefenseStats, getInitialStats, Position, TrainingSession } from './types';
import PlayerCard from './components/PlayerCard';
import PlayerRadarChart from './components/PlayerRadarChart';
import StatEditModal from './components/StatEditModal';
import TrainingModal from './components/TrainingModal';
import RankingModal from './components/RankingModal';
import { generatePlayerAnalysis } from './services/geminiService';
import { Trophy, ArrowLeft, Activity, Edit2, Zap, Target, Menu, Plus, Users, ShieldAlert, TrendingUp, Calendar, Medal } from 'lucide-react';

// --- MOCK DATA GENERATOR ---
const generateMockPlayers = (): Player[] => {
  return [
    {
      id: '1',
      name: '李雷',
      number: 12,
      positions: ['QB', 'S'],
      ageGroup: 'U12',
      avatar: 'https://picsum.photos/200/200?random=1',
      stats: {
        'QB': {
            passAttempts: 150,
            passCompletions: 98,
            passYards: 1250,
            passTDs: 18,
            interceptionsThrown: 4,
            sacksTaken: 2
        } as QBStats,
        'S': {
            flagPullsAttempts: 15,
            flagPullsSuccess: 12,
            interceptionsCaught: 2,
            passDeflections: 5,
            sacksMade: 0,
            defensiveTDs: 0
        } as DefenseStats
      }
    },
    {
      id: '2',
      name: '韩梅梅',
      number: 88,
      positions: ['WR', 'CB'],
      ageGroup: 'U10',
      avatar: 'https://picsum.photos/200/200?random=2',
      stats: {
        'WR': {
            targets: 60,
            catches: 45,
            receivingYards: 680,
            receivingTDs: 8,
            rushingYards: 120,
            rushingTDs: 1
        } as SkillStats,
        'CB': {
            flagPullsAttempts: 25,
            flagPullsSuccess: 20,
            interceptionsCaught: 3,
            passDeflections: 8,
            sacksMade: 0,
            defensiveTDs: 1
        } as DefenseStats
      }
    },
    {
      id: '3',
      name: '张伟',
      number: 52,
      positions: ['LB'],
      ageGroup: 'U12',
      avatar: 'https://picsum.photos/200/200?random=3',
      stats: {
        'LB': {
            flagPullsAttempts: 40,
            flagPullsSuccess: 35,
            interceptionsCaught: 3,
            passDeflections: 8,
            sacksMade: 5,
            defensiveTDs: 1
        } as DefenseStats
      }
    },
    {
      id: '4',
      name: '王强',
      number: 21,
      positions: ['CB'],
      ageGroup: 'U8',
      avatar: 'https://picsum.photos/200/200?random=4',
      stats: {
        'CB': {
            flagPullsAttempts: 25,
            flagPullsSuccess: 20,
            interceptionsCaught: 5,
            passDeflections: 12,
            sacksMade: 0,
            defensiveTDs: 2
        } as DefenseStats
      }
    },
     {
      id: '5',
      name: '刘波',
      number: 26,
      positions: ['RB', 'RUSH'],
      ageGroup: 'U6',
      avatar: 'https://picsum.photos/200/200?random=5',
      stats: {
        'RB': {
            targets: 20,
            catches: 15,
            receivingYards: 120,
            receivingTDs: 1,
            rushingYards: 450,
            rushingTDs: 5
        } as SkillStats,
        'RUSH': {
            flagPullsAttempts: 10,
            flagPullsSuccess: 5,
            interceptionsCaught: 0,
            passDeflections: 2,
            sacksMade: 8,
            defensiveTDs: 0
        } as DefenseStats
      }
    }
  ];
};

const App: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  
  // Modal States
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null); 
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [isRankingModalOpen, setIsRankingModalOpen] = useState(false);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [filterType, setFilterType] = useState<string>('全部');
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);

  useEffect(() => {
    // Load Players
    const saved = localStorage.getItem('hc_players_v2');
    if (saved) {
      setPlayers(JSON.parse(saved));
    } else {
      setPlayers(generateMockPlayers());
    }

    // Load Training
    const savedTraining = localStorage.getItem('hc_training_v1');
    if (savedTraining) {
        setTrainingSessions(JSON.parse(savedTraining));
    }
  }, []);

  const savePlayers = (newPlayers: Player[]) => {
    setPlayers(newPlayers);
    localStorage.setItem('hc_players_v2', JSON.stringify(newPlayers));
  };

  const handleSavePlayer = (playerData: Player) => {
    // Check if updating existing or adding new
    const exists = players.some(p => p.id === playerData.id);
    let newPlayers: Player[];
    
    if (exists) {
        newPlayers = players.map(p => p.id === playerData.id ? playerData : p);
        if (selectedPlayer && selectedPlayer.id === playerData.id) {
            setSelectedPlayer(playerData);
        }
    } else {
        newPlayers = [...players, playerData];
    }
    
    savePlayers(newPlayers);
    setIsEditModalOpen(false);
  };

  const handleDeletePlayer = (playerId: string) => {
      const newPlayers = players.filter(p => p.id !== playerId);
      savePlayers(newPlayers);
      if (selectedPlayer?.id === playerId) {
          setSelectedPlayer(null);
      }
      setIsEditModalOpen(false);
  };

  const handleSaveTraining = (sessions: TrainingSession[]) => {
      setTrainingSessions(sessions);
      localStorage.setItem('hc_training_v1', JSON.stringify(sessions));
  };

  const openAddModal = () => {
      setEditingPlayer(null); // Null means add mode
      setIsEditModalOpen(true);
  };

  const openEditModal = (player: Player) => {
      setEditingPlayer(player);
      setIsEditModalOpen(true);
  };

  const handleAIAnalysis = async () => {
    if (!selectedPlayer) return;
    setIsAnalyzing(true);
    const analysis = await generatePlayerAnalysis(selectedPlayer);
    const updatedPlayer = { ...selectedPlayer, aiAnalysis: analysis };
    
    // Update local state and storage
    const newPlayers = players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p);
    savePlayers(newPlayers);
    setSelectedPlayer(updatedPlayer);
    
    setIsAnalyzing(false);
  };

  // --- STAT DISPLAY HELPERS ---
  const StatBox = ({ label, value, subLabel }: { label: string, value: string | number, subLabel?: string }) => (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-2 md:p-3 flex flex-col items-center justify-center relative overflow-hidden group">
       <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
       <span className="text-xl md:text-2xl font-mono font-bold text-white group-hover:text-tech-orange transition-colors">{value}</span>
       <span className="text-[10px] text-slate-400 uppercase mt-1 text-center">{label}</span>
       {subLabel && <span className="text-[10px] text-tech-blue mt-0.5">{subLabel}</span>}
    </div>
  );

  const renderStats = (position: Position, stats: PlayerStats) => {
    const type = getStatType(position);
    
    if (type === StatType.OFFENSE_QB) {
      const s = stats as QBStats;
      const compRate = s.passAttempts > 0 ? ((s.passCompletions / s.passAttempts) * 100).toFixed(1) : '0.0';
      return (
        <>
          <StatBox label="传球码数" value={s.passYards} />
          <StatBox label="达阵 (TDs)" value={s.passTDs} />
          <StatBox label="成功率" value={`${compRate}%`} subLabel={`${s.passCompletions}/${s.passAttempts}`} />
          <StatBox label="被抄截" value={s.interceptionsThrown} />
          <StatBox label="被擒杀" value={s.sacksTaken} />
        </>
      );
    } else if (type === StatType.OFFENSE_SKILL) {
      const s = stats as SkillStats;
      const catchRate = s.targets > 0 ? ((s.catches / s.targets) * 100).toFixed(1) : '0.0';
      return (
        <>
          <StatBox label="总码数" value={s.receivingYards + s.rushingYards} />
          <StatBox label="总达阵" value={s.receivingTDs + s.rushingTDs} />
          <StatBox label="接球成功率" value={`${catchRate}%`} subLabel={`${s.catches}/${s.targets}`} />
          <StatBox label="接球码数" value={s.receivingYards} />
          <StatBox label="跑球码数" value={s.rushingYards} />
        </>
      );
    } else {
      const s = stats as DefenseStats;
      const pullRate = s.flagPullsAttempts > 0 ? ((s.flagPullsSuccess / s.flagPullsAttempts) * 100).toFixed(1) : '0.0';
      return (
        <>
          <StatBox label="拔旗成功" value={s.flagPullsSuccess} />
          <StatBox label="成功率" value={`${pullRate}%`} subLabel={`${s.flagPullsSuccess}/${s.flagPullsAttempts}`} />
          <StatBox label="抄截" value={s.interceptionsCaught} />
          <StatBox label="破坏传球" value={s.passDeflections} />
          <StatBox label="擒杀" value={s.sacksMade} />
        </>
      );
    }
  };

  // --- DASHBOARD WIDGETS ---
  const TeamDashboard = () => {
      return (
          <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl relative overflow-hidden flex flex-col items-center justify-center shadow-lg">
                  <div className="absolute top-0 right-0 p-2 opacity-10"><Users size={40} /></div>
                  <div className="text-2xl font-black text-white">{players.length}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">注册球员</div>
              </div>
              
              <div 
                onClick={() => setIsTrainingModalOpen(true)}
                className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl relative overflow-hidden flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800 hover:border-tech-orange/50 transition-all shadow-lg group"
              >
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity"><Calendar size={40} /></div>
                  <div className="text-2xl font-black text-tech-orange">{trainingSessions.length}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 group-hover:text-tech-orange transition-colors">本周训练</div>
              </div>

              <div 
                onClick={() => setIsRankingModalOpen(true)}
                className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl relative overflow-hidden flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800 hover:border-tech-blue/50 transition-all shadow-lg group"
              >
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity"><Medal size={40} /></div>
                  <div className="text-lg font-bold text-tech-blue group-hover:scale-110 transition-transform">查看</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 group-hover:text-tech-blue transition-colors">球员表现排名</div>
              </div>
          </div>
      )
  };

  const filteredPlayers = players.filter(p => {
      if (filterType === '全部') return true;
      return p.ageGroup === filterType;
  });

  if (selectedPlayer) {
    // PLAYER DETAIL VIEW
    return (
      <div className="min-h-screen bg-tech-bg text-slate-200 pb-20">
        <StatEditModal 
            player={editingPlayer} 
            isOpen={isEditModalOpen} 
            onClose={() => setIsEditModalOpen(false)} 
            onSave={handleSavePlayer} 
            onDelete={handleDeletePlayer}
        />

        {/* Header */}
        <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-700 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button 
              onClick={() => setSelectedPlayer(null)}
              className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <ArrowLeft size={20} /> <span className="text-sm font-semibold">返回列表</span>
            </button>
            <div className="text-center">
                <div className="text-tech-orange text-xs font-bold tracking-widest uppercase">HongCheng Sports</div>
            </div>
            <button 
              onClick={() => openEditModal(selectedPlayer)}
              className="p-2 -mr-2 text-tech-blue hover:text-white transition-colors"
            >
              <Edit2 size={20} />
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto p-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Hero Profile */}
          <div className="flex flex-col items-center pt-4">
            <div className="w-28 h-28 rounded-full border-4 border-slate-700 bg-slate-800 overflow-hidden shadow-2xl relative ring-2 ring-tech-orange/20">
              <img src={selectedPlayer.avatar} alt={selectedPlayer.name} className="w-full h-full object-cover" />
            </div>
            <h2 className="mt-3 text-3xl font-black text-white">{selectedPlayer.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-tech-orange text-white text-xs font-bold px-2 py-0.5 rounded">#{selectedPlayer.number}</span>
              <span className="bg-slate-700 text-slate-300 text-xs font-bold px-2 py-0.5 rounded">{selectedPlayer.ageGroup}</span>
              <div className="flex gap-1">
                  {selectedPlayer.positions.map(pos => (
                      <span key={pos} className="text-slate-400 font-mono tracking-wider text-xs border border-slate-700 px-1 rounded">{pos}</span>
                  ))}
              </div>
            </div>
          </div>

          {/* Radar Charts Area */}
          <div className={`grid gap-4 ${selectedPlayer.positions.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
            {selectedPlayer.positions.map((pos) => {
                const stats = selectedPlayer.stats[pos];
                if (!stats) return null;
                return (
                    <div key={pos} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 shadow-inner h-80">
                        <div className="flex items-center gap-2 mb-2 text-tech-blue">
                        <Activity size={18} />
                        <h3 className="text-sm font-bold uppercase tracking-wider">{pos} 能力雷达</h3>
                        </div>
                        <PlayerRadarChart stats={stats} position={pos} playerName={selectedPlayer.name} />
                    </div>
                )
            })}
          </div>

          {/* Stats Grid - Grouped by Position */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-tech-orange">
              <Target size={18} />
              <h3 className="text-sm font-bold uppercase tracking-wider">核心数据</h3>
            </div>
            
            {selectedPlayer.positions.map(pos => {
                const stats = selectedPlayer.stats[pos];
                if (!stats) return null;
                return (
                    <div key={pos} className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                         <h4 className="text-xs font-bold text-slate-500 mb-3 border-b border-slate-800 pb-1 flex justify-between">
                            <span>{pos} 数据面板</span>
                            <span className="text-slate-600 font-mono">SEASON 2024</span>
                         </h4>
                         <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                             {renderStats(pos, stats)}
                         </div>
                    </div>
                );
            })}
          </div>

          {/* AI Analysis */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
             {/* Decorative Background */}
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Zap size={120} />
             </div>
             
             <div className="relative z-10">
               <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-2 text-purple-400">
                    <Zap size={20} fill="currentColor" />
                    <h3 className="text-lg font-bold">AI 教练点评</h3>
                 </div>
                 <button 
                  onClick={handleAIAnalysis}
                  disabled={isAnalyzing}
                  className={`text-xs px-3 py-1.5 rounded border transition-all ${isAnalyzing ? 'border-slate-600 text-slate-500 cursor-wait' : 'border-purple-500 text-purple-400 hover:bg-purple-500/10'}`}
                 >
                   {isAnalyzing ? '分析中...' : selectedPlayer.aiAnalysis ? '重新生成' : '生成报告'}
                 </button>
               </div>
               
               {selectedPlayer.aiAnalysis ? (
                 <div className="text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                   {selectedPlayer.aiAnalysis}
                 </div>
               ) : (
                 <div className="text-sm text-slate-500 italic text-center py-4">
                   点击“生成报告”获取由 Gemini 驱动的个性化表现分析。
                 </div>
               )}
             </div>
          </div>

        </main>
      </div>
    );
  }

  // PLAYER LIST VIEW
  return (
    <div className="min-h-screen bg-tech-bg text-slate-200 relative">
      <StatEditModal 
        player={editingPlayer} 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSave={handleSavePlayer} 
        onDelete={handleDeletePlayer}
      />

      <TrainingModal 
        isOpen={isTrainingModalOpen}
        onClose={() => setIsTrainingModalOpen(false)}
        sessions={trainingSessions}
        onSave={handleSaveTraining}
      />

      <RankingModal
        isOpen={isRankingModalOpen}
        onClose={() => setIsRankingModalOpen(false)}
        players={players}
      />
      
      {/* Navbar */}
      <nav className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-700 px-4 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-gradient-to-tr from-tech-orange to-red-500 rounded flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Trophy size={16} className="text-white" />
             </div>
             <div>
               <h1 className="text-xl font-black text-white tracking-tight italic">鸿橙体育</h1>
               <p className="text-[10px] text-tech-orange tracking-widest uppercase">Flag Football Analytics</p>
             </div>
          </div>
          <button className="text-slate-400">
            <Menu size={24} />
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-4 pb-24">
        <TeamDashboard />

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-2">
          {['全部', 'U6', 'U8', 'U10', 'U12'].map((filter) => (
             <button 
               key={filter} 
               onClick={() => setFilterType(filter)}
               className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filterType === filter ? 'bg-tech-orange text-white shadow-lg shadow-orange-500/25 scale-105' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
             >
               {filter}
             </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPlayers.length > 0 ? (
              filteredPlayers.map(player => (
                <PlayerCard key={player.id} player={player} onClick={setSelectedPlayer} />
              ))
          ) : (
              <div className="col-span-full py-12 text-center text-slate-500 flex flex-col items-center">
                  <Users size={48} className="mb-2 opacity-50" />
                  <p>该年龄组暂无球员，点击右下角添加</p>
              </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="mt-12 text-center text-slate-600 text-xs py-8">
          <p>© 2024 鸿橙体育腰旗橄榄球. Powered by React & Gemini.</p>
        </div>
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={openAddModal}
        className="fixed bottom-6 right-6 w-14 h-14 bg-tech-orange hover:bg-tech-orange-dark text-white rounded-full shadow-2xl shadow-orange-500/40 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 z-40"
      >
        <Plus size={28} />
      </button>
    </div>
  );
};

export default App;
