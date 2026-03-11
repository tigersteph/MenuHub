import React from 'react';
import { Spinner } from 'react-bootstrap';

const Loader = ({ text }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '120px' }}>
    <Spinner animation="border" role="status" style={{color:'#f7651d', width:48, height:48, borderWidth:4}} />
    <div style={{ marginTop: 16, color:'#f7651d', fontWeight:'bold', fontSize:18, animation:'fadein 1.2s' }}>
      {text || "Chargement en cours..."}
    </div>
    <style>{`
      @keyframes fadein {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `}</style>
  </div>
);

export default Loader;
