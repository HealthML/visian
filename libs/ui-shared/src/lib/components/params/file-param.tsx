import React, { useCallback } from "react";
import styled from "styled-components";

import { fontSize } from "../../theme";
import { IFileParameter } from "../../types";
import { InvisibleButton } from "../button";
import { sheetMixin } from "../sheet";
import { InputLabel, Text } from "../text";
import { ListPositionProps } from "./types";

const InvisibleFileInput = styled.input.attrs(() => ({ type: "file" }))`
  display: none;
`;

const Container = styled.label`
  ${sheetMixin}
  align-items: center;
  box-sizing: border-box;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  height: 24px;
  margin-bottom: 10px;
  width: 100%;
`;

const FileInputText = styled(Text)<{ isFileLoaded?: boolean }>`
  flex: 1;
  font-size: ${fontSize("small")};
  line-height: 10px;
  margin: 0 14px;
  text-align: ${(props) => (props.isFileLoaded ? "left" : "center")};
`;

const XButton = styled(InvisibleButton).attrs(() => ({ icon: "xSmall" }))`
  height: 16px;
  margin-right: 10px;
  width: 16px;
`;

export type FileParamProps = IFileParameter &
  ListPositionProps &
  Omit<React.HTMLAttributes<HTMLInputElement>, "defaultValue" | "onChange">;

// TODO: In the future, we should probably offer a more flexible pop up color
// picker that allows user to specify fully custom colors
export const FileParam: React.FC<Partial<FileParamProps>> = ({
  isFirst,
  labelTx,
  label,
  value,
  setValue,

  defaultValue,
  onBeforeValueChange,
  kind,
  name,
  ...rest
}) => {
  const setFile = useCallback(
    (event?: React.ChangeEvent<HTMLInputElement>) => {
      if (setValue) setValue(event?.target.files?.[0]);
    },
    [setValue],
  );

  const clearFile = useCallback(() => {
    if (setValue) setValue(undefined);
  }, [setValue]);

  return (
    <>
      {(labelTx || label) && <InputLabel tx={labelTx} text={label} />}
      <Container>
        <InvisibleFileInput {...rest} onChange={setFile} />
        <FileInputText
          isFileLoaded={Boolean(value)}
          tx={value ? undefined : "upload-file"}
          text={value?.name}
        />
        {Boolean(value) && <XButton onPointerDown={clearFile} />}
      </Container>
    </>
  );
};
