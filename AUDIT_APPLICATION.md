# Audit actuel de l’application VitrectoMed

Dernière mise à jour : 28 juin 2026

## Résumé exécutif

VitrectoMed est un monolithe Next.js 16 qui contient deux espaces clairement identifiables :

- la boutique et le contenu public sous `src/app/(public)/[locale]` ;
- l’administration privée sous `src/app/admin` ;
- les API communes sous `src/app/api` ;
- la logique partagée sous `src/lib`, `src/server`, `src/components` et `src/context`.

La boutique et l’administration ne sont donc pas deux projets indépendants. Elles partagent le même déploiement et Firestore, mais elles sont maintenant séparées par leurs routes et par une protection serveur de l’administration. Cette architecture est cohérente pour la taille actuelle du projet.

État global : le build de production passe, l’administration utilise une session serveur, le portugais et ShipStation sont retirés, Firebase Admin est unifié et un important lot de code mort a été supprimé.

## Chiffres actuels

- 42 pages publiques localisées, dont quatre pages juridiques.
- 13 pages d’administration.
- 41 routes API.
- 218 fichiers TypeScript/TSX.
- 74 feuilles CSS.
- 6 langues : français, anglais, espagnol, allemand, italien et néerlandais.

## Hiérarchie fonctionnelle

```text
src/
├── app/
│   ├── (public)/[locale]/
│   │   ├── page.tsx                 accueil
│   │   ├── products/                catalogue et fiches produit
│   │   ├── cart/                    panier
│   │   ├── checkout/                commande et paiement
│   │   ├── bank-transfer/           instructions de virement
│   │   ├── success/                 confirmation
│   │   ├── review/                  dépôt d’avis
│   │   ├── annuaire/                annuaire médical
│   │   ├── blog/                    contenus éditoriaux
│   │   ├── operation/               informations vitrectomie
│   │   ├── pathologies/             contenus médicaux
│   │   ├── convalescence/           récupération et produit
│   │   └── contact/                 contact
│   ├── admin/
│   │   ├── login/                   connexion
│   │   ├── page.tsx                 tableau de bord
│   │   ├── orders/                  commandes
│   │   ├── logistics/               préparation logistique
│   │   ├── products/                catalogue administrable
│   │   ├── payment-methods/         moyens de paiement
│   │   ├── shipping/                méthodes de livraison
│   │   ├── taxes/                   TVA
│   │   ├── reviews/                 avis et e-mails d’avis
│   │   ├── annuaire/                fiches de l’annuaire
│   │   └── export/                   exports
│   └── api/
│       ├── admin/                   opérations privées
│       ├── checkout/                création Stripe
│       ├── stripe-webhook/          confirmation Stripe
│       ├── paypal/                  paiement PayPal
│       ├── bank-transfer/           commandes par virement
│       ├── reviews/                 avis publics
│       └── sendcloud/               webhook logistique
├── components/                      composants partagés
├── context/                         panier
├── lib/                             intégrations et outils
├── server/                          logique exclusivement serveur
├── types/                           types partagés
└── proxy.ts                         garde des routes admin et locales
```

## Sécurité de l’administration

### Terminé

- Session signée d’une durée maximale de huit heures.
- Cookie `HttpOnly`, `SameSite=Lax` et `Secure` en production.
- Aucun mot de passe ni faux jeton conservé dans le stockage navigateur actif.
- Protection de `/admin/**` et `/api/admin/**` dans `src/proxy.ts`.
- Contrôle du rôle administrateur ou logistique côté serveur.
- Restriction du rôle logistique à ses écrans et opérations autorisés.
- Vérification d’origine sur les mutations admin.
- Déconnexion et lecture de session sous `/api/admin/session`.
- Route « marquer comme payée » corrigée.
- Suppression de commande réservée au rôle administrateur.

### Action de déploiement restante

Définir `ADMIN_SESSION_SECRET` dans Vercel avec une longue valeur aléatoire, différente des mots de passe, puis redéployer. Le code possède un repli pour le développement, mais le secret explicite est préférable en production.

## Langues et logistique

- Le portugais a été retiré des locales, marchés, traductions, produits, factures et checkouts.
- Les anciennes données portugaises éventuellement présentes dans Firestore ne sont pas supprimées automatiquement.
- ShipStation a été retiré du code, des routes, des types, des dépendances et des variables locales.
- Les anciennes variables `SHIPSTATION_*` doivent aussi être supprimées manuellement de Vercel et l’ancien webhook doit être désactivé chez le fournisseur.
- La logistique actuelle repose sur le traitement interne, les points relais et Sendcloud.

