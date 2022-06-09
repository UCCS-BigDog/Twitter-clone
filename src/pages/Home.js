import React from "react";
import "./Home.css";
import { defaultImgs } from "../defaultimgs";
import { TextArea, Icon } from "web3uikit";
import TweetInFeed from "../components/TweetInFeed";
import { useState, useRef } from "react";
import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";

const Home = () => {

  const { Moralis} = useMoralis();
  const user = Moralis.User.current();
  const contractProcessor = useWeb3ExecuteFunction();


  const inputFile = useRef(null);
  const [selectedFile, setSelectedFile] = useState();
  const [theFile, setTheFile] = useState();
  const [tweet, setTweet] = useState();

  async function maticTweet() {
 
    if (!tweet) return;
  
    let img;
    if (theFile) {
      const data = theFile;
      const file = new Moralis.File(data.name, data);
      await file.saveIPFS();
      img = file.ipfs();
    }else{
      img = "No Img"
    }
  
    let options = {
      contractAddress: "0x45810a7e91Fc1be88da5B8748F7736dF5d0c57db",
      functionName: "addTweet",
      abi: [{
          "inputs": [
            {
              "internalType": "string",
              "name": "tweetTxt",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "tweetImg",
              "type": "string"
            }
          ],
          "name": "addTweet",
          "outputs": [],
          "stateMutability": "payable",
          "type": "function"
        },
        {
          "inputs": [],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "address",
              "name": "tweeter",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "string",
              "name": "tweetTxt",
              "type": "string"
            },
            {
              "indexed": false,
              "internalType": "string",
              "name": "tweetImg",
              "type": "string"
            }
          ],
          "name": "tweetCreated",
          "type": "event"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "id",
              "type": "uint256"
            }
          ],
          "name": "getTweet",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "owner",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        }],

      params: {
        tweetTxt: tweet,
        tweetImg: img,
      },
      msgValue: Moralis.Units.ETH(1),
    
    }
  
    await contractProcessor.fetch({
      params: options,
      onSuccess: () => {
        saveTweet();
      },
      onError: (error) => {
        console.log(error.data.message)
      }
    });
  
  }

  async function saveTweet() {
 
    if(!tweet) return;
  
    const Tweets = Moralis.Object.extend("Tweets");
  
    const newTweet = new Tweets();
  
    newTweet.set("tweetTxt", tweet);
    newTweet.set("tweeterPfp", user.attributes.pfp);
    newTweet.set("tweeterAcc", user.attributes.ethAddress);
    newTweet.set("tweeterUserName", user.attributes.username);
  
    if (theFile) {
      const data = theFile;
      const file = new Moralis.File(data.name, data);
      await file.saveIPFS();
      newTweet.set("tweetImg", file.ipfs());
    }
  
    await newTweet.save();
    window.location.reload();
  
  }


  
  

  const onImageClick = () => {
    inputFile.current.click();
 };
  
 const changeHandler = (event) => {
    const img = event.target.files[0];
    setTheFile(img);
    setSelectedFile(URL.createObjectURL(img));
 };
  return (
    <>
      <div className="pageIdentify">Home</div>
      <div className="pageIdentify">Home</div>
	<div className="mainContent">
       <div className="profileTweet">
       <img src={user.attributes.pfp ? user.attributes.pfp : defaultImgs[0]} className="profilePic"></img>
         <div className="tweetBox">
           <TextArea
             label=""
             name="tweetTxtArea"
             value="GM World"
             type="text"
             onChange={(e) => setTweet(e.target.value)}
             width="95%"
           ></TextArea>
           {selectedFile && (
             <img src={selectedFile} className="tweetImg"></img>
           )}
           <div className="imgOrTweet">
             <div className="imgDiv" onClick={onImageClick}>
             <input
                 type="file"
                 name="file"
                 ref={inputFile}
                 onChange={changeHandler}
                 style={{ display: "none"}}
               />
               <Icon fill="#1DA1F2" size={20} svg="image"></Icon>
             </div>
             <div className="tweetOptions">
               <div className="tweet" onClick={saveTweet}>Tweet</div>
               <div className="tweet" onClick={maticTweet} style={{ backgroundColor: "#8247e5" }}>
                 <Icon fill="#ffffff" size={20} svg="matic" />
               </div>
             </div>
           </div>
         </div>
       </div>
       <TweetInFeed profile={false}/>
     </div>
    </>
  );
};

export default Home;
