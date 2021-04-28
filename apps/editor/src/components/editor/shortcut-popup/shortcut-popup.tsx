import {
  color,
  coverMixin,
  PopUp,
  zIndex,
  Text,
  fontWeight,
  Icon,
  KeyIcon,
} from "@visian/ui-shared";
import React from "react";
import styled from "styled-components";

const StyledOverlay = styled.div`
  ${coverMixin}

  align-items: center;
  display: flex;
  justify-content: center;
  background-color: ${color("modalUnderlay")};
  z-index: ${zIndex("overlay")};
  backdrop-filter: blur(3px);
`;

const ShortcutColumn = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ShortcutColumnContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  overflow: scroll;
`;

const ShortcutGroup = styled.div`
  margin-bottom: 20px;
  width: 100%;
`;

const GroupTitle = styled(Text)`
  font-size: 22px;
  font-weight: ${fontWeight("regular")};
`;

const GroupTitleContainer = styled.div`
  margin-bottom: 14px;
  width: 100%;
`;

const ShortcutLabel = styled(Text)`
  font-size: 14px;
  margin-left: 12px;
`;

const ShortcutDescription = styled(Text)`
  font-size: 17px;
  font-weight: ${fontWeight("default")};
`;

const ShortcutRow = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-bottom: 16px;
  align-items: center;
`;

const ShortcutContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 30%;
  align-items: center;
`;

const ShortcutDescriptionContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 70%;
  align-items: center;
`;

const ShortcutPopUpContainer = styled(PopUp)`
  align-items: center;
  width: 80%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  height: 80%;
  max-height: 800px;
`;

const PlusIcon = styled(Icon).attrs(() => ({ icon: "plusIcon" }))`
  margin: 0 8px;
  height: 7px;
  width: 7px;
`;

const MouseIcon = styled(Icon)`
  height: 26px;
  width: 20px;
`;

