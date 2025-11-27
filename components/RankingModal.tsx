
import React, { useState } from 'react';
import { Player, Position, getStatType, StatType, QBStats, SkillStats, DefenseStats } from '../types';
import { X, Trophy, ArrowUp, ArrowDown } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
}

const POSITIONS: Position[] = ['QB', 'WR', 'RB', 'CB', 'LB', 'S', 'RUSH'];

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

const RankingModal: React.FC<Props> = ({ isOpen, onClose, players }) => {
  const [activePos, setActivePos] = useState<Position>('QB');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'rating', direction: 'desc' });

  if (!isOpen) return null;

  // 1. Filter Players by Position
  const filteredPlayers = players.filter(p => p.positions.includes(activePos) && p.stats[activePos]);

  // 2. Define Columns based on Position Type
  const statType = getStatType(activePos);
  
  let columns: { key: string, label: string }[] = [];
  if (statType === StatType.OFFENSE_QB) {
    columns = [
        { key: 'passYards', label: '传球码数' },
        { key: 'passTDs', label: '达阵' },
        { key: 'passCompletions', label: '成功数' },
        { key: 'interceptionsThrown', label: '被抄截' }, // Lower is better usually, but simplified sorting here
        { key: 'sacksTaken', label: '被擒杀' },
    ];
  } else if (statType === StatType.OFFENSE_SKILL) {
    columns = [
        { key: 'receivingYards', label: '接球码数' },
        { key: 'catches', label: '接球数' },
        { key: 'receivingTDs', label: '接球达阵' },
        { key: 'rushingYards', label: '跑球码数' },
        { key: 'rushingTDs', label: '跑球达阵' },
    ];
  } else {
    columns = [
        { key: 'flagPullsSuccess', label: '拔旗成功' },
        { key: 'interceptionsCaught', label: '抄截' },
        { key: 'passDeflections', label: '破坏传球' },
        { key: 'sacksMade', label: '擒杀' },
        { key: 'defensiveTDs', label: '防守达阵' },
    ];
  }

  // 3. Sort Logic
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
      const statsA = (a.stats[activePos] as any);
      const statsB = (b.stats[activePos] as any);
      const valA = statsA[sortConfig.key] || 0;
      const valB = statsB[sortConfig.key] || 0;

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
  });

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="text-yellow-500" size={24} /> 球员表现排名
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Position Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-800 p-2 gap-2 no-scrollbar">
            {POSITIONS.map(pos => (
                <button
                    key={pos}
                    onClick={() => setActivePos(pos)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                        activePos === pos 
                        ? 'bg-tech-orange text-white shadow-lg shadow-orange-500/20' 
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                >
                    {pos}
                </button>
            ))}
        </div>

        {/* Table */}
        <div className="p-0 overflow-auto custom-scrollbar flex-1">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-800/50 sticky top-0 z-10">
                    <tr>
                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-16">排名</th>
                        <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">球员</th>
                        {columns.map(col => (
                            <th 
                                key={col.key}
                                onClick={() => handleSort(col.key)}
                                className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-tech-blue transition-colors select-none text-center"
                            >
                                <div className="flex items-center justify-center gap-1">
                                    {col.label}
                                    {sortConfig.key === col.key && (
                                        sortConfig.direction === 'desc' ? <ArrowDown size={12} /> : <ArrowUp size={12} />
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {sortedPlayers.map((player, index) => {
                        const stats = (player.stats[activePos] as any);
                        return (
                            <tr key={player.id} className="hover:bg-slate-800/50 transition-colors">
                                <td className="p-4 text-center">
                                    {index < 3 ? (
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                            index === 0 ? 'bg-yellow-500 text-black' :
                                            index === 1 ? 'bg-slate-300 text-black' :
                                            'bg-orange-700 text-white'
                                        }`}>
                                            {index + 1}
                                        </div>
                                    ) : (
                                        <span className="text-slate-500 font-mono">{index + 1}</span>
                                    )}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
                                            <img src={player.avatar} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-sm">{player.name}</div>
                                            <div className="text-[10px] text-slate-500">{player.ageGroup} | #{player.number}</div>
                                        </div>
                                    </div>
                                </td>
                                {columns.map(col => (
                                    <td key={col.key} className="p-4 text-center">
                                        <span className={`font-mono text-sm ${sortConfig.key === col.key ? 'text-tech-orange font-bold' : 'text-slate-300'}`}>
                                            {stats[col.key]}
                                        </span>
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                    {sortedPlayers.length === 0 && (
                        <tr>
                            <td colSpan={columns.length + 2} className="p-8 text-center text-slate-500">
                                暂无该位置球员数据
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default RankingModal;
