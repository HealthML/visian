import { useCallback, useState } from "react";

export const useImageSelection = () => {
  const [selectedImages, setSelectedImages] = useState<Set<string>>(
    new Set<string>(),
  );

  const setImageSelection = useCallback(
    (imageId: string, isSelected: boolean) => {
      setSelectedImages((prevSelectedImages) => {
        const newSelectedImages = new Set(prevSelectedImages);
        if (isSelected) {
          newSelectedImages.add(imageId);
        } else {
          newSelectedImages.delete(imageId);
        }
        return newSelectedImages;
      });
    },
    [setSelectedImages],
  );

  return {
    selectedImages,
    setSelectedImages,
    setImageSelection,
  };
};
