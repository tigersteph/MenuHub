# Guide de Navigation - Bonnes Pratiques

## Principes Généraux

### 1. Utilisation de `history.replace()` vs `history.push()`

**`history.replace()`** - Utilisé pour :
- ✅ Redirections après authentification (login/register)
- ✅ Redirections après actions critiques (suppression, modification)
- ✅ Éviter que l'utilisateur revienne à une page non pertinente avec le bouton retour

**`history.push()`** - Utilisé pour :
- ✅ Navigation normale entre les pages
- ✅ Navigation depuis les boutons de l'interface
- ✅ Permettre à l'utilisateur de revenir en arrière

### 2. Gestion des Routes Protégées

Les routes protégées doivent :
- ✅ Rediriger vers `/login` si non authentifié
- ✅ Sauvegarder la route d'origine dans `location.state.from`
- ✅ Rediriger vers la route d'origine après connexion

### 3. Gestion des Utilisateurs Déjà Connectés

Les pages publiques (login, register) doivent :
- ✅ Vérifier si l'utilisateur est déjà connecté
- ✅ Rediriger vers `/places` si connecté
- ✅ Utiliser `history.replace()` pour éviter de revenir à la page de login

## Implémentation par Page

### Login.js
```javascript
// Rediriger si déjà connecté
useEffect(() => {
  if (auth.token) {
    const from = location.state?.from?.pathname || '/places';
    history.replace(from);
  }
}, [auth.token, history, location.state]);

// Après connexion réussie
const from = location.state?.from?.pathname || '/places';
history.replace(from);
```

### Register.js
```javascript
// Rediriger si déjà connecté
useEffect(() => {
  if (auth.token) {
    history.replace('/places');
  }
}, [auth.token, history]);

// Après inscription réussie
history.replace('/places');
```

### PrivateRoute.js
```javascript
// Sauvegarder la route d'origine
<Redirect
  to={{
    pathname: "/login",
    state: { from: location },
  }}
/>
```

### Pages avec Bouton Retour

**Profile.js** :
```javascript
onClick={() => history.push('/places')}
```

**EditPlace.js** :
```javascript
// Après sauvegarde
history.push(`/places/${place.id}`);

// Bouton retour
onClick={() => history.push(`/places/${place.id}`)}
```

**QRCodesPage.js** :
```javascript
// Bouton retour vers la page de gestion
onClick={() => history.push(`/places/${placeId}`)}
```

## Flux de Navigation Typiques

### Connexion
1. Utilisateur non authentifié accède à `/places/:id`
2. Redirection vers `/login` avec `state: { from: { pathname: '/places/:id' } }`
3. Après connexion, redirection vers `/places/:id` (route d'origine)
4. Utilisation de `history.replace()` pour éviter de revenir à `/login`

### Inscription
1. Utilisateur accède à `/register`
2. Après inscription, redirection vers `/places`
3. Utilisation de `history.replace()` pour éviter de revenir à `/register`

### Navigation Normale
1. Utilisation de `history.push()` pour toutes les navigations normales
2. Permet à l'utilisateur d'utiliser le bouton retour du navigateur
3. Navigation cohérente et prévisible

## Checklist de Vérification

- [ ] Les redirections après authentification utilisent `history.replace()`
- [ ] Les utilisateurs déjà connectés sont redirigés depuis login/register
- [ ] Les routes protégées sauvegardent la route d'origine
- [ ] Les boutons retour utilisent des routes spécifiques (pas `goBack()` sauf cas particulier)
- [ ] La navigation est cohérente et prévisible
- [ ] Le bouton retour du navigateur fonctionne correctement

## Notes Importantes

1. **Ne jamais utiliser `history.goBack()`** sauf cas très spécifiques, car :
   - C'est imprévisible (dépend de l'historique du navigateur)
   - Peut amener l'utilisateur sur une page externe
   - Rend la navigation difficile à tester

2. **Toujours utiliser des routes spécifiques** pour les boutons retour :
   - Plus prévisible
   - Meilleure expérience utilisateur
   - Plus facile à tester et déboguer

3. **Vérifier l'authentification** avant de permettre l'accès aux pages protégées

4. **Gérer les erreurs de navigation** avec des try/catch si nécessaire

