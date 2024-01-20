import CONTRACT, { oneAddress } from "arccjs";

import { arc72Schema } from "./abi/arc/72/index.js";

const BalanceBoxCost = 28500; 
const AllowanceBoxCost = 28500; 

/*
 * prepareString
 * - prepare string (strip trailing null bytes)
 * @param str: string to prepare
 * @returns: prepared string
 */
// const prepareString = (str) => {
//   const index = str.indexOf("\x00");
//   if (index > 0) {
//     return str.slice(0, str.indexOf("\x00"));
//   } else {
//     return str;
//   }
// };

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

/* read-only methods */

/*
 * arc200_balanceOf
 * - get balance of addr
 * @param contractInstance: contract instance
 * @param addr: address
 * @returns: balance (Int)
 */
const arc72_balanceOf = async (contractInstance, addr) =>
  handleResponse("Balance", await contractInstance.arc72_balanceOf(addr));

/*
 * arc200_getApproved
 * - get approved address
 * @param contractInstance: contract instance
 * @param tid: token id
 * @returns: approved address (String)
 */
const arc72_getApproved = async (contractInstance, tid) =>
  handleResponse("GetApproved", await contractInstance.arc72_getApproved(tid));

/*
 * arc200_isApprovedForAll
 * - check if spender is approved for all
 * @param contractInstance: contract instance
 * @param addr: address
 * @returns: bool
 */
const arc72_isApprovedForAll = async (contractInstance, addr, addr2) =>
  handleResponse(
    "IsApprovedForAll",
    await contractInstance.arc72_isApprovedForAll(addr, addr2)
  );

/*
 * arc200_ownerOf
 * - get owner of
 * @param contractInstance: contract instance
 * @param tid: token id
 * @returns: owner (String)
 */
const arc72_ownerOf = async (contractInstance, tid) =>
  handleResponse("OwnerOf", await contractInstance.arc72_ownerOf(tid));

/*
 * arc200_tokenByIndex
 * - get token by index
 * @param contractInstance: contract instance
 * @param tid: token id
 * @returns: token (Int)
 */
const arc72_tokenByIndex = async (contractInstance, tid) =>
  handleResponse(
    "TokenByIndex",
    await contractInstance.arc72_tokenByIndex(tid)
  );

/*
 * arc72_totalSupply
 * - get total supply
 * @param contractInstance: contract instance
 * @returns: total supply (Int)
 */
const arc72_totalSupply = async (contractInstance) =>
  handleResponse("Total Supply", await contractInstance.arc200_totalSupply());

/*
 * arc72_tokenURI
 * - get token URI
 * @param contractInstance: contract instance
 * @param tid: token id
 * @returns: token URI (String)
 */
const arc72_tokenURI = async (contractInstance, tid) =>
  handleResponse("TokenURI", await contractInstance.arc72_tokenURI(tid));

/*
 * supportsInterface
 * - check if interface is supported
 * @param contractInstance: contract instance
 * @param sel: selector
 * @returns: bool
 */
const supportsInterface = async (contractInstance, sel) =>
  handleResponse(
    "SupportsInterface",
    await contractInstance.supportsInterface(sel)
  );

/*
 * safe_arc72_transferFrom
 * - send
 * @param ci: contract instance
 * @param addrFrom: from address
 * @param addrTo: to address
 * @param tid: token id
 * @param simulate: boolean
 * @param waitForConfirmation: boolean
 * @returns: if simulate: true  { success: bool, txns: string[] }
 *          if simulate: false { success: bool, txId: string }
 */
// TODO - add conditional payment of box cost if ctcAddr balance - minBalance < box cost, 
//        where box cost is 28500
const safe_arc72_transferFrom = async (
  ci,
  addrFrom,
  addrTo,
  tid,
  simulate,
  waitForConfirmation
) => {
  try {
    const opts = {
      acc: { addr: ci.getSender(), sk: ci.getSk() },
      simulate,
      formatBytes: true,
      waitForConfirmation,
    };
    const ARC72 = new Contract(
      ci.getContractId(),
      ci.algodClient,
      ci.indexerClient,
      opts
    );
    const bal = await ci.arc72_balanceOf(addrTo);
    const addPayment = !bal.success || (bal.success && bal.returnValue === 0n);
    if (addPayment) {
      ARC72.contractInstance.setPaymentAmount(BalanceBoxCost);
    }
    const addrSpender = ARC72.contractInstance.getSender();
    console.log(
      `TransferFrom spender: ${addrSpender} from: ${addrFrom} to: ${addrTo} token: ${tid}`
    );
    return await ARC72.contractInstance.arc72_transferFrom(
      addrFrom,
      addrTo,
      tid
    );
  } catch (e) {
    console.log(e);
  }
};

