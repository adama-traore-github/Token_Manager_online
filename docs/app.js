// État global
let web3;
let currentAccount;
const STORAGE_KEYS = {
    TOKENS: 'created_tokens',
    TRANSACTIONS: 'token_transactions'
};

const NOTIFICATIONS = {
    container: null,
    queue: [],
    init() {
        this.container = document.createElement('div');
        this.container.className = 'fixed bottom-4 right-4 space-y-2 z-50';
        document.body.appendChild(this.container);
    },
    show(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `
            transform transition-all duration-300 ease-in-out
            flex items-center p-4 rounded-lg shadow-lg
            ${type === 'success' ? 'bg-green-50 text-green-800 border-l-4 border-green-500' : 
              'bg-red-50 text-red-800 border-l-4 border-red-500'}
        `;
        
        notification.innerHTML = `
            <div class="flex-shrink-0 mr-3">
                ${type === 'success' ? 
                    '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>' :
                    '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>'
                }
            </div>
            <div class="flex-1">${message}</div>
            <button class="ml-4 text-gray-400 hover:text-gray-600" onclick="this.parentElement.remove()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        `;

        this.container.appendChild(notification);
        setTimeout(() => {
            notification.classList.add('opacity-0', 'translate-x-full');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
};


// Configuration du contrat
const CONTRACT_CONFIG = {
    factoryAddress: '0x88aF9989aD557BAF15D29c1BB4356DEE5380bE0C',
    factoryABI: [
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "creator",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "name",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "symbol",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "supply",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "tokenAddress",
                    "type": "address"
                }
            ],
            "name": "TokenCreated",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_name",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_symbol",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "_initialSupply",
                    "type": "uint256"
                },
                {
                    "internalType": "uint8",
                    "name": "_decimals",
                    "type": "uint8"
                }
            ],
            "name": "createToken",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ],
    erc20ABI: [
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "account",
                    "type": "address"
                }
            ],
            "name": "balanceOf",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "decimals",
            "outputs": [
                {
                    "internalType": "uint8",
                    "name": "",
                    "type": "uint8"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]
};

// Initialisation

async function initWeb3() {
    NOTIFICATIONS.init(); // Initialiser le système de notifications

    if (typeof window.ethereum !== 'undefined') {
        try {
            web3 = new Web3(window.ethereum);
            
            const accounts = await web3.eth.getAccounts();
            if (accounts.length > 0) {
                currentAccount = accounts[0];
                console.log('Compte déjà connecté:', currentAccount);
            } else {
                const newAccounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                currentAccount = newAccounts[0];
            }
            
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', () => window.location.reload());
            
            displayConnectedAddress(currentAccount);
            initUI();
            loadStoredData();
            return true;
        } catch (error) {
            showError('Erreur de connexion à MetaMask: ' + error.message);
            return false;
        }
    } else {
        showError('MetaMask n\'est pas installé');
        return false;
    }
}



function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        showError('Veuillez connecter un compte MetaMask.');
        currentAccount = null;
    } else if (accounts[0] !== currentAccount) {
        currentAccount = accounts[0];
        displayConnectedAddress(currentAccount);
        console.log('Compte changé:', currentAccount);
    }
}

