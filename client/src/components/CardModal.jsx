import React, { useState, useEffect } from 'react';
import { X, Trash2, Calendar, AlignLeft, Check, Layers } from 'lucide-react';

export default function CardModal({ 
  card, 
  columns, 
  onClose, 
  onUpdateCard, 
  onDeleteCard 
}) {
  const [title, setTitle] = useState(card ? card.title : '');
  const [description, setDescription] = useState(card ? (card.description || '') : '');
  const [columnId, setColumnId] = useState(card ? card.column_id : (columns[0]?.id || ''));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description || '');
      setColumnId(card.column_id);
    }
  }, [card]);

  if (!card) return null;

  const handleSave = async () => {
    if (!title.trim()) return;
    setIsSaving(true);
    try {
      await onUpdateCard(card.id, {
        title: title.trim(),
        description: description.trim(),
        column_id: parseInt(columnId, 10),
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSave();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div 
        className="bg-surface border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-textMuted" />
            <span className="text-xs text-textMuted font-mono">ID #{card.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm('Tem certeza que deseja excluir este card?')) {
                  onDeleteCard(card.id);
                  onClose();
                }
              }}
              className="p-1.5 text-textMuted hover:text-red-400 hover:bg-surfaceHover rounded-lg transition-colors"
              title="Excluir card"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-textMuted hover:text-white hover:bg-surfaceHover rounded-lg transition-colors"
              title="Fechar (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Title input */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-textMuted mb-1.5">
              Título da Tarefa
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título do card..."
              autoFocus
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-textPrimary font-medium placeholder-textMuted focus:outline-none focus:border-white focus:ring-1 focus:ring-white/20 transition-all"
            />
          </div>

          {/* Status / Column Selector */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-textMuted mb-1.5">
              Status (Coluna)
            </label>
            <select
              value={columnId}
              onChange={(e) => setColumnId(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-textPrimary focus:outline-none focus:border-white transition-colors cursor-pointer"
            >
              {columns.map((col) => (
                <option key={col.id} value={col.id} className="bg-surface text-white">
                  {col.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description Textarea */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-textMuted" />
              <label className="text-[11px] font-semibold uppercase tracking-wider text-textMuted">
                Descrição Detalhada
              </label>
            </div>
            <textarea
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione notas, checklists, detalhes, links ou especificações..."
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs text-textPrimary placeholder-textMuted focus:outline-none focus:border-white focus:ring-1 focus:ring-white/20 transition-all resize-y leading-relaxed font-sans"
            />
          </div>

          {/* Metadata info */}
          <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-textMuted">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Criado em {formatDate(card.created_at)}</span>
            </div>
            <span className="text-[11px] text-textMuted font-mono">Dica: Ctrl + Enter para salvar</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-border bg-background flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-textSecondary hover:text-white rounded-xl hover:bg-surface transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!title.trim() || isSaving}
            className="px-5 py-2 text-xs font-semibold bg-white text-black rounded-xl hover:bg-accentHover transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Check className="w-4 h-4" />
            <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
