import React from 'react';
import QRCode from './QRCode';
import { Row, Col } from 'react-bootstrap';

const QRCodesList = ({ tables, placeId }) => {
  return (
    <Row>
      {tables.map((table) => (
        <Col key={table} xs={12} sm={6} md={4} lg={3} className="mb-4">
          <QRCode table={table} placeId={placeId} />
        </Col>
      ))}
    </Row>
  );
};

export default QRCodesList;
