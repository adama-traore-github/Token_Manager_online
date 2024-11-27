
let web3;

const connectButton = document.getElementById('connectButton');

// Écoute du clic sur le bouton de connexion pour initier la connexion à MetaMask
connectButton.addEventListener('click', async () => {
    if (typeof window.ethereum !== 'undefined') {
        web3 = new Web3(window.ethereum);
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];

            connectButton.textContent = 'Déjà connecté à MetaMask';
            connectButton.disabled = true;
            console.log(`Connecté à l'adresse : ${account}`);
        } catch (error) {
            console.error('Erreur de connexion à MetaMask:', error);
            alert('Erreur lors de la connexion. Vérifiez Ganache et MetaMask.');
        }
    } else {
        alert('MetaMask n\'est pas installé. Veuillez l\'installer pour continuer.');
    }
});

// Écoute les changements de compte et réinitialise le bouton si déconnecté
if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            connectButton.textContent = 'Connecter avec MetaMask';
            connectButton.disabled = false;
        }
    });
}