async function createToken(web3, factoryContract, account) {
    const name = document.getElementById('tokenName').value.trim();
    const symbol = document.getElementById('tokenSymbol').value.trim();
    const initialSupply = document.getElementById('initialSupply').value.trim();
    const decimals = document.getElementById('decimals').value.trim();

    if (!name || !symbol || !initialSupply || !decimals) {
        showError('Veuillez remplir tous les champs.');
        return;
    }

    try {
        const createButton = document.getElementById('createButton');
        createButton.disabled = true;
        createButton.textContent = 'Création en cours...';

        const createMethod = factoryContract.methods.createToken(
            name,
            symbol,
            initialSupply,
            decimals
        );

        // Optimisation du gas
        const gasPrice = await web3.eth.getGasPrice();
        const gasEstimate = await createMethod.estimateGas({ from: account });
        const adjustedGasPrice = Math.floor(Number(gasPrice) * 1.2); // Increase gas price by 20% for better reliability
        const adjustedGasLimit = Math.floor(gasEstimate * 1.1); // Add 10% buffer to gas limit

        const receipt = await createMethod.send({
            from: account,
            gas: adjustedGasLimit,
            gasPrice: adjustedGasPrice
        });

        // Vérifie que la transaction est confirmée
        const txReceipt = await web3.eth.getTransactionReceipt(receipt.transactionHash);
        if (txReceipt && txReceipt.status) {
            const tokenAddress = receipt.events.TokenCreated.returnValues.tokenAddress;
            await addTokenToMetaMask(tokenAddress, symbol, Number(decimals));

            addTransactionToHistory("creation", symbol, initialSupply); 

            showSuccess(`Token ${symbol} créé avec succès et ajouté à MetaMask!`);
        } else {
            console.error("Transaction échouée ou non confirmée");
            showError("Erreur : La transaction n'a pas été confirmée.");
        }
        
        document.getElementById('createTokenForm').reset();
    } catch (error) {
        console.error('Erreur lors de la création du token:', error);
        showError(error.message.includes('gas') ? 
            'Transaction échouée. Essayez d\'augmenter la limite de gas ou d\'attendre que le réseau soit moins congestionné.' : 
            'Erreur lors de la création du token: ' + error.message
        );
    } finally {
        const createButton = document.getElementById('createButton');
        createButton.disabled = false;
        createButton.textContent = 'Créer le Token';
    }
}

// Gestion du localStorage
function loadStoredData() {

    
    displayTransactions();
    const storedTokens = JSON.parse(localStorage.getItem(STORAGE_KEYS.TOKENS) || '[]');

    // Créer un Set pour vérifier les doublons avant d'ajouter des tokens ou des transactions
    const displayedTokenAddresses = new Set();

    // Ajouter les tokens à la liste en évitant les doublons
    storedTokens.forEach(token => {
        if (!displayedTokenAddresses.has(token.tokenAddress)) {
            addTokenToList(token);
            displayedTokenAddresses.add(token.tokenAddress); // Marquer comme affiché
        }
    });

    loadTransactionHistory();
}

// Sauvegarder un token sans doublons
function saveToken(tokenData) {
    const tokens = JSON.parse(localStorage.getItem(STORAGE_KEYS.TOKENS) || '[]');
    
    // Vérifier si le token existe déjà par tokenAddress
    const exists = tokens.some(token => token.tokenAddress === tokenData.tokenAddress);
    if (!exists) {
        tokens.push(tokenData);
        localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
    } else {
        console.log("Ce token existe déjà.");
    }
}


function saveTransaction(txData) {
    // Récupère les transactions existantes depuis le localStorage
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    // Vérifie si la transaction existe déjà (par exemple, en comparant un identifiant unique)
    const existeDeja = transactions.some(transaction => transaction.id === txData.id);

    // Ajoute la transaction seulement si elle n'existe pas déjà
    if (!existeDeja) {
        transactions.push(txData);
        localStorage.setItem('transactions', JSON.stringify(transactions));
    } else {
        console.log("Transaction déjà existante.");
    }
}


function loadTransactionHistory() {
    addTransactionToHistory();
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    transactions.forEach(txData => {
        addTransactionToHistory(txData);
    });
}


// UI Initialization
function initUI() {
    const factoryContract = createContract(web3);
    document.getElementById('createButton').onclick = () => createToken(web3, factoryContract, currentAccount);
    
    const toggleBtn = document.getElementById('toggleHistory');
    const historyDiv = document.getElementById('transactionHistory');
    toggleBtn.onclick = () => {
        const isHidden = historyDiv.classList.contains('hidden');
        historyDiv.classList.toggle('hidden');
        toggleBtn.textContent = isHidden ? 'Cacher l\'historique' : 'Voir l\'historique';
    };
}

