import { MiaAnnotation } from "@visian/mia-api";
import {
  InvisibleButton,
  List,
  ListItem,
  StatusBadge,
  Text,
  useTranslation,
} from "@visian/ui-shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { MiaReviewStrategy, TaskType } from "../../../models/review-strategy";
import { useAnnotationsByImage } from "../../../queries";
import { handleImageSelection } from "../util";
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

  // Refetch images if annotations can't be loaded
  useEffect(() => {
    if (isErrorAnnotations) refetchImages();
  }, [isErrorAnnotations, refetchImages]);

  const toggleShowAnnotations = useCallback(() => {
    setShowAnnotations((prev: boolean) => {
      // Refetch annotations if the annotations list is being opened
      if (!prev) refetchAnnotations();
      return !prev;
    });
  }, [refetchAnnotations]);

  const store = useStore();
  const { t: translate } = useTranslation();
  const navigate = useNavigate();

  const hasVerifiedAnnotation = useMemo(
    () => annotations?.some((annotation) => annotation.verified) ?? false,
    [annotations],
  );

  const imageText = useMemo(
    () => (isInSelectMode ? image.dataUri : image.dataUri.split("/").pop()),
    [isInSelectMode, image.dataUri],
  );

  const deleteDeleteImage = useCallback(() => {
    deleteImage(image);
  }, [deleteImage, image]);

  const handleSelection = useCallback(() => {
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
    );
  }, [
    image.id,
    index,
    selectedImages,
    isShiftPressed,
    selectedRange,
    setSelectedRange,
    images,
    setImageSelection,
    setSelectedImages,
  ]);

  const startReview = useCallback(
    async (taskType: TaskType, annotationId?: string) => {
      store?.startReview(
        async () =>
          annotationId
            ? MiaReviewStrategy.fromAnnotationId(store, annotationId, taskType)
            : MiaReviewStrategy.fromImageIds(store, [image.id], taskType),
        navigate,
      );
    },
    [navigate, image, store],
  );

  const openImage = useCallback(() => {
    startReview(TaskType.Create);
  }, [startReview]);

  const openAnnotation = useCallback(
    (annotationId: string) => {
      startReview(TaskType.Create, annotationId);
    },
    [startReview],
  );

  return (
    <>
      <ListItem isLast={isLast && !showAnnotations}>
        <IconButton
          icon={showAnnotations ? "arrowDown" : "arrowRight"}
          onClick={toggleShowAnnotations}
        />
        <Spacer />
        <ClickableText onClick={openImage}>{imageText}</ClickableText>
        <ExpandedSpacer />
        {hasVerifiedAnnotation && (
          <StatusBadge
            textColor="Neuronic Neon"
            borderColor="gray"
            tx="verified"
          />
        )}
        <Spacer />
        {!isInSelectMode ? (
          <IconButton
            icon="trash"
            tooltipTx="delete-image-title"
            onClick={deleteDeleteImage}
            tooltipPosition="left"
          />
        ) : (
          <IconButton
            icon={isSelected ? "checked" : "unchecked"}
            onClick={handleSelection}
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
              {annotations.map(
                (annotation: MiaAnnotation, annotationIndex: number) => (
                  <ListItem
                    isLast={
                      isLast && annotationIndex === annotations.length - 1
                    }
                  >
                    <ClickableText
                      onClick={() => openAnnotation(annotation.id)}
                    >
                      {isInSelectMode
                        ? annotation.dataUri
                        : annotation.dataUri.split("/").pop()}
                    </ClickableText>
                    <ExpandedSpacer />
                    {annotation.verified && (
                      <StatusBadge
                        textColor="Neuronic Neon"
                        borderColor="gray"
                        tx="verified"
                      />
                    )}
                    <Spacer />
                    {!isInSelectMode && (
                      <IconButton
                        icon="trash"
                        tooltipTx="delete-annotation-title"
                        onClick={() => {
                          deleteAnnotation(annotation);
                        }}
                      />
                    )}
                  </ListItem>
                ),
              )}
            </AnnotationsList>
          )
        ))}
    </>
  );
};
