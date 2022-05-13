import React, { useState, useEffect } from "react"
import Layout from "./layout"
import { useMoralisWeb3Api, useMoralis, useMoralisQuery } from "react-moralis"
import DateTimePicker from 'react-datetime-picker'
import axios from 'axios';
import Web3 from "web3";
//import Moralis from "moralis"
//import s4bytes from './s4bytes'
//import { DateTimePickerComponent } from '@syncfusion/ej2-react-calendars';

//import 'bootstrap/dist/css/bootstrap.css';
//import 'bootstrap/dist/js/bootstrap.js';
//import $ from 'jquery'


const chainList = [
    {
        id: 2,
        name: 'Avalanche',
        net: 'avalanche'
    },
    {
        id: 0,
        name: 'Ethereum',
        net: 'eth'
    },
    {
        id: 1,
        name: 'Binance Smart Chain',
        net: 'bsc'
    },
    {
        id: 3,
        name: 'Avalanche Testnet',
        net: 'avalanche testnet'
    },
    {
        id: 4,
        name: 'Polygon (Matic) Mainnet',
        net: 'matic'
    },
]

const methodSign = {
    "0x095ea7b3": "approve",
    "0xa9059cbb": "transfer",
    "0x": "transfer",
    "0x38ed1739": "swapExactTokensForTokens",
    "0x61feb716": "openPacks",
    "0xe67729b7": "withdrawRegular",
    "0x5238faf3": "processTokenRequests",
    "0xa0712d68": "",
    "0x20802c7e": "createNodeWithTokens"
}

