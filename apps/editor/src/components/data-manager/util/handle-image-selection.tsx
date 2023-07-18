import { Image } from "mia-api-client";

const multiSelection = (
  currentImageIndex: number,
  isDeselection: boolean,
  selectedRange: { start: number; end: number },
  setSelectedRange: React.Dispatch<
    React.SetStateAction<{ start: number; end: number }>
  >,
  images: Image[] | undefined,
  selectedImages: Set<string>,
  setSelectedImages: React.Dispatch<React.SetStateAction<Set<string>>>,
) => {
  const selectedRangeEnd =
    selectedRange.end !== -1 ? selectedRange.end : currentImageIndex;
  const startIndex = Math.min(selectedRangeEnd, currentImageIndex);
  const endIndex = Math.max(selectedRangeEnd, currentImageIndex);

  const updatedSelectedImages = new Set(selectedImages);

  images?.forEach((image, index) => {
    if (index >= startIndex && index <= endIndex) {
      if (isDeselection) {
        updatedSelectedImages.delete(image.id);
      } else {
        updatedSelectedImages.add(image.id);
      }
    } else if (selectedImages.has(image.id)) {
      updatedSelectedImages.add(image.id);
    }
  });

  setSelectedImages(updatedSelectedImages);
  setSelectedRange({ start: selectedRangeEnd, end: currentImageIndex });
};

export const handleImageSelection = (
  imageId: string,
  index: number,
  selectedImages: Set<string>,
  isShiftPressed: boolean,
  selectedRange: { start: number; end: number },
  setSelectedRange: React.Dispatch<
    React.SetStateAction<{ start: number; end: number }>
  >,
  images: Image[] | undefined,
  setImageSelection: (imageId: string, selection: boolean) => void,
  setSelectedImages: React.Dispatch<React.SetStateAction<Set<string>>>,
) => {
  const isSelected = selectedImages.has(imageId);

  if (isShiftPressed) {
    multiSelection(
      index,
      isSelected,
      selectedRange,
      setSelectedRange,
      images,
      selectedImages,
      setSelectedImages,
    );
  } else {
    setSelectedRange({ start: index, end: index });
    setImageSelection(imageId, !isSelected);
  }
};
