import {
  color,
  ColoredButtonParam,
  fontSize,
  InvisibleButton,
  Sheet,
  sheetNoise,
  SquareButton,
  Text,
  zIndex,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import { useCallback, useMemo } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { whoHome } from "../../../constants";

const ReviewBarSheet = styled(Sheet)`
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
  width: 40px;
`;

const ReviewContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
`;

const ReviewToolsContainer = styled.div`
  display: flex;
  flex-direction: row;
  position: relative;
`;

const ColoredButton = styled(ColoredButtonParam)`
  width: 40px;
  padding: 0;
  margin: 0px 4px;
`;

const SkipButton = styled(InvisibleButton)`
  width: 40px;
  height: 40px;
  margin: 0px;
`;

const ReviewMessageContainer = styled.div`
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

const ReviewMessageConnector = styled.div`
  width: 1px;
  height: 60px;
  margin: 10px 0px;
  background-color: ${color("lightText")};
`;

const ReviewMessage = styled(Sheet)`
  background: ${sheetNoise}, ${color("blueSheet")};
  border-color: ${color("blueBorder")};
  width: 300px;
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  padding: 14px 20px;
  box-sizing: border-box;
`;

const ReviewMessageTitle = styled(Text)`
  font-size: 18px;
  line-height: 18px;
  height: 18px;
  padding-bottom: 8px;
`;

const ReviewMessageSubtitle = styled(Text)`
  font-size: 16px;
  line-height: 12px;
  height: 12px;
  color: ${color("lightText")};
`;

export const WhoReviewBar = observer(() => {
  const store = useStore();

  const confirmTaskAnnotation = useCallback(async () => {
    store?.reviewStrategy?.nextTask();
  }, [store?.reviewStrategy]);

  const skipTaskAnnotation = useCallback(async () => {
    store?.reviewStrategy?.nextTask();
  }, [store?.reviewStrategy]);

  return store?.editor.activeDocument ? (
    <ReviewBarSheet>
      <TaskContainer>
        <TaskLabel tx="Task" />
        <TaskName
          text={store?.reviewStrategy?.currentTask?.title || "Task Title"}
        />
      </TaskContainer>
      <ActionContainer>
        <ActionName
          text={
            store?.reviewStrategy?.currentTask?.description ||
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
      <ReviewContainer>
        <ReviewToolsContainer>
          {false && (
            <ReviewMessageContainer>
              <ReviewMessage>
                <ReviewMessageTitle tx="ai-show-me" />
                <ReviewMessageSubtitle tx="ai-start-annotating" />
              </ReviewMessage>
              <ReviewMessageConnector />
            </ReviewMessageContainer>
          )}
          <SkipButton icon="arrowLeft" />
          <a href={whoHome}>
            <ColoredButton
              color="blue"
              icon="whoAI"
              tooltipTx="return-who"
              tooltipPosition="right"
            />
          </a>
          <SkipButton icon="arrowRight" />
        </ReviewToolsContainer>
      </ReviewContainer>
    </ReviewBarSheet>
  ) : null;
});

export const MiaReviewBar = observer(
  ({ openSavePopup }: { openSavePopup: () => void }) => {
    const store = useStore();

    const nextTask = useCallback(async () => {
      store?.reviewStrategy?.nextTask();
    }, [store?.reviewStrategy]);

    const isVerified = useMemo(
      () =>
        store?.editor.activeDocument?.activeLayer?.family?.metaData?.verified ??
        false,
      [store?.editor.activeDocument?.activeLayer?.family?.metaData],
    );

    const toggleVerification = useCallback(() => {
      if (store?.editor.activeDocument?.activeLayer?.family?.metaData) {
        store.editor.activeDocument.activeLayer.family.metaData = {
          ...store.editor.activeDocument.activeLayer.family.metaData,
          verified: !isVerified,
        };
      }
    }, [store?.editor.activeDocument?.activeLayer, isVerified]);

    return store?.editor.activeDocument ? (
      <ReviewBarSheet>
        <TaskContainer>
          <TaskLabel tx="Task" />
          <TaskName
            text={store?.reviewStrategy?.currentTask?.title || "Task Title"}
          />
        </TaskContainer>
        <ActionContainer>
          <ActionName
            text={
              store?.reviewStrategy?.currentTask?.description ||
              "Task Description"
            }
          />
          <ActionButtonsContainer />
        </ActionContainer>
        <ReviewContainer>
          <ReviewToolsContainer>
            <ActionButtons
              icon="save"
              tooltipTx="save"
              tooltipPosition="top"
              onPointerDown={openSavePopup}
            />
            <ActionButtons
              icon={isVerified ? "exit" : "check"}
              isDisabled={
                !store?.editor.activeDocument?.activeLayer?.family?.metaData
              }
              tooltipTx={
                isVerified
                  ? "unverify-annotation-tooltip"
                  : "verify-annotation-tooltip"
              }
              tooltipPosition="top"
              onPointerDown={toggleVerification}
            />
            <ActionButtons
              icon="arrowForward"
              tooltipTx="next-task-tooltip"
              tooltipPosition="top"
              onPointerDown={nextTask}
            />
          </ReviewToolsContainer>
        </ReviewContainer>
      </ReviewBarSheet>
    ) : null;
  },
);
