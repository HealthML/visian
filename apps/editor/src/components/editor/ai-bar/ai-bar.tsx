/* eslint-disable react/no-unescaped-entities */
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
  TextField,
  zIndex,
} from "@visian/ui-shared";
import {
  createBase64StringFromFile,
  putWHOTask,
  reloadWithNewTaskId,
  writeSingleMedicalImage,
} from "@visian/utils";
import { observer } from "mobx-react-lite";
import React, { useCallback, useRef, useState } from "react";
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

const NoticeText = styled(Text)`
  font-size: 10px;
  left: 50%;
  opacity: 0.8;
  position: absolute;
  width: 700px;
  text-align: center;
  top: 40px;
  transform: translateX(-50%);
`;

const LegalContainer = styled.div`
  bottom: 20px;
  display: flex;
  flex-direction: column;
  opacity: 0.5;
  position: absolute;
  pointer-events: auto;
  right: 80px;
`;

const ScrollView = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: auto;
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
  max-height: 75%;
  max-width: 600px;
  overflow: auto;
`;

const StyledParagraph = styled(Text)`
  margin-bottom: 10px;
`;

const BoldParagraph = styled(StyledParagraph)`
  font-weight: 700;
`;

const ErrorParagraph = styled(StyledParagraph)`
  color: ${color("red")};
`;

const InputRow = styled.div`
  align-self: center;
  margin-top: 10px;
`;

const PopUpButton = styled(Button)`
  margin-left: 10px;
