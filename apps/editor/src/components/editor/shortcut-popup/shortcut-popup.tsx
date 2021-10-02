import {
  LargePopUpGroupTitle,
  LargePopUpGroupTitleContainer,
  Icon,
  KeyIcon,
  LargePopUp,
  LargePopUpColumn,
  LargePopUpColumnContainer,
  LargePopUpGroup,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React from "react";

import { useStore } from "../../../app/root-store";
import { ShortcutPopUpProps } from "./shortcut-popup.props";
import {
  MouseIcon,
  PlusIcon,
  ShortcutContainer,
  ShortcutDescription,
  ShortcutDescriptionContainer,
  ShortcutLabel,
  ShortcutRow,
} from "./styled-components";

export const ShortcutPopUp: React.FC<ShortcutPopUpProps> = observer(
  ({ isOpen, onClose }) => {
    const store = useStore();
    return (
      <LargePopUp
        titleTx="shortcuts"
        isOpen={isOpen}
        dismiss={onClose}
        shouldDismissOnOutsidePress
      >
        <LargePopUpColumnContainer>
          <LargePopUpColumn>
            <LargePopUpGroup>
              <LargePopUpGroupTitleContainer>
                <LargePopUpGroupTitle text="Mouse" />
              </LargePopUpGroupTitleContainer>
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
                  <ShortcutDescription text="Use secondary mode of the active tool" />
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
                  <KeyIcon text="Ctrl" />
                  <PlusIcon />
                  <MouseIcon icon="leftMouse" />
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
                  <KeyIcon text="Ctrl" />
                  <PlusIcon />
                  <MouseIcon icon="scrollUp" />
                </ShortcutContainer>
                <ShortcutDescriptionContainer>
                  <ShortcutDescription text="Zoom In" />
                </ShortcutDescriptionContainer>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutContainer>
                  <KeyIcon text="Ctrl" />
                  <PlusIcon />
                  <MouseIcon icon="scrollDown" />
                </ShortcutContainer>
                <ShortcutDescriptionContainer>
                  <ShortcutDescription text="Zoom Out" />
                </ShortcutDescriptionContainer>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutContainer>
                  <KeyIcon text="Alt" />
                  <PlusIcon />
                  <MouseIcon icon="scrollUp" />
                </ShortcutContainer>
                <ShortcutDescriptionContainer>
                  <ShortcutDescription text="Decrease brush size" />
                </ShortcutDescriptionContainer>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutContainer>
                  <KeyIcon text="Alt" />
                  <PlusIcon />
                  <MouseIcon icon="scrollDown" />
                </ShortcutContainer>
                <ShortcutDescriptionContainer>
                  <ShortcutDescription text="Increase brush size" />
                </ShortcutDescriptionContainer>
              </ShortcutRow>
            </LargePopUpGroup>
            <LargePopUpGroup>
              <LargePopUpGroupTitleContainer>
                <LargePopUpGroupTitle text="Tool Selection" />
              </LargePopUpGroupTitleContainer>
              <ShortcutRow>
                <ShortcutContainer>
                  <KeyIcon text="H" />
                </ShortcutContainer>
                <ShortcutDescriptionContainer>
                  <ShortcutDescription text="Select Navigation (hand) tool" />
                </ShortcutDescriptionContainer>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutContainer>
                  <KeyIcon text="C" />
                </ShortcutContainer>
                <ShortcutDescriptionContainer>
                  <ShortcutDescription text="Select Crosshair tool" />
                </ShortcutDescriptionContainer>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutContainer>
                  <KeyIcon text="B" />
                </ShortcutContainer>
                <ShortcutDescriptionContainer>
                  <ShortcutDescription text="Select Brush tool" />
                </ShortcutDescriptionContainer>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutContainer>
                  <KeyIcon text="S" />
                </ShortcutContainer>
                <ShortcutDescriptionContainer>
                  <ShortcutDescription text="Select Smart Brush tool" />
                </ShortcutDescriptionContainer>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutContainer>
                  <KeyIcon text="E" />
                </ShortcutContainer>
                <ShortcutDescriptionContainer>
                  <ShortcutDescription text="Select Eraser tool" />
                </ShortcutDescriptionContainer>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutContainer>
                  <KeyIcon text="O" />
                </ShortcutContainer>
                <ShortcutDescriptionContainer>
                  <ShortcutDescription text="Select Outline tool" />
                </ShortcutDescriptionContainer>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutContainer>
                  <KeyIcon text="F" />
                </ShortcutContainer>
                <ShortcutDescriptionContainer>
                  <ShortcutDescription text="Select Fly tool (3D)" />
                </ShortcutDescriptionContainer>
              </ShortcutRow>
            </LargePopUpGroup>
            <LargePopUpGroup>
              <LargePopUpGroupTitleContainer>
                <LargePopUpGroupTitle text="Tools" />
              </LargePopUpGroupTitleContainer>
              <ShortcutRow>
                <ShortcutContainer>
                  <KeyIcon text="Delete" />
                </ShortcutContainer>
                <ShortcutDescriptionContainer>
                  <ShortcutDescription text="Delete the annotation on the current slice" />
                </ShortcutDescriptionContainer>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutContainer>
                  <KeyIcon text="Ctrl" />
                  <PlusIcon />
                  <KeyIcon text="Delete" />
                </ShortcutContainer>
                <ShortcutDescriptionContainer>
                  <ShortcutDescription text="Delete the whole annotation" />
                </ShortcutDescriptionContainer>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutContainer>
                  <KeyIcon text="+" />
                </ShortcutContainer>
                <ShortcutDescriptionContainer>
                  <ShortcutDescription text="Increase brush size" />
                </ShortcutDescriptionContainer>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutContainer>
                  <KeyIcon text="-" />
                </ShortcutContainer>
                <ShortcutDescriptionContainer>
                  <ShortcutDescription text="Decrease brush size" />
                </ShortcutDescriptionContainer>
              </ShortcutRow>
            </LargePopUpGroup>
          </LargePopUpColumn>
          <LargePopUpColumn>
            <LargePopUpGroup>
              <LargePopUpGroupTitleContainer>
                <LargePopUpGroupTitle text="Undo/Redo" />
              </LargePopUpGroupTitleContainer>
              <ShortcutRow>
                <ShortcutContainer>
                  <KeyIcon text="Ctrl" />
                  <PlusIcon />
                  <KeyIcon text="Z" />
                </ShortcutContainer>
                <ShortcutDescriptionContainer>
                  <ShortcutDescription text="Undo" />
                </ShortcutDescriptionContainer>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutContainer>
                  <KeyIcon text="Ctrl" />
                  <PlusIcon />
                  <KeyIcon text="Y" />
                </ShortcutContainer>
                <ShortcutDescriptionContainer>
                  <ShortcutDescription text="Redo" />
                </ShortcutDescriptionContainer>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutContainer>
                  <KeyIcon text="Ctrl" />
                  <PlusIcon />
                  <KeyIcon text="Shift" />
                  <PlusIcon />
                  <KeyIcon text="Z" />
                </ShortcutContainer>
                <ShortcutDescriptionContainer>
                  <ShortcutDescription text="Redo" />
                </ShortcutDescriptionContainer>
              </ShortcutRow>
            </LargePopUpGroup>
            <LargePopUpGroup>
              <LargePopUpGroupTitleContainer>
                <LargePopUpGroupTitle text="Layer Controls" />
              </LargePopUpGroupTitleContainer>
              <ShortcutRow>
                <ShortcutContainer>
                  <KeyIcon text="M" />
                </ShortcutContainer>
                <ShortcutDescriptionContainer>
                  <ShortcutDescription text="Toggle annotation visibility (mute/unmute)" />
                </ShortcutDescriptionContainer>
              </ShortcutRow>
            </LargePopUpGroup>
            <LargePopUpGroup>
              <LargePopUpGroupTitleContainer>
                <LargePopUpGroupTitle text="View Types" />
              </LargePopUpGroupTitleContainer>
              <ShortcutRow>
                <ShortcutContainer>
                  <KeyIcon text="1" />
                </ShortcutContainer>
                <ShortcutDescriptionContainer>
                  <ShortcutDescription text="Switch to Transverse (Axial) view" />
                </ShortcutDescriptionContainer>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutContainer>
                  <KeyIcon text="2" />
                </ShortcutContainer>
                <ShortcutDescriptionContainer>
                  <ShortcutDescription text="Switch to Sagittal view" />
                </ShortcutDescriptionContainer>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutContainer>
                  <KeyIcon text="3" />
                </ShortcutContainer>
                <ShortcutDescriptionContainer>
                  <ShortcutDescription text="Switch to Coronal view" />
                </ShortcutDescriptionContainer>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutContainer>
                  <KeyIcon text="4" />
                </ShortcutContainer>
                <ShortcutDescriptionContainer>
                  <ShortcutDescription text="Switch to 3D view" />
                </ShortcutDescriptionContainer>
              </ShortcutRow>
              {store?.editor.activeDocument?.viewport3D.isXRAvailable && (
                <ShortcutRow>
                  <ShortcutContainer>
                    <KeyIcon text="5" />
                  </ShortcutContainer>
                  <ShortcutDescriptionContainer>
                    <ShortcutDescription text="Switch to XR view" />
                  </ShortcutDescriptionContainer>
                </ShortcutRow>
              )}
              <ShortcutRow>
                <ShortcutContainer>
                  <KeyIcon text="0" />
                </ShortcutContainer>
                <ShortcutDescriptionContainer>
                  <ShortcutDescription text="Toggle side views" />
                </ShortcutDescriptionContainer>
              </ShortcutRow>
            </LargePopUpGroup>
            <LargePopUpGroup>
              <LargePopUpGroupTitleContainer>
                <LargePopUpGroupTitle text="Slice Navigation" />
              </LargePopUpGroupTitleContainer>
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
                  <KeyIcon text="Shift" />
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
                  <KeyIcon text="Shift" />
                  <PlusIcon />
                  <Icon icon="downArrow" />
                </ShortcutContainer>
                <ShortcutDescriptionContainer>
                  <ShortcutDescription text="Go ten slices down" />
                </ShortcutDescriptionContainer>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutContainer>
                  <KeyIcon text="Alt" />
                  <PlusIcon />
                  <KeyIcon text="0" />
                </ShortcutContainer>
                <ShortcutDescriptionContainer>
                  <ShortcutDescription text="Reset selected voxel" />
                </ShortcutDescriptionContainer>
              </ShortcutRow>
            </LargePopUpGroup>
            <LargePopUpGroup>
              <LargePopUpGroupTitleContainer>
                <LargePopUpGroupTitle text="Zoom" />
              </LargePopUpGroupTitleContainer>
              <ShortcutRow>
                <ShortcutContainer>
                  <KeyIcon text="Ctrl" />
                  <PlusIcon />
                  <KeyIcon text="+" />
                </ShortcutContainer>
                <ShortcutDescriptionContainer>
                  <ShortcutDescription text="Zoom in" />
                </ShortcutDescriptionContainer>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutContainer>
                  <KeyIcon text="Ctrl" />
                  <PlusIcon />
                  <KeyIcon text="-" />
                </ShortcutContainer>
                <ShortcutDescriptionContainer>
                  <ShortcutDescription text="Zoom out" />
                </ShortcutDescriptionContainer>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutContainer>
                  <KeyIcon text="Ctrl" />
                  <PlusIcon />
                  <KeyIcon text="0" />
                </ShortcutContainer>
                <ShortcutDescriptionContainer>
                  <ShortcutDescription text="Reset zoom and pan" />
                </ShortcutDescriptionContainer>
              </ShortcutRow>
            </LargePopUpGroup>
            <LargePopUpGroup>
              <LargePopUpGroupTitleContainer>
                <LargePopUpGroupTitle text="Save/Export" />
              </LargePopUpGroupTitleContainer>
              <ShortcutRow>
                <ShortcutContainer>
                  <KeyIcon text="Ctrl" />
                  <PlusIcon />
                  <KeyIcon text="Alt" />
                  <PlusIcon />
                  <KeyIcon text="N" />
                </ShortcutContainer>
                <ShortcutDescriptionContainer>
                  <ShortcutDescription text="Create a new document" />
                </ShortcutDescriptionContainer>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutContainer>
                  <KeyIcon text="Ctrl" />
                  <PlusIcon />
                  <KeyIcon text="S" />
                </ShortcutContainer>
                <ShortcutDescriptionContainer>
                  <ShortcutDescription text="Save in browser" />
                </ShortcutDescriptionContainer>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutContainer>
                  <KeyIcon text="Ctrl" />
                  <PlusIcon />
                  <KeyIcon text="E" />
                </ShortcutContainer>
                <ShortcutDescriptionContainer>
                  <ShortcutDescription text="Download annotation as *.nii.gz" />
                </ShortcutDescriptionContainer>
              </ShortcutRow>
              <ShortcutRow>
                <ShortcutContainer>
                  <KeyIcon text="Ctrl" />
                  <PlusIcon />
                  <KeyIcon text="Shift" />
                  <PlusIcon />
                  <KeyIcon text="E" />
                </ShortcutContainer>
                <ShortcutDescriptionContainer>
                  <ShortcutDescription text="Download the current annotation slice as *.png" />
                </ShortcutDescriptionContainer>
              </ShortcutRow>
            </LargePopUpGroup>
          </LargePopUpColumn>
        </LargePopUpColumnContainer>
      </LargePopUp>
    );
  },
);
