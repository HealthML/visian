import {
  BlueButtonParam,
  color,
  fontSize,
  InvisibleButton,
  Sheet,
  sheetNoise,
  SquareButton,
  Text,
  zIndex,
} from "@visian/ui-shared";
import {
  createBase64StringFromFile,
  putWHOTask,
  setNewTaskIdForUrl,
  WHOAnnotationData,
  WHOAnnotationStatus,
} from "@visian/utils";
import { observer } from "mobx-react-lite";
import { useCallback } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { whoHome } from "../../../constants";

const AIBarSheet = styled(Sheet)`
  width: 800px;
  height: 70px;
  padding: 10px 28px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  pointer-events: auto;

  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: ${zIndex("modal")};
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
  margin-right: 20px;
  padding-top: 2px;
  white-space: wrap;
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
  line-height: 18px;
  margin-right: 10px;
  padding-top: 2px;
  white-space: wrap;
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

  const getBase64LayerDataForId = useCallback(
    async (layerId: string) => {
      const layerFile = await store?.editor.activeDocument?.getFileForLayer(
        layerId,
      );
      if (!layerFile) return;
      const base64LayerData = await createBase64StringFromFile(layerFile);
      if (!base64LayerData || !(typeof base64LayerData === "string")) return;
      return base64LayerData;
    },
    [store?.editor.activeDocument],
  );

  const getBase64LayerDataForAnnotationData = useCallback(
    async (annotationData: WHOAnnotationData) => {
      const { correspondingLayerId } = annotationData;
      if (!correspondingLayerId) return;
      const base64LayerData = await getBase64LayerDataForId(
        correspondingLayerId,
      );
      return base64LayerData;
    },
    [getBase64LayerDataForId],
  );

  const saveAnnotationToWHOBackend = useCallback(
    async (status: WHOAnnotationStatus) => {
      if (!store?.currentTask?.annotations.length) return;
      store.currentTask.annotations.forEach((annotation) => {
        annotation.status = status;
      });

      const newAnnotations = await Promise.all(
        store.currentTask.annotations.map(async (annotation) => {
          if (annotation.data.length) {
            // Add base64 data for each existing AnnotationData object
            const base64Data = await Promise.all(
              annotation.data.map(async (annotationData) => {
                const base64Annotation =
                  await getBase64LayerDataForAnnotationData(annotationData);
                if (base64Annotation) annotationData.data = base64Annotation;
                return annotationData;
              }),
            );
            annotation.data = base64Data;
          } else {
            // Add new AnnotationData object for each existing annotation layer
            const annotationLayerIds =
              store.editor.activeDocument?.annotationLayers.map(
                (annotationLayer) => annotationLayer.id,
              );
            if (annotationLayerIds) {
              const base64Data = await Promise.all(
                annotationLayerIds.map((annotationLayerId) =>
                  getBase64LayerDataForId(annotationLayerId),
                ),
              );
              base64Data.forEach((base64Annotation) => {
                if (!base64Annotation) return;
                const annotationDataForBackend = {
                  data: base64Annotation,
                };
                annotation.data.push(
                  new WHOAnnotationData(annotationDataForBackend),
                );
              });
            }
          }
          annotation.submittedAt = new Date().toISOString();
          return annotation;
        }),
      );

      store.currentTask.annotations = newAnnotations;

      try {
        const response = await putWHOTask(
          store.currentTask.taskUUID,
          JSON.stringify(store.currentTask.toJSON()),
        );
        if (response) {
          const newLocation = response.headers.get("location");
          if (newLocation) {
            const urlElements = newLocation.split("/");
            const newTaskId = urlElements[urlElements.length - 1];
            if (newTaskId !== store.currentTask.taskUUID) {
              store?.setIsDirty(false, true);
              setNewTaskIdForUrl(newTaskId);
              await store.loadWHOTask(newTaskId);
              return;
            }
          }
        }
        // If no new location is given, return to the WHO page
        window.location.href = whoHome;
      } catch {
        store?.setError({
          titleTx: "export-error",
          descriptionTx: "file-upload-error",
        });
      }
    },
    [getBase64LayerDataForAnnotationData, getBase64LayerDataForId, store],
  );

  const confirmTaskAnnotation = useCallback(async () => {
    await saveAnnotationToWHOBackend(WHOAnnotationStatus.Completed);
  }, [saveAnnotationToWHOBackend]);

  const skipTaskAnnotation = useCallback(async () => {
    await saveAnnotationToWHOBackend(WHOAnnotationStatus.Rejected);
  }, [saveAnnotationToWHOBackend]);

  return store?.editor.activeDocument ? (
    <AIBarSheet>
      <TaskContainer>
        <TaskLabel tx="Task" />
        <TaskName
          tx={store.currentTask?.annotationTasks[0]?.title || "Task Name"}
        />
      </TaskContainer>
      <ActionContainer>
        <ActionName
          tx={
            store.currentTask?.annotationTasks[0]?.description ||
            "Task Description"
          }
        />
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
          {false && (
            <AIMessageContainer>
              <AIMessage>
                <AIMessageTitle tx="ai-show-me" />
                <AIMessageSubtitle tx="ai-start-annotating" />
              </AIMessage>
              <AIMessageConnector />
            </AIMessageContainer>
          )}

          <SkipButton icon="arrowLeft" />
          <a href={whoHome}>
            <AIButton
              icon="whoAI"
              tooltipTx="return-who"
              tooltipPosition="right"
            />
          </a>
          <SkipButton icon="arrowRight" />
        </AIToolsContainer>
      </AIContainer>
    </AIBarSheet>
  ) : null;
});
