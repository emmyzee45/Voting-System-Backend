import { Request, Response } from "express";
import ElectionContract from "../../web3";

export default async (_: Request, res: Response) => {
  try{
    const instance = await ElectionContract.deployed();

  const status = await instance.getStatus();
  console.log(status)
  return res.send({ status });
  }catch(err){
    console.log(err)
  }
};
