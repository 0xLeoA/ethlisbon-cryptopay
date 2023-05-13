import '@/styles/globals.css'
import { MoralisProvider } from "react-moralis";
import NoSSR from 'react-no-ssr';
import { NotificationProvider } from 'web3uikit';


import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider, darkTheme
} from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

const avalancheChain = {
  id: 43114,
  name: 'Avalanche',
  network: 'avalanche',
  iconUrl: 'https://cryptologos.cc/logos/avalanche-avax-logo.png',
  iconBackground: '#fff',
  nativeCurrency: {
    decimals: 18,
    name: 'Avalanche',
    symbol: 'AVAX',
  },
  rpcUrls: {
    default: {
      http: ['https://api.avax.network/ext/bc/C/rpc'],
    },
  },
  blockExplorers: {
    default: { name: 'SnowTrace', url: 'https://snowtrace.io' },
    etherscan: { name: 'SnowTrace', url: 'https://snowtrace.io' },
  },
  testnet: false,
};

const goerliChain = {
  id: 5,
  name: ' Goerli Testnet',
  network: 'Ethereum Goerli Testnet',
  iconUrl: 'https://w7.pngwing.com/pngs/268/1013/png-transparent-ethereum-eth-hd-logo-thumbnail.png',
  iconBackground: '#fff',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
    },
  },
  blockExplorers: {
    default: { name: 'Goerli Etherscan', url: 'https://goerli.etherscan.io' },
    etherscan: { name: 'Goerli Etherscan', url: 'https://goerli.etherscan.io' },
  },
  testnet: true,
};

const lineaChain = {
  id: 59140,
  name: ' Linea Testnet',
  network: 'Linea Goerli test network',
  iconUrl: 'https://pbs.twimg.com/profile_images/1639402103486521344/erDLnbwE_400x400.jpg',
  iconBackground: '#fff',
  nativeCurrency: {
    decimals: 18,
    name: 'LineaETH',
    symbol: 'LineaETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.goerli.linea.build/'],
    },
  },
  blockExplorers: {
    default: { name: 'Linea Explorer', url: 'https://explorer.goerli.linea.build/' },
    etherscan: { name: 'Linea Explorer', url: 'https://explorer.goerli.linea.build/' },
  },
  testnet: true,
};
const chiadoChain = {
  id: 10200,
  name: ' Chiado Testnet',
  network: 'Chiado Testnet',
  iconUrl: 'https://cryptologos.cc/logos/gnosis-gno-gno-logo.png',
  iconBackground: '#fff',
  nativeCurrency: {
    decimals: 18,
    name: 'XDai',
    symbol: 'XDAI',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.chiadochain.net'],
    },
  },
  blockExplorers: {
    default: { name: 'Chiado Explorer', url: 'https://blockscout.com/gnosis/chiado' },
    etherscan: { name: 'Chiado Explorer', url: 'https://blockscout.com/gnosis/chiado' },
  },
  testnet: true,
};

const mumbaiChain = {
  id: 80001,
  name: ' Mumbai Testnet',
  network: 'Polygon Mumbai Testnet',
  iconUrl: 'https://seeklogo.com/images/P/polygon-matic-logo-1DFDA3A3A8-seeklogo.com.png',
  iconBackground: '#fff',
  nativeCurrency: {
    decimals: 18,
    name: 'Matic',
    symbol: 'MATIC',
  },
  rpcUrls: {
    default: {
      http: ['https://matic-mumbai.chainstacklabs.com'],
    },
  },
  blockExplorers: {
    default: { name: 'Mumbai Explorer', url: 'https://mumbai.polygonscan.com' },
    etherscan: { name: 'Mumbai Explorer', url: 'https://mumbai.polygonscan.com' },
  },
  testnet: true,
};
const polygonZkEVM = {
  id: 1442,
  name: 'Polygon ZkEVM',
  network: 'Polygon zkEVM Testnet',
  iconUrl: 'https://seeklogo.com/images/P/polygon-matic-logo-1DFDA3A3A8-seeklogo.com.png',
  iconBackground: '#fff',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.public.zkevm-test.net'],
    },
  },
  blockExplorers: {
    default: { name: 'Polygon zkEVM Testnet Explorer', url: 'https://explorer.public.zkevm-test.net' },
    etherscan: { name: 'Polygon zkEVM Testnet Explorer', url: 'https://explorer.public.zkevm-test.net' },
  },
  testnet: true,
};
const optimismGoerliChain = {
  id: 420,
  name: 'Optimism Testnet',
  network: 'Optimism Goerli Testnet',
  iconUrl: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png',
  iconBackground: '#fff',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://goerli.optimism.io'],
    },
  },
  blockExplorers: {
    default: { name: 'Optimism Goerli Explorer', url: 'https://goerli-optimism.etherscan.io/' },
    etherscan: { name: 'Optimism Goerli Explorer', url: 'https://goerli-optimism.etherscan.io/' },
  },
  testnet: true,
};

const { chains, provider } = configureChains(
  [goerliChain, optimismGoerliChain, mumbaiChain, polygonZkEVM, lineaChain, chiadoChain,],
  [
    alchemyProvider({ apiKey: process.env.ALCHEMY_ID }),
    publicProvider()
  ]
);
const { connectors } = getDefaultWallets({
  appName: 'My App',
  projectId: 'YOUR_PROJECT_ID',
  chains
});
const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})
export default function App({ Component, pageProps }) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains} theme={darkTheme()}>
        <NoSSR><NotificationProvider><Component {...pageProps} /></NotificationProvider></NoSSR></RainbowKitProvider></WagmiConfig>
  );
}