/*
 * safe_arc72_approve
 * - approve spending
 * @param ci: contract instance
 * @param addrSpender: spender address
 * @param tid: token id
 * @param simulate: boolean
 * @param waitForConfirmation: boolean
 * @returns: if simulate: true  { success: bool, txns: string[] }
 *          if simulate: false { success: bool, txId: string }
 */
// TODO - check if nft exits before attempting to improve
const safe_arc72_approve = async (
  ci,
  addrSpender,
  tid,
  simulate,
  waitForConfirmation
) => {
  try {
    const opts = {
      acc: { addr: ci.getSender(), sk: ci.getSk() },
      simulate,
      formatBytes: true,
      waitForConfirmation,
    };
    const ARC72 = new Contract(
      ci.getContractId(),
      ci.algodClient,
      ci.indexerClient,
      opts
    );
    const addrFrom = ARC72.contractInstance.getSender();
    const all = await ci.arc72_getApproved(tid);
    const addPayment = !all.success || (all.success && all.returnValue === 0n);
    if (addPayment) {
      ARC72.contractInstance.setPaymentAmount(AllowanceBoxCost);
    }
    console.log(
      `Approval from: ${addrFrom} spender: ${addrSpender} token: ${tid}`
    );
    return await ARC72.contractInstance.arc72_approve(addrSpender, tid);
  } catch (e) {
    console.log(e);
  }
};

/*
 * safe_arc72_setApprovalForAll
 * - approve spending
 * @param ci: contract instance
 * @param addrSpender: spender address
 * @param approve: boolean
 * @param simulate: boolean
 * @param waitForConfirmation: boolean
 * @returns: if simulate: true  { success: bool, txns: string[] }
 *         if simulate: false { success: bool, txId: string }
 */
const safe_arc72_setApprovalForAll = async (
  ci,
  addrSpender,
  approve,
  simulate,
  waitForConfirmation
) => {
  try {
    const opts = {
      acc: { addr: ci.getSender(), sk: ci.getSk() },
      simulate,
      formatBytes: true,
      waitForConfirmation,
    };
    const ARC72 = new Contract(
      ci.getContractId(),
      ci.algodClient,
      ci.indexerClient,
      opts
    );
    const addrFrom = ARC72.contractInstance.getSender();
    const all = await ci.arc72_isApprovedForAll(addrFrom, addrSpender);
    const addPayment = !all.success || (all.success && all.returnValue === 0n);
    if (addPayment) {
      ARC72.contractInstance.setPaymentAmount(AllowanceBoxCost);
    }
    console.log(
      `Approval from: ${addrFrom} spender: ${addrSpender} approve: ${approve}`
    );
    return await ARC72.contractInstance.arc72_setApprovalForAll(
      addrSpender,
      approve
    );
  } catch (e) {
    console.log(e);
  }
};

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
        ...arc72Schema,
        methods: [...arc72Schema.methods],
        events: [...arc72Schema.events],
      },
      opts.acc,
      opts.simulate,
      opts.waitForConfirmation
    );
    this.opts = opts;
  }
  // standard methods
  arc72_tokenURI = async (tid) => {
    const res = await arc72_tokenURI(this.contractInstance, tid);
    if (!res.success) return res;
    if (this.opts?.formatBytes)
      return {
        ...res,
        returnValue: prepareString(res.returnValue),
      };
    return res;
  };
  arc72_balanceOf = async (addr) =>
    await arc72_balanceOf(this.contractInstance, addr);
  arc72_getApproved = async (tid) =>
    await arc72_getApproved(this.contractInstance, tid);
  arc72_isApprovedForAll = async (addr, addr2) =>
    await arc72_isApprovedForAll(this.contractInstance, addr, addr2);
  arc72_ownerOf = async (tid) =>
    await arc72_ownerOf(this.contractInstance, tid);
  arc72_tokenByIndex = async (tid) =>
    await arc72_tokenByIndex(this.contractInstance, tid);
  arc72_totalSupply = async () =>
    await arc72_totalSupply(this.contractInstance);
  supportsInterface = async (sel) =>
    await supportsInterface(this.contractInstance, sel);
  arc72_transferFrom = async (
    addrFrom,
    addrTo,
    amt,
    simulate,
    waitForConfirmation
  ) =>
    await safe_arc72_transferFrom(
      this,
      addrFrom,
      addrTo,
      amt,
      simulate,
      waitForConfirmation
    );
  arc72_approve = async (addrSpender, amt, simulate, waitForConfirmation) => {};
  arc72_setApprovalForAll = async (
    addrSpender,
    approve,
    simulate,
    waitForConfirmation
  ) => {};
  arc72_Approval = async (query) =>
    await this.contractInstance.arc72_Approval(query);
  arc72_ApprovalForAll = async (query) =>
    await this.contractInstance.arc72_ApprovalForAll(query);
  arc72_Transfer = async (query) =>
    await this.contractInstance.arc72_Transfer(query);
  // non-standard methods
  getEvents = async (query) => await this.contractInstance.getEvents(query);
}

export default Contract;
