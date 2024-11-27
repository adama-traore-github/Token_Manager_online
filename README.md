
# Token Manager

Token Manager est une plateforme sécurisée permettant la création, la gestion et la destruction de tokens fongibles via un **smart contract**, avec une intégration directe dans **MetaMask**. La plateforme fonctionne en local grâce à **Ganache** et **Truffle**, permettant ainsi des tests et des déploiements sur un réseau de développement Ethereum local.

## Fonctionnalités

- **Création de tokens** : Créez des tokens fongibles personnalisés directement sur la plateforme.
- **Destruction de tokens** : Détruisez des tokens pour gérer l'offre en circulation.
- **Intégration avec MetaMask** : Une fois les tokens créés, ils sont automatiquement ajoutés à votre portefeuille MetaMask pour une gestion facile et sécurisée.
- **Gestion des comptes MetaMask** : Changez de compte facilement via MetaMask, la plateforme détecte et met à jour automatiquement les informations.
- **Voir l'adresse du token** : Après la création d'un token, l'adresse du smart contract est affichée sur la plateforme et peut être consultée sur **Etherscan**.
- **Historique des transactions** : Visualisez toutes les transactions effectuées avec vos tokens (émission, destruction, transferts) sur **Etherscan** via l'adresse du contrat.

## Prérequis

- **MetaMask** : Un portefeuille Ethereum nécessaire pour interagir avec la plateforme.
- **Ganache** : Utilisé en local pour simuler un réseau Ethereum.
- **Truffle** : Framework pour développer, tester et déployer les smart contracts sur Ganache.

## Guide d'Utilisation

### 1. Connexion avec MetaMask

Avant de commencer, assurez-vous d'être connecté à **MetaMask** :

1. Téléchargez et installez **MetaMask** depuis [le site officiel](https://metamask.io/).
2. Connectez-vous ou créez un compte MetaMask.
3. Connectez **MetaMask** à la plateforme **Token Manager**.

**Important** : Vous ne pourrez pas créer ni détruire de tokens tant que votre compte MetaMask n'est pas relié à la plateforme.

### 2. Création de Tokens

1. Cliquez sur **"Créer des Tokens"**.
2. Entrez les détails de votre token (nom, symbole, quantité, etc.).
3. Confirmez la création du token. Le **smart contract** se charge de l'émission et ajoute automatiquement le token à votre portefeuille MetaMask.
4. **Voir l'adresse du contrat** : Après la création du token, l'adresse du smart contract sera affichée sur la plateforme. Cette adresse peut être consultée sur **Etherscan** pour obtenir plus de détails sur le contrat et ses transactions.

### 3. Destruction de Tokens

1. Accédez à la section **"Destruction de Tokens"**.
2. Sélectionnez les tokens à détruire.
3. Confirmez l'opération. Les tokens seront brûlés via le smart contract, réduisant l'offre totale.

### 4. Historique des Transactions

Toutes les transactions liées à votre token (émission, destruction, transferts) sont enregistrées sur la blockchain. Vous pouvez visualiser l'historique complet en consultant l'adresse du contrat sur **Etherscan**. L'historique inclut des informations sur chaque interaction avec le token.

### 5. Gestion des Comptes MetaMask

Si plusieurs comptes MetaMask sont disponibles :

- **Compte par défaut** : La plateforme utilisera automatiquement le compte ouvert par défaut.
- **Changement de compte** : Sélectionnez un autre compte dans MetaMask pour l'utiliser. La plateforme actualisera les informations et les soldes du nouveau compte.

### 6. Impact du Changement de Compte

Lors du changement de compte MetaMask :

- Les soldes et l'historique de transactions seront remis à zéro pour le nouveau compte.
- Pour consulter les transactions et les soldes, restez sur le même compte.

## Sécurité

- La plateforme utilise des **smart contracts** pour garantir la sécurité des transactions.
- **MetaMask** assure la gestion des clés privées et la sécurité des actifs.

## Conclusion

Token Manager est une solution complète et sécurisée pour gérer des tokens fongibles. Grâce à l'intégration avec **MetaMask** et l'utilisation des **smart contracts** déployés via **Ganache** et **Truffle**, vous pouvez créer, gérer et détruire des tokens facilement et en toute sécurité, tout en accédant à l'adresse du contrat et à l'historique des transactions sur **Etherscan**.



**© 2024 Token Management Platform. Tous droits réservés.**
