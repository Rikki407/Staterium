App = {
    web3Provider: null,
    contracts: {},
    account: 0x0,

    init: function() {
        return App.initWeb3();
    },

    initWeb3: function() {
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider;
        } else {
            App.web3Provider = new Web3.providers.HttpProvider(
                'http://localhost:7545'
            );
        }
        web3 = new Web3(App.web3Provider);

        App.displayAccountInfo();

        return App.initContract();
    },

    initContract: () => {
        $.getJSON('Staterium.json', stateriumArtifact => {
            App.contracts.Staterium = TruffleContract(
                stateriumArtifact
            );
            App.contracts.Staterium.setProvider(App.web3Provider);
            return App.reloadGame();
        });
    },

    displayAccountInfo: () => {
        web3.eth.getCoinbase((err, account) => {
            if (err === null) {
                App.account = account;
                $('#eth_account').text(account);
                //On the Register and Login Page
                $("#publicKey").val(account);
                $("#publicKey2").val(account);
                console.log(account);
            }
            web3.eth.getBalance(account, (err, balance) => {
                if (err === null) {
                    console.log(DummyMatches['10']);
                    $('#eth_amount').text(
                        web3.fromWei(balance, 'ether') + ' Eth'
                    );
                }
            });
        });
    },

    reloadGame: () => {
        App.contracts.Staterium.deployed().then(instance => {
            console.log(instance);
            instance.Matches.call(11).then((match, err) => {
                console.log(match[2].toString(10));
                // App.stake();
            });
        });
    },

    stake: () => {
        App.contracts.Staterium.deployed().then(instance => {
            return instance.stake(100, 1, 10, {
                from: App.account,
                value: web3.toWei(20, 'ether'),
                gas: 500000
            });
        }).catch(error => {
            console.log(error)
        })
    }
};
$(document).ready(() => {
    App.init();
});
