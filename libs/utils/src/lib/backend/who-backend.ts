/* eslint-disable no-console */
export const whoBackendBaseUrl = "https://annotation.ai4h.net";

export const getWHOTask = (taskId: string) =>
  fetch(`${whoBackendBaseUrl}/tasks/${taskId}`)
    .then((data) => data.json())
    .then((task) => {
      console.log(task);
      return task;
    })
    .catch((error) => {
      console.log(error);
    });

export const putWHOTask = (taskId: string, task: string) => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: task,
  };
  fetch(`${whoBackendBaseUrl}/tasks/${taskId}`, options)
    .then((data) => {
      if (!data.ok) {
        throw new Error(data.status.toString());
      }
      return data.json();
    })
    .then((update) => {
      console.log(update);
      // TOOD: If response contains nextTaskId -> Get new task + load into editor
    })
    .catch((e) => {
      console.log(e);
    });
};
