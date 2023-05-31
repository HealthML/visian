import {
  InvisibleButton,
  List,
  ListItem,
  StatusBadge,
  Text,
  useTranslation,
} from "@visian/ui-shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";

import { useAnnotationsByImage } from "../../../queries";
import { Annotation } from "../../../types";
import { editorPath, handleImageSelection } from "../util";
import { DatasetImageListItemProps } from "./dataset-image-list-item.props";

const Spacer = styled.div`
  width: 10px;
`;

const ExpandedSpacer = styled.div`
  flex-grow: 1;
`;

const IconButton = styled(InvisibleButton)`
  width: 30px;
`;

const AnnotationsList = styled(List)`
  margin-left: 30px;
  width: calc(100% - 30px);
`;

const ClickableText = styled(Text)`
  cursor: pointer;
`;

export const DatasetImageListItem: React.FC<DatasetImageListItemProps> = ({
  isInSelectMode,
  image,
  refetchImages,
  isSelected,
  index,
  selectedImages,
  images,
  setImageSelection,
  setSelectedImages,
  isShiftPressed,
  selectedRange,
  setSelectedRange,
  deleteAnnotation,
  deleteImage,
  isLast,
}) => {
  const {
    annotations,
    annotationsError,
    isErrorAnnotations,
    isLoadingAnnotations,
    refetchAnnotations,
  } = useAnnotationsByImage(image.id);

  const [showAnnotations, setShowAnnotations] = useState(false);

  // refetch images if annotations can't be loaded
  useEffect(() => {
    if (isErrorAnnotations) refetchImages();
  }, [isErrorAnnotations, refetchImages]);

  const toggleShowAnnotations = useCallback(() => {
    setShowAnnotations((prev: boolean) => {
      // refetch annotations if the annotations list is being opened
      if (!prev) refetchAnnotations();
      return !prev;
    });
  }, [refetchAnnotations]);

  const { t: translate } = useTranslation();
  const navigate = useNavigate();

  const projectId = useParams().projectId || "";
  const datasetId = useParams().datasetId || "";

  const hasVerifiedAnnotation = useMemo(
    () => annotations?.some((annotation) => annotation.verified) ?? false,
    [annotations],
  );

  const getVerifiedBadge = () => (
    <StatusBadge textColor="Neuronic Neon" borderColor="gray" tx="verified" />
  );

  function extractTitleFromDataUri(dataUri: string) {
    return dataUri.split("/").pop();
  }

  return (
    <>
      <ListItem isLast={isLast && !showAnnotations}>
        <IconButton
          icon={showAnnotations ? "arrowDown" : "arrowRight"}
          onPointerDown={toggleShowAnnotations}
        />
        <Spacer />
        <ClickableText
          onClick={() => {
            navigate(editorPath(image.id, undefined, projectId, datasetId));
          }}
        >
          {isInSelectMode
            ? image.dataUri
            : extractTitleFromDataUri(image.dataUri)}
        </ClickableText>
        <ExpandedSpacer />
        {hasVerifiedAnnotation && getVerifiedBadge()}
        <Spacer />
        {!isInSelectMode ? (
          <IconButton
            icon="trash"
            tooltipTx="delete-image-title"
            onPointerDown={() => deleteImage(image)}
            tooltipPosition="left"
          />
        ) : (
          <IconButton
            icon={isSelected ? "checked" : "unchecked"}
            onPointerDown={() =>
              handleImageSelection(
                image.id,
                index,
                selectedImages,
                isShiftPressed,
                selectedRange,
                setSelectedRange,
                images,
                setImageSelection,
                setSelectedImages,
              )
            }
          />
        )}
      </ListItem>
      {showAnnotations &&
        (isLoadingAnnotations ? (
          <Text tx="annotations-loading" />
        ) : isErrorAnnotations ? (
          <Text>{`${translate("annotations-loading-error")} ${
            annotationsError?.response?.statusText
          } (${annotationsError?.response?.status})`}</Text>
        ) : (
          annotations && (
            <AnnotationsList>
              {annotations.map((annotation: Annotation) => (
                <ListItem>
                  <ClickableText
                    onClick={() => {
                      navigate(
                        editorPath(
                          image.id,
                          annotation.id,
                          projectId,
                          datasetId,
                        ),
                      );
                    }}
                  >
                    {isInSelectMode
                      ? annotation.dataUri
                      : extractTitleFromDataUri(annotation.dataUri)}
                  </ClickableText>
                  <ExpandedSpacer />
                  {annotation.verified && getVerifiedBadge()}
                  <Spacer />
                  {!isInSelectMode && (
                    <IconButton
                      icon="trash"
                      tooltipTx="delete-annotation-title"
                      onPointerDown={() => {
                        deleteAnnotation(annotation);
                      }}
                    />
                  )}
                </ListItem>
              ))}
            </AnnotationsList>
          )
        ))}
    </>
  );
};