`;

export const FloyBar = observer(() => {
  const store = useStore();

  const [token, setToken] = useState("");
  const [tokenError, setTokenError] = useState<string>();
  const [shouldShowWelcome, setShouldShowWelcome] = useState(true);
  const dismissWelcome = useCallback(() => {
    store?.editor.activeDocument?.floyDemo
      .activateToken(
        store?.editor.activeDocument?.floyDemo.hasToken() ? undefined : token,
      )
      .then(() => {
        setTokenError(undefined);
        setShouldShowWelcome(false);
      })
      .catch(() => {
        store?.editor.activeDocument?.floyDemo.clearToken();
        setTokenError("Ungültiger Token!");
      });
  }, [store, token]);
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();

        dismissWelcome();
      }
    },
    [dismissWelcome],
  );

  const privacyRef = useRef(false);
  const [shouldShowPrivacy, setShouldShowPrivacy] = useState(false);
  const dismissPrivacy = useCallback(() => {
    setShouldShowPrivacy(false);
  }, []);
  const runInferencing = useCallback(() => {
    if (privacyRef.current) {
      store?.setProgress({ label: "Risikoeinschätzung läuft" });
      store?.editor.activeDocument?.floyDemo
        .runInferencing()
        .catch(() => {
          store?.setError({
            title: "KI Fehler",
            description: "KI Analyse fehlgeschlagen",
          });
        })
        .then(() => {
          store?.setProgress();
        });
    } else {
      setShouldShowPrivacy(true);
    }
  }, [store]);
  const consent = useCallback(() => {
    store?.editor.activeDocument?.floyDemo
      .consent()
      .then(() => {
        setTokenError(undefined);
        setShouldShowPrivacy(false);
        privacyRef.current = true;
        runInferencing();
      })
      .catch(() => {
        store?.editor.activeDocument?.floyDemo.clearToken();
        setTokenError("Ihr Token wurde deaktiviert!");
        setShouldShowWelcome(true);
        setShouldShowPrivacy(false);
      });
  }, [runInferencing, store]);
  const rejectConsent = useCallback(() => {
    // eslint-disable-next-line no-alert
    alert("Bitte Annehmen oder die Website verlassen");
  }, []);

  const reset = useCallback(() => {
    store?.editor.newDocument();
  }, [store]);

  return (
    <>
      <NoticeText>
        Diese Web Applikation dient lediglich zu Demonstrationszwecken und ist
        noch nicht als Medizinprodukt zertifiziert. Demzufolge darf sie unter
        keinen Umständen in der Praxis angewandt werden. Bitte kontaktieren Sie
        info@floy.com für weitere Informationen.
      </NoticeText>
      <LegalContainer>
        <Text
          as="a"
          text="Datenschutz"
          {...({
            href: "https://www.floy.com/data-privacy",
            target: "_blank",
            rel: "noreferrer",
          } as unknown)}
        />
        <Text
          as="a"
          text="Impressum"
          {...({
            href: "https://www.floy.com/legal-notice",
            target: "_blank",
            rel: "noreferrer",
          } as unknown)}
        />
      </LegalContainer>
      {store?.editor.activeDocument?.floyDemo.hasDemoCandidate && (
        <AIBarSheet>
          <AIContainer>
            <TaskContainer>
              <TaskLabel tx="KI Analyse" />
              <TaskName text="Fokale Läsionen" />
            </TaskContainer>
            <ActionContainer>
              <ActionName
                text={
                  store.editor.activeDocument.floyDemo.inferenceResults
                    ? `Wahrscheinlichkeit: ${Math.round(
                        parseFloat(
                          store.editor.activeDocument.floyDemo
                            .inferenceResults[0].probability as string,
                        ) * 100,
                      )} % | Größe: ${
                        Math.round(
                          parseFloat(
                            store.editor.activeDocument.floyDemo
                              .inferenceResults[1].impactValue as string,
                          ) / 100,
                        ) / 10
                      } cm³`
                    : "Floy KI ausführen"
                }
              />
              <ActionButtonsContainer>
                {store.editor.activeDocument.floyDemo.inferenceResults ? (
                  <ActionButtons
                    icon="trash"
                    tooltip="Zurücksetzen"
                    tooltipPosition="right"
                    onPointerDown={reset}
                  />
                ) : (
                  <ActionButtons
                    icon="playFilled"
                    tooltip="Floy ausführen"
                    tooltipPosition="right"
                    onPointerDown={runInferencing}
                  />
                )}
              </ActionButtonsContainer>
            </ActionContainer>
            <AIToolsContainer>
              <a href={FLOY_HOME} target="_blank" rel="noreferrer">
                <AIButton
                  icon="floyAI"
                  tooltip="Zurück zu Floy"
                  tooltipPosition="right"
                />
              </a>
            </AIToolsContainer>
          </AIContainer>
        </AIBarSheet>
      )}
      {shouldShowWelcome && (
        <FloyPopUp
          title="Willkommen!"
          dismiss={dismissWelcome}
          shouldDismissOnOutsidePress
        >
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
          {!store?.editor.activeDocument?.floyDemo.hasToken() && (
            <>
              <BoldParagraph>
                Bitte geben Sie hier Ihren persönlichen Token ein, um Zugang zur
                Demo zu erhalten:
              </BoldParagraph>
              {tokenError && <ErrorParagraph>{tokenError}</ErrorParagraph>}
            </>
          )}
          <InputRow>
            {!store?.editor.activeDocument?.floyDemo.hasToken() && (
              <TextField
                placeholder="Token"
                value={token}
                onChangeText={setToken}
                onKeyDown={handleKeyDown}
              />
            )}
            <PopUpButton text="Okay" onPointerDown={dismissWelcome} />
          </InputRow>
        </FloyPopUp>
      )}
      {shouldShowPrivacy && (
        <FloyPopUp
          title="AGB"
          dismiss={dismissPrivacy}
          shouldDismissOnOutsidePress
        >
          <ScrollView>
            <BoldParagraph>
              Allgemeine Bedingungen zur Nutzung des Web Demonstrators der Floy
              GmbH
            </BoldParagraph>
            <StyledParagraph>
              Die unter der Internetadresse "demo.floy.com" bereitgestellten
              Dienste ("Demonstrator") werden von der Floy GmbH, Loristraße 12,
              80335 München (HRB 267609) ("Floy") betrieben. Der Demonstrator
              soll Ihnen Leistungsfähigkeit der KI demonstrieren. Soweit Sie den
              Demonstrator kostenlos nutzen möchten, müssen sie den folgenden
              Bedingungen zustimmen. Mit Anklicken der Schaltfläche "Annehmen"
              stimmen Sie den folgenden Bedingungen zu. Wenn Sie den folgenden
              Bedingungen nicht zustimmen, müssen sie die Schaltfläche "Nicht
              Annehmen" klicken und dürfen die Dienste unter demo.floy.com nicht
              nutzen, darauf zugreifen oder anderweitig verwenden. Wenn Sie eine
              gesonderte schriftliche Vereinbarung mit Floy abgeschlossen haben,
              gilt diese gesonderte Vereinbarung und diese Bedingungen finden
              keine Anwendung.
            </StyledParagraph>
            <BoldParagraph>Nutzungsrechte</BoldParagraph>
            <StyledParagraph>
              1.1 Floy räumt Ihnen ein unentgeltliches einfaches Recht zur
              Nutzung des Demonstrator ein, beschränkt auf den Upload und die
              Prüfung von bis zu zehn (10) radiologischen Lichtbilder für eigene
              Testzwecke ein. Eine Nutzung der des Demonstrators zu
              kommerziellen oder medizinischen Zwecken oder zur Behandlung von
              Patienten ist untersagt. Sie erkennen ausdrücklich an, dass Floy
              das alleinige Eigentum an sämtlichen Rechten an dem Demonstrator
              behält und Ihnen durch die Nutzung des Demonstrators keine Rechte
              an dem Demonstrator zuwachsen.
            </StyledParagraph>
            <StyledParagraph>
              1.2 Sie garantieren, ausschließlich solche radiologischen
              Lichtbilder im Rahmen des Demonstrators zu verwenden, für die Sie
              der Inhaber sämtlicher für die Verwendung im Rahmen des
              Demonstrators notwendigen Nutzungsrechte sind. Sie garantieren
              ferner, ausschließlich Lichtbilder zu verwenden, die neben dem
              Lichtbild keine weiteren Information in Bezug auf den Patienten
              enthalten.
            </StyledParagraph>
            <BoldParagraph>Datenschutz</BoldParagraph>
            <StyledParagraph>
              2.1 Sie sind für die Einhaltung der Pflichten des Datenschutzes,
              insbesondere aus der Datenschutz-Grundverordnung ("DSGVO") und dem
              Bundesdatenschutzgesetz, sowie für die Einhaltung
              berufsrechtlicher Pflichten allein verantwortlich. Sie
              garantieren, radiologische Lichtbilder im Rahmen des Demonstrators
              ausschließlich dann zu verwenden, wenn die jeweiligen Patienten in
              die Verwendung der radiologischen Lichtbilder zu den vorgenannten
              Zwecken wirksam eingewilligt haben. Floy wird die Lichtbilder
              ausschließlich nach gesonderter Bestätigung in Textform, und
              ausschließlich für den Fall, dass die jeweiligen Patienten wirksam
              in die Übermittlung der Bilder und deren Weiterverarbeitung durch
              Floy eingewilligt haben, selbstständig für das weitere Training
              seiner KI nutzen.
            </StyledParagraph>
            <StyledParagraph>
              2.2 Weitergehende Informationen zur Verarbeitung personenbezogener
              Daten durch Floy und wie diese geschützt werden, finden Sie auf
              der Webseite von Floy unter "floy.com" in der dort
              bereitgestellten Datenschutzerklärung.
            </StyledParagraph>
            <BoldParagraph>Haftung und Gewährleistung</BoldParagraph>
            <StyledParagraph>
              3.1 Eine Gewährleistung für die Funktionsfähigkeit des
              Demonstrators ist ausgeschlossen. Der Demonstrator wird
              ausschließlich zu Testzwecken bereitgestellt. Aufgrund der frühen
              Entwicklungsphase kann der Demonstrator Fehlfunktionen enthalten.
            </StyledParagraph>
            <StyledParagraph>
              3.2 Floy haftet uneingeschränkt für Schäden aus der Verletzung von
              Leben, Körper oder Gesundheit, die auf einer vorsätzlichen
              oderfahrlässigen Pflichtverletzung von Floy oder einer
              vorsätzlichen oder fahrlässigen Pflichtverletzung eines
              gesetzlichen Vertreters oder Erfüllungsgehilfen von Floy beruhen.
              Für sonstige Haftungsansprüche haftet Floy uneingeschränkt nur bei
              Fehlen einer garantierten Qualität sowie für Schäden aufgrund von
              Vorsatz und grober Fahrlässigkeit einschließlich derjenigen seiner
              gesetzlichen Vertreter und leitenden Angestellten. Für leichte
              Fahrlässigkeit haftet Floy nur bei Verletzung einer Pflicht, deren
              Erfüllung für die Erreichung des Vertragszwecks von besonderer
              Bedeutung ist ("Kardinalpflicht"). Bei Verletzung einer
              Kardinalpflicht ist die Haftung insgesamt auf das EUR 100 sowie
              auf Verluste begrenzt, deren Entstehung typischerweise im
              Zusammenhang mit dem Demonstrator zu erwarten wäre.
            </StyledParagraph>
          </ScrollView>
          <InputRow>
            <Button text="Annehmen" onPointerDown={consent} />
            <PopUpButton text="Ablehnen" onPointerDown={rejectConsent} />
          </InputRow>
        </FloyPopUp>
      )}
    </>
  );
});
