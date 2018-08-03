const App = {
    web3Provider: null,
    contracts: {},
    account: 0x0,

    init: () => {
        return App.initWeb3();
    },

    initWeb3: () => {
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider;
        } else {
            App.web3Provider = new Web3.providers.HttpProvider(
                'http://localhost:7545'
            );
        }
        web3 = new Web3(App.web3Provider);

        App.displayAccountInfo();
    },

    displayAccountInfo: () => {
        web3.eth.getCoinbase((err, account) => {
            if (err === null) {
                App.account = account;
                //On the Register and Login Page
                $('#publicKey').val(account);
                console.log($('#publicKey').val());
                App.sign();
            }
        });
    },
    sign: () => {
        const signMessage = (publicAddress, nonce) => {
            return new Promise((resolve, reject) =>
                web3.personal.sign(
                    web3.fromUtf8(`I am signing my one-time nonce: ${nonce}`),
                    publicAddress,
                    (err, signature) => {
                        if (err) return reject(err);
                        return resolve({ publicAddress, signature });
                    }
                )
            );
        };
        let publicAddress = $('#publicKey').val();
        let nonce = Math.floor(Math.random() * 1000000);
        $('#signup_btn').click(() => {
            signMessage(publicAddress, nonce).then(res => {
                console.log(res);
                $.ajax({
                    type: 'POST',
                    url: '/register',
                    data: {
                        ethAddress: res.publicAddress,
                        nonce: nonce,
                        signature: res.signature
                    },
                    success: data => {
                        if (typeof data.redirect === 'string')
                            window.location = data.redirect;
                    }
                });
            });
            return false;
        });
    }
};
$(document).ready(() => {
    App.init();
});
