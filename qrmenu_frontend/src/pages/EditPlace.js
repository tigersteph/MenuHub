import React, { useEffect, useState, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import BackButton from '../components/ui/BackButton';
import { fetchPlace, updatePlace, uploadImage } from '../services';

const EditPlace = () => {
  const [place, setPlace] = useState({});
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [logo, setLogo] = useState('');
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const history = useHistory();
  const auth = useContext(AuthContext);

  useEffect(() => {
    const fetch = async () => {
      const json = await fetchPlace(params.id, auth.token);
      if (json) {
        setPlace(json);
        setName(json.name || '');
        setAddress(json.address || '');
        setPhone(json.phone || '');
        setLogo(json.logoUrl || json.logo_url || '');
      }
    };
    fetch();
  }, [params.id, auth.token]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const result = await uploadImage(file);
    if (result && result.secure_url) {
      setLogo(result.secure_url);
    }
  };

  const onSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    const json = await updatePlace(place.id, { name, address, phone, logoUrl: logo, logo_url: logo }, auth.token);
    setLoading(false);
    if (json) {
      history.push(`/places/${place.id}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-light-surface font-display">
      <header className="bg-white shadow-custom-light sticky top-0 z-10 border-b border-gray-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <BackButton 
              onClick={() => history.push(`/places/${place.id}`)} 
              ariaLabel="Retour à la gestion de l'établissement" 
            />
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-dark-text truncate flex-1">
              Modifier l'établissement
            </h1>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 flex-grow flex items-center justify-center pb-safe">
        <form className="bg-white rounded-lg shadow-custom-light p-4 sm:p-6 lg:p-8 w-full max-w-xl space-y-4 sm:space-y-6 border border-gray-border" onSubmit={onSave}>
          <div>
            <label className="block font-semibold mb-2 sm:mb-3 text-sm sm:text-base text-dark-text">Nom de l'établissement</label>
            <input 
              type="text" 
              className="w-full border border-gray-border rounded-md px-3 sm:px-4 py-2 sm:py-2.5 bg-white text-sm sm:text-base text-dark-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary min-h-[44px]" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="block font-semibold mb-2 sm:mb-3 text-sm sm:text-base text-dark-text">Adresse</label>
            <input 
              type="text" 
              className="w-full border border-gray-border rounded-md px-3 sm:px-4 py-2 sm:py-2.5 bg-white text-sm sm:text-base text-dark-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary min-h-[44px]" 
              value={address} 
              onChange={e => setAddress(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="block font-semibold mb-2 sm:mb-3 text-sm sm:text-base text-dark-text">Téléphone</label>
            <input 
              type="tel" 
              className="w-full border border-gray-border rounded-md px-3 sm:px-4 py-2 sm:py-2.5 bg-white text-sm sm:text-base text-dark-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary min-h-[44px]" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
            />
          </div>
          <div>
            <label className="block font-semibold mb-2 sm:mb-3 text-sm sm:text-base text-dark-text">Logo</label>
            {logo && <img src={logo} alt="logo" className="h-12 sm:h-16 mb-2 rounded object-cover" />}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleLogoUpload} 
              className="text-dark-text text-sm sm:text-base w-full min-h-[44px] py-2" 
            />
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-2">
            <button 
              type="button" 
              className="w-full sm:w-auto bg-white border-2 border-gray-border text-gray-700 font-semibold py-2.5 sm:py-2 px-6 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 min-h-[44px] text-sm sm:text-base" 
              onClick={() => history.push(`/places/${place.id}`)}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="w-full sm:w-auto bg-[#FF6B35] text-white font-bold py-2.5 sm:py-2 px-6 rounded-md shadow-[0_4px_12px_rgba(255,107,53,0.4)] hover:bg-[#FF7B45] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B35] disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px] text-sm sm:text-base active:scale-[0.98]" 
              disabled={loading}
            >
              {loading ? 'Sauvegarde...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditPlace;
