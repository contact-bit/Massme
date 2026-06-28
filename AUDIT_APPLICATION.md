# Audit complet de l'application Vitrectomed

Date de l'audit : 27 juin 2026

## Mise à jour du 28 juin 2026 — phase sécurité terminée

- Session admin signée de huit heures ajoutée dans un cookie `HttpOnly`, `SameSite=Lax` et `Secure` en production.
- Mot de passe, faux token et rôle supprimés du stockage navigateur pour les parcours actifs.
- Protection serveur globale de `/admin/**` et `/api/admin/**` via `src/proxy.ts`, convention correcte de Next.js 16.
- Rôle logistique limité à son écran et à ses opérations API autorisées.
- Vérification de l'origine ajoutée sur les mutations admin pour limiter les requêtes intersites.
- Anciens envois d'e-mails logistiques protégés par la session admin.
- Route de session et déconnexion serveur ajoutée sous `/api/admin/session`.
- Appel de l'action « marquer comme payée » corrigé vers `/api/admin/orders/mark-paid` avec contrôle de la réponse.
- Suppression de commande corrigée : elle exige maintenant explicitement le rôle administrateur.
- Ancienne route invalide `/admin/payments` supprimée ; elle était non reliée, remplacée par `/admin/payment-methods` et bloquait le build Next.js.
- Build de production Next.js validé avec Webpack ; le script `npm run build` utilise désormais ce moteur, Turbopack restant bloqué dans cet environnement.
- Portugais retiré complètement : locale `pt`, traductions, route `/pt`, marché `PT`, TVA Portugal et options produit supprimés du code. Les éventuelles anciennes données Firestore ne sont pas modifiées automatiquement.

Les constats de sécurité ci-dessous décrivent l'état trouvé lors de l'audit initial. Ils sont conservés comme historique ; les points listés dans cette mise à jour sont désormais corrigés.

## Résumé exécutif

L'application est un monolithe Next.js 16 : la boutique et l'administration vivent dans le même projet, le même déploiement et le même accès aux données. Leur séparation visuelle et leur séparation par URL sont bonnes, mais leur séparation de sécurité est insuffisante.

- Boutique : routes localisées sous `src/app/(public)/[locale]`.
- Administration : routes sous `src/app/admin`.
- API commune : routes sous `src/app/api`.
- Logique partagée : `src/lib`, `src/server`, `src/components`, `src/context`.
- Données : Firebase/Firestore côté navigateur et côté serveur.
- Paiements : Stripe, PayPal et virement bancaire.
- Logistique : traitement interne, Sendcloud et points relais.

Conclusion : les deux parties sont bien distinguées pour l'organisation des écrans, mais ne sont pas deux projets réellement isolés. Cette architecture peut rester monolithique, à condition de déplacer toute l'authentification admin côté serveur et de protéger uniformément les API sensibles.

## Chiffres du projet

- 38 pages publiques.
- 13 pages d'administration.
- 42 routes API après nettoyage et ajout de la session.
- 1 route serveur placée directement dans l'arbre admin, hors de `/api`.
- 263 fichiers TypeScript/TSX.
- 85 fichiers CSS.
- Environ 131 000 lignes dans `src` en comptant TypeScript, CSS, images et polices.
- Les plus gros fichiers atteignent 1 400 à 3 000 lignes, ce qui rend plusieurs fonctionnalités difficiles à maintenir.

## Hiérarchie fonctionnelle

### Racine

```text
src/app
├── layout.tsx                 document HTML et langue
├── page.tsx                   redirection vers /fr
├── (public)/[locale]          site public et boutique
├── admin                      interface d'administration
└── api                        API publiques, admin, paiement et logistique
```

Le middleware redirige `/` vers `/fr`, accepte une locale dans l'URL et laisse explicitement passer sans filtrage toutes les routes `/admin` et `/api`.

### Boutique et site public

```text
/[locale]
├── /                          accueil
├── /products                  catalogue
│   └── /[id]                  fiche produit
├── /cart                      panier
├── /checkout                  commande
├── /bank-transfer             instructions de virement
├── /success                   confirmation de commande
├── /review                    dépôt d'avis
├── /contact                   contact
├── /blog                      liste des articles
│   └── /[id]                  article
├── /annuaire                  annuaire médical
│   ├── /recherche
│   ├── /[location]
│   ├── /ophtalmologue/...
│   └── /hopitaux-cliniques/...
├── /pathologies               contenu médical
│   ├── /decollement-retine
│   ├── /mouches-volantes-ou-corps-flottants
│   ├── /myopie-forte
│   ├── /retinopathie-diabetique
│   ├── /trou-maculaire
│   │   ├── /convalescence
│   │   └── /temoignage
│   └── /uveite
├── /operation                 contenu opératoire
│   └── /risque                pages de risques
├── /convalescence
│   └── /coussin               expérience produit dédiée
└── /temoignage
```

