import { Tool, Toolbar as GenericToolbar } from "@visian/ui-shared";
import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";

import { Settings } from "../settings";
import { ToolbarProps } from "./toolbar.props";

const StyledToolbar = styled(GenericToolbar)`
  margin-bottom: 16px;
`;

export const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { renderer, ...rest } = props;

  const [isXRAvailable, setIsXRAvailable] = useState<boolean>(false);
  useEffect(() => {
    renderer.isXRAvailable().then((result) => setIsXRAvailable(result));
  }, [renderer, setIsXRAvailable]);

  const toggleFly = useCallback(() => {
    // TODO: Set active & deactivate on fly control unlock
    renderer.toggleFly();
  }, [renderer]);

  // Settings Toggling
  const [showSettings, setShowSettings] = useState(false);
  const toggleSettings = useCallback(() => {
    setShowSettings(!showSettings);
  }, [showSettings, setShowSettings]);

  // Settings Positioning
  // Menu Positioning
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);

  const [isInXR, setIsInXR] = useState<boolean>(false);
  const toggleXR = useCallback(() => {
    if (isInXR) {
      renderer.exitXR().then(() => {
        setIsInXR(false);
      });
    } else {
      renderer.enterXR().then(() => {
        setIsInXR(true);
      });
    }
  }, [isInXR, renderer, setIsInXR]);

  return (
    <StyledToolbar {...rest}>
      <Tool
        icon="crosshairPointer"
        tooltip="Fly (Shift + F)"
        onPress={toggleFly}
      />
      <Tool
        icon="settings"
        tooltip="View Settings"
        showTooltip={!showSettings}
        ref={setButtonRef}
        onPress={toggleSettings}
      />
      <Settings
        isOpen={showSettings}
        state={renderer.state}
        parentElement={buttonRef}
      />
      {isXRAvailable && (
        <Tool
          tooltip="Launch XR"
          onPress={toggleXR}
          isActive={isInXR}
          text="XR"
        />
      )}
    </StyledToolbar>
  );
};

export default Toolbar;
