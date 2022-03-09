import React, { useMemo } from "react";
import styled from "styled-components";

import { generalHotkeys } from "../../../event-handling/hotkeys";
import { Hotkey } from "../shortcut-popup";
import { InfoShortcutsProps } from "./info-shortcuts.props";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

export const InfoShortcuts: React.FC<InfoShortcutsProps> = ({
  hotkeys = [],
  hotkeyNames = [],
  hotkeyGroupNames = [],
}) => {
  const allHotkeys = useMemo(
    () => [
      ...hotkeys,
      ...(hotkeyNames.length
        ? generalHotkeys.filter(
            (hotkey) => hotkey.name && hotkeyNames.includes(hotkey.name),
          )
        : []),
      ...(hotkeyGroupNames.length
        ? generalHotkeys.filter(
            (hotkey) =>
              hotkey.shortcutGuideSection &&
              hotkeyGroupNames.includes(hotkey.shortcutGuideSection),
          )
        : []),
    ],
    [hotkeyGroupNames, hotkeyNames, hotkeys],
  );

  return allHotkeys.length ? (
    <Container>
      {allHotkeys.map((hotkey, i) => {
        const keyCombinations = hotkey.displayKeys
          ? [hotkey.displayKeys]
          : hotkey.keys.split(",").map((combination) => combination.split("+"));

        return keyCombinations.map((combination, cIndex) => (
          <Hotkey
            keyCombination={combination}
            label={hotkey.label}
            labelTx={hotkey.labelTx}
            key={`${i}-${cIndex}`}
            isShort
          />
        ));
      })}
    </Container>
  ) : null;
};
