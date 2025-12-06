import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './utils/PrivateRoute';
import ToastWrapper from './components/ui/ToastWrapper';
import { Loader } from './components/ui';

// Lazy loading des routes pour améliorer les performances
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Places = lazy(() => import('./pages/Places'));
const Place = lazy(() => import('./pages/Place'));
const Menu = lazy(() => import('./pages/Menu'));
const Orders = lazy(() => import('./pages/Orders'));
const MenuSettings = lazy(() => import('./pages/MenuSettings'));
const Help = lazy(() => import('./pages/Help'));
const Contact = lazy(() => import('./pages/Contact'));
const About = lazy(() => import('./pages/About'));
const QRCodesPage = lazy(() => import('./pages/QRCodesPage'));
const EditPlace = lazy(() => import('./pages/EditPlace'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Profile = lazy(() => import('./pages/Profile'));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader text="Chargement..." /></div>}>
          <Switch>
            <Route exact path='/'>
              <Home/>
            </Route>
            <Route exact path='/login'>
              <Login/>
            </Route>
            <Route exact path='/register'>
              <Register/>
            </Route>
            <Route exact path='/help'>
              <Help/>
            </Route>
            <Route exact path='/contact'>
              <Contact/>
            </Route>
            <Route exact path='/about'>
              <About/>
            </Route>
            <Route exact path='/forgot-password'>
              <ForgotPassword/>
            </Route>
            <Route exact path='/reset-password'>
              <ResetPassword/>
            </Route>
            <Route exact path='/menu/:id/:table'>
              <Menu/>
            </Route>

            <PrivateRoute exact path='/places/:id' component={Place} />
            <PrivateRoute exact path='/places/:id/edit' component={EditPlace} />
            <PrivateRoute exact path='/places' component={Places} />
            <PrivateRoute exact path='/places/:id/orders' component={Orders} />
            <PrivateRoute exact path='/places/:id/settings' component={MenuSettings} />

            <PrivateRoute exact path='/qrcodes/:id' component={QRCodesPage} />
            <PrivateRoute exact path='/profile' component={Profile} />
          </Switch>
        </Suspense>
        <ToastWrapper/>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App;