Le layout public charge la navigation, le pied de page et le panier. Il importe aussi globalement les feuilles de style de l'accueil, des produits, du checkout, du contact, du succès et du blog, même lorsque la page courante ne les utilise pas.

### Administration

```text
/admin
├── /                          tableau de bord
├── /login                     connexion
├── /orders                    commandes
├── /products                  catalogue
│   ├── /new                   création
│   └── /[id]                  édition
├── /payment-methods           méthodes de paiement actives
├── /payments                  ancien écran de paiement, non relié à la navigation
├── /shipping                  méthodes de livraison
├── /taxes                     taxes
├── /reviews                   avis et e-mails d'avis
├── /annuaire                  gestion de l'annuaire
├── /logistics                 traitement logistique
└── /export                    exports commandes
```

L'interface admin a son propre layout, sa police, son shell et ses styles. Elle réutilise toutefois `CartProvider`, alors qu'aucun composant admin n'utilise le panier. C'est un couplage inutile avec la boutique.

### API

```text
/api
├── /admin-login
├── /admin
│   ├── /directory             lecture et gestion annuaire
│   ├── /logistics/settings
│   ├── /orders                lecture, édition, validation, facture, export, e-mails
│   ├── /payment-methods       lecture et gestion
│   ├── /products              lecture et gestion
│   ├── /reviews               lecture, modération et envoi
│   ├── /settings              dashboard et e-mails d'avis
│   ├── /shipping-methods      lecture et gestion
│   └── /stats
├── /checkout                  création paiement Stripe
├── /bank-transfer/create-order
├── /paypal/create-order
├── /paypal/capture-order
├── /stripe-webhook
├── /get-order
├── /verify-payment
├── /payment-methods           méthodes visibles par la boutique
├── /reviews                   avis publics
├── /contact
├── /email-logistique
├── /sendcloud/webhook
└── /sendcloud/webhook
```

Les routes API sont fonctionnellement rangées, mais l'authentification n'est pas centralisée et plusieurs variantes de la même fonction coexistent.

## Séparation boutique / administration

### Ce qui est bien séparé

- Arbres de pages distincts : `(public)/[locale]` et `admin`.
- Layouts, navigation et identité visuelle distincts.
- Styles principaux distincts : `src/styles/shop` et `src/app/admin/styles`.
- Composants métier de commande admin regroupés par `components`, `hooks` et `domain`.
- Accès serveur Firebase séparé de l'initialisation Firebase navigateur dans la majorité des fichiers.

### Ce qui reste couplé ou incohérent

- Un seul déploiement et une seule API servent les deux parties.
- L'admin réutilise le contexte panier de la boutique sans en avoir besoin.
- Des pages admin (`taxes`, édition produit) interrogent Firestore directement depuis le navigateur au lieu de passer par une API serveur.
- La boutique interroge aussi Firestore directement pour les produits et méthodes de livraison. La sécurité dépend donc totalement de règles Firestore qui ne sont pas présentes dans ce dépôt.
- Deux initialisations Firebase Admin coexistent : `src/lib/firebase.admin.ts` et `src/server/firebaseAdmin.ts`.
- L'authentification admin est centralisée dans `src/server/adminAuth.ts`.
- Deux routes identiques de réglage des e-mails d'avis coexistent : `/api/admin/settings/review-email` et `/admin/settings/review-email`.
- Deux pages de gestion des paiements coexistent : `/admin/payment-methods` est utilisée ; `/admin/payments` n'est pas reliée à la navigation.

## Problèmes critiques

### 1. Authentification admin côté navigateur

La connexion écrit `admin_token = "true"`, le rôle et le mot de passe admin en clair dans `localStorage`. Le layout admin se contente de lire ces valeurs pour afficher ou masquer les pages. Cela n'est pas une session sécurisée et toute faille XSS pourrait lire le mot de passe.

Recommandation : session serveur dans un cookie `HttpOnly`, `Secure`, `SameSite`, avec expiration, vérification du rôle côté serveur et aucun mot de passe conservé dans le navigateur.

### 2. API admin non protégées

Au moins 18 routes admin ne font aucun contrôle d'authentification dans leur source. Elles incluent des opérations sensibles : marquer une commande payée, générer ou envoyer une facture, programmer un e-mail, créer/modifier/supprimer des moyens de paiement et de livraison, modérer des avis, modifier les réglages du dashboard et consulter les statistiques.

La route de validation de virement importe même `assertAdmin`, mais les deux lignes de vérification sont commentées.

Recommandation : une seule fonction de session/autorisation appelée au début de chaque route `/api/admin/**`, complétée par une protection serveur de `/admin/**`.

### 3. Action « marquer comme payée » cassée

