import axios from "axios";
import { Status } from "connectors/rnode-http-js";
import { CfRequest } from "./types";

export const cfExploreDeploy = async ({
  net,
  code,
}: CfRequest): Promise<Status> => {
  try {
    console.log(net);
    const res = await axios.get("/explore", {
      params: {
        net,
        code,
      },
    });

    const responseData = res.data;

    return responseData;
  } catch (e) {
    throw new Error(e);
  }
};