## Firebase et e-mails d’avis

- Une seule initialisation Firebase Admin subsiste : `src/lib/firebase.admin.ts`.
- L’ancien wrapper `src/server/firebaseAdmin.ts` a été supprimé.
- La seule route de réglage active est `/api/admin/settings/review-email`.
- L’ancienne route placée directement sous `/admin/settings/review-email` a été supprimée.
- La route conservée valide strictement `enabled`, `mode` et `delayDays`.

## Nettoyage réalisé

- Suppression des scripts et routes de test ou de diagnostic.
- Suppression des routes, services et types ShipStation.
- Suppression de l’ancienne page `/admin/payments`, remplacée par `/admin/payment-methods`.
- Suppression des anciennes versions de composants panier, checkout, produit, livraison, avis, dashboard et logistique qui n’étaient importées nulle part.
- Suppression de deux anciens widgets relais non utilisés, dont un chargeait encore une ancienne version de jQuery.
- Suppression d’un composant d’export vide.
- Suppression des cinq ressources SVG de Create Next App.
- Suppression de `tsconfig.tsbuildinfo` et ajout de `*.tsbuildinfo` au `.gitignore`.
- Remplacement du README Create Next App par la documentation du projet.

Chaque gros lot a été suivi d’un build de production. Le build final expose les 42 pages publiques, 13 pages admin et 41 routes API attendues.

## Qualité du code

Avant cette phase, ESLint signalait 451 erreurs et 43 avertissements.

État actuel :

- toutes les erreurs React concrètes ont été corrigées ;
- les appels impurs pendant le rendu ont été supprimés ;
- les synchronisations d’état du checkout ont été remplacées par des valeurs dérivées ;
- les dépendances principales de hooks ont été corrigées ;
- les apostrophes JSX et variables réassignées inutilement ont été corrigées ;
- des types communs ont été ajoutés pour les commandes, adresses, dates Firestore, articles et suivis logistiques ;
- les `any` sont passés de 428 à 369 pendant cette phase.

ESLint reste volontairement en échec à cause de 369 anciens `any`. Il reste aussi 25 avertissements : 12 variables internes inutilisées et 13 images HTML non optimisées. Leur correction doit continuer progressivement par domaine pour éviter une régression massive.

### Dépendances npm

- Audit initial : 31 vulnérabilités, dont 9 élevées et 2 critiques.
- Next.js, Firebase, Firebase Admin, next-intl et Resend ont été mis à jour vers leurs versions corrigées compatibles.
- Deux remplacements transitifs ciblés maintiennent PostCSS en `8.5.14` et UUID en `11.1.1`.
- Résultat final de `npm audit` : 0 vulnérabilité, sans utiliser `npm audit fix --force`.

## Vérifications effectuées

- Build Next.js 16 de production avec Webpack : succès.
- Compilation TypeScript du build : succès.
- Accueil français : affichage validé dans le navigateur.
- Checkout : affichage validé, y compris l’état panier vide.
- Administration non authentifiée : redirection et écran de connexion validés.
- Session admin et rôle logistique : parcours serveur validés lors de la phase sécurité.
- Recherche globale : aucune intégration active ShipStation ni locale portugaise ne subsiste dans `src`.

## Incohérences encore connues

- Les liens FAQ pointaient vers une page inexistante : ils ciblent maintenant la FAQ présente sur l’accueil.
- Les mentions « 20+ langues » ont été corrigées en « 6 langues ».
- Les pages de mentions légales, confidentialité, cookies et conditions générales de vente et d’utilisation ont été créées avec LAZURCO comme éditeur et vendeur. La convention avec le médiateur historique de LAZURCO doit être reconfirmée avant déploiement.
- Plusieurs fichiers admin restent très volumineux, notamment `OrderDetails.tsx`, la page des avis et leurs feuilles CSS.
- Certaines anciennes données Firestore peuvent contenir des champs portugais ou ShipStation ; elles n’affectent plus le code actif mais nécessiteraient une migration de données séparée.

## Étapes suivantes

1. Ajouter `ADMIN_SESSION_SECRET` dans Vercel et retirer les anciennes variables ShipStation.
2. Faire valider les textes juridiques et confirmer la convention de médiation LAZURCO.
3. Continuer le typage par domaines : détails de commande, logistique, checkout API, produits et webhooks.
4. Traiter les avertissements ESLint restants et migrer les images concernées vers `next/image` lorsque pertinent.
5. Découper progressivement les très gros composants admin.

Le système de tests est explicitement reporté dans une phase séparée : autorisations admin, calculs métier, checkout et parcours administration.
