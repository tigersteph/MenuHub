# Checklist de Tests - MenuHub

Cette checklist vous guide pour tester toutes les fonctionnalités de MenuHub avant et après le déploiement en production.

## 🔐 Tests d'Authentification

### Inscription
- [ ] Créer un nouveau compte avec email valide
- [ ] Vérifier la validation du mot de passe (force)
- [ ] Vérifier la validation de l'email
- [ ] Tester avec un email déjà utilisé (doit échouer)
- [ ] Vérifier le message de confirmation

### Connexion
- [ ] Se connecter avec des identifiants valides
- [ ] Tester avec un email invalide
- [ ] Tester avec un mot de passe incorrect
- [ ] Vérifier la persistance de la session
- [ ] Tester la déconnexion

### Mot de passe oublié
- [ ] Demander une réinitialisation avec email valide
- [ ] Vérifier la réception de l'email (si activé)
- [ ] Réinitialiser le mot de passe avec le token
- [ ] Tester avec un token expiré

## 🏪 Tests de Gestion d'Établissement

### Création
- [ ] Créer un nouvel établissement
- [ ] Remplir tous les champs (nom, adresse, téléphone, etc.)
- [ ] Uploader un logo
- [ ] Choisir une couleur de thème
- [ ] Sauvegarder et vérifier l'affichage

### Modification
- [ ] Modifier le nom de l'établissement
- [ ] Changer le logo
- [ ] Modifier la couleur de thème
- [ ] Mettre à jour les informations de contact
- [ ] Vérifier que les changements sont sauvegardés

### Suppression
- [ ] Supprimer un établissement
- [ ] Vérifier la confirmation de suppression
- [ ] Vérifier que toutes les données associées sont supprimées

## 🪑 Tests de Gestion des Tables

### Création
- [ ] Créer une nouvelle table
- [ ] Donner un nom à la table
- [ ] Vérifier l'affichage dans la liste

### Modification
- [ ] Modifier le nom d'une table
- [ ] Changer le statut (active/inactive)
- [ ] Vérifier que les changements sont appliqués

### Suppression
- [ ] Supprimer une table
- [ ] Vérifier la confirmation
- [ ] Vérifier que la table disparaît de la liste

### QR Code
- [ ] Générer un QR code pour une table
- [ ] Télécharger le QR code
- [ ] Scanner le QR code avec un téléphone
- [ ] Vérifier que le menu s'affiche correctement

## 📋 Tests de Gestion du Menu

### Catégories

#### Création
- [ ] Créer une nouvelle catégorie
- [ ] Donner un nom à la catégorie
- [ ] Vérifier l'affichage dans la liste

#### Modification
- [ ] Modifier le nom d'une catégorie (édition inline)
- [ ] Réorganiser les catégories (drag & drop)
- [ ] Vérifier que l'ordre est sauvegardé

#### Suppression
- [ ] Supprimer une catégorie vide
- [ ] Tenter de supprimer une catégorie avec des plats
- [ ] Vérifier les messages d'erreur appropriés

### Plats

#### Création
- [ ] Ajouter un nouveau plat
- [ ] Remplir tous les champs (nom, description, prix)
- [ ] Uploader une image
- [ ] Sélectionner une catégorie
- [ ] Définir la disponibilité
- [ ] Sauvegarder et vérifier l'affichage

#### Modification
- [ ] Modifier le nom d'un plat
- [ ] Changer le prix
- [ ] Modifier la description
- [ ] Changer l'image
- [ ] Changer la catégorie
- [ ] Toggle disponibilité (activer/désactiver)

#### Suppression
- [ ] Supprimer un plat
- [ ] Vérifier la confirmation
- [ ] Vérifier que le plat disparaît

#### Actions en masse
- [ ] Sélectionner plusieurs plats
- [ ] Activer plusieurs plats en masse
- [ ] Désactiver plusieurs plats en masse
- [ ] Supprimer plusieurs plats en masse

#### Duplication
- [ ] Dupliquer un plat
- [ ] Vérifier que le nom contient "(Copie)"
- [ ] Vérifier que tous les autres champs sont copiés

## 🛒 Tests du Menu Client (QR Code)

### Affichage
- [ ] Scanner le QR code d'une table
- [ ] Vérifier l'affichage du logo de l'établissement
- [ ] Vérifier l'affichage du nom de l'établissement
- [ ] Vérifier l'affichage des catégories
- [ ] Vérifier l'affichage des plats disponibles
- [ ] Vérifier que les plats indisponibles ne s'affichent pas

### Navigation
- [ ] Cliquer sur une catégorie
- [ ] Vérifier le filtrage des plats
- [ ] Utiliser la barre de recherche
- [ ] Vérifier que la recherche fonctionne

