
import React from 'react';
import { Player } from '../types';
import { ChevronRight, Shield, Zap } from 'lucide-react';

interface Props {
  player: Player;
  onClick: (player: Player) => void;
}

const PlayerCard: React.FC<Props> = ({ player, onClick }) => {
  return (
    <div 
      onClick={() => onClick(player)}
      className="group bg-slate-800/50 border border-slate-700 hover:border-tech-orange hover:bg-slate-800 transition-all cursor-pointer rounded-xl p-4 flex items-center gap-4 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
        <span className="text-5xl font-black italic text-white tracking-tighter">
          {player.ageGroup}
        </span>
      </div>

      <div className="relative z-10 w-16 h-16 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center overflow-hidden shrink-0">
         <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 relative z-10">
        <div className="flex justify-between items-start">
          <div>
             <h3 className="text-lg font-bold text-white group-hover:text-tech-orange transition-colors">
              {player.name}
            </h3>
            <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center text-tech-blue text-xs font-mono bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
                    #{player.number}
                </span>
                {player.positions.map(pos => (
                    <span key={pos} className="inline-flex items-center text-slate-300 text-xs font-bold bg-slate-700/50 px-2 py-0.5 rounded">
                        {pos}
                    </span>
                ))}
            </div>
          </div>
          <ChevronRight className="text-slate-500 group-hover:text-white transition-colors" />
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
