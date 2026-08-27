import React, { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { Plus, Search, Layers, LayoutGrid, X } from 'lucide-react';
import Column from './Column';

export default function KanbanBoard({ 
  boardData, 
  searchQuery, 
  setSearchQuery, 
  onDragEnd, 
  onAddCard, 
  onOpenCard, 
  onDeleteCard, 
  onAddColumn, 
  onUpdateColumn, 
  onDeleteColumn,
  onUpdateProject
}) {
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  const { project, columns } = boardData;

  const handleCreateColumn = async (e) => {
    e.preventDefault();
    if (!newColumnName.trim()) return;

    await onAddColumn(newColumnName.trim());
    setNewColumnName('');
    setIsAddingColumn(false);
  };

  // Filter cards by search query
  const displayColumns = columns.map(col => {
    if (!searchQuery.trim()) return col;
    const query = searchQuery.toLowerCase();
    return {
      ...col,
      cards: (col.cards || []).filter(c => 
        c.title.toLowerCase().includes(query) || 
        (c.description && c.description.toLowerCase().includes(query))
      ),
    };
  });

  const totalCards = columns.reduce((acc, col) => acc + (col.cards?.length || 0), 0);

  return (
    <main className="flex-1 h-screen flex flex-col bg-background overflow-hidden">
      {/* Board Top Header */}
      <header className="p-4 px-6 border-b border-border flex items-center justify-between gap-4 shrink-0 bg-surface/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-white tracking-tight">
                {project.name}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-surface border border-border text-textSecondary font-mono">
                {totalCards} {totalCards === 1 ? 'tarefa' : 'tarefas'}
              </span>
            </div>
            {project.description && (
              <p className="text-xs text-textMuted mt-0.5 truncate max-w-xl">
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
            <input
              type="text"
              placeholder="Buscar cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-surface border border-border rounded-lg pl-8 pr-7 py-1.5 text-xs text-textPrimary placeholder-textMuted focus:outline-none focus:border-white focus:ring-1 focus:ring-white/20 transition-all w-52 md:w-64"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-textMuted hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Add Column Button */}
          <button
            onClick={() => setIsAddingColumn(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface hover:bg-surfaceHover border border-border hover:border-borderLight text-xs font-medium text-textPrimary hover:text-white rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Coluna</span>
          </button>
        </div>
      </header>

      {/* Kanban Drag and Drop Columns Area */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 p-6 overflow-x-auto overflow-y-hidden flex items-start gap-4">
          {displayColumns.map((column) => (
            <Column
              key={column.id}
              column={column}
              onAddCard={onAddCard}
              onOpenCard={onOpenCard}
              onDeleteCard={onDeleteCard}
              onUpdateColumn={onUpdateColumn}
              onDeleteColumn={onDeleteColumn}
            />
          ))}

          {/* Add Column Form / Button Card */}
          <div className="w-80 shrink-0">
            {isAddingColumn ? (
              <form onSubmit={handleCreateColumn} className="bg-surface border border-border rounded-xl p-3.5 shadow-md">
                <input
                  type="text"
                  placeholder="Nome da coluna (ex: Em Revisão)..."
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  autoFocus
                  className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-xs text-textPrimary placeholder-textMuted focus:outline-none focus:border-white mb-2.5"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingColumn(false);
                      setNewColumnName('');
                    }}
                    className="px-2.5 py-1 text-xs text-textSecondary hover:text-white rounded hover:bg-surfaceHover transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!newColumnName.trim()}
                    className="px-3.5 py-1 text-xs bg-white text-black font-semibold rounded hover:bg-accentHover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Criar Coluna
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingColumn(true)}
                className="w-full py-3.5 px-4 bg-surface/40 hover:bg-surface border border-dashed border-border hover:border-borderLight rounded-xl text-xs font-medium text-textMuted hover:text-white transition-all flex items-center justify-center gap-2 group"
              >
                <Plus className="w-4 h-4 text-textMuted group-hover:text-white transition-colors" />
                <span>Adicionar Nova Coluna</span>
              </button>
            )}
          </div>
        </div>
      </DragDropContext>
    </main>
  );
}
