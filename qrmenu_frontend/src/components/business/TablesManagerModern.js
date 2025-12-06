import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { toast } from '../../utils/toast';
import { QrCode, Trash2 } from 'lucide-react';
import { useSnackbar } from '../ui/Snackbar';
import EditableText from '../ui/EditableText';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Loader from '../ui/Loader';
import QRCode from './QRCode';
import DeleteConfirmModal from '../ui/DeleteConfirmModal';

/**
 * Gestionnaire de tables moderne avec édition inline et QR codes
 */
const TablesManagerModern = ({ 
  placeId, 
  token, 
  tables = [], 
  loading = false,
  onAddTable,
  onUpdateTable,
  onDeleteTable,
  onRefresh
}) => {
  const { showSnackbarWithUndo } = useSnackbar();
  const [newTableName, setNewTableName] = useState('');
  const [addingTable, setAddingTable] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableToDelete, setTableToDelete] = useState(null);
  const [isDeletingTable, setIsDeletingTable] = useState(false);
  
  // Gestion du portal pour le modal QR Code
  const [mounted, setMounted] = useState(false);
  const portalContainerRef = useRef(null);

  // Créer et gérer le conteneur du portail pour le modal QR Code
  useEffect(() => {
    if (selectedTable && typeof document !== 'undefined') {
      // Créer un conteneur dédié pour ce modal
      const container = document.createElement('div');
      container.setAttribute('data-qr-modal-portal', 'true');
      document.body.appendChild(container);
      portalContainerRef.current = container;
      setMounted(true);

      return () => {
        // Nettoyage sécurisé du conteneur
        if (portalContainerRef.current && portalContainerRef.current.parentNode) {
          try {
            portalContainerRef.current.parentNode.removeChild(portalContainerRef.current);
          } catch (error) {
            // Ignorer les erreurs si le nœud a déjà été supprimé
            console.warn('QR Modal cleanup warning:', error);
          }
        }
        portalContainerRef.current = null;
        setMounted(false);
      };
    } else {
      setMounted(false);
    }
  }, [selectedTable]);

  // Gérer le body overflow pour éviter le scroll quand les modaux sont ouverts
  React.useEffect(() => {
    const hasModal = selectedTable || tableToDelete;
    if (hasModal) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        // Restaurer seulement si aucun modal n'est ouvert
        if (!selectedTable && !tableToDelete) {
          document.body.style.overflow = originalOverflow || 'unset';
        }
      };
    }
  }, [selectedTable, tableToDelete]);

  const handleAddTable = async () => {
    if (!newTableName.trim()) return;
    setAddingTable(true);
    try {
      await onAddTable({ name: newTableName.trim(), status: 'active' });
      setNewTableName('');
      toast.success('Table ajoutée avec succès');
    } catch (err) {
      toast.error('Erreur lors de l\'ajout de la table');
    } finally {
      setAddingTable(false);
    }
  };

  const handleUpdateTableName = async (tableId, newName) => {
    try {
      await onUpdateTable(tableId, { name: newName });
    } catch (err) {
      throw new Error('Erreur lors de la mise à jour');
    }
  };

  const handleDeleteTableClick = (tableId) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) {
      toast.error('Table introuvable');
      return;
    }
    setTableToDelete(table);
  };

  const handleConfirmDeleteTable = async () => {
    if (!tableToDelete || !onDeleteTable) {
      setTableToDelete(null);
      return;
    }

    setIsDeletingTable(true);
    try {
      // Sauvegarder les informations de la table avant suppression pour l'undo
      const tableToDeleteData = {
        id: tableToDelete.id,
        name: tableToDelete.name,
        status: tableToDelete.status || 'active'
      };
      
      // Appeler la fonction de suppression et attendre qu'elle se termine
      await onDeleteTable(tableToDelete.id);
      
      // Si on arrive ici, la suppression a réussi
      // Utiliser setTimeout pour fermer la modal après le rendu actuel
      setTimeout(() => {
        setTableToDelete(null);
      }, 0);
      
      // Afficher le message de succès uniquement après confirmation
      // Utiliser setTimeout pour éviter les conflits de rendu
      setTimeout(() => {
        showSnackbarWithUndo(
        `Table "${tableToDeleteData.name}" supprimée`,
        async () => {
          // Undo: recréer la table
          try {
            if (onAddTable) {
              await onAddTable({ 
                name: tableToDeleteData.name, 
                status: tableToDeleteData.status 
              });
            }
          } catch (err) {
            toast.error('Impossible de restaurer la table');
          }
        },
        { duration: 5000 }
        );
      }, 0);
    } catch (err) {
      console.error('Erreur suppression table:', err);
      // L'erreur est déjà gérée dans deleteTable, on ne fait que fermer la modal
      // Utiliser setTimeout pour éviter les conflits de rendu
      setTimeout(() => {
        setTableToDelete(null);
      }, 0);
    } finally {
      setIsDeletingTable(false);
    }
  };

  if (loading && tables.length === 0) {
    return <Loader text="Chargement des tables..." />;
  }

  return (
    <div className="space-y-4">
      {/* Formulaire d'ajout */}
      <div className="flex gap-2 mb-4">
        <Input
          value={newTableName}
          onChange={(e) => setNewTableName(e.target.value)}
          placeholder="Nom de la table"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAddTable();
            }
          }}
          disabled={addingTable}
          className="flex-1"
        />
        <Button
          onClick={handleAddTable}
          disabled={!newTableName.trim() || addingTable}
          loading={addingTable}
        >
          Ajouter
        </Button>
      </div>

      {/* Liste des tables */}
      {tables.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">
            Aucune table enregistrée
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {tables.map((table) => (
            <div
              key={table.id}
              className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex-1 flex items-center gap-4">
                <div className="flex-1">
                  <EditableText
                    value={table.name}
                    onSave={(newName) => handleUpdateTableName(table.id, newName)}
                    placeholder="Nom de la table"
                    textClassName="text-lg font-semibold text-text-dark"
                    validate={(value) => {
                      if (!value || value.trim().length < 2) {
                        return 'Le nom doit contenir au moins 2 caractères';
                      }
                      return null;
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    table.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {table.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTable(table)}
                  icon={<QrCode className="w-5 h-5" />}
                  title="Voir le QR code"
                />
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteTableClick(table.id)}
                  icon={<Trash2 className="w-5 h-5" />}
                  title="Supprimer"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal QR Code - Rendu via portail */}
      {selectedTable && mounted && portalContainerRef.current && ReactDOM.createPortal(
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedTable(null)}
          role="dialog"
          aria-modal="true"
          aria-label="QR Code de la table"
        >
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs flex flex-col items-center animate-modal-slide-in border border-gray-100">
            <button
              className="absolute -top-4 -right-4 bg-white border border-gray-200 rounded-full shadow-md w-10 h-10 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-colors text-2xl"
              onClick={() => setSelectedTable(null)}
              aria-label="Fermer"
            >
              &times;
            </button>
            <div className="mb-4 mt-2 text-center">
              <div className="text-sm font-semibold text-primary tracking-wide uppercase mb-1">Table</div>
              <div className="text-xl font-bold text-text-dark">{selectedTable.name || `Table ${selectedTable.id}`}</div>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 mb-4">
              <QRCode 
                table={selectedTable.id} 
                placeId={placeId}
                onDelete={handleDeleteTableClick}
                showDelete={true}
              />
            </div>
          </div>
        </div>,
        portalContainerRef.current
      )}

      {/* Modal de confirmation suppression table */}
      <DeleteConfirmModal
        isOpen={!!tableToDelete}
        onClose={() => setTableToDelete(null)}
        onConfirm={handleConfirmDeleteTable}
        title="Supprimer la table ?"
        itemName={tableToDelete?.name || ''}
        itemType="table"
        isLoading={isDeletingTable}
      />
    </div>
  );
};

export default TablesManagerModern;
