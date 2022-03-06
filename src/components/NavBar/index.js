import { useState } from 'react';
import toast from "react-hot-toast";
import { chainID, chainIDHex } from '../../constants/supportedChainID';
import { CustomError } from '../../utils/customError';
import formatWallet from '../../utils/formatWallet';
import hexToNumber from '../../utils/hexToNum';
import './NavBar.css';


export default function NavBar({ getConnectedAccount }){
  const [account, setAccount] = useState(null);

    const handleConnect = async() => {
        try {
            
            if(window.initialized){
                if(window.isMetaMask){
                    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                    if(chainID !== hexToNumber(chainId)){
                        throw new CustomError("Please change to BSC testnet");
                    }
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    setAccount(accounts[0]);
                    getConnectedAccount(accounts[0]);
                    (() => toast.success("Wallet connected"))();
                }else{
                    const web3 = window.web3;
                    const accounts = await web3.eth.getAccounts();
                    setAccount(accounts[0]);
                    getConnectedAccount(accounts[0]);
                    (() => toast.success("Wallet connected"))();
                }
            }else{
                // No wallet
                throw new CustomError("No Wallet Found")
            }
        } catch (error) {
            (() => toast.error(error.message))();
            
        }
    }
    return (
        <div className='navbar-style'>
            <button className='btn btn-primary' onClick={handleConnect}> {account !== null ? formatWallet(account) : "Connect Wallet"}  </button>
        </div>
    );
}
