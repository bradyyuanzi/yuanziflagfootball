
import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { PlayerStats, Position, StatType, getStatType } from '../types';

interface Props {
  stats: PlayerStats;
  position: Position;
  playerName: string;
}

const PlayerRadarChart: React.FC<Props> = ({ stats, position, playerName }) => {
  const type = getStatType(position);
  let data: any[] = [];

  // Normalize data roughly to a 0-100 scale for visual impact
  if (type === StatType.OFFENSE_QB) {
    const s = stats as any;
    const compRate = s.passAttempts > 0 ? (s.passCompletions / s.passAttempts) * 100 : 0;
    data = [
      { subject: '成功率', A: compRate, fullMark: 100 },
      { subject: '达阵力', A: Math.min(s.passTDs * 20, 100), fullMark: 100 },
      { subject: '推进力', A: Math.min(s.passYards / 3, 100), fullMark: 100 },
      { subject: '抗压', A: Math.max(100 - (s.sacksTaken * 10), 0), fullMark: 100 },
      { subject: '稳健', A: Math.max(100 - (s.interceptionsThrown * 15), 0), fullMark: 100 },
    ];
  } else if (type === StatType.OFFENSE_SKILL) {
    const s = stats as any;
    const catchRate = s.targets > 0 ? (s.catches / s.targets) * 100 : 0;
    data = [
      { subject: '捕获率', A: catchRate, fullMark: 100 },
      { subject: '推进力', A: Math.min((s.receivingYards + s.rushingYards) / 2, 100), fullMark: 100 },
      { subject: '得分力', A: Math.min((s.receivingTDs + s.rushingTDs) * 20, 100), fullMark: 100 },
      { subject: '活跃度', A: Math.min(s.targets * 10, 100), fullMark: 100 },
      { subject: '冲跑', A: Math.min(s.rushingYards * 2, 100), fullMark: 100 },
    ];
  } else {
    const s = stats as any;
    const pullRate = s.flagPullsAttempts > 0 ? (s.flagPullsSuccess / s.flagPullsAttempts) * 100 : 0;
    data = [
      { subject: '拔旗率', A: pullRate, fullMark: 100 },
      { subject: '破坏力', A: Math.min(s.passDeflections * 20, 100), fullMark: 100 },
      { subject: '球权转换', A: Math.min(s.interceptionsCaught * 25, 100), fullMark: 100 },
      { subject: '压迫力', A: Math.min(s.sacksMade * 20, 100), fullMark: 100 },
      { subject: '得分', A: Math.min(s.defensiveTDs * 30, 100), fullMark: 100 },
    ];
  }

  return (
    <div className="w-full h-full relative flex flex-col items-center">
       <div className="absolute top-2 left-4 z-10">
          <span className="text-4xl font-black italic text-slate-700/50 select-none">{position}</span>
       </div>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name={playerName}
            dataKey="A"
            stroke={type === StatType.DEFENSE ? '#06b6d4' : '#f97316'}
            strokeWidth={2}
            fill={type === StatType.DEFENSE ? '#06b6d4' : '#f97316'}
            fillOpacity={0.4}
          />
          <Tooltip 
             contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PlayerRadarChart;
