import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { MIN_DELAY } from "../helper-hardhat-config";

const boxContract: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  log("Deploying Box...");
  const box = await deploy("Box", {
    from: deployer,
    args: [],
    log: true,
  });
  log(`Deployed Box to address ${box.address}`);
  const timeLock = await ethers.getContract("TimeLock");
  const boxObj = await ethers.getContractAt("Box", box.address);
  const transferOwnerTx = await boxObj.transferOwnership(timeLock.address);
  await transferOwnerTx.wait(1);
  log("Ownership from Box transferred to timeLock");
};

export default boxContract;
