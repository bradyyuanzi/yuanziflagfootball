
import React, { useState, useEffect, useRef } from 'react';
import { Player, Position, AgeGroup, getStatType, getInitialStats } from '../types';
import { X, Save, Trash2, User, Activity, AlertTriangle, Check, Upload, Camera } from 'lucide-react';

interface Props {
  player: Player | null; // null means creating new player
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPlayer: Player) => void;
  onDelete?: (playerId: string) => void;
}

const POSITIONS: Position[] = ['QB', 'WR', 'RB', 'CB', 'LB', 'S', 'RUSH'];
const AGE_GROUPS: AgeGroup[] = ['U6', 'U8', 'U10', 'U12'];

const StatEditModal: React.FC<Props> = ({ player, isOpen, onClose, onSave, onDelete }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'stats'>('stats');
  const [statTabPosition, setStatTabPosition] = useState<Position | null>(null);
  const [formData, setFormData] = useState<Partial<Player>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      if (player) {
        setFormData(JSON.parse(JSON.stringify(player))); 
        setActiveTab('stats');
        setStatTabPosition(player.positions[0] || null);
      } else {
        setFormData({
          id: Date.now().toString(),
          name: '',
          number: 0,
          positions: ['WR'],
          ageGroup: 'U10',
          avatar: `https://picsum.photos/200/200?random=${Date.now()}`,
          stats: {
            'WR': getInitialStats('WR')
          }
        });
        setActiveTab('profile');
        setStatTabPosition('WR');
      }
    }
  }, [isOpen, player]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen || !formData.stats) return null;

  const currentStatPosition = statTabPosition && formData.positions?.includes(statTabPosition) 
    ? statTabPosition 
    : formData.positions?.[0];
  
  const type = currentStatPosition ? getStatType(currentStatPosition) : null;

  const handleStatChange = (pos: Position, key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [pos]: {
          ...(prev.stats as any)[pos],
          [key]: parseInt(value) || 0
        }
      }
    }));
  };

  const togglePosition = (pos: Position) => {
      setFormData(prev => {
          const currentPositions = prev.positions || [];
          let newPositions = [...currentPositions];
          let newStats = { ...prev.stats };

          if (newPositions.includes(pos)) {
              if (newPositions.length > 1) {
                newPositions = newPositions.filter(p => p !== pos);
                delete (newStats as any)[pos];
              } else {
                  alert("学员至少需要保留一个位置。");
                  return prev;
              }
          } else {
              if (newPositions.length < 2) {
                  newPositions.push(pos);
                  (newStats as any)[pos] = getInitialStats(pos);
              } else {
                  return prev; // Max 2 reached
              }
          }
          return { ...prev, positions: newPositions, stats: newStats };
      });
  };

  const renderInput = (pos: Position, label: string, key: string) => {
    const stats = (formData.stats as any)[pos];
    if (!stats) return null;

    return (
        <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-400 uppercase tracking-wider">{label}</label>
        <input
            type="number"
            value={stats[key]}
            onChange={(e) => handleStatChange(pos, key, e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded p-2 text-white focus:border-tech-orange focus:outline-none focus:ring-1 focus:ring-tech-orange transition-all font-mono"
        />
        </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {player ? '编辑球员' : '新增球员'}
            {formData.name && <span className="text-tech-orange text-sm font-normal">| {formData.name}</span>}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800">
            <button 
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${activeTab === 'profile' ? 'bg-slate-800 text-tech-orange border-b-2 border-tech-orange' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <User size={16} /> 基础信息
            </button>
            <button 
                onClick={() => setActiveTab('stats')}
                className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${activeTab === 'stats' ? 'bg-slate-800 text-tech-blue border-b-2 border-tech-blue' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <Activity size={16} /> 比赛数据
            </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          
          {activeTab === 'profile' && (
              <div className="space-y-4">
                  {/* Avatar Upload */}
                  <div className="flex flex-col items-center justify-center mb-6">
                      <div className="relative w-24 h-24 rounded-full border-2 border-slate-600 overflow-hidden mb-2 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                          <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <Camera size={24} className="text-white" />
                          </div>
                      </div>
                      <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileChange} 
                          accept="image/*"
                          className="hidden" 
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-tech-blue hover:text-white flex items-center gap-1"
                      >
                          <Upload size={12} /> 上传头像
                      </button>
                  </div>

                  <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400 uppercase tracking-wider">姓名</label>
                      <input 
                          type="text" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="bg-slate-800 border border-slate-700 rounded p-2 text-white focus:border-tech-orange focus:outline-none"
                          placeholder="输入球员姓名"
                      />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-400 uppercase tracking-wider">背号</label>
                        <input 
                            type="number" 
                            value={formData.number}
                            onChange={(e) => setFormData({...formData, number: parseInt(e.target.value)})}
                            className="bg-slate-800 border border-slate-700 rounded p-2 text-white focus:border-tech-orange focus:outline-none"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-400 uppercase tracking-wider">年龄组</label>
                        <select 
                            value={formData.ageGroup}
                            onChange={(e) => setFormData({...formData, ageGroup: e.target.value as AgeGroup})}
                            className="bg-slate-800 border border-slate-700 rounded p-2 text-white focus:border-tech-orange focus:outline-none appearance-none"
                        >
                            {AGE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-400 uppercase tracking-wider mb-2">场上位置 (最多选2个)</label>
                      <div className="flex flex-wrap gap-2">
                          {POSITIONS.map(pos => {
                              const isSelected = formData.positions?.includes(pos);
                              const isMaxReached = (formData.positions?.length || 0) >= 2;
                              const isDisabled = !isSelected && isMaxReached;
                              
                              return (
                                <button
                                    key={pos}
                                    onClick={() => togglePosition(pos)}
                                    disabled={isDisabled}
                                    className={`px-3 py-1.5 rounded border text-xs font-bold transition-all flex items-center gap-1
                                        ${isSelected 
                                            ? 'bg-tech-orange text-white border-tech-orange' 
                                            : isDisabled 
                                                ? 'bg-slate-800 text-slate-600 border-slate-800 cursor-not-allowed'
                                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
                                        }
                                    `}
                                >
                                    {pos}
                                    {isSelected && <Check size={12} />}
                                </button>
                              )
                          })}
                      </div>
                  </div>

                  {player && onDelete && (
                      <div className="pt-6 border-t border-slate-800 mt-4">
                          <button 
                             onClick={() => {
                                 if(window.confirm('确定要删除这名球员吗？此操作无法撤销。')) {
                                     onDelete(player.id);
                                     onClose();
                                 }
                             }}
                             className="w-full py-2 bg-red-500/10 border border-red-500/50 text-red-500 rounded hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                          >
                              <Trash2 size={16} /> 删除球员
                          </button>
                      </div>
                  )}
              </div>
          )}

          {activeTab === 'stats' && currentStatPosition && (
            <div>
                 {/* Position Sub-tabs */}
                 <div className="flex space-x-2 mb-6 p-1 bg-slate-800 rounded-lg">
                    {formData.positions?.map(pos => (
                        <button
                            key={pos}
                            onClick={() => setStatTabPosition(pos)}
                            className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${currentStatPosition === pos ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            {pos} 数据
                        </button>
                    ))}
                 </div>

                <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                    <div className="col-span-2 mb-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-300 flex items-center gap-2">
                        <AlertTriangle size={14} />
                        <span>当前编辑 {currentStatPosition} 位置的数据</span>
                    </div>
                    {type === 'OFFENSE_QB' && (
                    <>
                        {renderInput(currentStatPosition, '传球出手 (Attempts)', 'passAttempts')}
                        {renderInput(currentStatPosition, '传球成功 (Completions)', 'passCompletions')}
                        {renderInput(currentStatPosition, '传球码数 (Yards)', 'passYards')}
                        {renderInput(currentStatPosition, '传球达阵 (TDs)', 'passTDs')}
                        {renderInput(currentStatPosition, '被抄截 (INTs)', 'interceptionsThrown')}
                        {renderInput(currentStatPosition, '被擒杀 (Sacks)', 'sacksTaken')}
                    </>
                    )}
                    
                    {type === 'OFFENSE_SKILL' && (
                    <>
                        {renderInput(currentStatPosition, '被传球目标 (Targets)', 'targets')}
                        {renderInput(currentStatPosition, '接球成功 (Catches)', 'catches')}
                        {renderInput(currentStatPosition, '接球码数 (Rec Yards)', 'receivingYards')}
                        {renderInput(currentStatPosition, '接球达阵 (Rec TDs)', 'receivingTDs')}
                        {renderInput(currentStatPosition, '跑球码数 (Rush Yards)', 'rushingYards')}
                        {renderInput(currentStatPosition, '跑球达阵 (Rush TDs)', 'rushingTDs')}
                    </>
                    )}

                    {type === 'DEFENSE' && (
                    <>
                        {renderInput(currentStatPosition, '拔旗尝试 (Attempts)', 'flagPullsAttempts')}
                        {renderInput(currentStatPosition, '拔旗成功 (Success)', 'flagPullsSuccess')}
                        {renderInput(currentStatPosition, '抄截 (INTs)', 'interceptionsCaught')}
                        {renderInput(currentStatPosition, '破坏传球 (Deflections)', 'passDeflections')}
                        {renderInput(currentStatPosition, '擒杀 (Sacks)', 'sacksMade')}
                        {renderInput(currentStatPosition, '防守达阵 (TDs)', 'defensiveTDs')}
                    </>
                    )}
                </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
          <button onClick={onClose} className="px-4 py-2 rounded text-slate-300 hover:bg-slate-800 transition-colors">
            取消
          </button>
          <button 
            onClick={() => {
                if(!formData.name) {
                    alert('请输入球员姓名');
                    setActiveTab('profile');
                    return;
                }
                onSave(formData as Player);
            }}
            className="px-6 py-2 bg-tech-orange hover:bg-tech-orange-dark text-white rounded font-bold flex items-center gap-2 transition-colors shadow-lg shadow-orange-500/20"
          >
            <Save size={18} /> 保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatEditModal;
