import { useState, useEffect } from 'react';
import { ethers } from "ethers";

//CHANGE THE FILE NAME HERE TO MATCH THAT OF YOUR CONTRACT
import abi from "./contracts/ExpressiveNFTS.json";
import nftMetaData from "./nft_metadata.json";

function App() {

  //INSERT YOUR CONTRACT ADDRESS HERE
  const contractAddress = '0x52C7ac160282459426731e75ADDd24c1a2c8c323';
  const contractABI = abi.abi;
 
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [yourWalletAddress, setYourWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState({ walletAddress: "", tokenId: "", burntokenId:"",
    nftPerAddress: "", nftCost: "", maxMintAmount:"" });
  const [nftSupply, setNftSupply] = useState(0);
  const [nftMintPrice, setNftMintPrice] = useState(0);
  const [nftMaxMintAmount, setNftMaxMintAmount] = useState("");  
  const [mintStatus, setMintStatus] = useState("");
  const [withdrawStatus, setWithdrawStatus] = useState("");
  const [burntokenStatus, setBurntokenStatus] = useState(""); 
  const [NtfperAdddressLimit, setNftPerAddressLimit] = useState("");  
  const [returnedtokens, setReturnedtokens] = useState(null);      
  const [returnedtokenuri, setReturnedtokenUri] = useState(null); 
  const [contractOwner, setContractOwner] = useState(false);     
  const [openSeaProfile, setOpenSeaProfile] = useState('');
  const [error, setError] = useState(null);


  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();        
        const account = accounts[0];
        const nftContract = new ethers.Contract(contractAddress, contractABI, signer);
        const owner = await nftContract.owner();
        setIsWalletConnected(true);
        setYourWalletAddress(account);
        console.log("Account Connected: ", account);
        if (account.toLowerCase() === owner.toLowerCase()) {
            setContractOwner(true)
        }        
        getContractInfo();

        setOpenSeaProfile(`https://testnets.opensea.io/${account}?tab=activity`);
      } else {
        setError("Install a MetaMask wallet to mint an Expressive NFT Collection.");
        console.log("No Metamask detected");
      }
    } catch (error) {
      console.log(error);
    }
  }


  const getContractInfo = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const nftContract = new ethers.Contract(contractAddress, contractABI, signer);   
      const nftSupply = await nftContract.MAX_SUPPLY();
      const mintPrice = await nftContract.MINT_PRICE();
      const maxmint = await nftContract.maxMintAmount();
      const nftaddlimit = await nftContract.nftPerAddressLimit();
      const owner = await nftContract.owner();
      console.log('Total NFTS', parseInt(nftSupply));
      console.log('Mint price', parseInt(mintPrice));
      setNftSupply(parseInt(nftSupply));
      setNftMaxMintAmount(parseInt(maxmint));
      setNftPerAddressLimit(parseInt(nftaddlimit));
      setNftMintPrice(ethers.utils.formatEther((mintPrice)));
      
    } catch (error) {
      console.log(error);
    }
  }

  const mintToken = async (tokenId, uri) => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(contractAddress, contractABI, signer);

        //INSERT THE CID FROM PINATA FROM YOUR JSON FOLDER HERE
        const metadataURI = `${uri}/${tokenId}.json`
        console.log(metadataURI);
        const txn = await nftContract.safeMint(yourWalletAddress, metadataURI, {
          value: ethers.utils.parseEther('0.001'),
        });
        console.log("NFT Minting...");
        setMintStatus("⌛Minting...");
        await txn.wait();
        console.log("NFT Minted", txn.hash);
        setMintStatus("✅ Minted");
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Install a MetaMask wallet to mint an Expressive NFT.");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const withdrawPayment = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await nftContract.withdrawPayments();
        console.log("Withdrawing Payments...");
        setWithdrawStatus("Withdrawing.....");
        await txn.wait();
        console.log("Payments Withdrewn", txn.hash);
        setWithdrawStatus("✅ Withdrewn");
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Install a MetaMask wallet to mint an Expressive NFT.");
      }
    } catch (error) {
      console.log(error);
      setWithdrawStatus(error.message.toString());
    }
  }

  const BurnTokens = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await nftContract._burn(inputValue.burntokenId);
        console.log("Burnning Token...");
        setBurntokenStatus("Burnning.....");
        await txn.wait();
        console.log("BurnTokens ", txn.hash);
        setBurntokenStatus("✅ BurnTokens");
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Install a MetaMask wallet to mint an Expressive NFT.");
      }
    } catch (error) {
      console.log(error);
      setBurntokenStatus(error.message.toString());
    }
  }


  const OwnerTokens = async (event) => {
    try {
      event.preventDefault();      
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const account = accounts[0];
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(contractAddress, contractABI, signer);
        const tokens = await nftContract.walletOfOwner(account);
        console.log("Returning Tokens...");
        setReturnedtokens("Returning.....");
        console.log(tokens);
        let result = Object.entries(tokens);
            result.map((item, index)=>{
                    console.log('key is:- ', item[0], ' and value is:- ', item[1]);
                    setReturnedtokens('key is:- ', item[0], ' and value is:- ', item[1]);
              });
        
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Install a MetaMask wallet to mint an Expressive NFT.");
      }
    } catch (error) {
      console.log(error);
      setReturnedtokens(error.message.toString());
    }
  }

  const TokenUri = async (event) => {
    try {
      event.preventDefault();      
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(contractAddress, contractABI, signer);
        const tokenuri = await nftContract.tokenURI(inputValue.tokenId);
        console.log("Returning Tokens Uri...");
        setReturnedtokenUri("Returning.....");
        console.log("Returned Tokens Uri", tokenuri);
        setReturnedtokenUri(tokenuri);
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Install a MetaMask wallet to mint an Expressive NFT.");
      }
    } catch (error) {
      console.log(error);
      setReturnedtokenUri(error.message.toString());
    }
  }


  const NtfperAdddressValue = async (event) => {
    try {
      event.preventDefault();      
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await nftContract.setNftPerAddressLimit(inputValue.nftPerAddress);
        console.log("Setting Nft Per Address Limit...");
        setNftPerAddressLimit("Setting...");
        await txn.wait();
        console.log("Nft Per Address Limit Set", txn.hash);
        setNftPerAddressLimit("✅ Done");
        getContractInfo();
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Install a MetaMask wallet to mint an Expressive NFT.");
      }
    } catch (error) {
      console.log(error);
      setNftPerAddressLimit(error.message.toString());
    }
  }


  const MintCost = async (event) => {
    try {
      event.preventDefault();      
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await nftContract.setCost(inputValue.nftCost);
        console.log("Setting Nft Mint Price...");
        setNftMintPrice("Setting...");
        await txn.wait();
        console.log("Nft Mint Price Set", txn.hash);
        setNftMintPrice("✅ Done");
        getContractInfo();
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Install a MetaMask wallet to mint an Expressive NFT.");
      }
    } catch (error) {
      console.log(error);
      setNftMintPrice(error.message.toString());
    }
  }


  const maxMintValue = async (event) => {
    try {
      event.preventDefault();      
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(contractAddress, contractABI, signer);

        const txn = await nftContract.setmaxMintAmount(inputValue.maxMintAmount);
        console.log("Setting Nft Max Mint Amount...");
        setNftMaxMintAmount("Setting...");
        await txn.wait();
        console.log("Nft Max Mint Amount", txn.hash);
        setNftMaxMintAmount("✅ Done");
        getContractInfo();
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Install a MetaMask wallet to mint an Expressive NFT.");
      }
    } catch (error) {
      console.log(error);
      setNftMaxMintAmount(error.message.toString());
    }
  }

  const handleInputChange = (event) => {
    setInputValue(prevFormData => ({ ...prevFormData, [event.target.name]: event.target.value }));
  }


  useEffect(() => {
    checkIfWalletIsConnected();
    getContractInfo();
  }, [])

  return (
    <main className="container mx-auto p-4">
      <span className="prose">
        <h1 className="text-white sm:text-5xl text-3xl text-center sm:mt-5 sm:mb-10 mb-5">
          Expressive NFT Minter 🎟
        </h1>
      </span>
      <div className="mt-5">
        {isWalletConnected ? (
          <>
    
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {
                nftMetaData.map((nftMetaData) => {
                  return (
                    <div className="card bg-base-100 shadow-xl col-span-1" key={nftMetaData.edition}>
                      {console.log(nftMetaData)}
                      <figure><img src={nftMetaData.image} alt={nftMetaData.name} /></figure>
                      <div className="card-body">
                        <h2 className="card-title text-white">{nftMetaData.name}</h2>
                        <p className="mb-3 text-white">{nftMetaData.description}</p>
                        <p className="mb-3 text-amber-400"><span className="text-white font-semibold">Mint Price:</span> {nftMintPrice} ETH</p>
                        <div className="card-actions justify-center">
                          <button className="btn btn-primary btn-wide"
                            onClick={() => mintToken(nftMetaData.edition, nftMetaData.image)}>Mint</button>
                        </div>
                      </div>
                    </div>
                  );
                })
              }
            </div>
            <p className="mt-5 text-center text-white font-bold">{mintStatus}</p>
            <p className="mt-5 text-center text-amber-400	"><span className="font-bold text-white">Your Wallet Address: </span>{yourWalletAddress}</p>
            <div className="mt-5">
              <p className="text-amber-400 text-center"><span className="font-bold text-white mt-5">Your NFT will be available at: </span>
                <span className=" text-grey-800"> <a href={openSeaProfile} target="_blank" rel="noopener noreferrer">{openSeaProfile}</a> </span>
              </p>
            </div>
          </>
        ) : (
          <div className="prose mx-auto">
            <h2 className="text-center text-white">Connect Your Wallet to Start Minting</h2>
            <button className="btn btn-primary w-full" onClick={checkIfWalletIsConnected}>
              {"Connect Wallet 🔑"}
            </button>
          </div>
        )}
      </div>
      <section className="customer-section pb-10 text-center">
        {error && <p className="text-2xl text-red-700 mt-5">{error}</p>}
        <div className="mt-5">
          <p className="text-amber-400"><span className="font-bold text-white">Contract Address: </span>{contractAddress}</p>
        </div>
        <div className="mt-5">
          <p className="text-amber-400	"><span className="font-bold text-white">NFT Mint Price: </span>{nftMintPrice} ETH</p>
        </div>
        <div className="mt-5">
          <p className="text-amber-400  "><span className="font-bold text-white">NFT Per Address: </span>{NtfperAdddressLimit} ETH</p>
        </div>
              <div className="mt-5">
          <p className="text-amber-400  "><span className="font-bold text-white">NFT Max Mint Amount: </span>{nftMaxMintAmount} ETH</p>
        </div> 
        <div className="mt-5">
          <p className="text-amber-400"><span className="font-bold text-white">NFT Supply: </span>{nftSupply}</p>
        </div>
      </section>
        {contractOwner && (
          <section className="bank-owner-section">

          <h2 className="text-xl border-b-2 border-indigo-500 px-10 py-4 font-bold">Expressive Nft Admin Panel</h2>
            <div className="mt-10 mb-10">
              <form className="form-style">
                <button
                  className="btn-purple"
                  onClick={withdrawPayment}>
                  Withdraw Payments
                </button>
              <span className="mr-5"><strong></strong> {withdrawStatus} </span>  
              </form>
            </div>
            <div className="mt-10 mb-10">
              <form className="form-style">
                <input
                  type="text"
                  className="input-style"
                  onChange={handleInputChange}
                  name="burntokenId"
                  placeholder= "token Id"
                  value={inputValue.burntokenId}
                />
                <button
                  className="btn-purple"
                  onClick={BurnTokens}>
                  Burn Tokens
                </button>

              <span className="mr-5"><strong></strong> {burntokenStatus} </span>
              </form>
            </div>
            <div className="mt-10 mb-10">
              <form className="form-style">
                <button
                  className="btn-purple"
                  onClick={OwnerTokens}>
                  View Tokens
                </button>
                      <span className="mr-5"><strong></strong> 
                        {returnedtokens}
                      </span>
                      {console.log(returnedtokens)}
              </form>
            </div>
            <div className="mt-10 mb-10">
              <form className="form-style">
                <input
                  type="text"
                  className="input-style"
                  onChange={handleInputChange}
                  name="tokenId"
                  placeholder= "token Id"
                  value={inputValue.tokenId}
                />
                <button
                  className="btn-purple"
                  onClick={TokenUri}>
                 Get Token Uri
                </button>
              <span className="mr-5"><strong></strong> {returnedtokenuri} </span>
              </form>
            </div>
            <div className="mt-10 mb-10">
              <form className="form-style">
                <input
                  type="text"
                  className="input-style"
                  onChange={handleInputChange}
                  name="nftPerAddress"
                  placeholder= "nft Per Address"
                  value={inputValue.nftPerAddress}
                />
                <button
                  className="btn-purple"
                  onClick={NtfperAdddressValue}>
                 Nft Per Address
                </button>
              <span className="mr-5"><strong></strong> {NtfperAdddressLimit} </span>
              </form>
            </div>

            <div className="mt-10 mb-10">
              <form className="form-style">
                <input
                  type="text"
                  className="input-style"
                  onChange={handleInputChange}
                  name="nftCost"
                  placeholder= "nft Cost"
                  value={inputValue.nftCost}
                />
                <button
                  className="btn-purple"
                  onClick={MintCost}>
                 Nft Mint Price
                </button>
              <span className="mr-5"><strong></strong> {nftMintPrice} </span>
              </form>
            </div> 
            <div className="mt-10 mb-10">
              <form className="form-style">
                <input
                  type="text"
                  className="input-style"
                  onChange={handleInputChange}
                  name="maxMintAmount"
                  placeholder= "max Mint Amount"
                  value={inputValue.maxMintAmount}
                />
                <button
                  className="btn-purple"
                  onClick={maxMintValue}>
                 NFT Max Mint Amount
                </button>
              <span className="mr-5"><strong></strong> {nftMaxMintAmount} </span>
              </form>
            </div> 
                                    
          </section>
        )} 
    </main>
  );
}
export default App;