// Contrat Factory
function createContract(web3) {
    const factoryContract = new web3.eth.Contract(
        CONTRACT_CONFIG.factoryABI,
        CONTRACT_CONFIG.factoryAddress
    );

    factoryContract.events.TokenCreated()
        .on('data', async (event) => {
            const tokenData = event.returnValues;
            await addTokenToMetaMask(tokenData);
            addTokenToList(tokenData);
            saveToken(tokenData);
            addTransactionToHistory({
                type: 'creation',
                token: tokenData,
                timestamp: Date.now()
            });
        })
        .on('error', console.error);

    return factoryContract;
}


// UI Components
function addTokenToList(tokenData) {
    const tokenList = document.getElementById('tokenList');
    const tokenElement = document.createElement('div');
    tokenElement.className = 'bg-gray-50 p-4 rounded-lg border border-gray-200';
    
    tokenElement.innerHTML = `
        <div class="flex justify-between items-start">
            <div>
                <h3 class="font-bold text-lg text-indigo-600">${tokenData.name} (${tokenData.symbol})</h3>
                <p class="text-sm text-gray-600">Créé par: ${shortenAddress(tokenData.creator)}</p>
                <p class="text-sm text-gray-600">Adresse: ${shortenAddress(tokenData.tokenAddress)}</p>
                <div class="mt-2 text-sm font-medium" data-token-balance="${tokenData.tokenAddress}"></div>
            </div>
            <div class="space-y-2">
                
                <button onclick="showBurnDialog('${tokenData.tokenAddress}')" 
                        class="block w-full text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200">
                    Détruire
                </button>
                 <button onclick="showTokenAddress('${tokenData.tokenAddress}')" class="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200">
                    Voir Adresse
                </button>
            </div>
        </div>
    `;

    tokenList.prepend(tokenElement);
    showTokenBalance(tokenData.tokenAddress);
}
function showTokenAddress(address) {
    alert(`Adresse du token: ${address}`);
}

function showBurnDialog(tokenAddress) {
    const amount = prompt('Combien de tokens voulez-vous détruire?');
    if (amount && !isNaN(amount)) {
        burnTokens(web3, tokenAddress, amount, currentAccount);
    }
}

