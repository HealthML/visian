/* eslint-disable no-console */
export const whoBackendBaseUrl = "https://annotation.ai4h.net";

export const getWHOTask = (taskId: string) =>
  fetch(`${whoBackendBaseUrl}/tasks/${taskId}`)
    .then((data) => {
      if (!data.ok) {
        throw new Error(data.status.toString());
      }
      return data.json();
    })
    .then((task) => {
      console.log(task);
      return task;
    })
    .catch((error) => {
      // TODO: Error handling
      console.log(error);
    });

export const putWHOTask = (taskId: string, task: string) => {
  const options = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: task,
  };
  console.log(taskId);
  console.log(options);
  return fetch(`${whoBackendBaseUrl}/tasks/${taskId}`, options)
    .then((data) => {
      if (!data.ok) {
        throw new Error(data.status.toString());
      }
      return data.json();
    })
    .then((response) => {
      console.log(response);
      return response;
    })
    .catch((error) => {
      // TODO: Error handling
      console.log(error);
    });
};
