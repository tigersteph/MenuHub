import React, { useEffect, useState, useCallback } from 'react';
import { fetchTables, addTable, updateTable, removeTable } from '../services';
import { Button, Table, Form, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import Loader from './Loader';
import { toast } from '../../utils/toast';

const TablesManager = ({ placeId, token }) => {
  const { t } = useTranslation();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [editingTable, setEditingTable] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [editingStatus, setEditingStatus] = useState('active');

  const loadTables = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTables(placeId, token);
      if (data) setTables(data);
    } catch (e) {
      toast.error(t('tables.loadError'));
    } finally {
      setLoading(false);
    }
  }, [placeId, token, t]);

  useEffect(() => {
    loadTables();
  }, [placeId, token, loadTables]);

  const handleAddTable = async () => {
    if (!newTableName) return;
    setLoading(true);
    try {
      await addTable({ name: newTableName, place_id: placeId }, token);
      toast.success(t('tables.addSuccess'));
      setNewTableName('');
      await loadTables();
    } catch (e) {
      toast.error(t('tables.addError'));
    } finally {
      setLoading(false);
    }
  };

  const handleEditTable = (table) => {
    setEditingTable(table.id);
    setEditingName(table.name);
    setEditingStatus(table.status);
  };

  const handleUpdateTable = async () => {
    setLoading(true);
    try {
      await updateTable(editingTable, { name: editingName, status: editingStatus }, token);
      toast.success(t('tables.updateSuccess'));
      setEditingTable(null);
      await loadTables();
    } catch (e) {
      toast.error(t('tables.updateError'));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTable = async (id) => {
    setLoading(true);
    try {
      await removeTable(id, token);
      toast.success(t('tables.deleteSuccess'));
      await loadTables();
    } catch (e) {
      toast.error(t('tables.deleteError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4 style={{color:'#ff3366'}}>{t('tables')} {t('settings')}</h4>
      <div className="mb-3 p-3 bg-white rounded shadow-sm">
        <p className="text-muted mb-2">Les tables permettent d’identifier les zones de commande dans votre restaurant (ex : Table 1, Terrasse, Salon privé).<br/>Vous pouvez ajouter, modifier ou supprimer des tables à tout moment.</p>
      </div>
      <Row className="mb-3">
        <Col xs={8}>
          <Form.Control
            type="text"
            placeholder={t('table') + ' ' + t('add')}
            value={newTableName}
            onChange={e => setNewTableName(e.target.value)}
            disabled={loading}
          />
        </Col>
        <Col xs={4}>
          <Button style={{background:'#ff3366', border:'none'}} onClick={handleAddTable} disabled={loading}>{t('add')}</Button>
        </Col>
      </Row>
      {loading ? (
        <Loader text={t('tables.loading')} />
      ) : tables.length === 0 ? (
        <div className="text-center p-4 bg-white rounded shadow-sm mb-4">
          <h5 className="mb-3" style={{color:'#ff3366'}}>Aucune table enregistrée</h5>
          <p>Ajoutez vos premières tables pour permettre la prise de commande par QR code.</p>
        </div>
      ) : (
        <Table bordered>
          <thead>
            <tr>
              <th>{t('table')}</th>
              <th>{t('status')}</th>
              <th>{t('settings')}</th>
            </tr>
          </thead>
          <tbody>
            {tables.map(table => (
              <tr key={table.id}>
                <td>
                  {editingTable === table.id ? (
                    <Form.Control
                      type="text"
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      disabled={loading}
                    />
                  ) : (
                    table.name
                  )}
                </td>
                <td>
                  {editingTable === table.id ? (
                    <Form.Control
                      as="select"
                      value={editingStatus}
                      onChange={e => setEditingStatus(e.target.value)}
                      disabled={loading}
                    >
                      <option value="active">{t('active')}</option>
                      <option value="inactive">{t('inactive')}</option>
                    </Form.Control>
                  ) : (
                    t(table.status)
                  )}
                </td>
                <td>
                  {editingTable === table.id ? (
                    <>
                      <Button size="sm" style={{background:'#ff3366', border:'none'}} onClick={handleUpdateTable} disabled={loading}>{t('save')}</Button>{' '}
                      <Button size="sm" variant="secondary" onClick={() => setEditingTable(null)} disabled={loading}>{t('cancel')}</Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" style={{background:'#ff3366', border:'none'}} onClick={() => handleEditTable(table)} disabled={loading}>{t('edit')}</Button>{' '}
                      <Button size="sm" variant="danger" onClick={() => handleRemoveTable(table.id)} disabled={loading}>{t('delete')}</Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default TablesManager;
