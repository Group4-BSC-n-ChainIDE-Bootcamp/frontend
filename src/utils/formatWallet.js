const formatWallet = (acct) => {
    const dots = "...";
    const firstSix = acct.substring(0, 6);
    const lastFour = acct.substring(38, 42);
    const displayAcct = " " + firstSix + dots + lastFour;
    return displayAcct;
};

export default formatWallet;
