import React, { useState, useEffect } from "react"
import Layout from "./layout"
import { useMoralisWeb3Api } from "react-moralis"
import DateTimePicker from 'react-datetime-picker'
//import s4bytes from './s4bytes'
//import { DateTimePickerComponent } from '@syncfusion/ej2-react-calendars';

//import 'bootstrap/dist/css/bootstrap.css';
//import 'bootstrap/dist/js/bootstrap.js';
//import $ from 'jquery'

const chainList = [
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
        id: 2,
        name: 'Avalanche',
        net: 'avalanche'
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
    "0xa0712d68": ""
}

const TrackPage = (props) => {
    const [accountAddress, setAccountAddress] = useState("0x9F71F88cD9954692d8511F323e45D0b3b1E87EaF")
    const [chainName, setChainName] = useState(chainList[0].net)
    const [tokenAddress, setTokenAddress] = useState("0xe9e7cea3dedca5984780bafc599bd69add087d56")
    const [txList, setTxList] = useState([])
    const [stime, setStime] = useState(new Date("2022.03.01"))
    const [etime, setEtime] = useState(new Date())
    const [tokenMetadata, setTokenMetadata] = useState()

    const Web3Api = useMoralisWeb3Api();

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
        console.log(logs);
    }

    useEffect(() => {
        //const subscription = props.source.subscribe();
        return () => {
            // Clean up the subscription
            //subscription.unsubscribe();
        };
    });

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
        console.log(bscTransactions)
    }

    const fetchTransactions = async () => {
        let a = "https://raw.githubusercontent.com/ethereum-lists/4bytes/master/signatures/398bac63"
        // fetch(a, {method: "GET"}).then((res) => {
        //     console.log(res.json())
        // }).then((result) => {
        //     console.log(result)
        //     return result
        // })
        // getMethodname("398bac63").then(ct => {
        //     console.log(ct)
        // })

        console.log(accountAddress, chainName, tokenAddress)
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
                    console.log(_tx.method)
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
        console.log(txList)
    }

    const connectAndFetchAccount = async () => {
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
            return
        })
        console.log(tokenMetadata.symbol)

        // NFT token
        // try {
        //     const options1 = {
        //         chain: chainName,
        //         address: tokenAddress,
        //     };
        //     const nftTokenMetaData = await Web3Api.token.getNFTMetadata(options1)
        //     console.log(nftTokenMetaData)
        // } catch (e) {
        // }
    }

    return (
        <Layout>
            <div className="flex w-full items-center justify-center p-8">
                <div className="p-4 bg-app-blue-light rounded-md flex flex-col gap-2 sm: w-full">
                    <div className="flex justify-between items-center gap-4">
                        <p className="text-2xl font-bold">Dapp</p>
                    </div>
                    <div className="flex gap-2 justify-start sm:flex-row flex-col">
                        {/* <div className="flex gap-2 sm:gap-4 w-full"> */}
                        <div className="flex flex-col w-full space-x-2 sm:flex-row">
                            <p className="flex flex-shrink-0 text-sm mt-2">Wallet Address</p>
                            <input value={accountAddress} className="w-full border border-blue-900 rounded-md md:px-4 sm:px-2 px-1 py-1" placeholder="0x9F71F88cD9954692d8511F323e45D0b3b1E87EaF" onChange={(e) => { setAccountAddress(e.target.value) }} />
                        </div>
                        <button className="text-white bg-app-blue-200 rounded-md border border-blue-900 px-8 py-1" onClick={() => { connectAndFetchAccount() }}>
                            Connect
                        </button>
                        {/* </div> */}
                    </div>
                    <div className="flex gap-2 justify-start sm:flex-row flex-col">
                        <div className="flex flex-col w-full space-x-2 sm:flex-row">
                            <p className="flex flex-shrink-0 text-sm mt-2">Time</p>
                            <div className="w-full border border-blue-900 rounded-md md:px-4 sm:px-2 px-1 py-1">
                                <div>
                                    <DateTimePicker onChange={setStime} value={stime} />
                                    To
                                    <DateTimePicker onChange={(e) => { setEtime(e) }} value={etime} />
                                </div>
                                {/* <DateTimePickerComponent id="datetimepicker" strictMode={true} /> */}
                                {/* <div class="input-group input-daterange">
                                    <input type="text" class="form-control" value="2012-04-05"/>
                                    <div class="input-group-addon">to</div>
                                    <input type="text" class="form-control" value="2012-04-19"/>
                                </div> */}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 justify-start sm:flex-row flex-col">
                        <div className="flex flex-col w-full space-x-2 sm:flex-row">
                            <p className="flex flex-shrink-0 text-sm mt-2">Chain</p>
                            <select className="w-full py-1" onChange={(e) => setChainName(chainList[e.target.value].net)}>
                                {
                                    chainList.map((data, idx) => (
                                        <option key={idx} value={idx}>{data.name}</option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2 justify-start sm:flex-row flex-col">
                        <div className="flex flex-col w-full space-x-2 sm:flex-row">
                            <p className="flex flex-shrink-0 text-sm mt-2">Token</p>
                            <input className="w-1/3 border border-blue-900 rounded-md md:px-4 sm:px-2 px-1 py-1" onChange={(e) => { setTokenAddress(e.target.value) }} placeholder="Token address" />
                            <div className="flex items-center mr-4 mb-2">
                                <input type="checkbox" id="amount" name="amount" value="amount" onClick={(e) => { fetchLogsByAddress() }} />
                                <label htmlFor="amount" className="select-none">Amount</label>
                            </div>
                            <input className="w-1/3 border border-blue-900 rounded-md md:px-4 sm:px-2 px-1 py-1" onChange={(e) => { }} />

                            <button className="text-white bg-app-blue-200 rounded-md border border-blue-900 px-8 py-1" onClick={() => { fetchTransactions2() }}>
                                TestGetTx
                            </button>
                            <button className="text-white bg-app-blue-200 rounded-md border border-blue-900 px-8 py-1" onClick={() => { fetchTransactions() }}>
                                GetTx
                            </button>
                        </div>
                    </div>
                    <h1 className="p-0 font-bold">Transactions</h1>
                    <div className="flex flex-col gap-2" style={{ overflow: "auto", maxHeight: "1000px" }}>
                        <table className="w-full border-collapse border">
                            <thead>
                                <tr>
                                    <td className="border text-center">Token Symbol</td>
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
                                            <td className="border text-center">{tokenMetadata != null ? tokenMetadata.symbol : "indefinite"}</td>
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
        </Layout>
    )
}

export default TrackPage