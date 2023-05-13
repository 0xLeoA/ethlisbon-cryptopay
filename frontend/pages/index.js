import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { useEffect, useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useConnect, useDisconnect, useNetwork } from 'wagmi'
import { ERC20ABI, chainidtodata, cryptopayabi } from "../constants";
import { readContract, watchContractEvent, getAccount, prepareWriteContract, writeContract, waitForTransaction } from '@wagmi/core'



const inter = Inter({ subsets: ['latin'] })

export default function Home() {

  const { address, isConnecting, isDisconnected, isConnected } = useAccount()
  const { chain, chains } = useNetwork()
  const account = getAccount()
  const [details1, setDetails1] = useState()
  const [details2, setDetails2] = useState()

  const [paymentProccesing, setPaymentProccessing] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState(false)

  const updateDetails = async () => {

    try {
      setDetails1(document.getElementById("amountinput").value + " USD tokens will be transferred to ")
      setDetails2("the address " + document.getElementById("addressinput").value + " on " + chainidtodata[document.getElementById("networks").value].name)
    }
    catch (e) {
      console.log(e)
    }
  }

  const completePayment = async () => {
    setPaymentProccessing(true)
    let url = `http://localhost:3000/completepayment?address=${document.getElementById("addressinput").value}&amount=${document.getElementById("amountinput").value}&destinationChainid=${document.getElementById("networks").value}`
    const newWindow = window.open(url)
    setPaymentProccessing(true)
    window.addEventListener('message', (event) => {
      if (event.origin == "http://localhost:3000") {
        console.log(event.data)
        if (event.data == 'Success: Payment Complete') {
          setPaymentComplete(true)
          setPaymentProccessing(false)
        }
      }
    });

  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Complete Payment | Crypto Pay</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.headermaindomain}>
        <div className={styles.flexcolumn}><h className={styles.textheadermaindomain}>Crypto Pay</h>
          <h className={styles.testnetversion}>Testnet Version</h></div>
        <p></p>
      </div>
      <div className={styles.pargraphdivmain}>
        <p className={styles.pargraphtextmain}>Crypto Pay is a cross-chain payment solution allowing web merchants to integrate crypto payments into their application</p>
        <p className={styles.itonlytakes}>It only takes 9 lines of code to integerate crypto pay into your application</p>
        <div className={styles.threeheaderdiv}>
          <div><p className={styles.tryout}>Try out Crypto Pay by prompting it yourself:</p>
            <label className={styles.chooseanetworktocomplete}>Choose a network to complete payment on:
            </label>
            <div><select className={styles.selectnetwork} name="networks" id="networks" onChange={() => {
              updateDetails()
            }}>
              <option value="5">Goerli</option>
              <option value="420">Optimism</option>
              <option value="80001">Mumbai</option>
              <option value="1442">Polygon ZkEVM</option>
              <option value="10200">Chiado</option>
              <option value="59140">Linea</option>
            </select>
            </div>
            <div className={styles.flexcolumn}>
              <label className={styles.chooseanetworktocomplete}>Enter an ethereum address</label>
              <input className={styles.inputaddress} type="text" id="addressinput" name="addressinput" onChange={() => {
                updateDetails()
              }}></input>
              <label className={styles.enteramount}>Enter a USD payment amount</label>
              <input className={styles.inputamount} type="text" id="amountinput" name="amountinput" onChange={() => {
                updateDetails()
              }}></input>
              <div className={styles.details}><h>{details1}</h><p>{details2}</p></div>
              <div>{paymentComplete ? <h className={styles.paymentstatedesc}>Payment Complete</h> : paymentProccesing ? <h className={styles.paymentstatedesc}>Payment Proccessing</h> : <button className={styles.completepaymentbuttonmaindomain} onClick={() => { completePayment() }}>Complete Payment</button>}</div>
            </div>
          </div>
          <div className={styles.flexcolumn}><p className={styles.howtointegrate}>How to integrate:</p>
            <h className={styles.codepasted}>** CODE PASTED DOWN BELOW ** </h>
            <h className={styles.inordertouse}>In order to use Crypto Pay you must open the website with 3 parameters passed in</h>
            <h className={styles.ethwalletaddress}>The parameters are your ethereum wallet address,</h>
            <h className={styles.usdtokenamountwith2}>usd token payment amount with up to 2 decimals,</h>
            <h className={styles.anddestchainid}>and destination chain id on which you wish to receive the tokens</h>
            <div className={styles.integrationcodediv}>

              <h className={styles.integrationcode}>// cryptopay url</h>
              <h className={styles.integrationcode}>cryptopayurl = "http://localhost:3000"</h>
              <h className={styles.integrationcode}>// define url with parameters</h>
              <h className={styles.integrationcode}>{"let url = `http://localhost:3000/completepayment?address=${your_address}&amount=${payment_amount}&destinationChainid=${destination_chainid}`"}</h>
              <h className={styles.integrationcode}>// prompt user to complete payment </h>
              <h className={styles.integrationcode}>const newWindow = window.open(url)</h>
              <h className={styles.integrationcode}>// start listening for confirmation from Crypto Pay</h>
              <h className={styles.integrationcode}>{"window.addEventListener('message', (event) => {"}</h>
              <h className={styles.integrationcode}>{"    if (event.origin == cryptopayurl) {"}</h>
              <h className={styles.integrationcode}>{"        console.log(event.data)"}</h>
              <h className={styles.integrationcode}>{"        if (event.data == 'Success: Payment Complete') {"}</h>
              <h className={styles.integrationcode}>{"            // add your payment completion logic"}</h>
              <h className={styles.integrationcode}>{"        }"}</h>
              <h className={styles.integrationcode}>{"    }"}</h>
              <h className={styles.integrationcode}>{"});"}</h>
            </div>
          </div>

          <div className={styles.deploymentaddressesdiv}>
            <h className={styles.deploymentaddressesheader}>USD Test Token Deployments:
            </h>
            <h className={styles.testtokendeployments}>Goerli: 0x5c9cA4c4151a6a09F0656947A4c1dA2DaC016710</h>
            <h className={styles.testtokendeployments}>Optimism: 0x008435d34057f98ccC101b44810FdA290BEE10Af</h>
            <h className={styles.testtokendeployments}>Mumbai: 0x008435d34057f98ccC101b44810FdA290BEE10Af </h>
            <h className={styles.testtokendeployments}>Polygon zkEVM: 0x227b3563D193104274f84179CbdFCC845Cb6cdD6</h>
            <h className={styles.testtokendeployments}>Linea: 0x2b211222f5B3666D4AA73c3f2686f5249F6Ea543</h>
            <h className={styles.testtokendeployments}>Chiado Testnet: 0xef120293683c7083d94b5C54C6DB0a0213AAA7C0</h>
          </div>
        </div>
      </div>
    </div >
  )

}