`src/app/admin/orders/page.tsx` appelle `/api/mark-as-paid`, qui n'existe pas. La route réelle est `/api/admin/orders/mark-paid`. Le code ne contrôle pas non plus `response.ok`, puis affiche un succès même en cas de réponse HTTP en erreur.

### 4. Suppression de commande toujours refusée

La route `DELETE /api/admin/orders` utilise `assertAdminOrLogistics`, qui renvoie `null` en cas de succès, puis compare ce résultat à la chaîne `"admin"`. La comparaison échoue toujours et la suppression retourne 401.

### 5. Portugais accepté puis rejeté

Le middleware, le marché, le panier, le catalogue produit et certains composants acceptent `pt`. En revanche, `src/lib/i18n.ts`, la navigation, le checkout, les factures, certains e-mails et le blog ne connaissent que six langues, sans portugais. Une URL `/pt` passe le middleware mais peut ensuite retourner une page introuvable ou retomber en français.

Décision nécessaire : terminer réellement le portugais partout, ou le retirer de la liste du middleware et des écrans qui l'annoncent.

## Fichiers et modules potentiellement inutilisés

Cette liste vient d'une analyse statique des imports depuis toutes les pages, layouts et routes Next.js. Elle doit être validée fonctionnellement avant une suppression massive. Les fichiers `.d.ts` et les ressources chargées indirectement sont volontairement traités avec prudence.

### Boutique

- `src/app/(public)/[locale]/annuaire/directory-data.ts`
- `src/app/(public)/[locale]/cart/CartClient.tsx`
- `src/app/(public)/[locale]/checkout/components/CheckoutActions.css`
- `src/app/(public)/[locale]/checkout/components/CheckoutSection.css`
- `src/app/(public)/[locale]/checkout/services/createBankTransferOrder.ts`
- `src/app/(public)/[locale]/checkout/services/createStripeCheckout.ts`
- `src/app/(public)/[locale]/checkout/utils/getPayButtonLabel.ts`
- `src/app/(public)/[locale]/checkout/utils/sanitizeItems.ts`
- `src/app/(public)/[locale]/checkout/utils/validateCheckout.ts`

Les deux services de checkout sont remplacés par la logique intégrée dans `useCheckout.ts`. Les utilitaires semblent également être une ancienne tentative de découpage non raccordée.

### Administration

- `src/app/admin/components/AdminCard.tsx`
- `src/app/admin/components/AdminHeader.tsx`
- `src/app/admin/components/AdminKpiCard.tsx`
- `src/app/admin/components/AdminRevenueChart.tsx`
- `src/app/admin/components/AdminSidebar.tsx`
- `src/app/admin/components/AdminState.tsx`
- `src/app/admin/components/AdminTabs.tsx`
- `src/app/admin/components/AdminTopbar.tsx`
- `src/app/admin/components/ReviewEmailSettings.tsx`
- `src/app/admin/orders/components/Drawer.tsx`
- `src/app/admin/orders/components/KpiGrid.tsx`
- `src/app/admin/orders/components/LogisticsSourceBadge.tsx`
- `src/app/admin/orders/components/LogisticsStatusBadge.tsx`
- `src/app/admin/orders/components/PaginationControls.tsx`
- `src/app/admin/orders/domain/shippingText.ts`
- `src/app/admin/products/components/ProductForm.tsx`
- `src/app/admin/products/components/product-form.css`
- `src/app/admin/products/new/new-product.css`
- `src/app/admin/shipping/components/ChooseShippingMethod.tsx`
- `src/app/admin/shipping/components/ToggleActivation.tsx`
- `src/app/admin/shipping/components/choose-shipping-method.css`
- `src/app/admin/shipping/components/shipping/relayProviders.tsx`
- `src/app/admin/styles/admin-sidebar.css`
- `src/app/admin/styles/admin.layout.css`
- `src/app/admin/styles/adminlogin.css`

Plusieurs de ces fichiers sont des anciennes versions remplacées par `AdminNavbar`, `AdminShell`, les composants actuels de commande ou les formulaires placés un niveau plus haut.

### Composants, configuration et serveur

- `src/components/BesoinPage.tsx`
- `src/components/CartDrawer.tsx`
- `src/components/RelayPointModal.tsx`
- `src/components/RelayPointSelector.tsx`
- `src/components/RelayWidget.tsx`
- `src/components/admin/ToggleActivation.tsx`
- `src/components/reviews/ReviewsSection.tsx`
- `src/components/reviews/ReviewsSection.css`
- `src/config/shippingMethods.ts`
- `src/content/pages/home.ts`
- `src/lib/firebase.client.ts`
- `src/types/fulfillment.ts`
- `src/styles/admin-shipping-modal.css`
- `src/styles/components/cartDrawer.css`
- `src/styles/shipping-form.css`
- `src/types/shipping.ts`

