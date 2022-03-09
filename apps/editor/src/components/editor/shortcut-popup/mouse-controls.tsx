import {
  LargePopUpGroup,
  LargePopUpGroupTitleContainer,
  LargePopUpGroupTitle,
  KeyIcon,
} from "@visian/ui-shared";
import React from "react";
import {
  ShortcutRow,
  ShortcutContainer,
  MouseIcon,
  ShortcutLabel,
  ShortcutDescriptionContainer,
  ShortcutDescription,
  PlusIcon,
} from "./styled-components";

export const MouseControls = () => (
  <LargePopUpGroup>
    <LargePopUpGroupTitleContainer>
      <LargePopUpGroupTitle tx="mouse" />
    </LargePopUpGroupTitleContainer>
    <ShortcutRow>
      <ShortcutContainer>
        <MouseIcon icon="leftMouse" />
        <ShortcutLabel tx="left-click" />
      </ShortcutContainer>
      <ShortcutDescriptionContainer>
        <ShortcutDescription tx="use-active-tool" />
      </ShortcutDescriptionContainer>
    </ShortcutRow>
    <ShortcutRow>
      <ShortcutContainer>
        <MouseIcon icon="rightMouse" />
        <ShortcutLabel tx="right-click" />
      </ShortcutContainer>
      <ShortcutDescriptionContainer>
        <ShortcutDescription tx="use-active-tool-secondary" />
      </ShortcutDescriptionContainer>
    </ShortcutRow>
    <ShortcutRow>
      <ShortcutContainer>
        <MouseIcon icon="middleMouse" />
        <ShortcutLabel tx="middle-click" />
      </ShortcutContainer>
      <ShortcutDescriptionContainer>
        <ShortcutDescription tx="navigation-tool" />
      </ShortcutDescriptionContainer>
    </ShortcutRow>
    <ShortcutRow>
      <ShortcutContainer>
        <KeyIcon text="Ctrl" />
        <PlusIcon />
        <MouseIcon icon="leftMouse" />
      </ShortcutContainer>
      <ShortcutDescriptionContainer>
        <ShortcutDescription tx="navigation-tool" />
      </ShortcutDescriptionContainer>
    </ShortcutRow>
    <ShortcutRow>
      <ShortcutContainer>
        <MouseIcon icon="scrollUp" />
        <ShortcutLabel tx="scroll-up" />
      </ShortcutContainer>
      <ShortcutDescriptionContainer>
        <ShortcutDescription tx="slice-up" />
      </ShortcutDescriptionContainer>
    </ShortcutRow>
    <ShortcutRow>
      <ShortcutContainer>
        <MouseIcon icon="scrollDown" />
        <ShortcutLabel tx="scroll-down" />
      </ShortcutContainer>
      <ShortcutDescriptionContainer>
        <ShortcutDescription tx="slice-down" />
      </ShortcutDescriptionContainer>
    </ShortcutRow>
    <ShortcutRow>
      <ShortcutContainer>
        <KeyIcon text="Ctrl" />
        <PlusIcon />
        <MouseIcon icon="scrollUp" />
      </ShortcutContainer>
      <ShortcutDescriptionContainer>
        <ShortcutDescription tx="zoom-in" />
      </ShortcutDescriptionContainer>
    </ShortcutRow>
    <ShortcutRow>
      <ShortcutContainer>
        <KeyIcon text="Ctrl" />
        <PlusIcon />
        <MouseIcon icon="scrollDown" />
      </ShortcutContainer>
      <ShortcutDescriptionContainer>
        <ShortcutDescription tx="zoom-out" />
      </ShortcutDescriptionContainer>
    </ShortcutRow>
    <ShortcutRow>
      <ShortcutContainer>
        <KeyIcon text="Alt" />
        <PlusIcon />
        <MouseIcon icon="scrollUp" />
      </ShortcutContainer>
      <ShortcutDescriptionContainer>
        <ShortcutDescription tx="decrease-brush-size" />
      </ShortcutDescriptionContainer>
    </ShortcutRow>
    <ShortcutRow>
      <ShortcutContainer>
        <KeyIcon text="Alt" />
        <PlusIcon />
        <MouseIcon icon="scrollDown" />
      </ShortcutContainer>
      <ShortcutDescriptionContainer>
        <ShortcutDescription tx="increase-brush-size" />
      </ShortcutDescriptionContainer>
    </ShortcutRow>
  </LargePopUpGroup>
);
