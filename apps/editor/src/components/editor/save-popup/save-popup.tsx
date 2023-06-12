import {
  Button,
  PopUp,
  Text,
  TextField,
  useTranslation,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import path from "path";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { patchAnnotationFile, postAnnotationFile } from "../../../queries";
import { Annotation } from "../../../types";
import { SavePopUpProps } from "./save-popup.props";
import { LayerGroup } from "../../../models";

const SectionLabel = styled(Text)`
  font-size: 14px;
  margin-bottom: 8px;
`;

const SaveAsInput = styled(TextField)`
  margin: 0px 10px 0px 0px;
  width: 100%;
`;

const SaveInput = styled(TextField)`
  margin: 0px 10px 0px 0px;
  width: 100%;
  color: gray;
`;

const SaveButton = styled(Button)`
  min-width: 110px;
`;

const InlineRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 28px;
`;

const InlineRowLast = styled(InlineRow)`
  margin-bottom: 10px;
`;

const SavePopUpContainer = styled(PopUp)`
  align-items: left;
  width: 60%;
`;

export const SavePopUp = observer<SavePopUpProps>(({ isOpen, onClose }) => {
  const store = useStore();
  const [searchParams] = useSearchParams();
  const [newAnnotationURI, setnewAnnotationURI] = useState("");

  const { t } = useTranslation();

  const createActiveLayerFile = async (
    shouldBeAnnotation = true,
  ): Promise<File | undefined> => {
    const activeLayer = store?.editor.activeDocument?.activeLayer;
    if (activeLayer && activeLayer.isAnnotation === shouldBeAnnotation) {
      const layerFile = await activeLayer.toFile();
      return layerFile;
    }
  };

  const createActiveGroupFile = async (): Promise<File | undefined> => {
    const activeLayer = store?.editor.activeDocument?.activeLayer;
    if (activeLayer && activeLayer.isAnnotation) {
      const activeGroupLayer = activeLayer.parent as LayerGroup;
      const zipFile = await store?.editor?.activeDocument?.createZip(
        activeGroupLayer.layers,
      );
      return zipFile;
    }
  };

  const checkAnnotationURI = (file: File, uri: string) => {
    if (path.extname(uri) !== path.extname(file.name)) {
      throw new Error(
        `URI does not match file type ${path.extname(file.name)}`,
      );
    }
  };

  const saveAnnotation = async () => {
    store?.setProgress({ labelTx: "saving" });
    try {
      const annotationMeta = store?.editor.activeDocument?.activeLayer
        ?.metaData as Annotation;
      const annotationFile = await createActiveLayerFile();
      if (!annotationMeta || !annotationFile) {
        throw new Error("Could not create annotation file");
      }
      checkAnnotationURI(annotationFile, annotationMeta.dataUri);
      const response = await patchAnnotationFile(
        annotationMeta,
        annotationFile,
      );
      return response;
    } catch (error: any) {
      const description = error.response?.data?.message
        ? error.response.data.message
        : error.message
        ? error.message
        : "annotation-saving-error";
      store?.setError({
        titleTx: "saving-error",
        descriptionTx: description,
      });
    } finally {
      store?.setProgress();
    }
  };

  const saveAnnotationAs = async (uri: string) => {
    store?.setProgress({ labelTx: "saving" });
    try {
      const imageId = searchParams.get("imageId");
      const annotationFile = await createActiveGroupFile();
      if (!imageId || !annotationFile) {
        throw new Error("Could not create annotation file");
      }
      checkAnnotationURI(annotationFile, uri);
      const response = await postAnnotationFile(imageId, uri, annotationFile);
      return response;
    } catch (error: any) {
      const description = error.response?.data?.message
        ? error.response.data.message
        : error.message
        ? error.message
        : "annotation-saving-error";
      store?.setError({
        titleTx: "saving-error",
        descriptionTx: description,
      });
    } finally {
      store?.setProgress();
    }
  };

  const getAnnotationURISuggestion = useCallback(() => {
    const annotationLayerName =
      store?.editor.activeDocument?.activeLayer?.title?.split(".")[0];
    const imageURI =
      store?.editor.activeDocument?.mainImageLayer?.metaData?.dataUri;
    const imageName = path.basename(imageURI).split(".")[0];
    return `/annotations/${imageName}/${
      annotationLayerName || "annotation"
    }.nii.gz`;
  }, [store]);

  useEffect(() => {
    if (isOpen) {
      setnewAnnotationURI(getAnnotationURISuggestion());
    }
  }, [isOpen, getAnnotationURISuggestion]);

  const isValidDataUri = useCallback(
    (dataUri, allowedExtensions = [".nii.gz", ".zip"]) => {
      const extensionsPattern = `(${allowedExtensions.join("|")})`;

      const pattern = new RegExp(
        `^((/|./)?([a-zA-Z0-9-_]+/)*([a-zA-Z0-9-_]+)${extensionsPattern})$`,
      );

      return pattern.test(dataUri)
        ? "valid"
        : `${t("data_uri_help_message")} ${allowedExtensions.join(", ")}.`;
    },
    [t],
  );

  const isValidAnnotationUri = useMemo(
    () => isValidDataUri(newAnnotationURI),
    [newAnnotationURI, isValidDataUri],
  );

  return (
    <SavePopUpContainer
      titleTx="annotation-saving"
      isOpen={isOpen}
      dismiss={onClose}
      shouldDismissOnOutsidePress
    >
      {store?.editor.activeDocument?.activeLayer?.metaData?.dataUri && (
        <>
          <SectionLabel tx="annotation-saving-overrwite" />
          <InlineRow>
            <SaveInput
              value={
                store?.editor.activeDocument?.activeLayer?.metaData?.dataUri
              }
              readOnly
            />
            <SaveButton
              tx="save"
              onPointerDown={async () => {
                if (await saveAnnotation()) {
                  onClose?.();
                }
              }}
            />
          </InlineRow>
        </>
      )}
      <SectionLabel tx="annotation-saving-as" />
      {isValidAnnotationUri !== "valid" && <Text text={isValidAnnotationUri} />}
      <InlineRowLast>
        <SaveAsInput
          placeholder="URI"
          value={newAnnotationURI}
          onChangeText={setnewAnnotationURI}
        />
        <SaveButton
          tx="save-as"
          onPointerDown={async () => {
            if (await saveAnnotationAs(newAnnotationURI)) {
              onClose?.();
            }
          }}
          isDisabled={isValidAnnotationUri !== "valid"}
        />
      </InlineRowLast>
    </SavePopUpContainer>
  );
});
