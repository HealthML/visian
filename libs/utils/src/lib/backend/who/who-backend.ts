import { CognitoUser } from "@aws-amplify/auth";
import { Auth } from "aws-amplify";

import { WHOTask } from "./types";

export const whoBackendBaseUrl = "https://annotation.ai4h.net/api/v1";

export const getWHOTask = async (taskId: string): Promise<WHOTask> => {
  const user: CognitoUser = await Auth.currentAuthenticatedUser();
  const session = user.getSignInUserSession();
  if (!session) throw new Error("No login session found.");
  const jwtToken = session.getAccessToken().getJwtToken();

  const options = {
    headers: { Authorization: `Bearer ${jwtToken}` },
  };

  const data = await fetch(`${whoBackendBaseUrl}/tasks/${taskId}`, options);
  if (!data.ok) throw new Error(data.status.toString());
  const task = new WHOTask(await data.json());
  return task;
};

export const putWHOTask = async (taskId: string, task: string) => {
  const user: CognitoUser = await Auth.currentAuthenticatedUser();
  const session = user.getSignInUserSession();
  if (!session) throw new Error("No login session found.");
  const jwtToken = session.getAccessToken().getJwtToken();

  const options: RequestInit = {
    method: "PUT",
    redirect: "manual",
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      "Content-Type": "application/json",
    },
    body: task,
  };

  const data = await fetch(
    `${whoBackendBaseUrl}/tasks/${taskId}/next`,
    options,
  );

  if (!data || !data.ok) throw new Error(data.status.toString());
  return data;
};
