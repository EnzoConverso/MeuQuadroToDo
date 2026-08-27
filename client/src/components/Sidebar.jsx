import React, { useState } from 'react';
import { 
  FolderKanban, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  ChevronRight,
  Layers,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ 
  projects, 
  activeProjectId, 
  onSelectProject, 
  onOpenNewProjectModal, 
  onUpdateProject, 
  onDeleteProject 
}) {
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editName, setEditName] = useState('');
  const [filterText, setFilterText] = useState('');

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(filterText.toLowerCase())
  );

  const startEditing = (p, e) => {
    e.stopPropagation();
    setEditingProjectId(p.id);
    setEditName(p.name);
  };

  const handleSaveEdit = async (id, e) => {
    e?.stopPropagation();
    if (editName.trim()) {
      await onUpdateProject(id, { name: editName.trim() });
    }
    setEditingProjectId(null);
  };

  const handleCancelEdit = (e) => {
    e?.stopPropagation();
    setEditingProjectId(null);
  };

  return (
    <aside className="w-72 h-screen bg-surface border-r border-border flex flex-col select-none shrink-0 transition-all duration-200">
      {/* App Header / Brand */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-sm shadow-sm">
            <Layers className="w-4 h-4 text-black" />
          </div>
          <div>
            <h1 className="font-semibold text-sm tracking-tight text-white">Meu Quadro To Do</h1>
            <p className="text-[11px] text-textMuted flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span> Localhost • Postgres
            </p>
          </div>
        </div>
      </div>

      {/* Projects Header & Action */}
      <div className="p-3 pb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-textMuted px-2">
          Projetos ({projects.length})
        </span>
        <button
          onClick={onOpenNewProjectModal}
          className="p-1.5 hover:bg-surfaceHover text-textSecondary hover:text-white rounded-md transition-colors flex items-center gap-1 text-xs border border-transparent hover:border-border"
          title="Novo Projeto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo</span>
        </button>
      </div>

      {/* Projects Search Filter */}
      {projects.length > 5 && (
        <div className="px-3 pb-2">
          <input
            type="text"
            placeholder="Filtrar projetos..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full bg-background border border-border rounded-md px-2.5 py-1 text-xs text-textPrimary placeholder-textMuted focus:outline-none focus:border-white transition-colors"
          />
        </div>
      )}

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {filteredProjects.map((project) => {
          const isActive = project.id === activeProjectId;
          const isEditing = editingProjectId === project.id;

          return (
            <div
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className={`group relative flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs font-medium transition-all duration-150 ${
                isActive 
                  ? 'bg-white text-black font-semibold shadow-sm' 
                  : 'text-textSecondary hover:text-white hover:bg-surfaceHover'
              }`}
            >
              {isEditing ? (
                <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(project.id, e);
                      if (e.key === 'Escape') handleCancelEdit(e);
                    }}
                    autoFocus
                    className="flex-1 bg-background text-white border border-border rounded px-1.5 py-0.5 text-xs focus:outline-none focus:border-white"
                  />
                  <button 
                    onClick={(e) => handleSaveEdit(project.id, e)}
                    className="p-1 hover:text-emerald-400 text-textSecondary"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={handleCancelEdit}
                    className="p-1 hover:text-red-400 text-textSecondary"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
                    <FolderKanban className={`w-4 h-4 shrink-0 ${isActive ? 'text-black' : 'text-textMuted group-hover:text-textPrimary'}`} />
                    <span className="truncate">{project.name}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Badge card count */}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isActive 
                        ? 'bg-black/10 text-black font-bold' 
                        : 'bg-border text-textMuted group-hover:text-textSecondary'
                    }`}>
                      {project.card_count || 0}
                    </span>

                    {/* Actions on hover */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity ml-1">
                      <button
                        onClick={(e) => startEditing(project, e)}
                        className={`p-1 rounded hover:bg-black/10 ${isActive ? 'text-black' : 'text-textMuted hover:text-white'}`}
                        title="Renomear"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      {projects.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Tem certeza que deseja excluir o projeto "${project.name}" e todas as suas tarefas?`)) {
                              onDeleteProject(project.id);
                            }
                          }}
                          className={`p-1 rounded hover:bg-black/10 ${isActive ? 'text-black' : 'text-textMuted hover:text-red-400'}`}
                          title="Excluir"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="py-8 text-center text-textMuted text-xs">
            Nenhum projeto encontrado.
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-border flex items-center justify-between text-[11px] text-textMuted">
        <span className="font-mono">v1.0.0</span>
        <span className="text-textSecondary">Tema Preto & Branco</span>
      </div>
    </aside>
  );
}
