import detectEthereumProvider from '@metamask/detect-provider';
import { useEffect, useState } from 'react';
import Web3 from 'web3';
import toast, { Toaster } from "react-hot-toast";
import './App.css';
import GameToken from './constants/abis/GameToken.json';
import NavBar from './components/NavBar';
import cardArray from './utils/cardArray';
import { errorOption, successOption } from './utils/toastOptions';
import { CustomError } from './utils/customError';
function App() {
  /**
   * this.state = {
      account: '0x0',
      token: null,
      totalSupply: 0,
      tokenURIs: [],
      cardArray: [],
      cardsChosen: [],
      cardsChosenId: [],
      cardsWon: []
    }
   */

  // Local states
  const [account, setAccount] = useState(null);
  const [token, setToken] = useState(null);
  const [totalSupply, setTotalSupply] = useState(0);
  const [tokenURIs, setTokenURIs] = useState([]);
  const [cards, setCards] = useState([]);
  const [cardsChosen, setCardsChosen] = useState([]);
  const [cardsChosenId, setCardsChosenId] = useState([]);
  const [cardsWon, setCardsWon] = useState([]);
  const [walletInstalled, setWalletInstalled] = useState(false);

  const getConnectedAccount = (account) => {
    setAccount(account);
  }

  const loadBlockchainData = async() => {
    console.log("loadBlockchainData called...");
    try {
      const web3 = window.web3;
      const accounts = await web3.eth.getAccounts();
  
      // Load smart contract
      const networkId = await web3.eth.net.getId();
      const networkData = GameToken.networks[networkId];
      if(networkData) {
        const abi = GameToken.abi
        const address = networkData.address
        const token = new web3.eth.Contract(abi, address)
        setToken(token);
        const totalSupply = await token.methods.totalSupply().call()
        setTotalSupply(totalSupply);
        
        // Load Tokens
        let balanceOf = await token.methods.balanceOf(accounts[0]).call()
        for (let i = 0; i < balanceOf; i++) {
          let id = await token.methods.tokenOfOwnerByIndex(accounts[0], i).call()
          let tokenURI = await token.methods.tokenURI(id).call()
          setTokenURIs(tokenURIs => [...tokenURIs, tokenURI]);
        }
      } else {
        // window.alert('Smart contract not deployed to detected network.');
        throw new CustomError("Wrong network");
      }
      
    } catch (error) {
      console.log(error);
      if(error.custom){
        //
        (() => toast.error(error.message))();
      }else{
        (() => toast.error("Blockchain data error"))();
      }

    }
  }

  const chooseImage = (cardId) => {
    cardId = cardId.toString();
    if(cardsWon.includes(cardId)) {
      return window.location.origin + '/images/white.png';
    }
    else if(cardsChosenId.includes(cardId)) {
      return cardArray[cardId].img;
    } else {
      return window.location.origin + '/images/blank.png';
    }
  }

  const checkForMatch = async () => {
    const optionOneId = cardsChosenId[0];
    const optionTwoId = cardsChosenId[1];
    console.log("optionOneId: ", optionOneId);
    console.log("optionTwoId: ", optionTwoId);
    console.log("cardsChosen: ", cardsChosen);
    console.log("cardsChosenId: ", cardsChosenId);

    // console.log("cardsChosen[0]: ", cardsChosen[0]);
    // console.log("cardsChosen[1]: ", cardsChosen[1]);

    if(optionOneId === optionTwoId){
      (() => toast.error("You have clicked the same image"))();
    } else if (cardsChosen[0] === cardsChosen[1]) {
      (() => toast.success("You found a match"))();
      token.methods.mint(
        account,
        window.location.origin + cardArray[optionOneId].img.toString()
      )
      .send({ from: account })
      .on('transactionHash', (hash) => {
        // this.setState({
        //   cardsWon: [...this.state.cardsWon, optionOneId, optionTwoId],
        //   tokenURIs: [...this.state.tokenURIs, CARD_ARRAY[optionOneId].img]
        // })
        setCardsWon([...cardsWon, optionOneId, optionTwoId]);
        setTokenURIs([...tokenURIs, cardArray[optionOneId].img]);
      })
    } else {
      (() => toast.error("Sorry, try again"))();
    }
    // this.setState({
    //   cardsChosen: [],
    //   cardsChosenId: []
    // })
    setCardsChosen([]);
    setCardsChosenId([]);

    if (cardsWon.length === cardArray.length) {
      (() => toast.success("Congratulations! You found them all"))();
    }
  }


  const flipCard = async (cardId) => {
    let alreadyChosen = cardsChosen.length
    
    const newChosenCards = [...cardsChosen, cards[cardId].name];
    console.log("chrisss: ", newChosenCards);
    const newChosenCardsId = [...cardsChosenId, cardId];
    setCardsChosen(newChosenCards);
    setCardsChosenId(newChosenCardsId);

    if (alreadyChosen === 1) {
      setTimeout(checkForMatch, 100);
    }

  }


  useEffect(() => {
    if(account !== null && account !== ""){
      (async() => {
        await loadBlockchainData();
      })();
    }
  }, [account]);

  
  useEffect(() => {
    (async() => {
      try {
        const provider = await detectEthereumProvider();
        if(provider === window.ethereum){
          window.web3 = new Web3(provider);
          window.web3.eth.extend({
            methods: [
              {
                name: "chainId",
                call: "eth_chainId",
                outputFormatter: window.web3.utils.hexToNumber
              }
            ]
          });
          window.initialized = true;
          window.isMetaMask = true;
        }else if(provider === window.web3){
          window.web3 = new Web3(window.web3.currentProvider);
          window.web3.eth.extend({
            methods: [
              {
                name: "chainId",
                call: "eth_chainId",
                outputFormatter: window.web3.utils.hexToNumber
              }
            ]
          });
          window.initialized = true;
          window.isMetaMask = false;
        }else{
          setWalletInstalled(false);
          window.initialized = false;
        }
  
        
      } catch (error) {
        console.log(error);
        (() => toast.error(error.message))();

      }
    
    })();

    setCards(cardArray.sort(() => 0.5 - Math.random()));
  }, []);

  const tOptions = {
    error: errorOption,
    success: successOption
  };

  return (
    <div className="App">
      <NavBar getConnectedAccount={getConnectedAccount} />
      <h2 style={{color: "white"}}>Blockchain NFT Game</h2>
      <div className="grid mb-4" >
      {
        cards.map((card, key) => {
          return(
            <img
              key={key}
              src={chooseImage(key)}
              alt="card"
              data-id={key}
              onClick={(event) => {
                let cardId = event.target.getAttribute('data-id')
                if(!cardsWon.includes(cardId.toString())) {
                  flipCard(cardId)
                }
              }}
            />
          )
          }
        )
      }
      </div>
      <Toaster toastOptions={tOptions} />
    </div>
  );
}

export default App;