const erc20ABI = [
    {
        "inputs": [{"internalType": "uint256","name": "amount","type": "uint256"}],
        "name": "burn",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address","name": "account","type": "address"}],
        "name": "balanceOf",
        "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
];


async function burnTokens(web3, tokenAddress, amount, userAddress) {
    const tokenContract = new web3.eth.Contract([
        ...erc20ABI,
        {
            "inputs": [],
            "name": "symbol",
            "outputs": [{"internalType": "string", "name": "", "type": "string"}],
            "stateMutability": "view",
            "type": "function"
        }
    ], tokenAddress);
    
    try {
        // Récupérer le symbole du token AVANT la transaction burn
        const symbol = await tokenContract.methods.symbol().call();
        
        // Exécuter la transaction burn
        const receipt = await tokenContract.methods.burn(amount).send({ 
            from: userAddress,
            gas: 300000
        });

        if (receipt.status) {
            // Ajouter la transaction à l'historique avec les bonnes valeurs
            addTransactionToHistory('destruction', symbol, amount);
            showSuccess(`${amount} ${symbol} ont été détruits avec succès`);
            await showTokenBalance(tokenAddress);
        }
    } catch (error) {
        showError('Erreur lors de la destruction des tokens: ' + error.message);
        console.error(error);
    }
}
// Fonction pour afficher le solde
async function showTokenBalance(tokenAddress) {
    try {
        const tokenContract = new web3.eth.Contract(CONTRACT_CONFIG.erc20ABI, tokenAddress);
        const balance = await tokenContract.methods.balanceOf(currentAccount).call();
        const decimals = await tokenContract.methods.decimals().call();
        
        // Convertir le solde en format lisible
        const formattedBalance = formatBalance(balance, decimals);
        
        const balanceElement = document.querySelector(`[data-token-balance="${tokenAddress}"]`);
        if (balanceElement) {
            balanceElement.textContent = `Solde: ${formattedBalance} tokens`;
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du solde:', error);
    }
}

function addTransactionToHistory(type, symbol, amount) {
    if (!symbol || !amount) {
        return;
    }

    const transaction = {
        type,
        symbol,
        amount,
        timestamp: Date.now()
    };

    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    displayTransactions();
}

function displayTransactions() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const container = document.getElementById('transactionList');
    if (!container) return;
    
    container.innerHTML = '';

    transactions.reverse().forEach(tx => {
        if (!tx.symbol || !tx.amount) return; // Ignorer les transactions invalides
        
        const txElement = document.createElement('div');
        txElement.className = 'p-3 border-b border-gray-200 flex justify-between items-center';

        const date = new Date(tx.timestamp).toLocaleString('fr-FR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        const icon = tx.type === 'creation' ? '🟢' : '🔴';
        const action = tx.type === 'creation' ? 'création' : 'destruction';

        txElement.innerHTML = `
            <div class="flex items-center gap-2">
                <span class="text-xl">${icon}</span>
                <span class="font-medium">${action} de ${tx.amount} ${tx.symbol}</span>
            </div>
            <span class="text-sm text-gray-500">${date}</span>
        `;

        container.appendChild(txElement);
    });

    if (transactions.length === 0) {
        container.innerHTML = '<div class="text-center p-4 text-gray-500">Aucune transaction</div>';
    }
}




// Fonction pour récupérer et formater le solde
async function getTokenBalance(tokenAddress) {
    const tokenContract = new web3.eth.Contract(CONTRACT_CONFIG.erc20ABI, tokenAddress);
    const decimals = await tokenContract.methods.decimals().call();
    const balance = await tokenContract.methods.balanceOf(currentAccount).call();
    return formatBalance(balance, decimals);
}
function formatBalance(balance, decimals) {
    // Convertir en nombre décimal
    const balanceInDecimal = BigInt(balance) / BigInt(Math.pow(10, decimals));
    
    // Convertir en chaîne de caractères et s'assurer qu'il n'y ait pas de notation scientifique
    const formattedBalance = balanceInDecimal.toString();
    
    // Retourner la valeur directement en tant que chaîne de caractères (sans virgule, sans notation scientifique)
    return formattedBalance;
}

// Ajout au MetaMask
async function addTokenToMetaMask(tokenAddress, tokenSymbol, tokenDecimals) {
    try {
        const wasAdded = await ethereum.request({
            method: 'wallet_watchAsset',
            params: {
                type: 'ERC20',
                options: {
                    address: tokenAddress,
                    symbol: tokenSymbol,
                    decimals: tokenDecimals,
                },
            },
        });

        if (wasAdded) {
            console.log("Token ajouté à MetaMask !");
        } else {
            console.log("Ajout du token à MetaMask annulé.");
        }
    } catch (error) {
        console.error("Erreur lors de l'ajout du token à MetaMask :", error);
    }
}


// Utility Functions
function displayConnectedAddress(address) {
    const shortAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    const addressDisplay = document.createElement('div');
    addressDisplay.className = 'text-center text-sm text-gray-600 mb-4';
    addressDisplay.textContent = `Connecté avec: ${shortAddress}`;
    document.querySelector('h1').after(addressDisplay);
}

function shortenAddress(address) {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

function showError(message) {
    NOTIFICATIONS.show(message, 'error');
}

function showSuccess(message) {
    NOTIFICATIONS.show(message, 'success');
}


// Initialize the application
initWeb3();




