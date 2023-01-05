import { Dataset } from "../../types/dataset-types";

const baseUrl = "http://localhost:3000/";
const datasetId = "f21452ab-a82a-4f88-9786-0c5cbf1086fa";

export const fetchDataset = async () => {
  const datasetResponse = await fetch(`${baseUrl}datasets/${datasetId}`);
  const dataset = (await datasetResponse.json()) as Dataset;

  const imagesResponse = await fetch(`${baseUrl}images?dataset=${datasetId}`);
  dataset.images = await imagesResponse.json();

  await Promise.all(
    dataset.images.map(async (image: any) => {
      const annotationsResponse = await fetch(
        `${baseUrl}annotations?image=${image.id}`,
      );
      const annotations = await annotationsResponse.json();
      image.annotations = annotations;
    }),
  );

  return dataset;
};
