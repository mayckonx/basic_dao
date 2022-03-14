import * as fs from "fs";
import { ethers, network } from "hardhat";
import {
  developmentChains,
  FUNC,
  MIN_DELAY,
  NEW_STORE_VALUE,
  PROPOSAL_DESCRIPTION,
  VOTING_DELAY,
} from "../helper-hardhat-config";
import moveBlocks from "../utils/move-blocks";
import moveTime from "../utils/move-time";
const index = 0;

async function queueAndExecute() {
  const governor = await ethers.getContract("GovernorContract");
  const box = await ethers.getContract("Box");
  const args = [NEW_STORE_VALUE];
  const encodedFunctionCall = box.interface.encodeFunctionData(FUNC, args);
  const descriptionHash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION)
  );
  console.log("queueing...");

  const queueTx = await governor.queue(
    [box.address],
    [0],
    [encodedFunctionCall],
    descriptionHash
  );
  await queueTx.wait(1);

  if (developmentChains.includes(network.name)) {
    await moveTime(MIN_DELAY + 1);
    await moveBlocks(VOTING_DELAY + 1);
  }

  console.log("Executing");
  const executeTx = await governor.execute(
    [box.address],
    [0],
    [encodedFunctionCall],
    descriptionHash
  );
  await executeTx.wait(1);

  const boxNewValue = await box.retrieve();
  console.log(`New box value: ${boxNewValue.toString()}`);
}

queueAndExecute()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
