import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import KanbanBoard from './components/KanbanBoard';
import CardModal from './components/CardModal';
import NewProjectModal from './components/NewProjectModal';
import { api } from './services/api';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [boardData, setBoardData] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingBoard, setLoadingBoard] = useState(false);
  const [error, setError] = useState(null);

  const [selectedCard, setSelectedCard] = useState(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all projects on mount
  const fetchProjects = useCallback(async (selectId = null) => {
    try {
      const data = await api.getProjects();
      setProjects(data);
      if (data.length > 0) {
        if (selectId) {
          setActiveProjectId(selectId);
        } else if (!activeProjectId || !data.some(p => p.id === activeProjectId)) {
          setActiveProjectId(data[0].id);
        }
      } else {
        setActiveProjectId(null);
        setBoardData(null);
      }
    } catch (err) {
      console.error(err);
      setError('Falha ao conectar com o servidor backend: ' + err.message);
    } finally {
      setLoadingProjects(false);
    }
  }, [activeProjectId]);

  // Fetch board data whenever activeProjectId changes
  const fetchBoard = useCallback(async (projectId) => {
    if (!projectId) return;
    setLoadingBoard(true);
    setError(null);
    try {
      const data = await api.getBoard(projectId);
      setBoardData(data);
    } catch (err) {
      console.error(err);
      setError('Falha ao carregar o quadro do projeto: ' + err.message);
    } finally {
      setLoadingBoard(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (activeProjectId) {
      fetchBoard(activeProjectId);
    }
  }, [activeProjectId, fetchBoard]);

  // ----------------------------------------------------
  // DRAG AND DROP HANDLER
  // ----------------------------------------------------
  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // Dropped outside or at same position
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColId = parseInt(source.droppableId, 10);
    const destColId = parseInt(destination.droppableId, 10);
    const cardId = parseInt(draggableId, 10);

    // Deep copy current columns for optimistic update
    const prevColumns = JSON.parse(JSON.stringify(boardData.columns));
    const newColumns = [...boardData.columns];

    const sourceCol = newColumns.find(c => c.id === sourceColId);
    const destCol = newColumns.find(c => c.id === destColId);

    if (!sourceCol || !destCol) return;

    // Remove from source column
    const [movedCard] = sourceCol.cards.splice(source.index, 1);
    // Update column_id on the card
    movedCard.column_id = destColId;

    // Insert into destination column
    destCol.cards.splice(destination.index, 0, movedCard);

    // Apply optimistic state update
    setBoardData(prev => ({
      ...prev,
      columns: newColumns,
    }));

    // Update project card counts in sidebar if moved between different columns
    try {
      await api.moveCard(cardId, destColId, destination.index);
    } catch (err) {
      console.error('Failed to move card on backend, rolling back...', err);
      // Rollback on failure
      setBoardData(prev => ({
        ...prev,
        columns: prevColumns,
      }));
    }
  };

  // ----------------------------------------------------
  // PROJECT ACTIONS
  // ----------------------------------------------------
  const handleCreateProject = async (data) => {
    try {
      const newProj = await api.createProject(data);
      await fetchProjects(newProj.id);
    } catch (err) {
      alert('Erro ao criar projeto: ' + err.message);
    }
  };

  const handleUpdateProject = async (id, data) => {
    try {
      const updated = await api.updateProject(id, data);
      setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
      if (boardData && boardData.project.id === id) {
        setBoardData(prev => ({ ...prev, project: { ...prev.project, ...updated } }));
      }
    } catch (err) {
      alert('Erro ao atualizar projeto: ' + err.message);
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await api.deleteProject(id);
      await fetchProjects();
    } catch (err) {
      alert('Erro ao excluir projeto: ' + err.message);
    }
  };

  // ----------------------------------------------------
  // COLUMN ACTIONS
  // ----------------------------------------------------
  const handleAddColumn = async (name) => {
    if (!activeProjectId) return;
    try {
      const newCol = await api.createColumn(activeProjectId, { name });
      setBoardData(prev => ({
        ...prev,
        columns: [...prev.columns, newCol],
      }));
      fetchProjects(activeProjectId);
    } catch (err) {
      alert('Erro ao adicionar coluna: ' + err.message);
    }
  };

  const handleUpdateColumn = async (columnId, data) => {
    try {
      const updated = await api.updateColumn(columnId, data);
      setBoardData(prev => ({
        ...prev,
        columns: prev.columns.map(c => c.id === columnId ? { ...c, ...updated } : c),
      }));
    } catch (err) {
      alert('Erro ao atualizar coluna: ' + err.message);
    }
  };

  const handleDeleteColumn = async (columnId) => {
    try {
      await api.deleteColumn(columnId);
      setBoardData(prev => ({
        ...prev,
        columns: prev.columns.filter(c => c.id !== columnId),
      }));
      fetchProjects(activeProjectId);
    } catch (err) {
      alert('Erro ao excluir coluna: ' + err.message);
    }
  };

  // ----------------------------------------------------
  // CARD ACTIONS
  // ----------------------------------------------------
  const handleAddCard = async (columnId, data) => {
    try {
      const newCard = await api.createCard(columnId, data);
      setBoardData(prev => ({
        ...prev,
        columns: prev.columns.map(col => {
          if (col.id === columnId) {
            return { ...col, cards: [...(col.cards || []), newCard] };
          }
          return col;
        }),
      }));
      fetchProjects(activeProjectId);
    } catch (err) {
      alert('Erro ao criar card: ' + err.message);
    }
  };

  const handleUpdateCard = async (cardId, data) => {
    try {
      const updatedCard = await api.updateCard(cardId, data);
      setBoardData(prev => {
        // Rebuild columns removing card from old column and putting into new if column_id changed
        const newCols = prev.columns.map(col => ({
          ...col,
          cards: (col.cards || []).filter(c => c.id !== cardId),
        }));

        const targetCol = newCols.find(c => c.id === updatedCard.column_id);
        if (targetCol) {
          targetCol.cards.push(updatedCard);
        }

        return { ...prev, columns: newCols };
      });
      fetchProjects(activeProjectId);
    } catch (err) {
      alert('Erro ao atualizar card: ' + err.message);
    }
  };

  const handleDeleteCard = async (cardId) => {
    try {
      await api.deleteCard(cardId);
      setBoardData(prev => ({
        ...prev,
        columns: prev.columns.map(col => ({
          ...col,
          cards: (col.cards || []).filter(c => c.id !== cardId),
        })),
      }));
      fetchProjects(activeProjectId);
    } catch (err) {
      alert('Erro ao excluir card: ' + err.message);
    }
  };

  // ----------------------------------------------------
  // RENDER
  // ----------------------------------------------------
  if (loadingProjects) {
    return (
      <div className="h-screen w-screen bg-background flex flex-col items-center justify-center gap-3 text-textMuted">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
        <p className="text-xs font-mono">Iniciando Meu Quadro To Do...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-background text-textPrimary overflow-hidden font-sans">
      {/* Left Sidebar */}
      <Sidebar
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={(id) => setActiveProjectId(id)}
        onOpenNewProjectModal={() => setIsNewProjectModalOpen(true)}
        onUpdateProject={handleUpdateProject}
        onDeleteProject={handleDeleteProject}
      />

      {/* Main Board Content */}
      <div className="flex-1 h-screen flex flex-col overflow-hidden">
        {error && (
          <div className="bg-red-950/40 border-b border-red-800/50 p-3 px-6 text-xs text-red-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchBoard(activeProjectId)}
              className="flex items-center gap-1 text-xs underline hover:text-white"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Tentar novamente
            </button>
          </div>
        )}

        {loadingBoard ? (
          <div className="flex-1 flex items-center justify-center gap-3 text-textMuted">
            <Loader2 className="w-6 h-6 animate-spin text-white" />
            <span className="text-xs font-mono">Carregando quadro...</span>
          </div>
        ) : boardData ? (
          <KanbanBoard
            boardData={boardData}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onDragEnd={handleDragEnd}
            onAddCard={handleAddCard}
            onOpenCard={(card) => setSelectedCard(card)}
            onDeleteCard={handleDeleteCard}
            onAddColumn={handleAddColumn}
            onUpdateColumn={handleUpdateColumn}
            onDeleteColumn={handleDeleteColumn}
            onUpdateProject={handleUpdateProject}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-textMuted p-6 text-center">
            <p className="text-sm font-medium mb-3">Nenhum projeto selecionado ou cadastrado.</p>
            <button
              onClick={() => setIsNewProjectModalOpen(true)}
              className="px-4 py-2 bg-white text-black text-xs font-semibold rounded-lg hover:bg-accentHover transition-colors"
            >
              Criar Primeiro Projeto
            </button>
          </div>
        )}
      </div>

      {/* Card Details Modal */}
      {selectedCard && boardData && (
        <CardModal
          card={selectedCard}
          columns={boardData.columns}
          onClose={() => setSelectedCard(null)}
          onUpdateCard={handleUpdateCard}
          onDeleteCard={handleDeleteCard}
        />
      )}

      {/* New Project Modal */}
      {isNewProjectModalOpen && (
        <NewProjectModal
          onClose={() => setIsNewProjectModalOpen(false)}
          onCreateProject={handleCreateProject}
        />
      )}
    </div>
  );
}
