const hexToNumber = (value) => {
    if(window.web3.utils.isHex(value)){
        return window.web3.utils.hexToNumber(value);
    }else{
        return value;
    }
}

export default hexToNumber;