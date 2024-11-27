document.getElementById('createTokenLink').addEventListener('click', async (event) => {
    event.preventDefault(); // Empêche le comportement par défaut du lien

    // Demande à l'utilisateur de se connecter à MetaMask et de choisir un compte
    const isConnected = await requestMetaMaskConnection();
    if (isConnected) {
        // Récupère l'adresse du compte sélectionné par l'utilisateur
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const userAccount = accounts[0];

        // Stocke l'adresse du compte dans le localStorage
        localStorage.setItem('userAccount', userAccount);

        // Redirige vers la page de création de token
        window.location.href = "emission_et_destruction.html";
    } else {
        alert('Veuillez connecter votre compte MetaMask pour continuer.');
    }
});

async function requestMetaMaskConnection() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            // Demande à MetaMask de se connecter et de choisir un compte
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            return accounts.length > 0; // Retourne vrai si au moins un compte est connecté
        } catch (error) {
            console.error('Erreur de connexion MetaMask:', error);
            alert('La connexion à MetaMask a été refusée.');
            return false;
        }
    } else {
        alert('MetaMask n\'est pas installé.');
        return false;
    }
}