export const ShortcutPopUp: React.FC = () => (
  <StyledOverlay>
    <ShortcutPopUpContainer label="Shortcuts">
      <ShortcutColumnContainer>
        <ShortcutColumn>
          <ShortcutGroup>
            <GroupTitleContainer>
              <GroupTitle text="Mouse" />
            </GroupTitleContainer>
            <ShortcutRow>
              <ShortcutContainer>
                <MouseIcon icon="leftMouse" />
                <ShortcutLabel text="Left Click" />
              </ShortcutContainer>
              <ShortcutDescriptionContainer>
                <ShortcutDescription text="Use active tool" />
              </ShortcutDescriptionContainer>
            </ShortcutRow>
            <ShortcutRow>
              <ShortcutContainer>
                <MouseIcon icon="rightMouse" />
                <ShortcutLabel text="Right Click" />
              </ShortcutContainer>
              <ShortcutDescriptionContainer>
                <ShortcutDescription text="Use secondary mode of the active tool " />
              </ShortcutDescriptionContainer>
            </ShortcutRow>
            <ShortcutRow>
              <ShortcutContainer>
                <MouseIcon icon="middleMouse" />
                <ShortcutLabel text="Middle Click" />
              </ShortcutContainer>
              <ShortcutDescriptionContainer>
                <ShortcutDescription text="Navigate (hand tool)" />
              </ShortcutDescriptionContainer>
            </ShortcutRow>
            <ShortcutRow>
              <ShortcutContainer>
                <KeyIcon label="Cmd ⌘" />
                <PlusIcon />
                <MouseIcon icon="middleMouse" />
              </ShortcutContainer>
              <ShortcutDescriptionContainer>
                <ShortcutDescription text="Navigate (hand tool)" />
              </ShortcutDescriptionContainer>
            </ShortcutRow>
            <ShortcutRow>
              <ShortcutContainer>
                <KeyIcon label="Ctrl" />
                <PlusIcon />
                <MouseIcon icon="middleMouse" />
              </ShortcutContainer>
              <ShortcutDescriptionContainer>
                <ShortcutDescription text="Navigate (hand tool)" />
              </ShortcutDescriptionContainer>
            </ShortcutRow>
            <ShortcutRow>
              <ShortcutContainer>
                <MouseIcon icon="scrollUp" />
                <ShortcutLabel text="Scroll up" />
              </ShortcutContainer>
              <ShortcutDescriptionContainer>
                <ShortcutDescription text="Go one slice up" />
              </ShortcutDescriptionContainer>
            </ShortcutRow>
            <ShortcutRow>
              <ShortcutContainer>
                <MouseIcon icon="scrollDown" />
                <ShortcutLabel text="Scroll down" />
              </ShortcutContainer>
              <ShortcutDescriptionContainer>
                <ShortcutDescription text="Go one slice down" />
              </ShortcutDescriptionContainer>
            </ShortcutRow>
            <ShortcutRow>
              <ShortcutContainer>
                <KeyIcon label="Ctrl" />
                <PlusIcon />
                <MouseIcon icon="scrollUp" />
              </ShortcutContainer>
              <ShortcutDescriptionContainer>
                <ShortcutDescription text="Zoom In" />
              </ShortcutDescriptionContainer>
            </ShortcutRow>
            <ShortcutRow>
              <ShortcutContainer>
                <KeyIcon label="Ctrl" />
                <PlusIcon />
                <MouseIcon icon="scrollDown" />
              </ShortcutContainer>
              <ShortcutDescriptionContainer>
                <ShortcutDescription text="Zoom Out" />
              </ShortcutDescriptionContainer>
            </ShortcutRow>
            <ShortcutRow>
              <ShortcutContainer>
                <KeyIcon label="Alt" />
                <PlusIcon />
                <MouseIcon icon="scrollUp" />
              </ShortcutContainer>
              <ShortcutDescriptionContainer>
                <ShortcutDescription text="Decrease brush size" />
              </ShortcutDescriptionContainer>
            </ShortcutRow>
            <ShortcutRow>
              <ShortcutContainer>
                <KeyIcon label="Alt" />
                <PlusIcon />
                <MouseIcon icon="scrollDown" />
              </ShortcutContainer>
              <ShortcutDescriptionContainer>
                <ShortcutDescription text="Increase brush size" />
              </ShortcutDescriptionContainer>
            </ShortcutRow>
          </ShortcutGroup>
          <ShortcutGroup>
            <GroupTitleContainer>
              <GroupTitle text="Tool Selection" />
            </GroupTitleContainer>
            <ShortcutRow>
              <ShortcutContainer>
                <KeyIcon label="H" />
              </ShortcutContainer>
              <ShortcutDescriptionContainer>
                <ShortcutDescription text="Select Navigation (hand) tool" />
              </ShortcutDescriptionContainer>
            </ShortcutRow>
            <ShortcutRow>
              <ShortcutContainer>
                <KeyIcon label="C" />
              </ShortcutContainer>
              <ShortcutDescriptionContainer>
                <ShortcutDescription text="Select Crosshair tool" />
              </ShortcutDescriptionContainer>
            </ShortcutRow>
            <ShortcutRow>
              <ShortcutContainer>
                <KeyIcon label="B" />
              </ShortcutContainer>
              <ShortcutDescriptionContainer>
                <ShortcutDescription text="Select Brush tool" />
              </ShortcutDescriptionContainer>
            </ShortcutRow>
            <ShortcutRow>
              <ShortcutContainer>
                <KeyIcon label="S" />
              </ShortcutContainer>
              <ShortcutDescriptionContainer>
                <ShortcutDescription text="Select Smart Brush tool" />
              </ShortcutDescriptionContainer>
            </ShortcutRow>
            <ShortcutRow>
              <ShortcutContainer>
                <KeyIcon label="E" />
              </ShortcutContainer>
              <ShortcutDescriptionContainer>
                <ShortcutDescription text="Select Eraser tool" />
              </ShortcutDescriptionContainer>
            </ShortcutRow>
          </ShortcutGroup>
          <ShortcutGroup>
            <GroupTitleContainer>
              <GroupTitle text="Tools" />
            </GroupTitleContainer>
            <ShortcutRow>
              <ShortcutContainer>
                <KeyIcon label="Delete" />
              </ShortcutContainer>
              <ShortcutDescriptionContainer>
                <ShortcutDescription text="Delete the annotation on the current slice" />
              </ShortcutDescriptionContainer>
            </ShortcutRow>
            <ShortcutRow>
              <ShortcutContainer>
                <KeyIcon label="Ctrl" />
                <PlusIcon />
                <KeyIcon label="Delete" />
              </ShortcutContainer>
              <ShortcutDescriptionContainer>
                <ShortcutDescription text="Delete the whole annotation" />
              </ShortcutDescriptionContainer>
            </ShortcutRow>
            <ShortcutRow>
              <ShortcutContainer>
                <KeyIcon label="+" />
              </ShortcutContainer>
              <ShortcutDescriptionContainer>
                <ShortcutDescription text="Increase brush size" />
              </ShortcutDescriptionContainer>
            </ShortcutRow>
            <ShortcutRow>
              <ShortcutContainer>
                <KeyIcon label="-" />
              </ShortcutContainer>
              <ShortcutDescriptionContainer>
                <ShortcutDescription text="Decrease brush size" />
              </ShortcutDescriptionContainer>
            </ShortcutRow>
          </ShortcutGroup>
        </ShortcutColumn>
        <ShortcutColumn>
          <ShortcutGroup>
            <GroupTitleContainer>
              <GroupTitle text="Undo/Redo" />
            </GroupTitleContainer>
            <ShortcutRow>
              <ShortcutContainer>
                <KeyIcon label="Ctrl" />
                <PlusIcon />
                <KeyIcon label="Z" />
              </ShortcutContainer>
              <ShortcutDescriptionContainer>
                <ShortcutDescription text="Undo" />
              </ShortcutDescriptionContainer>
            </ShortcutRow>
            <ShortcutRow>
              <ShortcutContainer>
                <KeyIcon label="Ctrl" />
                <PlusIcon />
                <KeyIcon label="Y" />
              </ShortcutContainer>
              <ShortcutDescriptionContainer>
                <ShortcutDescription text="Redo" />
              </ShortcutDescriptionContainer>
            </ShortcutRow>
            <ShortcutRow>
              <ShortcutContainer>
                <KeyIcon label="Ctrl" />
                <PlusIcon />
                <KeyIcon label="Shift" />
                <PlusIcon />
                <KeyIcon label="Z" />
              </ShortcutContainer>
              <ShortcutDescriptionContainer>
                <ShortcutDescription text="Redo" />
              </ShortcutDescriptionContainer>
            </ShortcutRow>
          </ShortcutGroup>
          <ShortcutGroup>
            <GroupTitleContainer>
              <GroupTitle text="Layer Controls" />
            </GroupTitleContainer>
            <ShortcutRow>
              <ShortcutContainer>
                <KeyIcon label="M" />
              </ShortcutContainer>
              <ShortcutDescriptionContainer>
                <ShortcutDescription text="Toggle annotation visibility (mute/unmute)" />
              </ShortcutDescriptionContainer>
            </ShortcutRow>
          </ShortcutGroup>
          <ShortcutGroup>
            <GroupTitleContainer>
              <GroupTitle text="View Types" />
            </GroupTitleContainer>
            <ShortcutRow>
              <ShortcutContainer>
                <KeyIcon label="1" />
              </ShortcutContainer>
              <ShortcutDescriptionContainer>
                <ShortcutDescription text="Switch to Transverse (Axial) view" />
              </ShortcutDescriptionContainer>
            </ShortcutRow>
            <ShortcutRow>
              <ShortcutContainer>
                <KeyIcon label="2" />
              </ShortcutContainer>
              <ShortcutDescriptionContainer>
                <ShortcutDescription text="Switch to Sagittal view" />
              </ShortcutDescriptionContainer>
            </ShortcutRow>
            <ShortcutRow>
              <ShortcutContainer>
                <KeyIcon label="3" />
              </ShortcutContainer>
              <ShortcutDescriptionContainer>
                <ShortcutDescription text="Switch to Coronal view" />
              </ShortcutDescriptionContainer>
            </ShortcutRow>
            <ShortcutRow>
              <ShortcutContainer>
                <KeyIcon label="4" />
              </ShortcutContainer>
              <ShortcutDescriptionContainer>
                <ShortcutDescription text="Toggle side views" />
              </ShortcutDescriptionContainer>
            </ShortcutRow>
          </ShortcutGroup>
          <ShortcutGroup>
            <GroupTitleContainer>
              <GroupTitle text="Slice Navigation" />
            </GroupTitleContainer>
            <ShortcutRow>
              <ShortcutContainer>
                <Icon icon="upArrow" />
              </ShortcutContainer>
              <ShortcutDescriptionContainer>
                <ShortcutDescription text="Go one slice up" />
              </ShortcutDescriptionContainer>
            </ShortcutRow>
            <ShortcutRow>
              <ShortcutContainer>
                <KeyIcon label="Shift " />
                <PlusIcon />
                <Icon icon="upArrow" />
              </ShortcutContainer>
              <ShortcutDescriptionContainer>
                <ShortcutDescription text="Go ten slices up" />
              </ShortcutDescriptionContainer>
            </ShortcutRow>
            <ShortcutRow>
              <ShortcutContainer>
                <Icon icon="downArrow" />
              </ShortcutContainer>
              <ShortcutDescriptionContainer>
                <ShortcutDescription text="Go one slice down" />
              </ShortcutDescriptionContainer>
            </ShortcutRow>
            <ShortcutRow>
              <ShortcutContainer>
                <KeyIcon label="Shift " />
                <PlusIcon />
                <Icon icon="downArrow" />
              </ShortcutContainer>
              <ShortcutDescriptionContainer>
                <ShortcutDescription text="Go ten slices down" />
              </ShortcutDescriptionContainer>
            </ShortcutRow>
            <ShortcutRow>
              <ShortcutContainer>
                <KeyIcon label="Alt " />
                <PlusIcon />
                <KeyIcon label="0" />
              </ShortcutContainer>
              <ShortcutDescriptionContainer>
                <ShortcutDescription text="Reset selected voxel" />
              </ShortcutDescriptionContainer>
            </ShortcutRow>
          </ShortcutGroup>
        </ShortcutColumn>
      </ShortcutColumnContainer>
    </ShortcutPopUpContainer>
  </StyledOverlay>
);
