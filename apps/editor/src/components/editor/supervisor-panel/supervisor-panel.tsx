import {
  BooleanParam,
  color,
  Divider,
  fontSize,
  Modal,
  Text,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import styled from "styled-components";
import { AnnotatorRole } from "../../../models/who";
import { useStore } from "../../../app/root-store";

interface AnnotatorSectionProps {
  annotatorRole: AnnotatorRole;
  annotatorName: string;
  annotationTime?: string;
  colorAddition: string;
  colorDeletion?: string;
}

const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
  width: 100%;
`;

const AnnotatorInformationContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const TypeText = styled(Text)`
  color: ${color("lightText")};
  font-size: ${fontSize("small")};
`;

const InformationText = styled(Text)`
  font-size: 18px;
`;

const EditCircle = styled.div<{ circleColor: string }>`
  width: 17px;
  height: 17px;
  background-color: ${(props) => props.circleColor};
  border-radius: 50%;
`;
const CircleContainer = styled.div`
  display: flex;
  flex-direction: row;
  min-width: 40px;
  justify-content: space-between;
`;

const AnnotatorSection: React.FC<AnnotatorSectionProps> = ({
  annotatorRole,
  annotatorName,
  annotationTime,
  colorAddition,
  colorDeletion,
}) => (
  <SectionContainer>
    <TypeText tx={annotatorRole} />
    <AnnotatorInformationContainer>
      <InformationText tx={annotatorName} />
      <CircleContainer>
        <EditCircle circleColor={colorAddition} />
        {colorDeletion && <EditCircle circleColor={colorDeletion} />}
      </CircleContainer>
    </AnnotatorInformationContainer>
    {annotationTime && (
      <>
        <TypeText tx="annotation-time" />
        <InformationText tx={annotationTime} />
      </>
    )}
  </SectionContainer>
);

export const SupervisorPanel = observer(() => {
  // TODO: Use actual information from the store
  const store = useStore();

  const [shouldShowDelta, setShouldShowDelta] = useState(false);

  return (
    <Modal>
      {/* TODO: Set delta options */}
      {/* eslint-disable-next-line @typescript-eslint/no-empty-function */}
      <BooleanParam
        labelTx="show-delta"
        value={shouldShowDelta}
        setValue={() => {
          setShouldShowDelta(!shouldShowDelta);
        }}
      />
      <Divider />
      <AnnotatorSection
        annotatorRole="Annotator"
        annotatorName="Adam Annotator"
        colorAddition="yellow"
      />
      <Divider />
      <AnnotatorSection
        annotatorRole="Reviewer"
        annotatorName="Rick Reviewer"
        annotationTime="01:12:26"
        colorAddition="green"
        colorDeletion="red"
      />
    </Modal>
  );
});
