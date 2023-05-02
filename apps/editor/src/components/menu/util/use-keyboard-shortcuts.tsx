import { isMac } from "@visian/ui-shared";
import { useEffect, useState } from "react";

import { Image } from "../../../types";

export const useKeyboardShortcuts = ({
  selectedImages,
  setSelectedImages,
  images,
}: {
  selectedImages: Set<string>;
  setSelectedImages: React.Dispatch<React.SetStateAction<Set<string>>>;
  images: Image[] | undefined;
}) => {
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [selectedRange, setSelectedRange] = useState({
    start: -1,
    end: -1,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey) {
        setIsShiftPressed(true);
      }
      const isControlKey = isMac() ? event.metaKey : event.ctrlKey;
      if (isControlKey && event.key === "a") {
        event.preventDefault();
        const newSelectedImages = new Set<string>(selectedImages);
        images?.forEach((image) => newSelectedImages.add(image.id));
        setSelectedImages(newSelectedImages);
      }
    };

    const handleKeyUp = () => {
      setIsShiftPressed(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [setSelectedImages, images, selectedImages, setIsShiftPressed]);

  return { isShiftPressed, selectedRange, setSelectedRange };
};
