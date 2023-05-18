import { Auth } from "aws-amplify";

export const whoBackendBaseUrl = "https://annotation.ai4h.net/api/v1";

export const getWHOTask = async (taskId: string) => {
  const user = await Auth.currentAuthenticatedUser();
  const { jwtToken } = await user.signInUserSession.accessToken;

  const options = {
    headers: { Authorization: `Bearer ${jwtToken}` },
  };

  const data = await fetch(`${whoBackendBaseUrl}/tasks/${taskId}`, options);
  if (!data.ok) throw new Error(data.status.toString());
  return data.json();
};

export const putWHOTask = async (taskId: string, task: string) => {
  const user = await Auth.currentAuthenticatedUser();
  const { jwtToken } = user.signInUserSession.accessToken;

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
