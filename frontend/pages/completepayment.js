import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { useEffect, useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useConnect, useDisconnect, useNetwork } from 'wagmi'
import { ERC20ABI, chainidtodata, cryptopayabi } from "../constants";
import { readContract, watchContractEvent, getAccount, prepareWriteContract, writeContract, waitForTransaction } from '@wagmi/core'
import { useNotification } from 'web3uikit'


const inter = Inter({ subsets: ['latin'] })

export default function Home() {

    const { address, isConnecting, isDisconnected, isConnected } = useAccount()
    const { chain, chains } = useNetwork()
    const account = getAccount()
    const dispatch = useNotification()


    const supportedChainIds = [5, 420, 80001, 59140]
    function getURLParameters(url) {
        var params = {};
        var parser = document.createElement('a');
        parser.href = url;
        var query = parser.search.substring(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
        }
        return params;
    }

    let url = window.location.href
    console.log(url)
    let params = getURLParameters(url)
    let merchantAddress = params['address']
    let paymentAmount = params['amount']
    let destinationChainId = params['destinationChainid']
    let invalidParams
    const [usdTokenBalance, setUSDTokenBalance] = useState(0)


    const [usdAllowance, setUSDAllowance] = useState()

    async function getAllowance() {
        if (isDefaultChainIdSupported()) {
            const data = await readContract({
                address: chainidtodata[chain.id]['usd_token'],
                abi: ERC20ABI,
                functionName: 'allowance',
                args: [account.address, chainidtodata[chain.id]['cryptopay_contract']]
            })
            console.log(parseInt(data['_hex'], 16) / 10 ** 18 + " usd approved")
            setUSDAllowance(parseInt(data['_hex'], 16) / 10 ** 18)
            return parseInt(data['_hex'], 16) / 10 ** 18
        }
        setUSDAllowance(0)
        return 0

    }

    useEffect(() => {
        getAllowance()
    }, [])

    const setBalanceOfUSD = async () => {
        if (isDefaultChainIdSupported()) {
            const usdBalance = await readContract({
                address: chainidtodata[chain.id]['usd_token'],
                abi: ERC20ABI,
                functionName: 'balanceOf',
                args: [account.address]
            })
            console.log(parseInt(usdBalance['_hex'], 16) / 10 ** 18)
            setUSDTokenBalance(Math.floor(parseInt(usdBalance['_hex'], 16) / 10 ** 16) / 10 ** 2)
        }
    }





    function isDefaultChainIdSupported() {
        let chainid = 0
        if (isConnected) {
            chainid = chain.id
        }

        if (chainid == 5 || chainid == 80001 || chainid == 420 || chainid == 59140 || chainid == 10200 || chainid == 1442) {
            return true
        } else {
            return false
        }
    }

    function isChainIdSupported(chainid) {
        if (chainid == 5 || chainid == 80001 || chainid == 420 || chainid == 59140 || chainid == 10200 || chainid == 1442) {
            return true
        } else {
            return false
        }
    }
    if (merchantAddress == undefined || paymentAmount == undefined || destinationChainId == undefined || isChainIdSupported(destinationChainId) == false) {
        invalidParams = true
    } else {
        invalidParams = false
    }

    function isAllowanceSufficient() {
        if (usdAllowance >= paymentAmount) {
            return true
        }
        else {
            return false
        }
    }

    setBalanceOfUSD()

    const [mintComplete, setMintComplete] = useState(true)
    const [txConfirmed, setTXConfirmed] = useState(true)

    const mintUSDTokens = async () => {
        console.log("Minting USD")
        const config = await prepareWriteContract({
            address: chainidtodata[chain.id]['usd_token'],
            abi: ERC20ABI,
            functionName: 'mint',
            args: [account.address, BigInt(1000 * 10 ** 18)]
        })
        try {
            setTXConfirmed(false)
            const { hash } = await writeContract(config)
            setTXConfirmed(true)
            setMintComplete(false)
            console.log(hash)
            const data = await waitForTransaction({
                hash,
            })
            dispatch({
                type: "success",
                message: "Transaction Complete!",
                title: "Tx Notification",
                position: "topR",
                icon: ""
            })
            setMintComplete(true)
            setBalanceOfUSD()
            getAllowance()
            console.log(data)
        } catch (e) {
            setTXConfirmed(true)
            setMintComplete(true)
            setBalanceOfUSD()
            getAllowance()
            console.log(e)
        }
    }

    const [usdApproved, setUSDApproved] = useState(true)

    const approveUSDTokens = async () => {
        const config = await prepareWriteContract({
            address: chainidtodata[chain.id]["usd_token"],
            abi: ERC20ABI,
            functionName: 'approve',
            args: [chainidtodata[chain.id]['cryptopay_contract'], BigInt(paymentAmount * 10 ** 18)]
        })
        try {
            setTXConfirmed(false)
            const { hash } = await writeContract(config)
            setTXConfirmed(true)
            setUSDApproved(false)
            console.log(hash)
            const data = await waitForTransaction({
                hash,
            })
            dispatch({
                type: "success",
                message: "Transaction Complete!",
                title: "Tx Notification",
                position: "topR",
                icon: ""
            })
            console.log("USD approved")
            getAllowance()
            setUSDApproved(true)
        } catch (e) {
            setTXConfirmed(true)
            getAllowance()
            setUSDApproved(true)
            console.log(e)
        }
    }

    const [paymentTXComplete, setPaymentTXComplete] = useState(true)
    const [paymentTransferredToMerchant, setPaymentTransferredToMerchant] = useState(false)

    async function getCrosschainTransferValue() {
        const usdBalance = await readContract({
            address: chainidtodata[chain.id]['cryptopay_contract'],
            abi: cryptopayabi,
            functionName: 'estimateFees',
            args: [chainidtodata[destinationChainId]["lz_chainid"], chainidtodata[destinationChainId]['cryptopay_contract'], BigInt(paymentAmount * 10 ** 18), merchantAddress]
        })
        console.log(parseInt(usdBalance['_hex'], 16) + " eth amount for crosschain message")
        return parseInt(usdBalance['_hex'], 16)
    }


    let paymenttxcomplete = false
    async function completePayment() {
        paymenttxcomplete = true
        if (destinationChainId == chain.id) {
            const config = await prepareWriteContract({
                address: chainidtodata[chain.id]["usd_token"],
                abi: ERC20ABI,
                functionName: 'transfer',
                args: [merchantAddress, BigInt(paymentAmount * 10 ** 18)]
            })
            try {
                setTXConfirmed(false)
                const { hash } = await writeContract(config)
                setTXConfirmed(true)
                console.log(hash)
                const data = await waitForTransaction({
                    hash,
                })
                dispatch({
                    type: "success",
                    message: "Transaction Complete!",
                    title: "Tx Notification",
                    position: "topR",
                    icon: ""
                })
                setPaymentTransferredToMerchant(true)
                const message = 'Success: Payment Complete';
                window.opener.postMessage(message, 'http://localhost:3000/');
            } catch (e) {
                setTXConfirmed(true)
                setPaymentTXComplete(true)
                console.log(e)
            }
        }
        else {
            const config = await prepareWriteContract({
                address: chainidtodata[chain.id]["cryptopay_contract"],
                abi: cryptopayabi,
                functionName: 'send',
                args: [BigInt(paymentAmount * 10 ** 18), merchantAddress, chainidtodata[destinationChainId]['cryptopay_contract'], chainidtodata[destinationChainId]["lz_chainid"]],
                overrides: {
                    'value': BigInt(Math.floor(await getCrosschainTransferValue() * 1.1))
                }
            })
            try {
                setTXConfirmed(false)
                const { hash } = await writeContract(config)
                setTXConfirmed(true)
                console.log(hash)
                const data = await waitForTransaction({
                    hash,
                })
                console.log("Payment complete")
                dispatch({
                    type: "success",
                    message: "Transaction Complete!",
                    title: "Tx Notification",
                    position: "topR",
                    icon: ""
                })
                setPaymentTransferredToMerchant(true)
                const message = 'Success: Payment Complete';
                window.opener.postMessage(message, 'http://localhost:3000/')
            } catch (e) {
                setTXConfirmed(true)
                setPaymentTXComplete(true)
                console.log(e)
                console.log("shitcoins")
            }

        }
    }






    return (
        <div className={styles.container}>
            <Head>
                <title>Complete Payment | Crypto Pay</title>
                <meta name="description" content="Generated by create next app" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className={styles.topheader}>
                <h className={styles.textheader}>Crypto Pay</h>
                <ConnectButton className={styles.connectbutton}></ConnectButton>
            </div>
            <div className={styles.bottomheader}>
                {paymentTransferredToMerchant ? <h>Payment complete, confirmation sent to merchant. You may safely close this page.</h> : invalidParams ? <><div className={styles.invalidparamstext}>Error: Payment issued with invalid parameters.</div><div className={styles.invalidparamstext}>This is an error on the merchant side. Please contact them to fix it.</div></> : <div className={styles.flexcolumn}><div className={styles.flexcolumn}><h className={styles.donotrefresh}>Do not refresh or reload</h><h className={styles.connectionwillbelost}>If you do, the connection to the merchant application will be lost</h><h className={styles.youwillhavetoreopen}>and you will need to reopen it</h></div>{isConnected ? isDefaultChainIdSupported() ? <><h className={styles.paymentamount}>Payment Amount: {Math.floor(paymentAmount * 100) / 100} USD</h><h className={styles.yourbalance}>Your balance: {usdTokenBalance} USD </h>{usdTokenBalance >= paymentAmount ? chain.id == destinationChainId ? <div>{paymentTXComplete ? txConfirmed == false ? <button disabled className={styles.completepaymentdisabled}>Confirm Transaction</button> : <button onClick={() => { completePayment() }} className={styles.completepayment}>Complete Payment</button> : <button disabled className={styles.completepaymentdisabled}>Proccessing...</button>}</div> : usdAllowance >= paymentAmount ? <div>{paymentTXComplete ? txConfirmed == false ? <button disabled className={styles.completepaymentdisabled}>Confirm Transaction</button> : <button onClick={async () => {
                    completePayment()
                }} className={styles.completepayment}>Complete Payment</button> : <button disabled onClick={completePayment()} className={styles.completepaymentdisabled}>Proccesing...</button>}</div> : <div>{txConfirmed == false ? <button disabled className={styles.approvebuttondisabled}>Confirm Transaction</button> : usdApproved ? <button className={styles.approvebutton} onClick={async () => {
                    approveUSDTokens()

                }}>Approve USD for Transfer</button> : <button disabled className={styles.approvebuttondisabled}>Proccessing...</button>}</div> : <><h className={styles.notenoughtokens}>Not enough USD tokens to complete payment</h><div>{txConfirmed == false ? <><button className={styles.claimusdbuttondisabled}>Confirm Transaction</button></> : mintComplete ? <><button className={styles.claimusdbutton} onClick={() => { mintUSDTokens() }}>Get test USD tokens</button><p className={styles.tokensareworthless}>These tokens do not have any monetary value</p></> : <button disabled className={styles.claimusdbuttondisabled}>Proccessing...</button>}</div></>}</> : <h className={styles.switchtoasupportednetwork}>Switch to a supported network to proceed</h> : <h className={styles.pleaseconnect}>Connect to a wallet to complete payment</h>}</div>}</div>

        </div >
    )
}
