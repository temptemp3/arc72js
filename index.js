import CONTRACT from "arccjs";
//import dotenv from "dotenv";

import ARC72Spec from "./abi/arc/72/arc72.json" assert { type: "json" }; // spec

//dotenv.config();

/*
 * prepareString
 * - prepare string (strip trailing null bytes)
 * @param str: string to prepare
 * @returns: prepared string
 */
const prepareString = (str) => {
  const index = str.indexOf("\x00");
  if (index > 0) {
    return str.slice(0, str.indexOf("\x00"));
  } else {
    return str;
  }
};

/*
 * handleResponse
 * - handle response
 * @param name: name of method
 * @param res: response
 * @returns: response
 */
const handleResponse = (name, res) => {
  /*
  if (process.env.DEBUG === "1") {
    console.log(`${name}: ${res.returnValue}`);
  }
  */
  return res;
};

export const arc72_approve = async (contractInstance, addr, amt) =>
  handleResponse("Approve", await contractInstance.arc72_approve(addr, amt));

export const arc72_balanceOf = async (contractInstance, addr) =>
  handleResponse(`BalanceOf ${addr}`, await contractInstance.arc72_balanceOf(addr));

export const arc72_getApproved = async (contractInstance, amt) =>
  handleResponse("Get Approvedy", await contractInstance.arc72_getApproved(amt));

export const arc72_isApprovedForAll = async (contractInstance, addrFrom, addrSpender) =>
  handleResponse("Is Approved for All", await contractInstance.arc72_isApprovedForAll(addrFrom, addrSpender));

export const arc72_ownerOf = async (contractInstance, id) =>
  handleResponse(`Owner of ${id}`, await contractInstance.arc72_ownerOf(id));

export const arc72_setApprovalForAll = async (contractInstance, addr, approved) =>
  handleResponse("Set Approval for All", await contractInstance.arc72_setApprovalForAll(addr, approved));

export const arc72_tokenByIndex = async (contractInstance, id) =>
  handleResponse(`Token by index ${addr}`, await contractInstance.arc72_tokenByIndex(id));

export const arc72_tokenURI = async (contractInstance, id) =>
  handleResponse("Token URI", await contractInstance.arc72_tokenURI(id));

export const arc72_totalSupply = async (contractInstance) =>
  handleResponse("Total Supply", await contractInstance.arc72_totalSupply());

export const arc72_transferFrom = async (contractInstance, addrFrom, addrSpender, amt) =>
  handleResponse(`Transfer`, await contractInstance.arc72_transferFrom(addrFrom, addrSpender, amt));

export const burn = async (contractInstance, id) =>
  handleResponse("Burn", await contractInstance.burn(id));

export const close = async (contractInstance) =>
  handleResponse("Close", await contractInstance.close());

export const deleteNftDataBox = async (contractInstance, num) =>
  handleResponse("Delete NFT Data Box", await contractInstance.deleteNftDataBox(num));

export const deleteOperatorDataBox = async (contractInstance, addrFrom,addrSpender) =>
  handleResponse("Delete Operator Data Box", await contractInstance.deleteOperatorDataBox(addrFrom,addrSpender));

export const grant = async (contractInstance, addr) =>
  handleResponse("Grant", await contractInstance.grant(addr));

export const manager = async (contractInstance) =>
  handleResponse("Manager", await contractInstance.manager());

export const mintTo = async (contractInstance, addr, num1, num2, num3, num4) =>
  handleResponse("Mint To", await contractInstance.mintTo(addr, num1, num2, num3, num4));

/*
 * Contract class
 * - wrapper for CONTRACT class
 */
class Contract {
  constructor(
    contractId,
    algodClient,
    indexerClient,
    opts = {
      acc: { addr: oneAddress },
      simulate: true,
      formatBytes: true,
      waitForConfirmation: false,
    }
  ) {
    this.contractInstance = new CONTRACT(
      contractId,
      algodClient,
      indexerClient,
      {
        ...ARC72Spec,
        methods: [...ARC72Spec.methods],
        events: [...ARC72Spec.events],
      },
      opts.acc,
      opts.simulate,
      opts.waitForConfirmation
    );
    this.opts = opts;
  }

  arc72_approve = async (addr, amt) => 
    await arc72_approve(this.contractInstance, addr, amt);
  arc72_balanceOf = async (addr) => 
    await arc72_balanceOf(this.contractInstance, addr);
  arc72_getApproved = async (amt) =>
    await arc72_getApproved(this.contractInstance, amt);
  arc72_isApprovedForAll = async (addrFrom, addrSpender) =>
    await arc72_isApprovedForAll(this.contractInstance, addrFrom, addrSpender);
  arc72_ownerOf = async (id) =>
    await arc72_ownerOf(this.contractInstance, id);
  arc72_tokenByIndex = async (id) => 
    await arc72_tokenByIndex(this.contractInstance, id);
  arc72_tokenURI = async (id) => 
    await arc72_tokenURI(this.contractInstance, id);
  arc72_totalSupply = async () =>
    await arc72_totalSupply(this.contractInstance);
  arc72_transferFrom = async (addrFrom, addrSpender, amt) =>
    await arc72_transferFrom(this.contractInstance, addrFrom, addrSpender, amt);
  burn = async (id) =>
    await burn(this.contractInstance, id);
  close = async () =>
    await close(this.contractInstance);
  deleteNftDataBox = async (id) =>
    await deleteNftDataBox(this.contractInstance, id);
  deleteOperatorDataBox = async (addrFrom, addrSpender) =>
    await deleteOperatorDataBox(this.contractInstance, addrFrom, addrSpender);
  grant = async (addr) =>
    await grant(this.contractInstance, addr);
  manager = async () =>
    await manager(this.contractInstance);
  mintTo = async (addr, num1, num2, num3, num4) =>
    await mintTo(this.contractInstance, addr, num1, num2, num3, num4);

  state = async () => {
    const stateR = await this.contractInstance.state();
    if (!stateR.success) {
      return {
        success: false,
        error: "Failed to get state",
      };
    }
    const [
      addr,
      num1,
      num2
    ] = stateR.returnValue;
    return {
      success: true,
      returnValue: {
        addr: addr,
        num1: num1,
        num2:num2,
      },
    };
  };

  arc72_Approval = async (query) =>
    await this.contractInstance.arc72_Approval(query);
  arc72_ApprovalForAll = async (query) =>
    await this.contractInstance.arc72_ApprovalForAll(query);
  arc72_Transfer = async (query) =>
    await this.contractInstance.arc72_Transfer(query);
}

export default Contract;
