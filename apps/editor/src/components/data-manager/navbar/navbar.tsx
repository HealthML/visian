import { FloatingUIButton } from "@visian/ui-shared";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { ShortcutPopUp } from "../../editor/shortcut-popup";
import { MenuDataManager } from "../menu-data-manager";

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;

  display: flex;
  justify-content: space-between;
  flex-direction: column;
`;

const Button = styled(FloatingUIButton)`
  margin-right: 16px;
`;

export const Navbar = ({ className }: { className?: string }) => {
  const navigate = useNavigate();

  // Shortcut Pop Up Toggling
  const [isShortcutPopUpOpen, setIsShortcutPopUpOpen] = useState(false);
  const openShortcutPopUp = useCallback(() => {
    setIsShortcutPopUpOpen(true);
  }, []);
  const closeShortcutPopUp = useCallback(() => {
    setIsShortcutPopUpOpen(false);
  }, []);

  const navigateToHome = useCallback(() => navigate(`/projects`), [navigate]);
  const navigateToEditor = useCallback(() => navigate(`/editor`), [navigate]);

  return (
    <Container className={className}>
      <Button
        icon="home"
        tooltipTx="home"
        tooltipPosition="right"
        onPointerDown={navigateToHome}
        isActive={false}
      />
      <MenuDataManager onOpenShortcutPopUp={openShortcutPopUp} />
      <Button
        icon="pixelBrush"
        tooltipTx="open-editor"
        tooltipPosition="right"
        onPointerDown={navigateToEditor}
        isActive={false}
      />
      <ShortcutPopUp
        isOpen={isShortcutPopUpOpen}
        onClose={closeShortcutPopUp}
      />
    </Container>
  );
};

export default Navbar;
