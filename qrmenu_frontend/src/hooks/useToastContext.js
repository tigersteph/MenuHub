import { useLocation } from 'react-router-dom';

/**
 * Hook to determine if the current page is a client-facing page
 * Client pages: /menu/:id/:table
 * Restaurant pages: all other authenticated pages
 */
export const useToastContext = () => {
  const location = useLocation();
  const isClientPage = location.pathname.startsWith('/menu/');
  
  return {
    isClientPage,
    position: isClientPage ? 'top-center' : 'top-right',
    autoClose: isClientPage ? 4000 : 3000,
  };
};

export default useToastContext;

