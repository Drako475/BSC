const serverUrl = "https://habpbxfwknnl.usemoralis.com:2053/server";
const appId = "8oMPCz2CeS8MsNBnRePJC2R5Xw4S39WjmzH90YOi";
Moralis.start({ serverUrl, appId });
const chainToQuery = 'rinkeby'
checkWeb3();
const nft_contract_address = "0x0Fb6EF3505b9c52Ed39595433a21aF9B5FCc4431"

function displayMessage(messageType, message){
    message = {
        "00":`<div class = "alert alert-success"> ${message}</div>`,
        "01":`<div class = "alert alert-success"> ${message}</div>`,
        "02":`<div class = "alert alert-success"> ${message}</div>`
    }
    document.getElementById("resultSpace").innerHTML = message[messageType];
}
async function checkWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Se detectó que no está conectado a la red de Ethereum. ¡Debería considerar probar MetaMask! :)')
    }
  }

async function login(){
    Moralis.Web3.authenticate().then(function (user){
        user.set("name", document.getElementById('username').value);
        user.set("email", document.getElementById('email').value);
        user.save();
        document.getElementById("upload").removeAttribute("disabled");
      document.getElementById("file").removeAttribute("disabled");
      document.getElementById("name").removeAttribute("disabled");
      document.getElementById("description").removeAttribute("disabled");
        desactivateControls();
        populate();
    })
}

function desactivateControls(){
    document.getElementById('login').setAttribute("disabled", null);
    document.getElementById('username').setAttribute("disabled", null);
    document.getElementById('email').setAttribute("disabled", null);
}

async function populate(){
    const balances = await Moralis.Web3API.account.getTokenBalances({chain: chainToQuery}).then(buildTableBalances);
    const nft = await Moralis.Web3API.account.getNFTs({chain: chainToQuery}).then(buildTableNFT);
    const transtactions = await Moralis.Web3API.account.getTransactions({chain: chainToQuery}).then(buildTableTransactions);

}

function buildTableBalances(data){
    document.getElementById("resultBalances").innerHTML = `<table class="table table-dark table-striped" id="balancesTable">
                                                            </table>`;
    const table = document.getElementById("balancesTable");
    const rowHeader = `<thead>
                            <tr>
                                <th>Token</th>
                                <th>Symbol</th>
                                <th>Balance</th>
                            </tr>
                        </thead>`
    table.innerHTML += rowHeader;
    for (let i=0; i < data.length; i++){
        let row = `<tr>
                        <td>${data[i].name}</td>
                        <td>${data[i].symbol}</td>
                        <td>${data[i].balance/10**18}</td>
                    </tr>`
        table.innerHTML += row
    }
}

function buildTableNFT(_data){
    let data = _data.result;
    document.getElementById("resultNFT").innerHTML = `<table class="table table-dark table-striped" id="nftTable">
                                                            </table>`;
    const table = document.getElementById("nftTable");
    const rowHeader = `<thead>
                            <tr>
                                <th>ID</th>
                                <th>Type</th>
                                <th>Contract</th>
                            </tr>
                        </thead>`
    table.innerHTML += rowHeader;
    for (let i=0; i < data.length; i++){
        let row = `<tr>
                        <td>${data[i].token_id}</td>
                        <td>${data[i].contract_type}</td>
                        <td>${data[i].token_address}</td>
                    </tr>`
        table.innerHTML += row
    }
}

function buildTableTransactions(_data){
    console.log(_data)
    const current = ethereum.selectedAddress;
    let data = _data.result;
    document.getElementById("resultTransactions").innerHTML = `<table class="table table-dark table-striped" id="transactionsTable">
                                                            </table>`;
    const table = document.getElementById("transactionsTable");
    const rowHeader = `<thead>
                            <tr>
                                <th>Type</th>
                                <th>From/To</th>
                                <th>Value</th>
                            </tr>
                        </thead>`
    table.innerHTML += rowHeader;
    for (let i=0; i < data.length; i++){
        let type = "";
        if (data[i].from_address == current){
            type = "Outgoing";
            fromTo = data[i].to_address;
        }
        else {
            type = "Incoming";
            fromTo = data[i].from_address;
        }
        let row = `<tr>
                        <td>${type}</td>
                        <td>${fromTo}</td>
                        <td>${data[i].value/10**18}</td>
                    </tr>`
        table.innerHTML += row
    }
}

async function upload(){
    const fileInput = document.getElementById("file");
    const data = fileInput.files[0];
    const imageFile = new Moralis.File(data.name, data);
    document.getElementById('upload').setAttribute("disabled", null);
    document.getElementById('file').setAttribute("disabled", null);
    document.getElementById('name').setAttribute("disabled", null);
    document.getElementById('description').setAttribute("disabled", null);
    await imageFile.saveIPFS();
    const imageURI = imageFile.ipfs();
    const metadata = {
      "name":document.getElementById("name").value,
      "description":document.getElementById("description").value,
      "image":imageURI
    }
    const metadataFile = new Moralis.File("metadata.json", {base64 : btoa(JSON.stringify(metadata))});
    await metadataFile.saveIPFS();
    const metadataURI = metadataFile.ipfs();
    const txt = await mintToken(metadataURI).then(notify)
  }
  
  async function mintToken(_uri){
    const encodedFunction = web3.eth.abi.encodeFunctionCall({
      name: "mintToken",
      type: "function",
      inputs: [{
        type: 'string',
        name: 'tokenURI'
        }]
    }, [_uri]);
  
    const transactionParameters = {
      to: nft_contract_address,
      from: ethereum.selectedAddress,
      data: encodedFunction
    };
    const txt = await ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters]
    });
    return txt
  }
  
  async function notify(_txt){
    document.getElementById("resultSpace").innerHTML =  
    `<input disabled = "true" id="result" type="text" class="form-control" placeholder="Description" aria-label="URL" aria-describedby="basic-addon1" value="Tu NFT ya cargó en la transacción ${_txt}">`;
  } 