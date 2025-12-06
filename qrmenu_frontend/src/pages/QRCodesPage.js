import React, { useEffect, useState, useContext, useMemo, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { toast } from '../utils/toast';
import QRCode from 'qrcode.react';
import { Download, Printer, CheckSquare, Square, X, Plus, FileText, Trash2, AlertTriangle, ArrowUp, ArrowDown, ArrowUpDown, Share2 } from 'lucide-react';
import AuthContext from '../contexts/AuthContext';
import BackButton from '../components/ui/BackButton';
import { Button, Input, Loader, Modal, SearchInput } from '../components/ui';
import EditableText from '../components/ui/EditableText';
import { fetchTables, addTable, updateTable, removeTable } from '../services';
import { debounce, copyToClipboard } from '../utils/helpers';

// Page universelle pour tous les restaurateurs : QR codes pour chaque table
const QRCodesPage = () => {
  const { id: placeId } = useParams();
  const history = useHistory();
  const auth = useContext(AuthContext);
  const token = auth?.token;
  
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newTableName, setNewTableName] = useState("");
  const [addingTable, setAddingTable] = useState(false);
  const [selectedTables, setSelectedTables] = useState(new Set());
  const [selectedTableForPreview, setSelectedTableForPreview] = useState(null);
  
  // États pour recherche, filtres et tri
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInputValue, setSearchInputValue] = useState('');
  const [filterStatus] = useState('all'); // 'all', 'active', 'inactive'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'date'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'
  
  // États pour la gestion des tables
  const [tableToDelete, setTableToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTable, setDeletingTable] = useState(false);
  const [updatingTable, setUpdatingTable] = useState(new Set());
  
  // Dimensions standard pour QR codes professionnels (normes ISO/IEC 18004)
  // 1000x1000px avec marge blanche = qualité professionnelle
  const STANDARD_QR_SIZE = 800; // Taille du QR code en pixels
  const STANDARD_MARGIN = 100; // Marge blanche (zone de silence)
  const STANDARD_TOTAL_SIZE = STANDARD_QR_SIZE + (STANDARD_MARGIN * 2); // 1000x1000px

  // États pour la personnalisation des QR codes
  const [qrCustomization, setQrCustomization] = useState({
    size: 256,
    fgColor: '#000000',
    bgColor: '#FFFFFF',
    logo: null,
    logoSize: 40,
    includeText: true,
    text: 'Scannez pour voir le menu'
  });
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);

  // Refs pour les QR codes (pour téléchargement) - réservé pour usage futur
  // const qrRefs = useRef({});

  // Debounce pour la recherche
  const debouncedSetSearch = useMemo(
    () => debounce((value) => {
      setSearchQuery(value);
    }, 300),
    []
  );

  // Mettre à jour la recherche avec debounce
  useEffect(() => {
    debouncedSetSearch(searchInputValue);
  }, [searchInputValue, debouncedSetSearch]);

  useEffect(() => {
    async function loadTables() {
      setLoading(true);
      setError("");
      if (!token) {
        setError("Accès refusé. Veuillez vous reconnecter.");
        setLoading(false);
        return;
      }
      try {
        const result = await fetchTables(placeId, token);
        if (!result) {
          // Si result est null, l'erreur a déjà été gérée par la fonction request
          setError("Erreur lors de la récupération des tables. Vérifiez votre connexion ou vos droits d'accès.");
          setTables([]);
        } else if (result.length === 0) {
          setError("Aucune table n'est configurée pour ce restaurant. Veuillez en ajouter.");
          setTables([]);
        } else {
          setError("");
          setTables(result);
          // Sélectionner la première table pour la preview
          if (!selectedTableForPreview) {
            setSelectedTableForPreview(result[0].id);
          }
        }
      } catch (e) {
        console.error('Erreur lors du chargement des tables:', e);
        const errorMsg = e?.message || "Erreur lors de la récupération des tables. Vérifiez votre connexion ou vos droits d'accès.";
        setError(errorMsg);
        toast.error(errorMsg);
        setTables([]);
      } finally {
        setLoading(false);
      }
    }
    loadTables();
  }, [placeId, token, selectedTableForPreview]);

  const handleAddTable = async (e) => {
    e.preventDefault();
    if (!newTableName.trim()) {
      setError("Le nom de la table est requis.");
      toast.error("Le nom de la table est requis.");
      return;
    }
    setAddingTable(true);
    setError("");
    try {
      const response = await addTable({ name: newTableName.trim(), placeId: placeId, place_id: placeId }, token);
      if (!response) {
        // Si response est null, l'erreur a déjà été gérée par la fonction request
        setError("Impossible d'ajouter la table. Vérifiez vos droits ou réessayez.");
        return;
      }
      
      // Vérifier si la réponse contient une erreur (format backend)
      if (response.error) {
        const errorMsg = typeof response.error === 'string' 
          ? response.error 
          : (response.error?.message || response.error?.code || 'Erreur lors de l\'ajout de la table');
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }
      
      // Succès
      const tableName = newTableName.trim();
      setNewTableName("");
      toast.success(`Table "${tableName}" ajoutée avec succès`);
      // Rafraîchir la liste
      const result = await fetchTables(placeId, token);
      setTables(result || []);
      // Sélectionner la nouvelle table pour la preview
      if (result && result.length > 0) {
        const newTable = result.find(t => t.name === tableName);
        if (newTable) {
          setSelectedTableForPreview(newTable.id);
        }
      }
    } catch (e) {
      const errorMsg = e?.message || "Impossible d'ajouter la table. Vérifiez vos droits ou réessayez.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setAddingTable(false);
    }
  };

  // URL à encoder dans le QR code
  const getTableUrl = useCallback((tableId) => `${window.location.origin}/menu/${placeId}/${tableId}`, [placeId]);

  // Télécharger un QR code en PNG avec dimensions standard professionnelles
  const downloadQRCodePNG = (tableId, tableName) => {
    const tableUrl = getTableUrl(tableId);
    
    // Fonction pour traiter un SVG et le convertir en PNG
    const processSVGToPNG = (svg) => {
      if (!svg) {
        toast.error("Impossible de trouver le QR code SVG");
        return;
      }
      
      const viewBox = svg.getAttribute('viewBox') || svg.getAttribute('viewbox') || '0 0 200 200';
      
      // Créer SVG wrapper
      const svgWrapper = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgWrapper.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svgWrapper.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      svgWrapper.setAttribute('width', `${STANDARD_TOTAL_SIZE}`);
      svgWrapper.setAttribute('height', `${STANDARD_TOTAL_SIZE}`);
      svgWrapper.setAttribute('viewBox', `0 0 ${STANDARD_TOTAL_SIZE} ${STANDARD_TOTAL_SIZE}`);
      
      // Fond blanc
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', `${STANDARD_TOTAL_SIZE}`);
      rect.setAttribute('height', `${STANDARD_TOTAL_SIZE}`);
      rect.setAttribute('fill', 'white');
      svgWrapper.appendChild(rect);
      
      // Groupe pour centrer
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', `translate(${STANDARD_MARGIN}, ${STANDARD_MARGIN})`);
      
      // QR code SVG
      const qrSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      qrSvg.setAttribute('width', `${STANDARD_QR_SIZE}`);
      qrSvg.setAttribute('height', `${STANDARD_QR_SIZE}`);
      qrSvg.setAttribute('viewBox', viewBox);
      qrSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      
      // Copier les enfants
      Array.from(svg.children).forEach(child => {
        qrSvg.appendChild(child.cloneNode(true));
      });
      
      g.appendChild(qrSvg);
      svgWrapper.appendChild(g);
      
      // Convertir en PNG
      convertSVGToPNG(svgWrapper, tableName || tableId, tableName);
    };
    
    try {
      // Essayer d'abord le conteneur du tableau
      const container = document.querySelector(`#qr-${tableId}`);
      if (container) {
        const svg = container.querySelector('svg');
        if (svg) {
          processSVGToPNG(svg);
          return;
        }
      }
      
      // Essayer la preview (toujours visible)
      const previewContainer = document.querySelector('[role="region"][aria-label*="Aperçu"]');
      if (previewContainer) {
        const previewSvg = previewContainer.querySelector('svg');
        if (previewSvg && previewTable && previewTable.id === tableId) {
          processSVGToPNG(previewSvg);
          return;
        }
      }
      
      // Si aucun SVG trouvé, utiliser l'URL pour créer un nouveau QR code via une API externe
      // ou utiliser le composant QRCode directement dans un conteneur temporaire
      toast.info("Génération du QR code en cours...");
      
      // Créer un conteneur temporaire
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = `${STANDARD_QR_SIZE}px`;
      tempDiv.style.height = `${STANDARD_QR_SIZE}px`;
      document.body.appendChild(tempDiv);
      
      // Utiliser React.createElement pour créer le QR code
      const qrElement = React.createElement(QRCode, {
        value: tableUrl,
        size: STANDARD_QR_SIZE,
        fgColor: qrCustomization.fgColor,
        bgColor: qrCustomization.bgColor,
        renderAs: 'svg'
      });
      
      // Rendre le composant
      const ReactDOM = require('react-dom');
      ReactDOM.render(qrElement, tempDiv);
      
      // Attendre le rendu
      setTimeout(() => {
        const svg = tempDiv.querySelector('svg');
        if (svg) {
          processSVGToPNG(svg);
        } else {
          toast.error("Impossible de générer le QR code");
        }
        ReactDOM.unmountComponentAtNode(tempDiv);
        document.body.removeChild(tempDiv);
      }, 500);
    } catch (error) {
      console.error('Erreur lors du téléchargement PNG:', error);
      toast.error("Erreur lors du téléchargement: " + (error.message || 'Erreur inconnue'));
    }
  };
  
  // Fonction helper pour convertir SVG en PNG
  const convertSVGToPNG = (svgElement, fileId, displayName) => {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const SCALE = 2;
    canvas.width = STANDARD_TOTAL_SIZE * SCALE;
    canvas.height = STANDARD_TOTAL_SIZE * SCALE;
    
    img.onload = () => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        
        if (!blob) {
          toast.error('Impossible de créer le PNG');
          return;
        }
        
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `QRCode_Table_${fileId.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
        
        toast.success(`QR code "${displayName || fileId}" téléchargé (1000x1000px, haute qualité)`);
      }, 'image/png', 1.0);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      toast.error('Erreur lors du chargement de l\'image SVG');
    };
    
    img.src = url;
  };
  

  // Télécharger un QR code en SVG avec dimensions standard professionnelles
  const downloadQRCodeSVG = (tableId, tableName) => {
    const tableUrl = getTableUrl(tableId);
    
    // Fonction pour traiter un SVG et le télécharger
    const processSVGToDownload = (svg) => {
      if (!svg) {
        toast.error("Impossible de trouver le QR code SVG");
        return;
      }
      
      const viewBox = svg.getAttribute('viewBox') || svg.getAttribute('viewbox') || '0 0 200 200';
      
      // Créer SVG wrapper
      const svgWrapper = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgWrapper.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svgWrapper.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      svgWrapper.setAttribute('width', `${STANDARD_TOTAL_SIZE}`);
      svgWrapper.setAttribute('height', `${STANDARD_TOTAL_SIZE}`);
      svgWrapper.setAttribute('viewBox', `0 0 ${STANDARD_TOTAL_SIZE} ${STANDARD_TOTAL_SIZE}`);
      
      // Fond blanc
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', `${STANDARD_TOTAL_SIZE}`);
      rect.setAttribute('height', `${STANDARD_TOTAL_SIZE}`);
      rect.setAttribute('fill', 'white');
      svgWrapper.appendChild(rect);
      
      // Groupe pour centrer
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', `translate(${STANDARD_MARGIN}, ${STANDARD_MARGIN})`);
      
      // QR code SVG
      const qrSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      qrSvg.setAttribute('width', `${STANDARD_QR_SIZE}`);
      qrSvg.setAttribute('height', `${STANDARD_QR_SIZE}`);
      qrSvg.setAttribute('viewBox', viewBox);
      qrSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      
      // Copier les enfants
      Array.from(svg.children).forEach(child => {
        qrSvg.appendChild(child.cloneNode(true));
      });
      
      g.appendChild(qrSvg);
      svgWrapper.appendChild(g);
      
      // Télécharger le SVG
      const svgData = new XMLSerializer().serializeToString(svgWrapper);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      link.download = `QRCode_Table_${(tableName || tableId).replace(/[^a-zA-Z0-9]/g, '_')}.svg`;
      link.href = svgUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(svgUrl);
      toast.success(`QR code SVG "${tableName || tableId}" téléchargé (1000x1000px, vectoriel)`);
    };
    
    try {
      // Essayer d'abord le conteneur du tableau
      const container = document.querySelector(`#qr-${tableId}`);
      if (container) {
        const svg = container.querySelector('svg');
        if (svg) {
          processSVGToDownload(svg);
          return;
        }
      }
      
      // Essayer la preview (toujours visible)
      const previewContainer = document.querySelector('[role="region"][aria-label*="Aperçu"]');
      if (previewContainer) {
        const previewSvg = previewContainer.querySelector('svg');
        if (previewSvg && previewTable && previewTable.id === tableId) {
          processSVGToDownload(previewSvg);
          return;
        }
      }
      
      // Si aucun SVG trouvé, utiliser l'URL pour créer un nouveau QR code
      toast.info("Génération du QR code en cours...");
      
      // Créer un conteneur temporaire
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = `${STANDARD_QR_SIZE}px`;
      tempDiv.style.height = `${STANDARD_QR_SIZE}px`;
      document.body.appendChild(tempDiv);
      
      // Utiliser React.createElement pour créer le QR code
      const qrElement = React.createElement(QRCode, {
        value: tableUrl,
        size: STANDARD_QR_SIZE,
        fgColor: qrCustomization.fgColor,
        bgColor: qrCustomization.bgColor,
        renderAs: 'svg'
      });
      
      // Rendre le composant
      const ReactDOM = require('react-dom');
      ReactDOM.render(qrElement, tempDiv);
      
      // Attendre le rendu
      setTimeout(() => {
        const svg = tempDiv.querySelector('svg');
        if (svg) {
          processSVGToDownload(svg);
        } else {
          toast.error("Impossible de générer le QR code");
        }
        ReactDOM.unmountComponentAtNode(tempDiv);
        document.body.removeChild(tempDiv);
      }, 500);
    } catch (error) {
      console.error('Erreur lors du téléchargement SVG:', error);
      toast.error("Erreur lors du téléchargement: " + (error.message || 'Erreur inconnue'));
    }
  };

  // Partager un QR code (copier le lien)
  const shareQRCode = async (tableId, tableName) => {
    const url = getTableUrl(tableId);
    const success = await copyToClipboard(url);
    if (success) {
      toast.success(`Lien de la table "${tableName || tableId}" copié dans le presse-papiers`);
    } else {
      toast.error("Impossible de copier le lien");
    }
  };

  // Télécharger plusieurs QR codes en PNG
  const downloadMultipleQRCodes = () => {
    if (selectedTables.size === 0) {
      toast.warning("Veuillez sélectionner au moins une table");
      return;
    }
    
    const selectedArray = Array.from(selectedTables);
    let delay = 0;
    
    selectedArray.forEach((tableId) => {
      const table = tables.find(t => t.id === tableId);
      if (table) {
        setTimeout(() => {
          downloadQRCodePNG(tableId, table.name);
        }, delay);
        delay += 500; // Délai de 500ms entre chaque téléchargement
      }
    });
    
    toast.info(`Téléchargement de ${selectedArray.length} QR code(s) en cours...`);
  };

  // Export PDF (simplifié - ouvre la fenêtre d'impression avec dimensions standard)
  const exportToPDF = () => {
    if (selectedTables.size === 0) {
      toast.warning("Veuillez sélectionner au moins une table");
      return;
    }

    const selectedArray = Array.from(selectedTables);
    const selectedTablesData = tables.filter(t => selectedArray.includes(t.id));
    
    try {
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      
      if (!printWindow) {
        toast.warning("Veuillez autoriser les popups pour l'impression");
        return;
      }
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>QR Codes - Export PDF</title>
            <style>
              @media print {
                @page {
                  size: A4;
                  margin: 20mm;
                }
                body {
                  margin: 0;
                  padding: 0;
                }
              }
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
              }
              .qr-container {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 30px;
                page-break-inside: avoid;
              }
              .qr-item {
                text-align: center;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 8px;
                page-break-inside: avoid;
              }
              .qr-item h3 {
                margin: 10px 0;
                font-size: 18px;
                font-weight: bold;
              }
              .qr-code {
                margin: 10px auto;
              }
              .qr-url {
                font-size: 10px;
                color: #666;
                word-break: break-all;
                margin-top: 10px;
              }
            </style>
          </head>
          <body>
            <h1 style="text-align: center; margin-bottom: 30px;">QR Codes des Tables</h1>
            <div class="qr-container">
              ${selectedTablesData.map(table => `
                <div class="qr-item">
                  <h3>Table ${table.name || table.id}</h3>
                  <div class="qr-code" id="qr-${table.id}"></div>
                  <p class="qr-url">${getTableUrl(table.id)}</p>
                </div>
              `).join('')}
            </div>
            <script src="https://unpkg.com/qrcode.react/dist/index.umd.js"></script>
            <script>
              ${selectedTablesData.map(table => `
                (function() {
                  var container = document.getElementById('qr-${table.id}');
                  var QRCode = window.QRCode;
                  var code = new QRCode({ value: '${getTableUrl(table.id)}', size: 200 });
                  container.appendChild(code._el);
                })();
              `).join('')}
              setTimeout(() => {
                window.print();
              }, 500);
            </script>
          </body>
        </html>
      `;
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      toast.success("Ouverture de la boîte de dialogue d'impression...");
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      toast.error('Erreur lors de l\'export PDF: ' + error.message);
    }
  };

  // Imprimer un QR code individuel - ouvre directement la boîte de dialogue d'impression
  const handlePrint = (tableId, tableName) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) {
      toast.error("Table introuvable");
      return;
    }

    try {
      // Créer une nouvelle fenêtre pour l'impression
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      
      if (!printWindow) {
        // Si popup bloquée, utiliser window.print() directement
        toast.warning("Veuillez autoriser les popups pour l'impression");
        return;
      }

      // Écrire le contenu dans la nouvelle fenêtre
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>QR Code - Table ${tableName || tableId}</title>
            <style>
              @media print {
                @page {
                  size: A4;
                  margin: 20mm;
                }
                body {
                  margin: 0;
                  padding: 0;
                }
              }
              body {
                font-family: Arial, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                padding: 20px;
              }
              h1 {
                font-size: 32px;
                font-weight: bold;
                margin-bottom: 20px;
                text-align: center;
                color: #FF5A1F;
              }
              h2 {
                font-size: 24px;
                margin-bottom: 30px;
                text-align: center;
              }
              .table-name {
                font-size: 24px;
                font-weight: bold;
                margin: 20px 0;
              }
              .instruction {
                font-size: 14px;
                color: #666;
                margin-top: 20px;
              }
              svg {
                display: block;
                margin: 0 auto;
              }
            </style>
          </head>
          <body>
            <h1>QR Code MenuHub</h1>
            <div class="table-name">Table ${tableName || tableId}</div>
            <div id="qrcode"></div>
            <p class="instruction">Scannez pour voir le menu</p>
            <p style="font-size: 10px; color: #999; margin-top: 10px;">${getTableUrl(tableId)}</p>
            <script src="https://unpkg.com/qrcode.react/dist/index.umd.js"></script>
            <script>
              var QRCode = window.QRCode;
              var container = document.getElementById('qrcode');
              var code = new QRCode({ value: '${getTableUrl(tableId)}', size: 400 });
              container.appendChild(code._el);
              setTimeout(() => {
                window.print();
              }, 500);
            </script>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      toast.success("Ouverture de la boîte de dialogue d'impression...");
    } catch (error) {
      console.error('Erreur lors de l\'impression:', error);
      toast.error('Erreur lors de l\'impression: ' + error.message);
    }
  };

  // Générer tous les QR codes (télécharger tous)
  const handleGenerateAll = () => {
    if (tables.length === 0) {
      toast.warning("Aucune table à générer");
      return;
    }
    // Sélectionner toutes les tables
    const allTableIds = new Set(tables.map(t => t.id));
    setSelectedTables(allTableIds);
    toast.info(`${tables.length} table(s) sélectionnée(s). Utilisez "Télécharger sélection" pour les télécharger.`);
  };

  // Gestion de la sélection
  const toggleTableSelection = (tableId) => {
    const newSelection = new Set(selectedTables);
    if (newSelection.has(tableId)) {
      newSelection.delete(tableId);
    } else {
      newSelection.add(tableId);
    }
    setSelectedTables(newSelection);
  };

  const selectAllTables = () => {
    const allTableIds = new Set(tables.map(t => t.id));
    setSelectedTables(allTableIds);
  };

  const deselectAllTables = () => {
    setSelectedTables(new Set());
  };

  // Filtrer et trier les tables
  const filteredAndSortedTables = useMemo(() => {
    let result = [...tables];

    // Appliquer la recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(table => 
        table.name?.toLowerCase().includes(query) ||
        table.id?.toLowerCase().includes(query) ||
        getTableUrl(table.id).toLowerCase().includes(query)
      );
    }

    // Appliquer le filtre de statut (pour l'instant, toutes les tables sont actives)
    // Cette fonctionnalité peut être étendue plus tard si nécessaire
    if (filterStatus !== 'all') {
      // TODO: Implémenter le filtre de statut si nécessaire
    }

    // Trier les tables
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          const nameA = (a.name || a.id || '').toLowerCase();
          const nameB = (b.name || b.id || '').toLowerCase();
          comparison = nameA.localeCompare(nameB, 'fr', { numeric: true, sensitivity: 'base' });
          break;
        case 'date':
          const dateA = new Date(a.createdAt || a.created_at || 0);
          const dateB = new Date(b.createdAt || b.created_at || 0);
          if (isNaN(dateA.getTime())) comparison = 1;
          else if (isNaN(dateB.getTime())) comparison = -1;
          else comparison = dateA.getTime() - dateB.getTime();
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [tables, searchQuery, filterStatus, sortBy, sortOrder, getTableUrl]);

  // Fonction pour mettre à jour le nom d'une table
  const handleUpdateTableName = async (tableId, newName) => {
    if (!newName || !newName.trim()) {
      toast.error("Le nom de la table ne peut pas être vide");
      return;
    }
    
    setUpdatingTable(prev => new Set(prev).add(tableId));
    try {
      const response = await updateTable(tableId, { name: newName.trim() }, token);
      
      // Vérifier si la mise à jour a réussi
      if (!response) {
        // Si response est null, l'erreur a déjà été gérée par la fonction request
        toast.error("Erreur lors de la mise à jour du nom de la table");
        throw new Error("Erreur lors de la mise à jour");
      }
      
      // Vérifier si la réponse contient une erreur (format backend)
      if (response.error) {
        const errorMsg = typeof response.error === 'string' 
          ? response.error 
          : (response.error?.message || response.error?.code || 'Erreur lors de la mise à jour du nom de la table');
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      // Succès
      toast.success(`Table renommée en "${newName.trim()}"`);
      // Rafraîchir la liste
      const result = await fetchTables(placeId, token);
      if (result) {
        setTables(result);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      const errorMsg = error?.message || "Erreur lors de la mise à jour du nom de la table";
      if (!errorMsg.includes("Erreur lors de la mise à jour")) {
        toast.error(errorMsg);
      }
      throw error;
    } finally {
      setUpdatingTable(prev => {
        const newSet = new Set(prev);
        newSet.delete(tableId);
        return newSet;
      });
    }
  };

  // Fonction pour supprimer une table
  const handleDeleteTable = async () => {
    if (!tableToDelete) return;
    
    setDeletingTable(true);
    try {
      const result = await removeTable(tableToDelete.id, token);
      
      // Vérifier si la suppression a réussi
      if (result === false || result === null) {
        // L'erreur a déjà été gérée par la fonction request
        toast.error("Erreur lors de la suppression de la table");
        return;
      }
      
      // Succès (DELETE retourne true ou 204)
      const tableName = tableToDelete.name || tableToDelete.id;
      toast.success(`Table "${tableName}" supprimée avec succès`);
      setShowDeleteModal(false);
      setTableToDelete(null);
      
      // Retirer de la sélection si sélectionnée
      const newSelection = new Set(selectedTables);
      newSelection.delete(tableToDelete.id);
      setSelectedTables(newSelection);
      
      // Retirer de la preview si c'était la table sélectionnée
      if (selectedTableForPreview === tableToDelete.id) {
        const remainingTables = tables.filter(t => t.id !== tableToDelete.id);
        setSelectedTableForPreview(remainingTables.length > 0 ? remainingTables[0].id : null);
      }
      
      // Rafraîchir la liste
      const refreshResult = await fetchTables(placeId, token);
      if (refreshResult) {
        setTables(refreshResult);
      } else {
        // Si le refresh échoue, retirer la table de la liste locale
        setTables(tables.filter(t => t.id !== tableToDelete.id));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      const errorMsg = error?.message || "Erreur lors de la suppression de la table";
      toast.error(errorMsg);
    } finally {
      setDeletingTable(false);
    }
  };

  // Table sélectionnée pour la preview
  const previewTable = selectedTableForPreview 
    ? tables.find(t => t.id === selectedTableForPreview)
    : (tables.length > 0 ? tables[0] : null);

  return (
    <div className="min-h-screen bg-light-surface font-display p-4 sm:p-6 lg:p-8">
      <div className="flex items-center gap-4 mb-6">
        <BackButton onClick={() => history.push(`/places/${placeId}`)} ariaLabel="Retour à la gestion de l'établissement" />
        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight tracking-tight text-dark-text m-0">
          Gestion des QR Codes
        </h3>
      </div>

      {/* État de chargement */}
      {loading && (
        <div className="flex justify-center py-8">
          <Loader text="Chargement des tables..." />
        </div>
      )}

      {/* Message d'erreur */}
      {error && !loading && (
        <div 
          className="bg-red-50 border border-red-200 text-center text-sm text-red-800 rounded-lg p-4 mb-4"
          role="alert"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {!loading && (
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Section principale */}
          <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
            {/* Actions principales */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
              <h1 className="sr-only">Gestion des QR Codes pour les tables</h1>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="primary"
                  onClick={handleGenerateAll}
                  icon={<CheckSquare className="w-4 h-4" />}
                >
                  Générer tous
                </Button>
                {selectedTables.size > 0 && (
                  <>
                    <Button
                      variant="light"
                      onClick={downloadMultipleQRCodes}
                      icon={<Download className="w-4 h-4" />}
                    >
                      Télécharger ({selectedTables.size})
                    </Button>
                    <Button
                      variant="light"
                      onClick={exportToPDF}
                      icon={<FileText className="w-4 h-4" />}
                    >
                      Export PDF
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={deselectAllTables}
                      icon={<X className="w-4 h-4" />}
                    >
                      Annuler
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Barre de recherche et filtres */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-xl border border-gray-border shadow-custom-light">
              <div className="flex-1">
                <label htmlFor="table-search" className="sr-only">
                  Rechercher une table
                </label>
                <SearchInput
                  id="table-search"
                  value={searchInputValue}
                  onChange={(e) => setSearchInputValue(e.target.value)}
                  placeholder="Rechercher une table..."
                  className="w-full"
                  aria-label="Rechercher une table par nom, ID ou URL"
                />
              </div>
              <div className="flex items-center gap-2">
                {/* Tri */}
                <div className="flex items-center gap-1 border border-gray-border rounded-lg p-1 bg-gray-50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newOrder = sortBy === 'name' ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc';
                      setSortBy('name');
                      setSortOrder(newOrder);
                    }}
                    className={`text-xs px-2 ${sortBy === 'name' ? 'bg-primary/10 text-primary' : ''}`}
                    icon={sortBy === 'name' ? (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3" />}
                    title="Trier par nom"
                  >
                    <span className="hidden sm:inline">Nom</span>
                    <span className="sm:hidden">N</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newOrder = sortBy === 'date' ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc';
                      setSortBy('date');
                      setSortOrder(newOrder);
                    }}
                    className={`text-xs px-2 ${sortBy === 'date' ? 'bg-primary/10 text-primary' : ''}`}
                    icon={sortBy === 'date' ? (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3" />}
                    title="Trier par date"
                  >
                    <span className="hidden sm:inline">Date</span>
                    <span className="sm:hidden">D</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Formulaire d'ajout de table */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-xl border border-gray-border shadow-custom-light">
              <form 
                onSubmit={handleAddTable} 
                className="flex-1"
                aria-label="Formulaire d'ajout de table"
              >
                <label htmlFor="new-table-name" className="sr-only">
                  Nom de la nouvelle table
                </label>
                <Input
                  id="new-table-name"
                  type="text"
                  placeholder="Nom ou numéro de la nouvelle table"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  className="w-full"
                  aria-label="Nom ou numéro de la nouvelle table"
                  aria-required="true"
                  aria-invalid={newTableName.trim().length === 0 && newTableName.length > 0}
                  disabled={addingTable}
                />
                {newTableName.trim().length === 0 && newTableName.length > 0 && (
                  <p className="text-red-600 text-xs mt-1" role="alert" aria-live="polite">
                    Le nom de la table est requis
                  </p>
                )}
              </form>
              <div className="flex gap-2 items-center">
                <Button
                  variant="primary"
                  onClick={handleAddTable}
                  disabled={addingTable || !newTableName.trim()}
                  icon={addingTable ? null : <Plus className="w-4 h-4" />}
                  aria-label={addingTable ? "Ajout de la table en cours..." : "Ajouter une nouvelle table"}
                  aria-busy={addingTable}
                >
                  {addingTable ? 'Ajout...' : 'Ajouter une table'}
                </Button>
              </div>
            </div>

            {/* Tableau des tables */}
            {tables.length === 0 ? (
              <div 
                className="bg-white rounded-xl border border-gray-border shadow-custom-light p-6 sm:p-8 text-center"
                role="status"
                aria-live="polite"
              >
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">Aucune table configurée</p>
                <p className="text-xs sm:text-sm text-gray-500">Ajoutez votre première table pour générer des QR codes</p>
              </div>
            ) : filteredAndSortedTables.length === 0 ? (
              <div 
                className="bg-white rounded-xl border border-gray-border shadow-custom-light p-6 sm:p-8 text-center"
                role="status"
                aria-live="polite"
              >
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">Aucune table ne correspond à votre recherche</p>
                <p className="text-xs sm:text-sm text-gray-500">Essayez de modifier vos critères de recherche</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0" role="region" aria-label="Liste des tables">
                <div className="bg-white rounded-xl border border-gray-border shadow-custom-light min-w-full sm:min-w-0">
                  <table className="w-full text-left" role="table" aria-label="Tableau des tables avec QR codes">
                    <thead className="border-b border-gray-border bg-gray-50">
                      <tr>
                        <th className="p-2 sm:p-4 w-10 sm:w-12" scope="col">
                          <button
                            type="button"
                            onClick={selectedTables.size === tables.length ? deselectAllTables : selectAllTables}
                            className="p-1 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                            title={selectedTables.size === tables.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                            aria-label={selectedTables.size === tables.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                          >
                            {selectedTables.size === tables.length ? (
                              <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                            ) : (
                              <Square className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                            )}
                          </button>
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-gray-600 text-xs sm:text-sm font-medium hidden sm:table-cell" scope="col">Preview</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-gray-600 text-xs sm:text-sm font-medium" scope="col">Nom de la table</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-gray-600 text-xs sm:text-sm font-medium hidden md:table-cell" scope="col">URL encodée</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-gray-600 text-xs sm:text-sm font-medium text-right" scope="col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAndSortedTables.map((table) => {
                        const isSelected = selectedTables.has(table.id);
                        const isUpdating = updatingTable.has(table.id);
                        return (
                          <tr
                            key={table.id}
                            className={`border-b border-gray-border hover:bg-primary/5 transition-colors cursor-pointer ${
                              isSelected ? 'bg-primary/10' : ''
                            } ${selectedTableForPreview === table.id ? 'ring-2 ring-primary' : ''}`}
                            onClick={() => setSelectedTableForPreview(table.id)}
                          >
                            <td className="p-2 sm:p-4" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => toggleTableSelection(table.id)}
                                className="p-1 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                                aria-label={isSelected ? `Désélectionner la table ${table.name || table.id}` : `Sélectionner la table ${table.name || table.id}`}
                                aria-pressed={isSelected}
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                ) : (
                                  <Square className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                                )}
                              </button>
                            </td>
                            <td className="px-2 sm:px-4 py-2 hidden sm:table-cell" onClick={(e) => e.stopPropagation()}>
                              <div
                                id={`qr-${table.id}`}
                                className="rounded-lg w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-white border border-gray-border p-1"
                              >
                                <QRCode 
                                  value={getTableUrl(table.id)} 
                                  size={32}
                                  fgColor={qrCustomization.fgColor}
                                  bgColor={qrCustomization.bgColor}
                                />
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 py-2 text-dark-text text-xs sm:text-sm font-medium">
                              <EditableText
                                value={table.name || table.id}
                                onSave={(newName) => handleUpdateTableName(table.id, newName)}
                                placeholder="Nom de la table"
                                textClassName="font-medium text-dark-text"
                                inputClassName="px-2 py-1 border border-primary rounded"
                                disabled={isUpdating}
                                validate={(value) => {
                                  if (!value || value.trim().length < 1) {
                                    return 'Le nom doit contenir au moins 1 caractère';
                                  }
                                  return null;
                                }}
                                onTextClick={(e) => e.stopPropagation()}
                              />
                            </td>
                            <td className="px-2 sm:px-4 py-2 text-gray-600 text-xs sm:text-sm font-normal break-all hidden md:table-cell">
                              <span className="truncate block max-w-xs">{getTableUrl(table.id)}</span>
                            </td>
                            <td className="px-2 sm:px-4 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1 flex-wrap" role="group" aria-label={`Actions pour la table ${table.name || table.id}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => shareQRCode(table.id, table.name)}
                                  icon={<Share2 className="w-4 h-4" />}
                                  title="Partager (copier le lien)"
                                  aria-label={`Partager le lien de la table ${table.name || table.id}`}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => downloadQRCodePNG(table.id, table.name)}
                                  icon={<Download className="w-4 h-4" />}
                                  title="Télécharger PNG (1000x1000px, haute qualité)"
                                  aria-label={`Télécharger le QR code PNG de la table ${table.name || table.id}`}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => downloadQRCodeSVG(table.id, table.name)}
                                  icon={<FileText className="w-4 h-4" />}
                                  title="Télécharger SVG"
                                  aria-label={`Télécharger le QR code SVG de la table ${table.name || table.id}`}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handlePrint(table.id, table.name)}
                                  icon={<Printer className="w-4 h-4" />}
                                  title="Imprimer"
                                  aria-label={`Imprimer le QR code de la table ${table.name || table.id}`}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setTableToDelete(table);
                                    setShowDeleteModal(true);
                                  }}
                                  icon={<Trash2 className="w-4 h-4" />}
                                  title="Supprimer"
                                  className="hover:text-red-600 hover:bg-red-50"
                                  aria-label={`Supprimer la table ${table.name || table.id}`}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Preview et Options */}
          <div className="lg:col-span-1 flex flex-col gap-4 sm:gap-6 order-first lg:order-last">
            {/* Live Preview */}
            <div>
              <h2 className="text-base sm:text-lg font-bold text-dark-text mb-3 sm:mb-4">Aperçu en direct</h2>
              <div 
                className="bg-white rounded-xl border border-gray-border shadow-custom-light p-4 sm:p-6 flex flex-col items-center text-center static lg:sticky lg:top-8"
                role="region"
                aria-label="Aperçu du QR code de la table sélectionnée"
              >
                {previewTable ? (
                  <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-xs aspect-[3/4] flex flex-col justify-between items-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="rounded-full w-12 h-12 bg-primary/10 border-2 border-primary flex items-center justify-center">
                        <span className="text-primary font-bold text-lg">
                          {previewTable.name?.charAt(0) || 'T'}
                        </span>
                      </div>
                      <p className="font-bold text-lg text-dark-text">
                        Table {previewTable.name || previewTable.id}
                      </p>
                    </div>
                    <div className="my-4">
                      <QRCode 
                        value={getTableUrl(previewTable.id)} 
                        size={180}
                        fgColor={qrCustomization.fgColor}
                        bgColor={qrCustomization.bgColor}
                      />
                    </div>
                    <div className="text-center">
                      {qrCustomization.includeText && qrCustomization.text ? (
                        <p className="text-sm text-gray-600 mb-2">{qrCustomization.text}</p>
                      ) : (
                        <p className="text-sm text-gray-600 mb-2">Scannez pour voir le menu</p>
                      )}
                      <p className="text-xs text-gray-400 break-all">{getTableUrl(previewTable.id)}</p>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center w-full"
                    role="status"
                    aria-live="polite"
                  >
                    <p className="text-gray-500 text-sm">Sélectionnez une table pour voir l'aperçu</p>
                  </div>
                )}
              </div>
            </div>

            {/* Informations sur les dimensions standard */}
            <div>
              <h2 className="text-base sm:text-lg font-bold text-dark-text mb-3 sm:mb-4">Spécifications</h2>
              <div className="bg-white rounded-xl border border-gray-border shadow-custom-light p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 static lg:sticky lg:top-[34rem]">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-dark-text mb-2">Dimensions standard</h3>
                    <p className="text-xs text-gray-600">
                      Les QR codes sont générés avec des dimensions professionnelles standardisées :
                    </p>
                    <ul className="text-xs text-gray-600 mt-2 space-y-1 list-disc list-inside">
                      <li>PNG : 1000x1000px (haute qualité)</li>
                      <li>SVG : 1000x1000px (vectoriel)</li>
                      <li>QR code : 800x800px</li>
                      <li>Marge blanche : 100px (zone de silence)</li>
                    </ul>
                  </div>
                  <div className="pt-3 border-t border-gray-border">
                    <h3 className="text-sm font-semibold text-dark-text mb-2">Qualité</h3>
                    <p className="text-xs text-gray-600">
                      Conforme aux normes ISO/IEC 18004 pour une lecture optimale par tous les scanners.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      <Modal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
          setTableToDelete(null);
        }}
        size="md"
        ariaLabel="Supprimer la table"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-dark-text">Supprimer la table ?</h2>
            <p className="text-sm text-gray-600">Cette action est irréversible</p>
          </div>
        </div>
        <p className="text-dark-text mb-4">
          Êtes-vous sûr de vouloir supprimer la table <span className="font-semibold text-red-600">"{tableToDelete?.name || tableToDelete?.id}"</span> ?
        </p>
        <p className="text-sm text-gray-600 mb-4">
          Le QR code associé ne fonctionnera plus après la suppression.
        </p>
        <div className="flex justify-end gap-4">
          <Button
            variant="light"
            onClick={() => {
              setShowDeleteModal(false);
              setTableToDelete(null);
            }}
            disabled={deletingTable}
          >
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteTable}
            disabled={deletingTable}
            icon={deletingTable ? null : <Trash2 className="w-4 h-4" />}
          >
            {deletingTable ? 'Suppression...' : 'Supprimer'}
          </Button>
        </div>
      </Modal>

      {/* Modal de personnalisation avancée */}
      <Modal
        show={showCustomizationModal}
        onHide={() => setShowCustomizationModal(false)}
        size="lg"
        ariaLabel="Personnaliser les QR codes"
      >
        <div className="mb-4">
          <h2 className="text-xl font-bold text-dark-text mb-2">Personnaliser les QR Codes</h2>
          <p className="text-sm text-gray-600">Configurez l'apparence de tous vos QR codes</p>
        </div>

        <div className="space-y-6">
          {/* Taille */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">
              Taille du QR code: {qrCustomization.size}px
            </label>
            <input
              type="range"
              min="128"
              max="512"
              step="32"
              value={qrCustomization.size}
              onChange={(e) => setQrCustomization({ ...qrCustomization, size: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>128px</span>
              <span>512px</span>
            </div>
          </div>

          {/* Couleurs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                Couleur avant-plan
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={qrCustomization.fgColor}
                  onChange={(e) => setQrCustomization({ ...qrCustomization, fgColor: e.target.value })}
                  className="w-16 h-10 rounded border border-gray-border cursor-pointer"
                />
                <Input
                  type="text"
                  value={qrCustomization.fgColor}
                  onChange={(e) => setQrCustomization({ ...qrCustomization, fgColor: e.target.value })}
                  className="flex-1"
                  placeholder="#000000"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">
                Couleur arrière-plan
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={qrCustomization.bgColor}
                  onChange={(e) => setQrCustomization({ ...qrCustomization, bgColor: e.target.value })}
                  className="w-16 h-10 rounded border border-gray-border cursor-pointer"
                />
                <Input
                  type="text"
                  value={qrCustomization.bgColor}
                  onChange={(e) => setQrCustomization({ ...qrCustomization, bgColor: e.target.value })}
                  className="flex-1"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>
          </div>

          {/* Texte sous le QR code */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="includeText"
                checked={qrCustomization.includeText}
                onChange={(e) => setQrCustomization({ ...qrCustomization, includeText: e.target.checked })}
                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
              />
              <label htmlFor="includeText" className="text-sm font-medium text-dark-text">
                Afficher un texte sous le QR code
              </label>
            </div>
            {qrCustomization.includeText && (
              <Input
                type="text"
                value={qrCustomization.text}
                onChange={(e) => setQrCustomization({ ...qrCustomization, text: e.target.value })}
                placeholder="Scannez pour voir le menu"
                className="mt-2"
              />
            )}
          </div>

          {/* Aperçu */}
          <div className="bg-gray-50 rounded-lg p-6 flex flex-col items-center">
            <p className="text-sm text-gray-600 mb-4">Aperçu</p>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <QRCode 
                value={previewTable ? getTableUrl(previewTable.id) : 'https://example.com'} 
                size={qrCustomization.size > 200 ? 200 : qrCustomization.size}
                fgColor={qrCustomization.fgColor}
                bgColor={qrCustomization.bgColor}
              />
              {qrCustomization.includeText && qrCustomization.text && (
                <p className="text-xs text-center text-gray-600 mt-2">{qrCustomization.text}</p>
              )}
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-border">
            <Button
              variant="light"
              onClick={() => {
                setQrCustomization({
                  size: 256,
                  fgColor: '#000000',
                  bgColor: '#FFFFFF',
                  logo: null,
                  logoSize: 40,
                  includeText: true,
                  text: 'Scannez pour voir le menu'
                });
                toast.info("Paramètres réinitialisés");
              }}
            >
              Réinitialiser
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowCustomizationModal(false);
                toast.success("Personnalisation appliquée");
              }}
            >
              Appliquer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QRCodesPage;
