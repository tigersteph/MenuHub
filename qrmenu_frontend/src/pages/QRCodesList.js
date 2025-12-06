import React, { useEffect, useState } from 'react';
import { Button, Card, Spinner } from 'react-bootstrap';
import QRCode from 'qrcode.react';
import { fetchTables } from '../services';

// Cette page affiche la liste des tables du restaurant et génère un QR code pour chacune
// Accessible à tous les restaurateurs

const QRCodesList = ({ placeId, token }) => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTables() {
      setLoading(true);
      const result = await fetchTables(placeId, token);
      setTables(result || []);
      setLoading(false);
    }
    loadTables();
  }, [placeId, token]);

  // URL à encoder dans le QR code (exemple : url/menu/table/{tableId})
  const getTableUrl = (tableId) => `${window.location.origin}/menu/table/${tableId}`;

  const handlePrint = (tableId) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html><head><title>QR Code Table</title></head><body style='display:flex;flex-direction:column;align-items:center;'>
      <h2>QR Code pour la table</h2>
      <div id='qrcode'></div>
      <script src='https://unpkg.com/qrcode.react/dist/index.umd.js'></script>
      <script>
        var QRCode = window.QRCode;
        var container = document.getElementById('qrcode');
        var code = new QRCode({ value: '${getTableUrl(tableId)}', size: 256 });
        container.appendChild(code._el);
      </script>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <h3>QR Codes des tables</h3>
      <div style={{display:'flex',flexWrap:'wrap',gap:'2rem'}}>
        {tables.map(table => (
          <Card key={table.id} style={{width:300,padding:16,alignItems:'center'}}>
            <h5>Table : {table.name || table.id}</h5>
            <QRCode value={getTableUrl(table.id)} size={180} />
            <Button variant="primary" style={{marginTop:12}} onClick={() => handlePrint(table.id)}>
              Imprimer le QR code
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QRCodesList;