`src/types/paypal__checkout-server-sdk.d.ts` n'a pas d'import entrant, mais c'est une déclaration TypeScript ambiante : ne pas la supprimer sans vérifier que la bibliothèque compile toujours.

### Ressources publiques non référencées

- `public/file.svg`
- `public/globe.svg`
- `public/next.svg`
- `public/vercel.svg`
- `public/window.svg`
- `public/brand/annuaire-hero-world.png`
- `public/brand/annuaire-hero.png`
- `public/brand/home-hero-consultation.png`
- `public/brand/home-hero-patient.png`
- `public/brand/vitrectomed-logo-board.png`
- `public/brand/vitrectomed-logo-horizontal.png`

Les cinq SVG sont les ressources par défaut de Create Next App. `public/robots.txt` n'est pas référencé dans le code mais est servi automatiquement : il doit rester.

## Doublons et dette de structure

- `ProductForm.tsx` existe deux fois ; seule la version directement sous `admin/products` est utilisée.
- `ToggleActivation.tsx` existe dans trois emplacements ; une seule variante de livraison est utilisée par la page active.
- `relayProviders.tsx` existe côté partagé et dans l'admin ; la variante admin semble abandonnée.
- Trois fichiers `product-form.css` coexistent.
- Deux feuilles `blog.css` coexistent ; ce doublon est légitime si elles ciblent liste et détail, mais les noms prêtent à confusion.
- `Navbar.tsx` à la racine des composants est seulement un fichier relais vers la vraie navigation. Ce n'est pas un bug, mais l'import direct éviterait une couche inutile.
- `tsconfig.tsbuildinfo` est versionné alors qu'il s'agit d'un cache généré. Il devrait être retiré du dépôt et ajouté au `.gitignore` lors d'un prochain nettoyage.
- Le README est encore presque entièrement celui de Create Next App et se termine par plusieurs lignes `massme` encodées de façon incorrecte.

## Qualité et maintenabilité

### Contrôles réalisés

- `npx tsc --noEmit` : succès, aucune erreur TypeScript de compilation.
- `npm run lint` : échec avec 548 signalements, dont 504 erreurs et 44 avertissements.
- 489 signalements viennent de `@typescript-eslint/no-explicit-any`.
- Autres catégories principales : 27 variables inutilisées, 13 balises image non optimisées, 7 mises à jour d'état synchrones dans des effets, 4 dépendances de hooks manquantes, 2 apostrophes JSX non échappées et un appel à `Math.random()` pendant le rendu.
- `npm run build` : interrompu après plusieurs minutes bloqué sur la création du build optimisé, sans erreur explicite. Le succès du compilateur seul ne permet donc pas d'affirmer qu'un build de production complet passe.

### Fichiers trop volumineux

Exemples :

- `admin-navbar.css` : environ 3 070 lignes.
- `admin.theme.css` : environ 2 230 lignes.
- `OrderDetails.css` : environ 2 060 lignes.
- `admin/page.tsx` : environ 1 630 lignes.
- `admin/reviews/page.tsx` : environ 1 510 lignes.
- `OrderDetails.tsx` : environ 1 470 lignes.
- `ProductEditForm.tsx` : environ 1 420 lignes.

Ces fichiers devraient être découpés par domaine et non seulement par type technique.

## Nettoyage effectué pendant l'audit

Les cinq artefacts explicitement dédiés aux tests, au développement ou au diagnostic ont été supprimés :

- `scripts/testMail.ts`
- `scripts/setupFirestore.ts`
- `src/app/api/admin/debug-firestore/route.ts`
- `src/app/api/dev/review-link/route.ts`
- `src/server/_debug/firebase/route.ts`

Aucun autre fichier potentiellement inutilisé n'a été supprimé automatiquement : l'analyse d'import ne remplace pas une validation fonctionnelle dans le navigateur.

## Plan d'action recommandé

1. Sécuriser immédiatement l'admin : session serveur, cookie HttpOnly, middleware/guard serveur et protection de toutes les API admin.
2. Corriger les deux bugs commandes : URL de `mark-paid` et logique de rôle dans `DELETE /api/admin/orders`.
3. Décider si le portugais est supporté, puis aligner toutes les listes de langues.
4. Unifier Firebase Admin et les réglages d'e-mails d'avis.
5. Supprimer les 54 candidats orphelins par petits lots, avec vérification visuelle boutique/admin après chaque lot.
6. Retirer les ressources Create Next App, le cache TypeScript versionné et réécrire le README.
7. Traiter d'abord les erreurs React du lint, puis réduire progressivement les `any` avec des types de domaine communs.
8. Ajouter ensuite le futur système de tests : tests de domaine, tests API d'autorisation, puis parcours navigateur checkout et admin.
