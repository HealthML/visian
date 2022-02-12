import {
  BooleanParam,
  color,
  Divider,
  fontSize,
  Icon,
  Modal,
  TaskType,
  Text,
  UserRole,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import styled from "styled-components";
import { useStore } from "../../../app/root-store";

interface AnnotatorSectionProps {
  annotatorRole: UserRole;
  annotatorName: string;
  annotationTime?: string;
  colorAddition: string;
  colorDeletion?: string;
  isLast?: boolean;
}

const SectionContainer = styled.div<{ isLast?: boolean }>`
  display: flex;
  flex-direction: column;
  margin-bottom: ${(props) => (props.isLast ? "0px" : "12px")};
  width: 100%;
`;

const AnnotatorInformationContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const AnnotationTimeContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 8px;
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
  background-color: ${(props) =>
    color(props.circleColor as any) || props.circleColor};
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
  isLast = false,
}) => (
  <>
    <Divider />
    <SectionContainer isLast={isLast}>
      <TypeText tx={annotatorRole} />
      <AnnotatorInformationContainer>
        <InformationText tx={annotatorName} />
        <CircleContainer>
          <EditCircle circleColor={colorAddition}>
            <Icon icon="pixelBrush" />
          </EditCircle>
          {colorDeletion && (
            <EditCircle circleColor={colorDeletion}>
              <Icon icon="eraser" />
            </EditCircle>
          )}
        </CircleContainer>
      </AnnotatorInformationContainer>
      {annotationTime && (
        <AnnotationTimeContainer>
          <TypeText tx="annotation-time" />
          <InformationText tx={annotationTime} />
        </AnnotationTimeContainer>
      )}
    </SectionContainer>
  </>
);

export const SupervisorPanel = observer(() => {
  const store = useStore();
  if (!(store?.currentTask?.kind === TaskType.Review)) return <></>;
  const annotationCount = store.currentTask.annotations.length;
  const annotations = store.currentTask.annotations.sort(
    (firstAnnotation, secondAnnotation) =>
      new Date(firstAnnotation.submittedAt).getTime() -
      new Date(secondAnnotation.submittedAt).getTime(),
  );

  const [shouldShowDelta, setShouldShowDelta] = useState(false);

  return (
    <Modal>
      {/* TODO: Set delta options */}
      <BooleanParam
        labelTx="show-delta"
        value={shouldShowDelta}
        setValue={() => {
          setShouldShowDelta(!shouldShowDelta);
        }}
      />
      {annotations.map((annotation, index) => {
        const isLast = index === annotationCount - 1;
        // TODO: Make coloring work properly
        const correspondingLayer = store.editor.activeDocument?.getLayer(
          annotation.data[0].correspondingLayerId,
        );
        const annotationColor = correspondingLayer?.color || "yellow";
        return (
          <AnnotatorSection
            key={index}
            annotatorRole={annotation.annotator.getRoleName()}
            annotatorName={annotation.annotator.username}
            colorAddition={annotationColor}
            colorDeletion={
              annotation.annotator.getRoleName() === "Reviewer" ? "red" : ""
            }
            isLast={isLast}
            // TODO: Remove mocked annotation time (needs to be added to the API for this)
            annotationTime={isLast ? "01:12:26" : ""}
          />
        );
      })}
    </Modal>
  );
});
