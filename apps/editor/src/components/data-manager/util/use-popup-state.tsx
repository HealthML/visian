import { useCallback, useState } from "react";

type PopUpState = [boolean, () => void, () => void, () => void];

export const usePopUpState = (initialValue: boolean): PopUpState => {
  const [isOpen, setIsOpen] = useState(initialValue);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  return [isOpen, open, close, toggle];
};
