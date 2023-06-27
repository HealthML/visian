import axios from "axios";

import { hubBaseUrl } from "./hub-base-url";

export const getJobLog = async (jobId: string) => {
  const response = await axios.get(`${hubBaseUrl}jobs/${jobId}/log-file`);
  return response.data;
};
