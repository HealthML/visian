export const whoBackendBaseUrl = "https://annotation.ai4h.net";

export const getWHOTask = (taskId: string) =>
  fetch(`${whoBackendBaseUrl}/tasks/${taskId}`).then((data) => {
    if (!data.ok) {
      throw new Error(data.status.toString());
    }
    return data.json();
  });

export const putWHOTask = (taskId: string, task: string) => {
  const options: RequestInit = {
    method: "PUT",
    redirect: "manual",
    headers: {
      "Content-Type": "application/json",
    },
    body: task,
  };
  return fetch(`${whoBackendBaseUrl}/tasks/${taskId}/next`, options).then(
    (data) => {
      if (!data.ok) throw new Error(data.status.toString());
      return data;
    },
  );
};
