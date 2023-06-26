import { CognitoUser } from "@aws-amplify/auth";
import { Auth } from "aws-amplify";
import axios, { AxiosRequestConfig } from "axios";

import { WHOTask } from "./types";

export const whoBackendBaseUrl = "https://annotation.ai4h.net/api/v1";

export const getWHOTask = async (taskId: string): Promise<WHOTask> => {
  const user: CognitoUser = await Auth.currentAuthenticatedUser();
  const session = user.getSignInUserSession();
  if (!session) throw new Error("No login session found.");
  const jwtToken = session.getAccessToken().getJwtToken();

  const options = {
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      "Content-Type": "application/json",
    },
  };

  const data = await axios
    .get(`${whoBackendBaseUrl}/tasks/${taskId}`, options)
    .catch((error) => {
      if (error.response) {
        throw new Error(error.status.toString());
      }
    });
  if (!data) {
    throw new Error("No response");
  }
  const task = new WHOTask(await data.data);

  return task;
};

export const putWHOTask = async (taskId: string, task: string) => {
  const user: CognitoUser = await Auth.currentAuthenticatedUser();
  const session = user.getSignInUserSession();
  if (!session) throw new Error("No login session found.");
  const jwtToken = session.getAccessToken().getJwtToken();

  const options: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      "Content-Type": "application/json",
    },
  };

  const data = await axios
    .put(`${whoBackendBaseUrl}/tasks/${taskId}/next`, task, options)
    .catch((error) => {
      if (error.response) {
        throw new Error(error.status.toString());
      }
    });
  if (!data) {
    throw new Error("No response");
  }
  return data;
};
