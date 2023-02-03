import {
  I18nData,
  Icon,
  IconType,
  isMac,
  KeyIcon,
  LargePopUp,
  LargePopUpColumn,
  LargePopUpColumnContainer,
  LargePopUpGroup,
  LargePopUpGroupTitle,
  LargePopUpGroupTitleContainer,
  useTranslation,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useMemo } from "react";

import { useStore } from "../../../app/root-store";
import { generalHotkeys } from "../../../event-handling/hotkeys";
import { MouseControls } from "./mouse-controls";
import { ShortcutPopUpProps } from "./shortcut-popup.props";
import {
  PlusIcon,
  ShortcutContainer,
  ShortcutDescription,
  ShortcutDescriptionContainer,
  ShortcutLabel,
  ShortcutRow,
} from "./styled-components";

export const Hotkey: React.FC<{
  keyCombination: string[];
  label?: string;
  labelTx?: string;
  labelData?: I18nData;
  isShort?: boolean;
}> = ({ keyCombination, label, labelTx, labelData, isShort, ...rest }) => {
  const icons = keyCombination.map((key, index, array) => {
    const nodes = [];

    if (["up", "down"].includes(key)) {
      nodes.push(<Icon icon={`${key}Arrow` as IconType} key={index} />);
    } else {
      nodes.push(
        <KeyIcon
          text={
            key === "ctrl" && isMac()
              ? "Cmd"
              : `${key[0].toUpperCase()}${key.substring(1)}`
          }
          key={index}
          isSmall={isShort}
        />,
      );
    }

    if (index < array.length - 1) {
      nodes.push(<PlusIcon key={index + 0.5} />);
    }

    return nodes;
  });

  return isShort ? (
    <ShortcutContainer fullWidth {...rest}>
      {icons}
      <ShortcutLabel text={label} tx={labelTx} data={labelData} />
    </ShortcutContainer>
  ) : (
    <ShortcutRow {...rest}>
      <ShortcutContainer>{icons}</ShortcutContainer>
      <ShortcutDescriptionContainer>
        <ShortcutDescription text={label} tx={labelTx} data={labelData} />
      </ShortcutDescriptionContainer>
    </ShortcutRow>
  );
};

const HotkeySection: React.FC<{ name: string }> = ({ name }) => {
  const hotkeys = useMemo(
    () =>
      generalHotkeys.filter((hotkey) => hotkey.shortcutGuideSection === name),
    [name],
  );

  return (
    <LargePopUpGroup>
      <LargePopUpGroupTitleContainer>
        <LargePopUpGroupTitle tx={name} />
      </LargePopUpGroupTitleContainer>
      {hotkeys.map((hotkey, i) => {
        const keyCombinations = hotkey.displayKeys
          ? [hotkey.displayKeys]
          : hotkey.keys.split(",").map((combination) => combination.split("+"));

        return keyCombinations.map((combination, cIndex) => (
          <Hotkey
            keyCombination={combination}
            label={hotkey.label}
            labelTx={hotkey.labelTx}
            key={`${i}-${cIndex}`}
          />
        ));
      })}
    </LargePopUpGroup>
  );
};

export const ShortcutPopUp: React.FC<ShortcutPopUpProps> = observer(
  ({ isOpen, onClose }) => {
    const store = useStore();
    const { t } = useTranslation();

    return (
      <LargePopUp
        titleTx="shortcuts"
        isOpen={isOpen}
        dismiss={onClose}
        shouldDismissOnOutsidePress
      >
        <LargePopUpColumnContainer>
          <LargePopUpColumn>
            <MouseControls />
            <LargePopUpGroup>
              <LargePopUpGroupTitleContainer>
                <LargePopUpGroupTitle tx="tool-selection" />
              </LargePopUpGroupTitleContainer>
              {store?.editor.activeDocument &&
                Object.values(store.editor.activeDocument.tools.tools).map(
                  (tool) =>
                    tool.activationKeys &&
                    (tool.labelTx || tool.label) && (
                      <Hotkey
                        key={tool.name}
                        keyCombination={tool.activationKeys
                          .split(",")[0]
                          .split("+")}
                        labelTx="select-tool"
                        labelData={{
                          toolName: t(tool.labelTx || "", tool.label),
                        }}
                      />
                    ),
                )}
              <Hotkey
                keyCombination={["shift", "f"]}
                labelTx="select-fly-controls"
              />
            </LargePopUpGroup>
            <HotkeySection name="brush-size" />
            <HotkeySection name="voxel-info" />
          </LargePopUpColumn>
          <LargePopUpColumn>
            <HotkeySection name="undo-redo" />
            <HotkeySection name="copy-paste" />
            <HotkeySection name="layer-controls" />
            <HotkeySection name="view-types" />
            <HotkeySection name="slice-navigation" />
            <HotkeySection name="zoom" />
            <HotkeySection name="save-export" />
          </LargePopUpColumn>
        </LargePopUpColumnContainer>
      </LargePopUp>
    );
  },
);
