import React, { useState } from 'react';
import { X, FolderPlus, Check } from 'lucide-react';

export default function NewProjectModal({ onClose, onCreateProject }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateProject({
        name: name.trim(),
        description: description.trim(),
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 px-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-white" />
            <h2 className="font-semibold text-sm text-white">Criar Novo Projeto</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-textMuted hover:text-white rounded-lg hover:bg-surfaceHover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-textMuted mb-1.5">
              Nome do Projeto *
            </label>
            <input
              type="text"
              placeholder="Ex: Lançamento do App, Estudos, etc."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs text-textPrimary placeholder-textMuted focus:outline-none focus:border-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-textMuted mb-1.5">
              Descrição (Opcional)
            </label>
            <textarea
              rows={3}
              placeholder="Breve resumo sobre o objetivo do projeto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-xs text-textPrimary placeholder-textMuted focus:outline-none focus:border-white resize-none transition-colors"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs text-textSecondary hover:text-white rounded-xl hover:bg-surfaceHover transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="px-4 py-2 text-xs font-semibold bg-white text-black rounded-xl hover:bg-accentHover transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Criando...' : 'Criar Projeto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
