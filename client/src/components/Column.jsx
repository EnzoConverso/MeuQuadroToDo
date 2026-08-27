import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Plus, MoreHorizontal, Trash2, Edit2, Check, X } from 'lucide-react';
import CardItem from './CardItem';

export default function Column({ 
  column, 
  onAddCard, 
  onOpenCard, 
  onDeleteCard, 
  onUpdateColumn, 
  onDeleteColumn 
}) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDesc, setNewCardDesc] = useState('');
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [columnName, setColumnName] = useState(column.name);
  const [showMenu, setShowMenu] = useState(false);

  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;

    await onAddCard(column.id, {
      title: newCardTitle.trim(),
      description: newCardDesc.trim(),
    });

    setNewCardTitle('');
    setNewCardDesc('');
    setIsAddingCard(false);
  };

  const handleSaveColumnName = async () => {
    if (columnName.trim() && columnName !== column.name) {
      await onUpdateColumn(column.id, { name: columnName.trim() });
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="w-80 shrink-0 flex flex-col bg-background border border-border rounded-xl max-h-full select-none shadow-sm">
      {/* Column Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isEditingTitle ? (
            <div className="flex items-center gap-1 w-full">
              <input
                type="text"
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveColumnName();
                  if (e.key === 'Escape') setIsEditingTitle(false);
                }}
                autoFocus
                className="w-full bg-surface text-white border border-border rounded px-2 py-0.5 text-xs focus:outline-none focus:border-white"
              />
              <button onClick={handleSaveColumnName} className="p-1 hover:text-emerald-400 text-textSecondary">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setIsEditingTitle(false)} className="p-1 hover:text-red-400 text-textSecondary">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              <h3 
                onClick={() => setIsEditingTitle(true)}
                className="font-semibold text-sm text-textPrimary truncate cursor-pointer hover:text-white transition-colors"
                title="Clique para renomear coluna"
              >
                {column.name}
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-surface border border-border text-textMuted font-mono">
                {column.cards?.length || 0}
              </span>
            </>
          )}
        </div>

        {/* Column Actions */}
        <div className="relative flex items-center gap-1">
          <button
            onClick={() => setIsAddingCard(true)}
            className="p-1.5 hover:bg-surface text-textSecondary hover:text-white rounded-md transition-colors"
            title="Adicionar Card"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 hover:bg-surface text-textSecondary hover:text-white rounded-md transition-colors"
            title="Opções da Coluna"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {/* Menu Dropdown */}
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-8 z-20 w-44 bg-surface border border-border rounded-lg shadow-xl py-1 text-xs text-textSecondary">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setIsEditingTitle(true);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-surfaceHover hover:text-white flex items-center gap-2"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Renomear Coluna</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    if (confirm(`Tem certeza que deseja excluir a coluna "${column.name}" e todos os seus cards?`)) {
                      onDeleteColumn(column.id);
                    }
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-surfaceHover text-red-400 hover:text-red-300 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir Coluna</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cards List / Droppable Area */}
      <Droppable droppableId={String(column.id)}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-3 overflow-y-auto min-h-[150px] transition-colors rounded-b-xl ${
              snapshot.isDraggingOver ? 'bg-surface/50' : ''
            }`}
          >
            {column.cards && column.cards.map((card, index) => (
              <CardItem
                key={card.id}
                card={card}
                index={index}
                onOpenCard={onOpenCard}
                onDeleteCard={onDeleteCard}
              />
            ))}
            {provided.placeholder}

            {/* Quick Add Form Inside Column */}
            {isAddingCard ? (
              <form onSubmit={handleCreateCard} className="bg-surface border border-borderLight rounded-lg p-3 mt-1 shadow-md">
                <input
                  type="text"
                  placeholder="Título do card..."
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  autoFocus
                  className="w-full bg-background border border-border rounded-md px-2.5 py-1.5 text-xs text-textPrimary placeholder-textMuted focus:outline-none focus:border-white mb-2"
                />
                <textarea
                  placeholder="Descrição opcional..."
                  rows={2}
                  value={newCardDesc}
                  onChange={(e) => setNewCardDesc(e.target.value)}
                  className="w-full bg-background border border-border rounded-md px-2.5 py-1.5 text-xs text-textPrimary placeholder-textMuted focus:outline-none focus:border-white resize-none mb-2"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCard(false);
                      setNewCardTitle('');
                      setNewCardDesc('');
                    }}
                    className="px-2.5 py-1 text-xs text-textSecondary hover:text-white rounded hover:bg-surfaceHover transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!newCardTitle.trim()}
                    className="px-3 py-1 text-xs bg-white text-black font-semibold rounded hover:bg-accentHover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Criar Card
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingCard(true)}
                className="w-full py-2 border border-dashed border-border rounded-lg text-xs text-textMuted hover:text-white hover:border-textMuted hover:bg-surfaceHover/40 transition-all flex items-center justify-center gap-1.5 mt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Card</span>
              </button>
            )}

            {(!column.cards || column.cards.length === 0) && !isAddingCard && (
              <div className="py-6 text-center text-textMuted text-xs select-none">
                Nenhum card aqui
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
