import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { GripVertical, AlignLeft, Calendar, Trash2 } from 'lucide-react';

export default function CardItem({ card, index, onOpenCard, onDeleteCard }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <Draggable draggableId={String(card.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          onClick={() => onOpenCard(card)}
          className={`group relative bg-surface border rounded-lg p-3.5 mb-2.5 transition-all duration-150 cursor-pointer ${
            snapshot.isDragging 
              ? 'border-white shadow-2xl scale-[1.02] bg-surfaceHover ring-2 ring-white/20' 
              : 'border-border hover:border-borderLight hover:bg-surfaceHover/80 shadow-sm'
          }`}
        >
          {/* Top Bar: Title & Drag Handle */}
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm text-textPrimary leading-snug break-words flex-1 group-hover:text-white">
              {card.title}
            </h4>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteCard(card.id);
                }}
                className="p-1 text-textMuted hover:text-red-400 rounded hover:bg-background/50 transition-colors"
                title="Excluir card"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div
                {...provided.dragHandleProps}
                className="p-1 text-textMuted hover:text-white cursor-grab active:cursor-grabbing rounded hover:bg-background/50"
                title="Arrastar card"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Description snippet */}
          {card.description && (
            <p className="mt-1.5 text-xs text-textSecondary line-clamp-2 leading-relaxed">
              {card.description}
            </p>
          )}

          {/* Bottom metadata */}
          <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px] text-textMuted">
            <div className="flex items-center gap-1.5">
              {card.description && (
                <span className="flex items-center gap-1" title="Possui descrição">
                  <AlignLeft className="w-3 h-3 text-textSecondary" />
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-textMuted" />
              <span>{formatDate(card.created_at)}</span>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
