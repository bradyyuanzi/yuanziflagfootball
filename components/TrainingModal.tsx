
import React, { useState, useRef } from 'react';
import { TrainingSession, TrainingFile, FileType } from '../types';
import { X, Calendar, Paperclip, FileText, Image as ImageIcon, Plus, Trash2, File, Eye, FileSpreadsheet, Download } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sessions: TrainingSession[];
  onSave: (sessions: TrainingSession[]) => void;
}

const TrainingModal: React.FC<Props> = ({ isOpen, onClose, sessions, onSave }) => {
  const [localSessions, setLocalSessions] = useState<TrainingSession[]>(sessions);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentSessionIdForUpload, setCurrentSessionIdForUpload] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddSession = () => {
    if (!newTitle) return;
    const newSession: TrainingSession = {
      id: Date.now().toString(),
      title: newTitle,
      description: newDesc,
      date: new Date().toLocaleDateString(),
      files: []
    };
    const updated = [newSession, ...localSessions];
    setLocalSessions(updated);
    onSave(updated);
    setNewTitle('');
    setNewDesc('');
    setIsAdding(false);
  };

  const handleDeleteSession = (id: string) => {
    const updated = localSessions.filter(s => s.id !== id);
    setLocalSessions(updated);
    onSave(updated);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentSessionIdForUpload) {
      const reader = new FileReader();
      reader.onloadend = () => {
        let fileType: FileType = 'other';
        
        if (file.type.startsWith('image/')) {
            fileType = 'image';
        } else if (file.type.includes('pdf')) {
            fileType = 'pdf';
        } else if (file.type.includes('word') || file.type.includes('document') || file.name.match(/\.(doc|docx)$/i)) {
            fileType = 'word';
        } else if (file.type.includes('excel') || file.type.includes('spreadsheet') || file.name.match(/\.(xls|xlsx|csv)$/i)) {
            fileType = 'excel';
        }
        
        const newFile: TrainingFile = {
          id: Date.now().toString(),
          name: file.name,
          type: fileType,
          data: reader.result as string, // Base64
          size: (file.size / 1024).toFixed(1) + 'KB'
        };

        const updated = localSessions.map(s => {
          if (s.id === currentSessionIdForUpload) {
            return { ...s, files: [...s.files, newFile] };
          }
          return s;
        });

        setLocalSessions(updated);
        onSave(updated);
        setCurrentSessionIdForUpload(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = (sessionId: string) => {
    setCurrentSessionIdForUpload(sessionId);
    fileInputRef.current?.click();
  };

  const removeFile = (sessionId: string, fileId: string) => {
      const updated = localSessions.map(s => {
          if(s.id === sessionId) {
              return { ...s, files: s.files.filter(f => f.id !== fileId) };
          }
          return s;
      });
      setLocalSessions(updated);
      onSave(updated);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="text-tech-orange" size={24} /> 本周训练安排
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
            
            {/* Add New Box */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 border-dashed">
                {isAdding ? (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                        <input 
                            type="text" 
                            placeholder="训练主题 (e.g., 敏捷梯与角锥特训)"
                            className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white focus:outline-none focus:border-tech-orange"
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                        />
                         <textarea 
                            placeholder="训练详情描述..."
                            className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white focus:outline-none focus:border-tech-orange text-sm h-20"
                            value={newDesc}
                            onChange={e => setNewDesc(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsAdding(false)} className="px-3 py-1 text-sm text-slate-400 hover:text-white">取消</button>
                            <button onClick={handleAddSession} className="px-4 py-1 bg-tech-orange text-white text-sm rounded font-bold">发布</button>
                        </div>
                    </div>
                ) : (
                    <button onClick={() => setIsAdding(true)} className="w-full py-2 flex items-center justify-center gap-2 text-slate-400 hover:text-tech-orange transition-colors">
                        <Plus size={20} /> 添加新的训练计划
                    </button>
                )}
            </div>

            {/* List */}
            {localSessions.map(session => (
                <div key={session.id} className="bg-slate-800 rounded-xl p-5 border border-slate-700 relative group">
                    <button 
                        onClick={() => handleDeleteSession(session.id)}
                        className="absolute top-4 right-4 text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <Trash2 size={16} />
                    </button>
                    
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-tech-blue/20 text-tech-blue text-xs px-2 py-0.5 rounded font-mono">{session.date}</span>
                        <h3 className="text-lg font-bold text-white">{session.title}</h3>
                    </div>
                    <p className="text-slate-400 text-sm mb-4 leading-relaxed whitespace-pre-wrap">{session.description}</p>
                    
                    {/* Attachments */}
                    <div className="space-y-2">
                        {session.files.map(file => (
                            <div key={file.id} className="flex items-center gap-3 bg-slate-900/50 p-2 rounded border border-slate-700/50 hover:border-slate-600 transition-colors">
                                {file.type === 'image' ? <ImageIcon size={18} className="text-purple-400" /> : 
                                 file.type === 'pdf' ? <FileText size={18} className="text-red-400" /> : 
                                 file.type === 'word' ? <FileText size={18} className="text-blue-400" /> :
                                 file.type === 'excel' ? <FileSpreadsheet size={18} className="text-green-500" /> :
                                 <File size={18} className="text-slate-400" />}
                                
                                <div className="flex-1 min-w-0">
                                    {/* Clickable Name */}
                                    <a 
                                        href={file.data} 
                                        download={file.name}
                                        className="text-sm text-slate-200 truncate hover:text-tech-orange hover:underline cursor-pointer block font-medium"
                                        title="点击下载/打开"
                                    >
                                        {file.name}
                                    </a>
                                    <p className="text-[10px] text-slate-500">{file.size}</p>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                     <a 
                                        href={file.data} 
                                        download={file.name} 
                                        className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                                        title="打开/下载"
                                     >
                                         {file.type === 'image' ? <Eye size={14} /> : <Download size={14} />}
                                     </a>
                                     <button onClick={() => removeFile(session.id, file.id)} className="p-1.5 hover:bg-red-500/20 rounded text-slate-500 hover:text-red-500 transition-colors">
                                         <X size={14} />
                                     </button>
                                </div>

                                {/* Preview for Images */}
                                {file.type === 'image' && (
                                    <div className="w-10 h-10 rounded bg-black overflow-hidden shrink-0 border border-slate-700 ml-2">
                                        <img src={file.data} alt="preview" className="w-full h-full object-cover opacity-80" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-700/50">
                        <button 
                            onClick={() => triggerUpload(session.id)}
                            className="text-xs flex items-center gap-1.5 text-tech-blue hover:text-white transition-colors"
                        >
                            <Paperclip size={14} /> 上传附件 (图片/PDF/Word/Excel)
                        </button>
                    </div>
                </div>
            ))}
        </div>
        
        {/* Hidden File Input */}
        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
            onChange={handleFileUpload}
        />
      </div>
    </div>
  );
};

export default TrainingModal;
