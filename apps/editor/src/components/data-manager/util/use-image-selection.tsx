import { useCallback, useState } from "react";

import { Image } from "../../../types";

export const useImageSelection = () => {
  const [selectedImages, setSelectedImages] = useState<Set<Image>>(new Set());

  const selectImage = useCallback(
    (image: Image, selected: boolean) => {
      setSelectedImages((prevSelectedImages) => {
        const newSelectedImages = new Set(prevSelectedImages);
        if (selected) {
          newSelectedImages.add(image);
        } else {
          newSelectedImages.delete(image);
        }
        return newSelectedImages;
      });
    },
    [setSelectedImages],
  );

  const selectImages = useCallback(
    (images: Image[]) => setSelectedImages(new Set(images)),
    [setSelectedImages],
  );

  return {
    selectedImages,
    selectImage,
    selectImages,
  };
};