const TrackPage = (props) => {
    const [accountAddress, setAccountAddress] = useState("0x3351e73298661e3b002c401ce13c03e9e1566625")
    const [chainName, setChainName] = useState(chainList[0].net)
    const [tokenAddress, setTokenAddress] = useState("0x8F47416CaE600bccF9530E9F3aeaA06bdD1Caa79")
    const [txList, setTxList] = useState([])
    const [ttList, setTtList] = useState([])
    const [ttxList, setTtxList] = useState([])
    const [stime, setStime] = useState(new Date("2022.03.01"))
    const [etime, setEtime] = useState(new Date())
    const [tokenMetadata, setTokenMetadata] = useState()
    const [tokenMarketCap, setTokenMarketCap] = useState(0)
    const [tokenInfo, setTokenInfo] = useState([])
    const [allTokenInfo, setAllTokenInfo] = useState([])
    const [tokenPrice, setTokenPrice] = useState(0)

    const Web3Api = useMoralisWeb3Api();
    const { Moralis, isInitialized, web3, enableWeb3, isWeb3Enabled, isWeb3EnableLoading, web3EnableError, authenticate, isAuthenticated, user } = useMoralis();

    // const web3 = new Web3("https://api.avax.network/ext/bc/C/rpc");
    const web3Obj = new Web3("https://api.avax.network/ext/bc/C/rpc");
    //enableWeb3();
    const { fetch } = useMoralisQuery(
        "MyTable",
        (query) => query.equalTo("confirmed", true).descending("block_timestamp").limit(1000),
        [],
        { autoFetch: false }
    );
    //enableWeb3();
    // create an array of objects with the id, trigger element (eg. button), and the content element
    const tabElements = [
        {
            id: 'profile',
            triggerEl: document.querySelector('#profile-tab-example'),
            targetEl: document.querySelector('#profile-example')
        },
        {
            id: 'dashboard',
            triggerEl: document.querySelector('#dashboard-tab-example'),
            targetEl: document.querySelector('#dashboard-example')
        },
        {
            id: 'settings',
            triggerEl: document.querySelector('#settings-tab-example'),
            targetEl: document.querySelector('#settings-example')
        },
        {
            id: 'contacts',
            triggerEl: document.querySelector('#contacts-tab-example'),
            targetEl: document.querySelector('#contacts-example')
        }
    ];

    // options with default values
    const options = {
        defaultTabId: 'settings',
        activeClasses: 'text-blue-600 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-400 border-blue-600 dark:border-blue-500',
        inactiveClasses: 'text-gray-500 hover:text-gray-600 dark:text-gray-400 border-gray-100 hover:border-gray-300 dark:border-gray-700 dark:hover:text-gray-300',
        onShow: () => {
            //console.log('tab is shown');
        }
    };

    //setTokenAddress(balances)
    const fetchLogsByAddress = async () => {
        const options = {
            address: "0x965bcc7a6ab4164a9d5e2e02d60527c549a336c9",
            chain: "bsc",
            topic0:
                "0x2caecd17d02f56fa897705dcc740da2d237c373f70686f4e0d9bd3bf0400ea7a",
            topic1:
                "0x000000000000000000000000031002d15b0d0cd7c9129d6f644446368deae391",
            topic2:
                "0x000000000000000000000000d25943be09f968ba740e0782a34e710100defae9",
        };
        const logs = await Web3Api.native.getLogsByAddress(options);
        //console.log(logs);
    }

    useEffect(async () => {
        //const subscription = props.source.subscribe();
        //const balances = await Web3Api.account.getTokenBalances({ address: accountAddress });
        //console.log("balances");
        var marketCap = await getMarketCapOfToken();
        //console.log('MC:::::' + marketCap);
        await setTokenMarketCap(marketCap);
       // console.log(tokenMarketCap);
         var tokenPriceData= await getTokenPriceData(50);
         setAllTokenInfo(tokenPriceData);
        // console.log(tokenPriceData.prices.find(x=>x[0]==1648113496676));
         var counts=tokenPriceData.prices.map(x=>x[0]);
         var goal=1648113496677;
         var closest = counts.reduce(function(prev, curr) {
            return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
          });
          console.log(closest);
          var tokenPrice = parseFloat(await fetchTokenPrice1(tokenAddress));
          setTokenPrice(tokenPrice);
        return () => {
            // Clean up the subscription
            //subscription.unsubscribe();
        };
    },[]);

    async function getMethodname(hexsign) {
        return new Promise((resolve, response) => {
            const xhttp = new XMLHttpRequest();
            xhttp.onload = function () {
                resolve(this.responseText)
            }
            xhttp.open("GET", "https://raw.githubusercontent.com/ethereum-lists/4bytes/master/signatures/" + hexsign)
            xhttp.send()
        })
    }



    const fetchTransactions2 = async () => {
        const acAddress = accountAddress
        const _chain = chainName
        const options = {
            chain: _chain,
            address: acAddress,
            order: "desc",
            from_block: "0",
        };
        // load transaction by account address
        const bscTransactions = await Web3Api.account.getTransactions(options)
        //console.log(bscTransactions)
    }

    const fetchTransactions = async () => {
        let a = "https://raw.githubusercontent.com/ethereum-lists/4bytes/master/signatures/398bac63"
        // fetch(a, {method: "GET"}).then((res) => {
        //     //console.log(res.json())
        // }).then((result) => {
        //     //console.log(result)
        //     return result
        // })
        // getMethodname("398bac63").then(ct => {
        //     //console.log(ct)
        // })

        //console.log(accountAddress, chainName, tokenAddress)
        const acAddress = accountAddress
        const _chain = chainName
        const options = {
            chain: _chain,
            address: acAddress,
            order: "desc",
            from_block: "0",
        };
        // load transaction by account address
        const bscTransactions = await Web3Api.account.getTransactions(options)

        // get token meta data
        const options2 = {
            chain: chainName,
            addresses: [tokenAddress],
        }
        const _tokenMetadata = (await Web3Api.token.getTokenMetadata(options2))[0]
        setTokenMetadata(_tokenMetadata)
        //console.log("hello:");
        //console.log(_tokenMetadata);

        // filter transaction list
        let _txList = []
        for (var i = 0; i < bscTransactions.result.length; i++) {
            let _tx = bscTransactions.result[i]
            var hexsign = bscTransactions.result[i].input.substring(0, 10)
            try {
                if (hexsign == "0x")
                    _tx.method = "Transfer"
                else {
                    _tx.method = await getMethodname(hexsign.substring(2))
                    _tx.method = _tx.method.substring(0, _tx.method.indexOf('('))
                    //console.log(_tx.method)
                }
            } catch (e) {

            }
            //_tx.method = await getMethodname(hexsign)
            let d = new Date(_tx.block_timestamp)
            if (d > stime && d < etime) {
                //if (_tx.from_address == tokenAddress || _tx.to_address == tokenAddress)
                _txList.push(_tx)
            }
        }
        setTxList(_txList)
        //console.log("hello1")
        //console.log(_txList)
        fetchTokenTransfers();

    }

    const fetchTokenTransfers = async () => {
        let a = "https://raw.githubusercontent.com/ethereum-lists/4bytes/master/signatures/398bac63"
        // fetch(a, {method: "GET"}).then((res) => {
        //     //console.log(res.json())
        // }).then((result) => {
        //     //console.log(result)
        //     return result
        // })
        // getMethodname("398bac63").then(ct => {
        //     //console.log(ct)
        // })

        //console.log(accountAddress, chainName, tokenAddress)
        const acAddress = accountAddress
        const _chain = chainName
        const options = {
            chain: _chain,
            address: acAddress,
            order: "desc",
            from_block: "0",
        };
        // load transaction by account address
        const tokenTransfers = await Web3Api.account.getTokenTransfers(options)
        const balances = await Web3Api.account.getTokenBalances({ address: accountAddress });
        let _ttList = [];
        for (var i = 0; i < tokenTransfers.result.length; i++) {
            let _tt = tokenTransfers.result[i]
            let data = balances.find(x => x.token_address == _tt.address);
            //console.log(data);
            if (data) {
                _tt.symbol = data.symbol;
                _tt.logo = data.logo;
            }
            else {
                _tt.symbol = "N/A";
            }
            //var hexsign = tokenTransfers.result[i].input.substring(0, 10)
            // try {
            //     if (hexsign == "0x")
            //         _tt.method = "Transfer"
            //     else {
            //         _tt.method = await getMethodname(hexsign.substring(2))
            //         _tt.method = _tt.method.substring(0, _tt.method.indexOf('('))
            //         //console.log(_tt.method)
            //     }
            // } catch (e) {

            // }
            //_tx.method = await getMethodname(hexsign)
            let d = new Date(_tt.block_timestamp)
            if (d > stime && d < etime) {
                //if (_tx.from_address == tokenAddress || _tx.to_address == tokenAddress)
                _ttList.push(_tt)
            }
        }

        setTtList(_ttList);
        //console.log("hello:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::")
        //debugger;
        //console.log(_ttList);
    }

    const getAllBlockHeights = () => {
        const options =
        {
            chainId: 1,
            address: accountAddress,
            startingBlock: 0,
            endingBlock: 1,
            pageNumber: 1,
            pageSize: 10,
            quoteCurrency: null
        }
        //var data = await Moralis.Plugins.covalent.getChangesInTokenHolerBetweenBlockHeights(options);
        // //console.log(JSON.stringify(data));

    }
    const getTransactionsForAddress = async (address) => {
        const options = {
            chainId: 43114,
            address: address,
            //quoteCurrency?: string;
            pageNumber: 1,
            pageSize: 1000,
        }
        //console.log("Data:" + address);
        //var data = await Moralis.Plugins.covalent.getTransactionsForAddress(options);
        const results = await fetch().catch(err => console.log(err));
        var items = [];
        for (let i = 0; i < results.length; i++) {
            const object = results[i];
            ////console.log(object.id + " - " +await object.get("transaction_hash"));
            items.push({ 'tx_hash': await object.get("transaction_hash"), value: await object.get("value_decimal"), block_number: await object.get("block_number"),  block_timestamp: await object.get("block_timestamp") });
        }
        //console.log(results);
        //var items = data.data.items.slice(0, 10);
        ////console.log(data);
        let _dtxList = [];
        //await enableWeb3();
        let i = 0;
        await items.forEach(async element => {
            //console.log(element);
            //var tx = await getTransactionsForTransactionHashCovalent(element.tx_hash);
            var tx = await getTransactionsForTransactionHashWeb3(element.tx_hash);
            //console.log("Data1:");
            //console.log(tx);
            var hexsign = tx.input.substring(0, 10)
            if (hexsign == "0x20802c7e") {
                if (i++ < 20) {
                    //console.log(element.block_timestamp.getTime());
                    const tokenPrice =await fetchTokenPrice(tokenAddress, element.block_timestamp.getTime())
                    const _tx = { ...tx, value: element.value.value.$numberDecimal/ 1.0e18, tokenPrice: tokenPrice,block_timestamp: element.block_timestamp.toLocaleString() };
                    _dtxList.push(_tx);
                }
            }
            try {
                if (hexsign == "0x")
                    tx.method = "Transfer"
                else {
                    //tx.method = await getMethodname(hexsign.substring(2))
                    //tx.method = tx.method.substring(0, tx.method.indexOf('('))
                    // //console.log(tx.method)
                }

            } catch (e) {

            }
        });
        setTtxList(_dtxList);

        getAllTokenForAddress(accountAddress);
        //console.log('hello:' + tokenMarketCap);
        //debugger;
        console.log(_dtxList);
    }

    const getTransactionsForTransactionHash = async (txHash) => {

        const _chain = chainName
        const options = {
            chain: _chain,
            transaction_hash: txHash,
        };
        const transaction = await Moralis.Web3API.native.getTransaction(options);
        ////console.log(transaction);
        return transaction;

    }

    const getTransactionsForTransactionHashCovalent = async (txHash) => {
        const options = {
            chainId: 43114,
            transactionHash: txHash,

        }
        ////console.log("Data:");
        var data = await Moralis.Plugins.covalent.getTransaction(options);
        return data;
    }

    const getTransactionsForTransactionHashWeb3 = async (txHash) => {
        const options = {
            chainId: 43114,
            transactionHash: txHash,

        }
        ////console.log("Dataggggg:");

        //await Moralis.enableWeb3();
        //const web3Js = new Web3(Moralis.provider);

        var data;
        await web3Obj.eth.getTransaction(txHash, function (error, result) {
            //console.log(error);
            data = result;
        });
        ////console.log(data);
        ////console.log("Datadddd:");
        return data;
    }

    const getMarketCapOfToken = async () => {
        var totalSupply = parseFloat(await getTotalSupplyOfToken());
        var tokenPrice = parseFloat(await fetchTokenPrice1(tokenAddress));
        //var tokenBalance =parseFloat(await getBalance(tokenAddress));
        //console.log('------' + totalSupply / 1.0e18 + '----' + tokenPrice.toString() + '---A---' + ((tokenPrice / 1000000000000000000)) + '-----' + (tokenPrice / 1.0e18));
        var marketCap = ((((totalSupply / 1.0e18)) * (tokenPrice)));
        //console.log(marketCap);
        return marketCap;
    }

    const getMarketCapOfToken1 = async () => {
        var data = 0;
        await axios.get(`https://api.coingecko.com/api/v3/coins/avalanche/contract/` + tokenAddress)
            .then(res => {
                const value = res.data;
                //var data=JSON.parse(value);
                //console.log(value['market_data']['market_cap']['usd'])
                data = value['market_data']['market_cap']['usd'];

            })
        return data;

    }

    const getTokenPriceData = async (count) => {
        var data = [];
        await axios.get(`https://api.coingecko.com/api/v3/coins/avalanche/contract/${tokenAddress}/market_chart/?vs_currency=usd&days=${count}`)
            .then(res => {
                const value = res.data;
                //var data=JSON.parse(value);
                //console.log(value['market_data']['market_cap']['usd'])
                data = value;

            })
        return data;

    }

    const getAllTokenForAddress = async (address) => {

        const balances = await Web3Api.account.getTokenBalances({ chain: chainName, address: address });
        setTokenInfo(balances);
        //console.log("balances::::");
        //console.log(balances);
    }

    const hexToDec = (value) => {
        if (value?._isBigNumber) return parseInt(value._hex, 16)
        else return -1
    }
    const getTotalSupplyOfToken1 = async () => {
        const ABI = [
            { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
        ];

        const options = {
            contractAddress: tokenAddress,
            functionName: "totalSupply",
            abi: ABI,
        };

        const message = await Moralis.executeFunction(options);
        //debugger;
        //console.log('kkkkkkkkkkkkkkkkkkkkkkkkkkkkk:' + JSON.stringify(message));
        return message;
        //getBalance(accountAddress);
    }

    const getTotalSupplyOfToken = async () => {
        var message = null;
        const ABI = [
            { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
        ];

        const contract = new web3Obj.eth.Contract(ABI, tokenAddress, {
            from: accountAddress, // default from address
            //gasPrice: '30000000000' // default gas price in wei, 20 gwei in this case
        });
        await contract.methods.totalSupply().call((err, result) => {

            //console.log(result)
            message = result;
        });

        //debugger;
        //console.log('kkkkkkkkkkkkkkkkkkkkkkkkkkkkk:' + JSON.stringify(message));
        return message;
        //getBalance(accountAddress);
    }

    const getBalance = async (address) => {
        const ABI = [{ "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }];

        const options = {
            contractAddress: tokenAddress,
            functionName: "balanceOf",
            abi: ABI,
            params: {
                account: address,
            }
        };

        const message = await Moralis.executeFunction(options);
        //console.log(message);
        return message;
    }

    const fetchTokenPrice1 = async (address, to_block = null) => {
        //Get token price on PancakeSwap v2 BSC
        const options = {
            address: address,
            chain: chainName,
            to_block: to_block
            //exchange: "PancakeSwapv2",
        };
        //console.log('-----' + address);
        const price = await Web3Api.token.getTokenPrice(options);
        //console.log('--------------------------------------------------' + JSON.stringify(price));
        return price.usdPrice;
    };

    const fetchTokenPrice = async (address, block_timestamp = null) => {
        //Get token price on PancakeSwap v2 BSC
        var counts=allTokenInfo.prices.map(x=>x[0]);
         var goal=block_timestamp;
         var closest = counts.reduce(function(prev, curr) {
            return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
          });
          console.log(closest);
          var data= allTokenInfo.prices.find(x=>x[0]==closest);
          return data[1];
    };
    const sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }


    const connectAndFetchAccount = async () => {
        //console.log('Hi' + isAuthenticated);
        if (true) {
            //console.log('Hi1');
            await authenticate()
                .then(function (user) {
                    const account = user.get("ethAddress");
                    //console.log(user.get("ethAddress"));
                    setAccountAddress(account)
                })
                .catch(function (error) {
                    //console.log(error);
                });
        }
    }
    const connectAndFetchAccount2 = async () => {
        if (window.ethereum) {
            const data = await enableWeb3();
            //await Moralis.enableWeb3();
            //await data.activate();

            var accounts = [];
            // var web31 = new Web3(Moralis.provider);
            try {
                //const web3 = new Web3("https://api.avax.network/ext/bc/C/rpc");
                // while(!isWeb3Enabled){
                //     await enableWeb3();
                //     //console.log(isWeb3Enabled);
                // }
                accounts = await web3.listAccounts();
            }
            catch (error) {
                //console.log(error);
                await enableWeb3();
                //await sleep(5000);
                // await enableWeb3();
                accounts = await web3.listAccounts();
            }
            const account = accounts[0];
            setAccountAddress(account)

        }
        else {
            setAccountAddress("Please Install Wallet!")
        }
    }
    const connectAndFetchAccount1 = async () => {
        if (window.ethereum) {

            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];
            setAccountAddress(account)

        }
        else {
            setAccountAddress("Please Install Wallet!")
        }
    }




    const onChangeToken = async () => {

        // FT token
        const options = {
            chain: chainName,
            addresses: tokenAddress,
        }
        const tokenMetadata = await Web3Api.token.getTokenMetadata(options).then((e) => {
            //console.log(tokenMetadata.symbol)
            return
        })
        //console.log(tokenMetadata.symbol)

        // NFT token
        // try {
        //     const options1 = {
        //         chain: chainName,
        //         address: tokenAddress,
        //     };
        //     const nftTokenMetaData = await Web3Api.token.getNFTMetadata(options1)
        //     //console.log(nftTokenMetaData)
        // } catch (e) {
        // }
    }

    const Tabs = ({ color }) => {
        const [openTab, setOpenTab] = React.useState(1);
        return (
            <>

                <div className="flex flex--wrap">
                    <div className="w-full">
                        <ul
                            className="flex mb-0 list-none flex-wrap pt-3 pb-4 flex-row"
                            role="tablist"
                        >
                            <li className="-mb-px mr-2 last:mr-0 flex-auto text-center">
                                <a
                                    className={
                                        "text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal " +
                                        (openTab === 1
                                            ? "text-white bg-blue" + color + "-600"
                                            : "text-" + color + "-600 bg-white")
                                    }
                                    onClick={e => {
                                        e.preventDefault();
                                        setOpenTab(1);
                                    }}
                                    data-toggle="tab"
                                    href="#link1"
                                    role="tablist"
                                >
                                    Transactions
                                </a>
                            </li>
                            <li className="-mb-px mr-2 last:mr-0 flex-auto text-center">
                                <a
                                    className={
                                        "text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal " +
                                        (openTab === 2
                                            ? "text-white bg-" + color + "-600"
                                            : "text-" + color + "-600 bg-white")
                                    }
                                    onClick={e => {
                                        e.preventDefault();
                                        setOpenTab(2);
                                    }}
                                    data-toggle="tab"
                                    href="#link2"
                                    role="tablist"
                                >
                                    Token Transfers
                                </a>
                            </li>
                            <li className="-mb-px mr-2 last:mr-0 flex-auto text-center">
                                <a
                                    className={
                                        "text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal " +
                                        (openTab === 3
                                            ? "text-white bg-" + color + "-600"
                                            : "text-" + color + "-600 bg-white")
                                    }
                                    onClick={e => {
                                        e.preventDefault();
                                        setOpenTab(3);
                                    }}
                                    data-toggle="tab"
                                    href="#link3"
                                    role="tablist"
                                >
                                    Token Create-Node Info
                                </a>
                            </li>
                            <li className="-mb-px mr-2 last:mr-0 flex-auto text-center">
                                <a
                                    className={
                                        "text-xs font-bold uppercase px-5 py-3 shadow-lg rounded block leading-normal " +
                                        (openTab === 4
                                            ? "text-white bg-" + color + "-600"
                                            : "text-" + color + "-600 bg-white")
                                    }
                                    onClick={e => {
                                        e.preventDefault();
                                        setOpenTab(4);
                                    }}
                                    data-toggle="tab"
                                    href="#link4"
                                    role="tablist"
                                >
                                    User Token Info
                                </a>
                            </li>
                        </ul>
                        <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
                            <div className="px-4 py-5 flex-auto">
                                <div className="tab-content tab-space">
                                    <div className={openTab === 1 ? "block" : "hidden"} id="link1">
                                        <div id="tx">
                                            <h1 className="p-0 font-bold">Transactions</h1>
                                            <div className="flex flex-col gap-2" style={{ overflow: "auto", maxHeight: "1000px" }}>
                                                <table className="w-full border-collapse border app-table">
                                                    <thead>
                                                        <tr>
                                                            <td className="border text-center">Transaction Hash</td>
                                                            <td className="border text-center">Method</td>
                                                            <td className="border text-center">Block</td>
                                                            <td className="border text-center">Date</td>
                                                            <td className="border text-center">From</td>
                                                            <td className="border text-center">To</td>
                                                            <td className="border text-center">Value</td>
                                                            <td className="border text-center">In/Out</td>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {
                                                            txList.map((data, idx) => (
                                                                <tr id={idx} key={idx}>
                                                                    <td className="border text-center"><a target={'_blank'} style={{ color: 'blue' }} href={'https://snowtrace.io/tx/' + data.hash}>{data.hash}</a></td>
                                                                    <td className="border text-center">{data.method}</td>
                                                                    <td className="border text-center">{data.block_number}</td>
                                                                    <td className="border text-center">{data.block_timestamp}</td>
                                                                    <td className="border text-center">{data.from_address}</td>
                                                                    <td className="border text-center">{data.to_address}</td>
                                                                    <td className="border text-center">{parseInt(data.value) / 10 ** parseInt(tokenMetadata != null ? tokenMetadata.decimals : 1)}</td>
                                                                    <td className="border text-center">{data.to_address === accountAddress.toLowerCase() ? 'IN' : "OUT"}</td>
                                                                </tr>
                                                            ))
                                                        }
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={openTab === 2 ? "block" : "hidden"} id="link2">
                                        <div id="tt">
                                            <h1 className="p-0 font-bold">Token Transfers</h1>
                                            <div className="flex flex-col gap-2" style={{ overflow: "auto", maxHeight: "1000px" }}>
                                                <table className="w-full border-collapse border app-table">
                                                    <thead>
                                                        <tr>
                                                            <td className="border text-center">Transaction Hash</td>
                                                            <td className="border text-center">Token Symbol</td>
                                                            <td className="border text-center">Address</td>
                                                            <td className="border text-center">Block Number</td>
                                                            <td className="border text-center">Date</td>
                                                            <td className="border text-center">From</td>
                                                            <td className="border text-center">To</td>
                                                            <td className="border text-center">Value</td>
                                                            <td className="border text-center">In/Out</td>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {
                                                            ttList.map((data, idx) => (
                                                                <tr id={idx} key={idx}>
                                                                    <td className="border text-center"><a target={'_blank'} style={{ color: 'blue' }} href={'https://snowtrace.io/tx/' + data.transaction_hash}>{data.transaction_hash}</a></td>
                                                                    <td className="border text-center"><img src={data.logo} />{data.symbol}</td>
                                                                    <td className="border text-center">{data.address}</td>
                                                                    <td className="border text-center">{data.block_number}</td>
                                                                    <td className="border text-center">{data.block_timestamp}</td>
                                                                    <td className="border text-center">{data.from_address}</td>
                                                                    <td className="border text-center">{data.to_address}</td>
                                                                    <td className="border text-center">{parseInt(data.value) / 10 ** parseInt(tokenMetadata != null ? tokenMetadata.decimals : 1)}</td>
                                                                    <td className="border text-center">{data.to_address === accountAddress.toLowerCase() ? 'IN' : "OUT"}</td>
                                                                </tr>
                                                            ))
                                                        }
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={openTab === 3 ? "block" : "hidden"} id="link3">

                                        <div id="ttx">
                                            <h1 className="p-0 font-bold">Token Create-Node Info</h1>
                                            <div className="flex flex-col gap-2" style={{ overflow: "auto", maxHeight: "1000px" }}>
                                                <table className="w-full border-collapse border app-table">
                                                    <thead>
                                                        <tr>
                                                            <td className="border text-center">Transaction Hash</td>
                                                            <td className="border text-center">Method</td>
                                                            <td className="border text-center">From</td>
                                                            <td className="border text-center">To</td>
                                                            <td className="border text-center">Timestamp</td>
                                                            <td className="border text-center">Token Price</td>
                                                            <td className="border text-center">Total Tokens</td>

                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {
                                                            ttxList.map((data, idx) => (
                                                                <tr id={idx} key={idx}>
                                                                    <td className="border text-center"><a target={'_blank'} style={{ color: 'blue' }} href={'https://snowtrace.io/tx/' + data.hash}>{data.hash}</a></td>
                                                                    <td className="border text-center">CreateNodeWithTokens</td>
                                                                    <td className="border text-center">{data.from}</td>
                                                                    <td className="border text-center">{data.to}</td>
                                                                    <td className="border text-center">{data.block_timestamp}</td>
                                                                    <td className="border text-center">{data.tokenPrice}</td>
                                                                    <td className="border text-center">{data.value}</td>
                                                                </tr>
                                                            ))
                                                        }
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={openTab === 4 ? "block" : "hidden"} id="link4">

                                        <div id="ti">
                                            <h1 className="p-0 font-bold">User Token Info</h1>
                                            <div className="flex flex-col gap-2" style={{ overflow: "auto", maxHeight: "1000px" }}>
                                                <table className="w-full border-collapse border  app-table">
                                                    <thead>
                                                        <tr>
                                                            <td className="border text-center">Token Address</td>
                                                            <td className="border text-center">Symbol</td>
                                                            <td className="border text-center">Name</td>
                                                            <td className="border text-center">Balance</td>

                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {
                                                            tokenInfo.map((data, idx) => (
                                                                <tr id={idx} key={idx}>
                                                                    <td className="border text-center"><a target={'_blank'} style={{ color: 'blue' }} href={'https://snowtrace.io/token/' + data.token_address}>{data.token_address}</a></td>
                                                                    <td className="border text-center"><img src={data.thumbnail} />{data.symbol}</td>
                                                                    <td className="border text-center">{data.name}</td>
                                                                    <td className="border text-center">{data.balance}</td>
                                                                </tr>
                                                            ))
                                                        }
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    };


    return (
        <Layout>
            {/* {web3EnableError && <span >{web3EnableError}</span>} */}

            <div className="flex w-full items-center justify-center">
                <div className="form-container p-4 rounded-md flex flex-col gap-2 sm: w-full">
                    <div className="items-center gap-4 title">
                        <h1></h1>
                    </div>
                    <div className="flex gap-2 justify-start sm:flex-row flex-col">
                        {/* <div className="flex gap-2 sm:gap-4 w-full"> */}
                        <div className="flex flex-col w-full space-x-2 sm:flex-row form-box">
                            <p className="flex flex-shrink-0 text-sm mt-2">Wallet Address</p>
                            <input value={accountAddress} className="w-full md:px-4 sm:px-2 px-1 py-1" placeholder="0x9F71F88cD9954692d8511F323e45D0b3b1E87EaF" onChange={(e) => { setAccountAddress(e.target.value) }} />
                        </div>
                        <button className="btn-type-1 px-8 py-1" onClick={() => { connectAndFetchAccount() }}>
                            Connect
                        </button>
                        {/* </div> */}
                    </div>
                    <div className="flex gap-2 justify-start sm:flex-row flex-col">
                        {/* <div className="flex gap-2 sm:gap-4 w-full"> */}
                        <div className="flex flex-col w-full space-x-2 sm:flex-row form-box">
                            <p className="flex flex-shrink-0 text-sm mt-2">Token Address</p>
                            <input value={tokenAddress} className="w-full md:px-4 sm:px-2 px-1 py-1" placeholder="0x9F71F88cD9954692d8511F323e45D0b3b1E87EaF" onChange={(e) => { setTokenAddress(e.target.value) }} />
                        </div>
                        <div className="flex flex-col w-full space-x-2 sm:flex-row form-box">
                            <h1 className=" w-full md:px-2 sm:px-2 px-1 py-1 p-0"><b>Price: </b>{tokenPrice} USD <br></br> <b>Market Cap : </b>{tokenMarketCap} USD</h1>
                        </div>

                        {/* </div> */}
                    </div>
                    {/* <div className="flex gap-2 justify-start sm:flex-row flex-col">
                        <div className="flex flex-col w-full space-x-2 sm:flex-row">
                            <p className="flex flex-shrink-0 text-sm mt-2">Time</p>
                            <div className="w-full border border-blue-900 rounded-md md:px-4 sm:px-2 px-1 py-1">
                                <div>
                                    <DateTimePicker onChange={setStime} value={stime} />
                                    To
                                    <DateTimePicker onChange={(e) => { setEtime(e) }} value={etime} />
                                </div>
                                <DateTimePickerComponent id="datetimepicker" strictMode={true} />
                                <div class="input-group input-daterange">
                                    <input type="text" class="form-control" value="2012-04-05"/>
                                    <div class="input-group-addon">to</div>
                                    <input type="text" class="form-control" value="2012-04-19"/>
                                </div>
                            </div>
                        </div>
                    </div> */}
                    <div className="flex gap-2 justify-start sm:flex-row flex-col">
                        <div className="flex flex-col w-full space-x-2 sm:flex-row form-box">
                            <p className="flex flex-shrink-0 text-sm mt-2 chain-para">Chain</p>
                            <select className="w-full py-1 ml-4" onChange={(e) => setChainName(chainList[e.target.value].net)}>
                                {
                                    chainList.map((data, idx) => (
                                        <option key={idx} value={idx}>{data.name}</option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-2 justify-start sm:flex-row flex-col">
                        <div className="flex flex-col w-full space-x-2 sm:flex-row btn-box">
                            {/* <p className="flex flex-shrink-0 text-sm mt-2">Token</p>
                            <input className="w-1/3 border border-blue-900 rounded-md md:px-4 sm:px-2 px-1 py-1" onChange={(e) => { setTokenAddress(e.target.value) }} placeholder="Token address" />
                            <div className="flex items-center mr-4 mb-2">
                                <input type="checkbox" id="amount" name="amount" value="amount" onClick={(e) => { fetchLogsByAddress() }} />
                                <label htmlFor="amount" className="select-none">Amount</label>
                            </div>
                            <input className="w-1/3 border border-blue-900 rounded-md md:px-4 sm:px-2 px-1 py-1" onClick={(e) => { onChangeToken() }} />

                            <button className="text-white bg-app-blue-200 rounded-md border border-blue-900 px-8 py-1" onClick={() => { fetchTransactions2() }}>
                                TestGetTx
                            </button> */}
                            <button className="btn-type-2 px-8 py-1" onClick={() => { fetchTransactions() }}>
                                Get Tx and Token Transfers
                            </button>
                            <button className="btn-type-2 px-8 py-1" onClick={() => getTransactionsForAddress(tokenAddress)}>Get Token Info</button>
                        </div>
                    </div>
                    <Tabs color="pink" />


                </div>
            </div>
        </Layout>
    )
}

export default TrackPage