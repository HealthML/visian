import { Button, PopUp, Text, TextField } from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import path from "path";
import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import {
  deleteAnnotation,
  patchAnnotationFile,
  postAnnotation,
} from "../../../querys";
import { Annotation } from "../../../types";
import { SavePopUpProps } from "./save-popup.props";

const SectionLabel = styled(Text)`
  font-size: 14px;
  margin-bottom: 8px;
`;

const SaveInput = styled(TextField)`
  margin: 0px 10px 0px 0px;
  width: 100%;
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
  width: 500px;
`;

export const SavePopUp = observer<SavePopUpProps>(({ isOpen, onClose }) => {
  const store = useStore();
  const [searchParams] = useSearchParams();
  const [newAnnotationURI, setnewAnnotationURI] = useState("");

  const saveAnnotation = async (annotation: Annotation | undefined) => {
    const annotationLayer = store?.editor.activeDocument?.activeLayer;
    if (annotationLayer) {
      const annotationFile = await annotationLayer.toFile();
      const annotationMeta = annotation || annotationLayer.metaData;
      try {
        if (!annotationMeta || !annotationFile)
          throw new Error("Could not create annotation file");
        if (
          path.extname(annotationMeta.dataUri) !==
          path.extname(annotationFile.name)
        ) {
          throw new Error("URI does not match file type");
        }
        const response = await patchAnnotationFile(
          annotationMeta as Annotation,
          annotationFile,
        );
        onClose?.();
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
      }
    }
  };

  const saveAnnotationAs = async (uri: string) => {
    const imageId = searchParams.get("imageId");
    const annotationLayer = store?.editor.activeDocument?.activeLayer;
    try {
      if (!imageId || !annotationLayer || !annotationLayer.isAnnotation) {
        throw new Error("No image or annotation layer selected");
      }
      const annotation = await postAnnotation(imageId, uri);
      const savedAnnotation = await saveAnnotation(annotation);
      if (!savedAnnotation) {
        await deleteAnnotation(annotation.id);
      } else {
        store?.destroyRedirect("/", true);
      }
    } catch (error: any) {
      const description = error.response?.data?.message
        ? error.response.data.message
        : error.message
        ? error.message
        : "annotation-saving-as-error";
      store?.setError({
        titleTx: "saving-error",
        descriptionTx: description,
      });
    }
  };

  const getAnnotationURISuggestion = useCallback(() => {
    const annotationLayerName =
      store?.editor.activeDocument?.activeLayer?.title;
    const imageURI =
      store?.editor.activeDocument?.mainImageLayer?.metaData?.dataUri;
    const imageName = path.basename(imageURI);
    return `/annotations/${imageName}/${annotationLayerName}`;
  }, [store]);

  useEffect(() => {
    if (isOpen) {
      setnewAnnotationURI(getAnnotationURISuggestion());
    }
  }, [isOpen, getAnnotationURISuggestion]);

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
              placeholder={
                store?.editor.activeDocument?.activeLayer?.metaData?.dataUri
              }
              readOnly
            />
            <SaveButton
              tx="save"
              onPointerDown={() => {
                saveAnnotation(undefined);
                store?.destroyRedirect("/", true);
              }}
            />
          </InlineRow>
        </>
      )}
      <SectionLabel tx="annotation-saving-as" />
      <InlineRowLast>
        <SaveInput
          placeholder="URI"
          value={newAnnotationURI}
          onChangeText={setnewAnnotationURI}
        />
        <SaveButton
          tx="save-as"
          onPointerDown={() => {
            saveAnnotationAs(newAnnotationURI);
          }}
        />
      </InlineRowLast>
    </SavePopUpContainer>
  );
});
