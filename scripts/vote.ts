import * as fs from "fs";
import { ethers, network } from "hardhat";
import {
  developmentChains,
  proposalsFile,
  VOTING_PERIOD,
} from "../helper-hardhat-config";
import moveBlocks from "../utils/move-blocks";
const index = 0;

async function main(proposalIndex: number) {
  const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
  const proposalId = proposals[network.config.chainId!][proposalIndex];
  // 0 = against, 1 = for, 2 = abstain
  const voteWay = 1;
  const governor = await ethers.getContract("GovernorContract");
  const reason = "I like the store box with 77";
  const voteTx = await governor.castVoteWithReason(proposalId, voteWay, reason);
  await voteTx.wait(1);

  if (developmentChains.includes(network.name)) {
    await moveBlocks(VOTING_PERIOD + 1);
  }

  console.log("Voted! Ready to go!");
}

main(index)
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
