import { MiaImage } from "@visian/utils";
import { useCallback, useState } from "react";

export const useImageSelection = () => {
  const [selectedImages, setSelectedImages] = useState<Set<MiaImage>>(
    new Set(),
  );

  const selectImage = useCallback(
    (image: MiaImage, selected: boolean) => {
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
    (images: MiaImage[]) => setSelectedImages(new Set(images)),
    [setSelectedImages],
  );

  return {
    selectedImages,
    selectImage,
    selectImages,
  };
};
