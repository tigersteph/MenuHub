import React, { useState, useEffect, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';
// import { useTranslation } from 'react-i18next'; // inutilisé
import styled from 'styled-components';
import AuthContext from '../contexts/AuthContext';
import { toast } from '../utils/toast';

import { fetchPlace, updatePlace, uploadImage } from '../services';
import MainLayout from '../layouts/MainLayout';
import BackButton from '../components/ui/BackButton';

const Panel = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 1px 1px 10px rgba(0,0,0,0.05);
`;

const MenuSettings = () => {
  // const { t } = useTranslation(); // inutilisé
  const [place, setPlace] = useState({});
  const [font, setFont] = useState("");
  const [color, setColor] = useState("");
  const [logo, setLogo] = useState("");
  const [loading, setLoading] = useState(false);

  const params = useParams();
  const history = useHistory();
  const auth = useContext(AuthContext);

  const onBack = () => history.push(`/places/${params.id}`);

  // onFetchPlace déplacé dans useEffect

  const onUpdatePlace = async () => {
    setLoading(true);
    const json = await updatePlace(place.id, { font, color, logoUrl: logo, logo_url: logo }, auth.token);
    if (json) {
      toast.success("New settings is updated");
      setPlace(json);
      setLoading(false);
    }
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const result = await uploadImage(file);
    if (result && result.secure_url) {
      setLogo(result.secure_url);
    }
  }

  useEffect(() => {
    const fetch = async () => {
      const json = await fetchPlace(params.id);
      if (json) {
        setPlace(json);
        setFont(json.font);
        setColor(json.color);
        setLogo(json.logoUrl || json.logo_url || "");
      }
    };
    fetch();
  }, [params.id]);

  return (
    <MainLayout>
      <div className="container-fluid px-3 px-sm-4 mx-auto min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="w-100" style={{maxWidth: 900}}>
          <Panel>
            <div className="mb-4 d-flex align-items-center" style={{gap:'12px'}}>
              <BackButton onClick={onBack} ariaLabel="Retour" />
              <h4 className="mb-0" style={{color:'#ff3366'}}>Assistant de configuration du menu</h4>
            </div>
            <p className="text-muted">Personnalisez l’apparence de votre menu QR : ajoutez un logo, choisissez les couleurs et le style d’affichage. Vous pourrez modifier ces paramètres à tout moment.</p>
            <ol className="text-left mx-auto" style={{maxWidth:400}}>
              <li>Ajoutez le logo de votre établissement</li>
              <li>Choisissez la couleur principale</li>
              <li>Sélectionnez la police d’écriture</li>
              <li>Sauvegardez et visualisez le rendu QR</li>
            </ol>
            <form>
              <div className="form-group">
                <label>Logo de l’établissement</label><br/>
                {logo && <img src={logo} alt="logo" style={{maxHeight:60, marginBottom:10}} />}
                <input type="file" accept="image/*" onChange={handleLogoUpload} />
              </div>
              <div className="form-group mt-3">
                <label>Couleur principale</label>
                <input type="color" value={color || '#ff3366'} onChange={e => setColor(e.target.value)} style={{width:50, height:30, border:'none'}} />
                <span className="ml-2">{color || '#ff3366'}</span>
              </div>
              <div className="form-group mt-3">
                <label>Police d’écriture</label>
                <select className="form-control" value={font} onChange={e => setFont(e.target.value)}>
                  <option value="">Par défaut</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lobster">Lobster</option>
                </select>
              </div>
              <div className="mt-4 d-flex justify-content-between">
                <BackButton onClick={onBack} ariaLabel="Retour" />
                <button type="button" className="btn btn-primary" style={{background:'#ff3366', border:'none'}} onClick={onUpdatePlace} disabled={loading}>
                  {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </form>
          </Panel>
        </div>
      </div>
    </MainLayout>
  );
}

export default MenuSettings;