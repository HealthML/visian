import {
  color,
  InvisibleButton,
  Sheet,
  Text,
  fontSize,
  SquareButton,
  BlueButtonParam,
  sheetNoise,
  IImageLayer,
} from "@visian/ui-shared";
import {
  createBase64StringFromFile,
  putWHOTask,
  reloadWithNewTaskId,
  writeSingleMedicalImage,
} from "@visian/utils";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import { AnnotationStatus } from "../../../models/who/annotation";
import { AnnotationData } from "../../../models/who/annotationData";

import { useStore } from "../../../app/root-store";

const AIBarContainer = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  justify-content: center;
  width: 100%;
  box-sizing: border-box;
  pointer-events: auto;
`;

const AIBarSheet = styled(Sheet)`
  width: 800px;
  height: 70px;
  padding: 10px 28px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const TaskContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const TaskLabel = styled(Text)`
  font-size: ${fontSize("small")};
  line-height: 10px;
  height: 12px;
  padding-bottom: 0px;
  color: ${color("lightText")};
`;

const TaskName = styled(Text)`
  font-size: 18px;
  line-height: 18px;
  height: 18px;
  padding-top: 2px;
`;

const ActionContainer = styled.div`
  height: 100%;
  min-width: 450px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-radius: 10px;
  border: 1px solid ${color("sheetBorder")};
  padding: 20px;
  box-sizing: border-box;
`;

const ActionName = styled(Text)`
  font-size: 18px;
  line-height: 10px;
  height: 12px;
  padding-top: 2px;
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ActionButtons = styled(SquareButton)`
  margin: 0px 5px;
`;

const AIContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
`;

const AIToolsContainer = styled.div`
  display: flex;
  flex-direction: row;
  position: relative;
`;

const AIButton = styled(BlueButtonParam)`
  width: 40px;
  padding: 0;
  margin: 0px 4px;
`;

const SkipButton = styled(InvisibleButton)`
  width: 40px;
  height: 40px;
  margin: 0px;
`;

const AIMessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: auto;
  position: absolute;
  top: -150px;
  left: 50%;
  transform: translateX(-50%);
`;

const AIMessageConnector = styled.div`
  width: 1px;
  height: 60px;
  margin: 10px 0px;
  background-color: ${color("lightText")};
`;

const AIMessage = styled(Sheet)`
  background: ${sheetNoise}, ${color("blueSheet")};
  border-color: ${color("blueBorder")};
  width: 300px;
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  padding: 14px 20px;
  box-sizing: border-box;
`;

const AIMessageTitle = styled(Text)`
  font-size: 18px;
  line-height: 18px;
  height: 18px;
  padding-bottom: 8px;
`;

const AIMessageSubtitle = styled(Text)`
  font-size: 16px;
  line-height: 12px;
  height: 12px;
  color: ${color("lightText")};
`;

export const AIBar = observer(() => {
  const store = useStore();

  const saveAnnotationToWHOBackend = useCallback(
    async (status: AnnotationStatus) => {
      if (!store?.currentTask?.annotations[0]) return;
      store.currentTask.annotations[0].status = status;
      const currentAnnotationImage = (store?.editor.activeDocument
        ?.activeLayer as IImageLayer).image.toITKImage();
      const currentAnnotationFile = await writeSingleMedicalImage(
        currentAnnotationImage,
        "annotation.nii.gz",
      );
      if (!currentAnnotationFile) return;
      const base64Annotation = await createBase64StringFromFile(
        currentAnnotationFile,
      );

      const annotationDataForBackend = {
        annotationDataUUID: uuidv4(),
        data: base64Annotation,
      };
      if (store.currentTask.annotations[0].data.length) {
        store.currentTask.annotations[0].data = [];
      }
      store.currentTask.annotations[0].data.push(
        new AnnotationData(annotationDataForBackend),
      );
      store.currentTask.annotations[0].submittedAt = new Date().toISOString();

      console.log(store.currentTask.toJSON());
      const responseJson = await putWHOTask(
        store.currentTask.taskUUID,
        JSON.stringify(store.currentTask.toJSON()),
      );
      if (responseJson?.nextTaskId) {
        reloadWithNewTaskId(responseJson.nextTaskId);
      }
    },
    [store?.currentTask, store?.editor.activeDocument?.activeLayer],
  );

  const confirmTaskAnnotation = useCallback(async () => {
    await saveAnnotationToWHOBackend(AnnotationStatus.Completed);
  }, [saveAnnotationToWHOBackend]);

  const skipTaskAnnotation = useCallback(async () => {
    await saveAnnotationToWHOBackend(AnnotationStatus.Rejected);
  }, [saveAnnotationToWHOBackend]);

  return store?.editor.activeDocument ? (
    <AIBarContainer>
      <AIBarSheet>
        <TaskContainer>
          <TaskLabel tx="Task" />
          <TaskName tx={store.currentTask?.annotationTasks[0].title} />
          {/* TODO: Styling */}
        </TaskContainer>
        <ActionContainer>
          <ActionName tx={store.currentTask?.annotationTasks[0].description} />
          <ActionButtonsContainer>
            <ActionButtons
              icon="check"
              tooltipTx="confirm-task-annotation-tooltip"
              tooltipPosition="right"
              onPointerDown={confirmTaskAnnotation}
            />
            <ActionButtons
              icon="redo"
              tooltipTx="skip-task-annotation-tooltip"
              tooltipPosition="right"
              onPointerDown={skipTaskAnnotation}
            />
          </ActionButtonsContainer>
        </ActionContainer>
        <AIContainer>
          <AIToolsContainer>
            <AIMessageContainer>
              <AIMessage>
                <AIMessageTitle tx="Show me what you are looking for" />
                <AIMessageSubtitle tx="Start annotating" />
              </AIMessage>
              <AIMessageConnector />
            </AIMessageContainer>
            <SkipButton icon="arrowLeft" />
            <AIButton
              icon="whoAI"
              tooltipTx="export-tooltip"
              tooltipPosition="right"
            />
            <SkipButton icon="arrowRight" />
          </AIToolsContainer>
        </AIContainer>
      </AIBarSheet>
    </AIBarContainer>
  ) : null;
});
