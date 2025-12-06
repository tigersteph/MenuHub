import React, { useState } from 'react';
import { Card, Button, Form, Row, Col } from 'react-bootstrap';
import QRCode from 'qrcode.react';
import BackButton from '../components/ui/BackButton';
import { useHistory } from 'react-router-dom';

// Page QR code moderne et responsive pour tous les restaurateurs
const QRCodes = () => {
  const [restaurantName, setRestaurantName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [showQR, setShowQR] = useState(false);

  // URL à encoder dans le QR code
  const getQRUrl = () => {
    // URL personnalisée pour chaque restaurant/table
    return `${window.location.origin}/menu/${encodeURIComponent(restaurantName)}/table/${encodeURIComponent(tableNumber)}`;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html><head><title>QR Code Table</title></head><body style='display:flex;flex-direction:column;align-items:center;background:#f8f9fa;'>
      <h2 style='color:#ff3366;font-family:sans-serif;'>QR Code MenuHub</h2>
      <div style='margin:2rem;'>
        <div id='qrcode'></div>
        <div style='margin-top:1rem;font-size:1.2rem;font-weight:bold;'>${restaurantName ? restaurantName : ''}${tableNumber ? ' - Table ' + tableNumber : ''}</div>
      </div>
      <script src='https://unpkg.com/qrcode.react/dist/index.umd.js'></script>
      <script>
        var QRCode = window.QRCode;
        var container = document.getElementById('qrcode');
        var code = new QRCode({ value: '${getQRUrl()}', size: 256 });
        container.appendChild(code._el);
      </script>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const history = useHistory();
  return (
    <div className="min-h-screen bg-background-lightbg-zinc-900 font-display p-6 lg:p-8">
      <div className="max-w-3xl mx-auto bg-surface-lightbg-zinc-800 rounded-xl border border-border-lightborder-zinc-700 p-6 shadow-lgshadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <BackButton onClick={() => history.goBack()} ariaLabel="Retour" />
          <h2 className="text-2xl font-black tracking-tight text-zinc-900text-zinc-100 m-0">Générer un QR Code MenuHub</h2>
        </div>
        <form className="mt-6 grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-900text-zinc-100 mb-2">Nom du restaurant</label>
            <input className="mt-1 w-full bg-whitebg-zinc-800 border border-gray-200border-zinc-700 rounded-lg py-2 px-3 text-zinc-900text-zinc-100 placeholder:text-zinc-400placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primaryfocus:ring-[#FF6A2A]" type="text" value={restaurantName} onChange={e => setRestaurantName(e.target.value)} placeholder="Ex: Le Gourmet" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-900text-zinc-100 mb-2">Numéro de table</label>
            <input className="mt-1 w-full bg-whitebg-zinc-800 border border-gray-200border-zinc-700 rounded-lg py-2 px-3 text-zinc-900text-zinc-100 placeholder:text-zinc-400placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primaryfocus:ring-[#FF6A2A]" type="text" value={tableNumber} onChange={e => setTableNumber(e.target.value)} placeholder="Ex: 12" />
          </div>
          <div className="flex justify-center">
            <button className="bg-primarybg-[#FF6A2A] text-white font-bold py-2.5 px-5 rounded-lg disabled:opacity-50 hover:bg-primary/90hover:bg-[#FF7A3A] transition-colors focus:outline-none focus:ring-2 focus:ring-primaryfocus:ring-[#FB923C]" onClick={e => {e.preventDefault();setShowQR(true);}} disabled={!restaurantName || !tableNumber}>
              Générer le QR Code
            </button>
          </div>
        </form>
        {showQR && (
          <div className="flex flex-col items-center mt-6">
            <QRCode value={getQRUrl()} size={220} style={{boxShadow:'0 2px 16px rgba(0,0,0,0.1)',borderRadius:'1rem',background:'#fff',padding:'1rem'}} />
            <div className="mt-3 mb-2 text-base font-bold text-zinc-900text-zinc-100">{restaurantName} - Table {tableNumber}</div>
            <button className="bg-primarybg-[#FF6A2A] text-white font-bold py-2.5 px-5 rounded-lg hover:bg-primary/90hover:bg-[#FF7A3A] transition-colors focus:outline-none focus:ring-2 focus:ring-primaryfocus:ring-[#FB923C]" onClick={handlePrint}>
              Imprimer le QR Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodes;
