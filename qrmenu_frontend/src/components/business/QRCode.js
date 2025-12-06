import React, { useRef, useState } from 'react';
import QRCodeReact from 'qrcode.react';
import { Share2, Download, FileImage, Printer, Trash2, ExternalLink, Check } from 'lucide-react';
import { toast } from '../../utils/toast';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const ComponentToPrint = styled.div`
  text-align: center;
  margin-top: 200px;
  h1 {
    font-size: 100px;
    font-weight: bold;
    margin-bottom: 50px;
  }
  h2 {
    font-size: 60px;
    margin-bottom: 100px
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  width: 100%;
  margin-top: 8px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const QRCode = ({ table, placeId, onDelete, showDelete = false }) => {
  const qrCodeRef = useRef(null);
  const componentRef = useRef();
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Fonction pour imprimer directement via la boîte de dialogue du navigateur
  const handlePrint = () => {
    if (!componentRef.current) {
      toast.error('Contenu d\'impression non disponible');
      return;
    }

    try {
      // Créer une nouvelle fenêtre pour l'impression
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      
      if (!printWindow) {
        // Si popup bloquée, utiliser window.print() directement
        // Afficher temporairement le contenu
        const printContent = componentRef.current.cloneNode(true);
        printContent.style.position = 'absolute';
        printContent.style.left = '-9999px';
        printContent.style.visibility = 'visible';
        printContent.style.display = 'block';
        document.body.appendChild(printContent);
        
        window.print();
        
        // Nettoyer après impression
        setTimeout(() => {
          document.body.removeChild(printContent);
        }, 1000);
        return;
      }

      // Écrire le contenu dans la nouvelle fenêtre
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>QR Code - Table ${table}</title>
            <style>
              @media print {
                @page {
                  margin: 20mm;
                  size: A4;
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
              }
              h2 {
                font-size: 24px;
                margin-bottom: 30px;
                text-align: center;
              }
              svg {
                display: block;
                margin: 0 auto;
              }
            </style>
          </head>
          <body>
            ${componentRef.current.innerHTML}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Attendre que le contenu soit chargé puis lancer l'impression
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          // Fermer la fenêtre après impression (optionnel)
          // printWindow.close();
        }, 250);
      };
      
      toast.success('Ouverture de la boîte de dialogue d\'impression...');
    } catch (error) {
      console.error('Erreur lors de l\'impression:', error);
      toast.error('Erreur lors de l\'impression: ' + error.message);
    }
  };

  const url = `${window.location.origin}/menu/${placeId}/${table}`;

  // Fonction pour partager (Web Share API avec fallback)
  const handleShare = async () => {
    const shareData = {
      title: `QR Code - Table ${table}`,
      text: `Scannez ce QR code pour accéder au menu de la table ${table}`,
      url: url,
    };

    try {
      // Vérifier si Web Share API est disponible
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success('Lien partagé avec succès');
      } else {
        // Fallback : copier le lien dans le presse-papier
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success('Lien copié dans le presse-papier');
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      // L'utilisateur a annulé le partage ou erreur
      if (error.name !== 'AbortError') {
        // Fallback : copier le lien
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          toast.success('Lien copié dans le presse-papier');
          setTimeout(() => setCopied(false), 2000);
        } catch (clipboardError) {
          toast.error('Impossible de partager ou copier le lien');
        }
      }
    }
  };

  // Fonction pour télécharger en SVG
  const handleDownloadSVG = async () => {
    if (!qrCodeRef.current) return;
    
    setIsDownloading(true);
    try {
      const svgElement = qrCodeRef.current.querySelector('svg');
      if (!svgElement) {
        toast.error('Impossible de trouver le QR code');
        return;
      }

      // Dimensions recommandées pour QR code professionnel : 1000x1000px avec marge
      const QR_SIZE = 800; // Taille du QR code
      const MARGIN = 100; // Marge blanche de chaque côté
      const TOTAL_SIZE = QR_SIZE + (MARGIN * 2); // 1000x1000px
      
      // Obtenir le viewBox original du SVG
      const originalViewBox = svgElement.getAttribute('viewBox') || svgElement.getAttribute('viewbox') || '0 0 200 200';
      
      // Créer un nouveau SVG wrapper avec fond blanc
      const svgWrapper = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgWrapper.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svgWrapper.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      svgWrapper.setAttribute('width', `${TOTAL_SIZE}`);
      svgWrapper.setAttribute('height', `${TOTAL_SIZE}`);
      svgWrapper.setAttribute('viewBox', `0 0 ${TOTAL_SIZE} ${TOTAL_SIZE}`);
      
      // Ajouter un fond blanc
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', `${TOTAL_SIZE}`);
      rect.setAttribute('height', `${TOTAL_SIZE}`);
      rect.setAttribute('fill', 'white');
      svgWrapper.appendChild(rect);
      
      // Créer un groupe pour centrer le QR code
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', `translate(${MARGIN}, ${MARGIN})`);
      
      // Créer un nouveau SVG pour le QR code avec les bonnes dimensions
      const qrSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      qrSvg.setAttribute('width', `${QR_SIZE}`);
      qrSvg.setAttribute('height', `${QR_SIZE}`);
      qrSvg.setAttribute('viewBox', originalViewBox);
      
      // Copier tous les enfants du SVG original
      Array.from(svgElement.children).forEach(child => {
        const clonedChild = child.cloneNode(true);
        qrSvg.appendChild(clonedChild);
      });
      
      g.appendChild(qrSvg);
      svgWrapper.appendChild(g);
      
      // Convertir en blob et télécharger
      const svgData = new XMLSerializer().serializeToString(svgWrapper);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `QRCode_Table_${table}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      
      toast.success('QR code téléchargé en SVG');
    } catch (error) {
      console.error('Erreur lors du téléchargement SVG:', error);
      toast.error('Erreur lors du téléchargement SVG: ' + error.message);
    } finally {
      setIsDownloading(false);
    }
  };

  // Fonction pour télécharger en PNG
  const handleDownloadPNG = async () => {
    if (!qrCodeRef.current) return;
    
    setIsDownloading(true);
    try {
      const svgElement = qrCodeRef.current.querySelector('svg');
      if (!svgElement) {
        toast.error('Impossible de trouver le QR code');
        return;
      }

      // Dimensions recommandées pour QR code professionnel (normes ISO/IEC 18004)
      // 1000x1000px à 300 DPI = qualité professionnelle pour impression et affichage
      const QR_SIZE = 800; // Taille du QR code en pixels
      const MARGIN = 100; // Marge blanche de chaque côté (zone de silence recommandée)
      const TOTAL_SIZE = QR_SIZE + (MARGIN * 2); // 1000x1000px total
      const SCALE = 2; // Facteur d'échelle pour haute qualité (2x = 2000x2000px réels)
      
      // Obtenir le viewBox original
      const originalViewBox = svgElement.getAttribute('viewBox') || svgElement.getAttribute('viewbox') || '0 0 200 200';
      
      // Créer un SVG wrapper avec fond blanc
      const svgWrapper = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgWrapper.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svgWrapper.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      svgWrapper.setAttribute('width', `${TOTAL_SIZE}`);
      svgWrapper.setAttribute('height', `${TOTAL_SIZE}`);
      svgWrapper.setAttribute('viewBox', `0 0 ${TOTAL_SIZE} ${TOTAL_SIZE}`);
      
      // Ajouter un fond blanc
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', `${TOTAL_SIZE}`);
      rect.setAttribute('height', `${TOTAL_SIZE}`);
      rect.setAttribute('fill', 'white');
      svgWrapper.appendChild(rect);
      
      // Créer un groupe pour centrer le QR code
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('transform', `translate(${MARGIN}, ${MARGIN})`);
      
      // Créer un nouveau SVG pour le QR code avec les bonnes dimensions
      const qrSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      qrSvg.setAttribute('width', `${QR_SIZE}`);
      qrSvg.setAttribute('height', `${QR_SIZE}`);
      qrSvg.setAttribute('viewBox', originalViewBox);
      
      // Copier tous les enfants du SVG original
      Array.from(svgElement.children).forEach(child => {
        const clonedChild = child.cloneNode(true);
        qrSvg.appendChild(clonedChild);
      });
      
      g.appendChild(qrSvg);
      svgWrapper.appendChild(g);
      
      // Convertir SVG en PNG via canvas avec haute qualité
      const svgData = new XMLSerializer().serializeToString(svgWrapper);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      // Canvas à haute résolution pour qualité professionnelle
      canvas.width = TOTAL_SIZE * SCALE; // 2000px
      canvas.height = TOTAL_SIZE * SCALE; // 2000px
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout lors du chargement de l\'image'));
        }, 10000);
        
        img.onload = () => {
          clearTimeout(timeout);
          
          // Remplir le canvas avec un fond blanc
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Dessiner l'image SVG sur le canvas avec la haute résolution
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Convertir en blob PNG avec qualité maximale
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Impossible de créer le PNG'));
              return;
            }
            
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `QRCode_Table_${table}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
            
            toast.success('QR code téléchargé en PNG (1000x1000px, haute qualité)');
            resolve();
          }, 'image/png', 1.0); // Qualité maximale (1.0)
        };
        
        img.onerror = (error) => {
          clearTimeout(timeout);
          console.error('Erreur lors du chargement de l\'image SVG:', error);
          reject(new Error('Erreur lors du chargement de l\'image SVG'));
        };
        
        // Encoder le SVG en data URL
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const reader = new FileReader();
        
        reader.onload = (e) => {
          img.src = e.target.result;
        };
        
        reader.onerror = () => {
          clearTimeout(timeout);
          // Fallback : utiliser base64
          img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
        };
        
        reader.readAsDataURL(svgBlob);
      });
    } catch (error) {
      console.error('Erreur lors du téléchargement PNG:', error);
      toast.error('Erreur lors du téléchargement PNG: ' + error.message);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Container>
      <div ref={qrCodeRef}>
        <QRCodeReact value={url} size={200} />
      </div>
      
      <ButtonGroup>
        <ActionButton onClick={handleShare} title="Partager le QR code">
          {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          <span>{copied ? 'Copié' : 'Partager'}</span>
        </ActionButton>
        
        <ActionButton 
          onClick={handleDownloadSVG} 
          disabled={isDownloading}
          title="Télécharger en SVG (vectoriel, redimensionnable)"
        >
          <Download className="w-4 h-4" />
          <span>SVG</span>
        </ActionButton>
        
        <ActionButton 
          onClick={handleDownloadPNG} 
          disabled={isDownloading}
          title="Télécharger en PNG (image haute qualité)"
        >
          <FileImage className="w-4 h-4" />
          <span>PNG</span>
        </ActionButton>
        
        <ActionButton onClick={handlePrint} title="Imprimer le QR code">
          <Printer className="w-4 h-4" />
          <span>Imprimer</span>
        </ActionButton>
        
        <ActionButton 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          as="a"
          title="Ouvrir le menu dans un nouvel onglet"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Menu</span>
        </ActionButton>
        
        {showDelete && onDelete && (
          <ActionButton 
            onClick={() => onDelete(table)} 
            title="Supprimer la table"
            style={{ 
              color: '#dc2626', 
              borderColor: '#fecaca',
              background: '#fef2f2'
            }}
          >
            <Trash2 className="w-4 h-4" />
            <span>Supprimer</span>
          </ActionButton>
        )}
      </ButtonGroup>

      {/* Composant caché pour l'impression - Utiliser visibility au lieu de display pour que useReactToPrint puisse le trouver */}
      <div style={{ position: 'absolute', left: '-9999px', visibility: 'hidden' }}>
        <ComponentToPrint ref={componentRef}>
          <h1>Table {table}</h1>
          <h2>Scannez pour le menu</h2>
          <QRCodeReact value={url} size={500} />
        </ComponentToPrint>
      </div>
    </Container>
  );
};

export default QRCode;