### Panier
- [ ] Ajouter un plat au panier
- [ ] Vérifier l'icône du panier (badge avec quantité)
- [ ] Ajouter plusieurs plats
- [ ] Modifier les quantités dans le panier
- [ ] Retirer un plat du panier
- [ ] Vérifier le calcul du total

### Commande
- [ ] Passer une commande avec plusieurs plats
- [ ] Vérifier la confirmation de commande
- [ ] Vérifier l'affichage du numéro de commande
- [ ] Vérifier la notification côté restaurateur (temps réel)

### Annulation
- [ ] Annuler une commande depuis la page de confirmation
- [ ] Vérifier la confirmation d'annulation
- [ ] Vérifier que la commande est annulée côté restaurateur

## 📊 Tests du Dashboard Restaurateur

### Vue d'ensemble
- [ ] Vérifier l'affichage des statistiques
- [ ] Vérifier le nombre de tables
- [ ] Vérifier le nombre de commandes du jour
- [ ] Vérifier le nombre de commandes de la semaine

### Commandes
- [ ] Voir la liste des commandes
- [ ] Filtrer par statut (en attente, en préparation, prête, terminée)
- [ ] Voir les détails d'une commande
- [ ] Changer le statut d'une commande
- [ ] Vérifier les notifications temps réel

### Notifications
- [ ] Vérifier la réception d'une notification pour une nouvelle commande
- [ ] Vérifier la mise à jour en temps réel du nombre de commandes

## 🖼️ Tests d'Upload d'Images

### Logo d'établissement
- [ ] Uploader un logo (format JPG)
- [ ] Uploader un logo (format PNG)
- [ ] Tester avec un fichier trop volumineux (>10MB)
- [ ] Tester avec un fichier non-image
- [ ] Vérifier l'affichage du logo

### Images de plats
- [ ] Uploader une image pour un plat
- [ ] Vérifier l'affichage dans la liste
- [ ] Vérifier l'affichage dans le menu client
- [ ] Tester avec différentes tailles d'images
- [ ] Vérifier l'optimisation automatique

## 🔄 Tests de Performance

### Temps de chargement
- [ ] Mesurer le temps de chargement de la page d'accueil
- [ ] Mesurer le temps de chargement du dashboard
- [ ] Mesurer le temps de chargement du menu client
- [ ] Vérifier que les images se chargent en lazy loading

### Réactivité
- [ ] Tester les mises à jour optimistes (ajout, modification, suppression)
- [ ] Vérifier que l'interface reste réactive
- [ ] Tester avec une connexion lente

### Rafraîchissement
- [ ] Vérifier le rafraîchissement automatique du menu client (30s)
- [ ] Vérifier le rafraîchissement des statistiques (60s)
- [ ] Vérifier les mises à jour en temps réel via WebSocket

## 📱 Tests Responsive

### Mobile
- [ ] Tester sur un téléphone (portrait)
- [ ] Tester sur un téléphone (paysage)
- [ ] Vérifier que tous les boutons sont accessibles
- [ ] Vérifier que les formulaires sont utilisables
- [ ] Vérifier le menu client sur mobile

### Tablette
- [ ] Tester sur une tablette (portrait)
- [ ] Tester sur une tablette (paysage)
- [ ] Vérifier l'adaptation de la mise en page

### Desktop
- [ ] Tester sur un écran large
- [ ] Vérifier la navigation latérale
- [ ] Vérifier l'utilisation du clavier

## 🔒 Tests de Sécurité

### Authentification
- [ ] Tester l'accès aux routes protégées sans authentification
- [ ] Vérifier la redirection vers la page de connexion
- [ ] Tester avec un token expiré
- [ ] Vérifier la déconnexion automatique

### Autorisation
- [ ] Tester l'accès à un établissement d'un autre utilisateur
- [ ] Vérifier que l'accès est refusé
- [ ] Vérifier les messages d'erreur appropriés

### Validation
- [ ] Tester avec des données invalides
- [ ] Vérifier les messages d'erreur
- [ ] Tester les limites (taille de fichier, longueur de texte)

## 🌐 Tests Multi-navigateurs

- [ ] Chrome (dernière version)
- [ ] Firefox (dernière version)
- [ ] Safari (dernière version)
- [ ] Edge (dernière version)
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)

## ✅ Validation Finale

- [ ] Tous les tests ci-dessus sont passés
- [ ] Aucune erreur dans la console du navigateur
- [ ] Aucune erreur dans les logs du serveur
- [ ] Les performances sont acceptables
- [ ] L'application est prête pour la production

## 📝 Notes de Test

Date: _______________
Testeur: _______________
Environnement: _______________

Problèmes rencontrés:
- 

Améliorations suggérées:
- 
