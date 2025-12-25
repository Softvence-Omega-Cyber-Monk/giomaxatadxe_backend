import mongoose from "mongoose";
import { Wallet_Model } from "../wallet/wallet.model";
import { WithdrawRequest_Model } from "./withdrowRequest.model";

/**
 * Create withdraw request
 */
const createWithdrawRequest = async (payload: any) => {
  const { walletId, ownerId, ownerType, amount } = payload;

  const wallet = await Wallet_Model.findById(walletId);
  if (!wallet) throw new Error("Wallet not found");

  if (wallet.pendingBalance < amount) {
    throw new Error("Insufficient balance");
  }

  // Deduct balance
  wallet.pendingBalance -= amount;
  wallet.balance += amount;

  await wallet.save();

  return await WithdrawRequest_Model.create({
    walletId,
    ownerId,
    ownerType,
    amount,
  });
};

/**
 * Get withdraw requests by owner
 */
const getWithdrawRequestsByOwner = async (ownerId: string) => {
  return await WithdrawRequest_Model.find({ ownerId }).sort({
    createdAt: -1,
  });
};

/**
 * Admin: get all withdraw requests
 */
const getAllWithdrawRequests = async () => {
  return await WithdrawRequest_Model.find()
    .populate("walletId")
    .sort({ createdAt: -1 });
};

/**
 * Admin: mark as PAID
 */
const markAsPaid = async (withdrawId: string) => {
  const withdraw = await WithdrawRequest_Model.findById(withdrawId);
  if (!withdraw) throw new Error("Withdraw request not found");

  if (withdraw.status !== "PENDING") {
    throw new Error("Withdraw already processed");
  }

  withdraw.status = "PAID";
  await withdraw.save();

  return withdraw;
};

/**
 * Admin: reject withdraw
 */
const rejectWithdraw = async (withdrawId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const withdraw = await WithdrawRequest_Model.findById(withdrawId).session(
      session
    );
    if (!withdraw) throw new Error("Withdraw request not found");

    if (withdraw.status !== "PENDING") {
      throw new Error("Withdraw already processed");
    }

    const wallet = await Wallet_Model.findById(withdraw.walletId).session(
      session
    );
    if (!wallet) throw new Error("Wallet not found");

    // Refund amount
    wallet.balance += withdraw.amount;
    wallet.pendingBalance -= withdraw.amount;
    withdraw.status = "REJECTED";

    await wallet.save({ session });
    await withdraw.save({ session });

    await session.commitTransaction();
    session.endSession();

    return withdraw;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const WithdrowRequestService = {
  createWithdrawRequest,
  getWithdrawRequestsByOwner,
  getAllWithdrawRequests,
  markAsPaid,
  rejectWithdraw,
};
