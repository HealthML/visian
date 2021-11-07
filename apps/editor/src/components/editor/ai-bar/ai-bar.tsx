import {
  BlueButtonParam,
  Button,
  color,
  fontSize,
  IImageLayer,
  InvisibleButton,
  mediaQuery,
  PopUp,
  Sheet,
  sheetNoise,
  SquareButton,
  Text,
  zIndex,
} from "@visian/ui-shared";
import {
  createBase64StringFromFile,
  putWHOTask,
  reloadWithNewTaskId,
  writeSingleMedicalImage,
} from "@visian/utils";
import { observer } from "mobx-react-lite";
import React, { useCallback, useState } from "react";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { FLOY_HOME, whoHome } from "../../../constants";
import { AnnotationStatus } from "../../../models/who/annotation";
import { AnnotationData } from "../../../models/who/annotationData";

const AIBarSheet = styled(Sheet)`
  width: 700px;
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

  ${mediaQuery("bigDesktopUp")} {
    width: 800px;
  }
`;

const TaskContainer = styled.div`
  height: 100%;
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
  justify-content: space-between;
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
      if (!store?.currentTask?.annotations.length) return;
      store.currentTask.annotations.forEach((annotation) => {
        annotation.status = status;
      });
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
        data: base64Annotation,
      };
      store.currentTask.annotations.forEach((annotation) => {
        if (annotation.data.length) {
          annotation.data = [];
        }
        annotation.data.push(new AnnotationData(annotationDataForBackend));
        annotation.submittedAt = new Date().toISOString();
      });

      try {
        const response = await putWHOTask(
          store.currentTask.taskUUID,
          JSON.stringify(store.currentTask.toJSON()),
        );
        if (response) {
          // const newLocation = response.headers.get("location");
          // TODO: Do not use hardcoded location
          const newLocation =
            "http://annotation.ai4h.net/tasks/b4009387-4d48-49b6-be2a-8ad50df03307";
          if (newLocation) {
            const urlElements = newLocation.split("/");
            const newTaskId = urlElements[urlElements.length - 1];
            if (newTaskId !== store.currentTask.taskUUID) {
              store?.setIsDirty(false, true);
              reloadWithNewTaskId(newTaskId);
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
    [store],
  );

  const confirmTaskAnnotation = useCallback(async () => {
    await saveAnnotationToWHOBackend(AnnotationStatus.Completed);
  }, [saveAnnotationToWHOBackend]);

  const skipTaskAnnotation = useCallback(async () => {
    await saveAnnotationToWHOBackend(AnnotationStatus.Rejected);
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

const FloyPopUp = styled(PopUp)`
  max-height: 80%;
  max-width: 600px;
  overflow: auto;
`;

const StyledParagraph = styled(Text)`
  margin-bottom: 10px;
`;

const PopUpButton = styled(Button)`
  align-self: center;
  margin-top: 10px;
`;

export const FloyBar = observer(() => {
  const store = useStore();

  const [shouldShowWelcome, setShouldShowWelcome] = useState(true);
  const dismissWelcome = useCallback(() => {
    setShouldShowWelcome(false);
  }, []);

  const [hasShownPrivacy, setHasShownPrivacy] = useState(false);
  const [shouldShowPrivacy, setShouldShowPrivacy] = useState(false);
  const dismissPrivacy = useCallback(() => {
    setShouldShowPrivacy(false);
  }, []);
  const runInferencing = useCallback(() => {
    if (hasShownPrivacy || shouldShowPrivacy) {
      setShouldShowPrivacy(false);
      store?.setProgress({ label: "Risikoeinschätzung läuft" });
      store?.editor?.activeDocument?.floyDemo.runInferencing().then(() => {
        store?.setProgress();
      });
    } else {
      setShouldShowPrivacy(true);
      setHasShownPrivacy(true);
    }
  }, [hasShownPrivacy, shouldShowPrivacy, store]);

  return store?.editor.activeDocument?.floyDemo.hasDemoCandidate ? (
    <>
      <AIBarSheet>
        <AIContainer>
          <TaskContainer>
            <TaskLabel tx="KI Aufgabe" />
            <TaskName text="MR Risikoeinschätzung" />
          </TaskContainer>
          <ActionContainer onPointerDown={runInferencing}>
            <ActionName text="Floy KI ausführen" />
            <ActionButtonsContainer>
              <ActionButtons
                icon="playFilled"
                tooltip="Floy ausführen"
                tooltipPosition="right"
              />
            </ActionButtonsContainer>
          </ActionContainer>
          <AIToolsContainer>
            <a href={FLOY_HOME}>
              <AIButton
                icon="floyAI"
                tooltip="Zurück zu Floy"
                tooltipPosition="right"
              />
            </a>
          </AIToolsContainer>
        </AIContainer>
      </AIBarSheet>
      {shouldShowWelcome && (
        <FloyPopUp
          title="Willkommen!"
          dismiss={dismissWelcome}
          shouldDismissOnOutsidePress
        >
          <StyledParagraph>
            Willkommen zu unserer ersten Produktdemo!
          </StyledParagraph>
          <StyledParagraph>
            Für Demonstrationszwecke unseres ersten Produktes gibt diese Web
            Applikation Risikoeinschätzungen über die Präsenz von fokalen
            Läsionen (anhand von Plasmozytomen und Knochenmetastasen) in
            sagittalen T1-gewichteten LWS MRT Serien.
          </StyledParagraph>
          <StyledParagraph>
            Das finale Produkt kommt am 1. Februar 2022 auf den Markt. Bis dahin
            wird sich unsere KI Qualität, als auch die Anzahl der unterstützten
            Körperteile und Indikationen deutlich weiterentwickeln. Ihr Feedback
            hilft uns bei dieser Weiterentwicklung immens. Für alle weiteren
            Informationen und Ergebnisbesprechungen melden Sie sich gerne direkt
            bei unserem Geschäftsführer Benedikt Schneider via
            benedikt.schneider@floy.com oder +4915786031618.
          </StyledParagraph>
          <PopUpButton text="Okay" onPointerDown={dismissWelcome} />
        </FloyPopUp>
      )}
      {shouldShowPrivacy && (
        <FloyPopUp
          title="Datenschutzvereinbarung"
          dismiss={dismissPrivacy}
          shouldDismissOnOutsidePress
        >
          <StyledParagraph>
            Mit Ihrem Einverständnis dieser Datenschutzvereinbarung und der
            Nutzung dieser Produktdemo stimmen Sie der notwendigen
            Datenverarbeitung für die Ausführung der Produktdemo, internen
            Ergebnisevaluation und weiteren Produktweiterentwicklung durch die
            Floy GmbH zu. Der Floy GmbH ist es explizit untersagt, diese Daten
            ohne vorherige schriftliche Genehmigung von Ihnen an Dritte
            weiterzugeben oder für andere Zwecke, als die oben angegeben, zu
            verwenden. Die Floy GmbH wird die Daten mit höchstmöglicher Vorsicht
            behandeln.
          </StyledParagraph>
          <PopUpButton text="Weiter" onPointerDown={runInferencing} />
        </FloyPopUp>
      )}
    </>
  ) : null;
});
