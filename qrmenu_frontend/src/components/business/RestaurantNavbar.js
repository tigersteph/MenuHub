import React, { useContext } from 'react';
import styled from 'styled-components';
import AuthContext from '../contexts/AuthContext';
import { Button } from 'react-bootstrap';
import { AiOutlineQrcode, AiOutlineDelete } from 'react-icons/ai';
import { FiSettings } from 'react-icons/fi';
import { useHistory, useParams } from 'react-router-dom';

// Palette premium
const COLORS = {
  background: '#F8F7F2', // Blanc crème
  text: '#333333',       // Gris anthracite
  accent: '#C1A36A',     // Or raffiné
  border: '#EAEAEA',     // Gris perle
};

const NavbarWrapper = styled.nav`
  background: ${COLORS.background};
  border-bottom: 1.5px solid ${COLORS.border};
  box-shadow: 0 2px 12px #0001;
  width: 100%;
  z-index: 100;
`;
const NavbarContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 1.5rem;
`;
const LogoBox = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;
const LogoImg = styled.img`
  height: 48px;
  width: 48px;
  object-fit: cover;
  border-radius: 12px;
  background: #f8f8f8;
  border: 2px solid ${COLORS.border};
`;
const Name = styled.span`
  font-size: 1.6rem;
  font-weight: 700;
  color: ${COLORS.text};
  letter-spacing: 0.5px;
`;
const UserBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.7rem;
`;
const UserImg = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  background: #eee;
  border: 1.5px solid ${COLORS.border};
`;
const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;
const UserEmail = styled.span`
  font-size: 1rem;
  color: ${COLORS.text};
  font-weight: 500;
`;
const Toolbar = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
  
  button {
    background: ${COLORS.accent};
    color: #fff;
    border: none;
    font-weight: 600;
    border-radius: 0.7rem;
    box-shadow: 0 2px 8px #c1a36a22;
    transition: background 0.2s, color 0.2s;
    padding: 0.5rem 1.1rem;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  button:hover, button:focus {
    background: #a88a54;
    color: #fff;
  }
  .btn-outline-danger {
    background: #fff;
    color: ${COLORS.accent};
    border: 1.5px solid ${COLORS.accent};
  }
  .btn-outline-danger:hover, .btn-outline-danger:focus {
    background: ${COLORS.accent};
    color: #fff;
  }
`;

const RestaurantNavbar = ({ place, onRemovePlace }) => {
  const auth = useContext(AuthContext);
  const history = useHistory();
  const params = useParams();
  const email = place?.creator_email || auth?.user?.email || 'Utilisateur';
  return (
    <NavbarWrapper>
      <NavbarContent>
        <LogoBox>
          <LogoImg src={place.logo_url || '/img/hero-restaurant.jpg'} alt={place.name || 'Logo'} />
          <Name>{place.name || 'Nom du restaurant'}</Name>
        </LogoBox>
        <Toolbar>
          <Button variant="standard" onClick={() => history.push(`/qrcodes/${place.id || params.id}`)}>
            <AiOutlineQrcode size={22} />
            QR Codes
          </Button>
          <Button variant="standard" href={`/places/${place.id || params.id}/settings`}>
            <FiSettings size={22} />
            Paramètres
          </Button>
          <Button variant="outline-danger" onClick={onRemovePlace}>
            <AiOutlineDelete size={22} />
            Supprimer
          </Button>
        </Toolbar>
        <UserBox>
          <UserImg src={place.logo_url || '/img/hero-restaurant.jpg'} alt="user" />
          <UserInfo>
            <UserEmail>{email}</UserEmail>
          </UserInfo>
        </UserBox>
      </NavbarContent>
    </NavbarWrapper>
  );
};

export default RestaurantNavbar;
