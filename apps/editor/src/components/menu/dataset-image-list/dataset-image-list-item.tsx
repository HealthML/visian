import {
  InvisibleButton,
  List,
  ListItem,
  Text,
  useTranslation,
} from "@visian/ui-shared";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";

import { useAnnotationsByImage } from "../../../queries";
import { Annotation, Image } from "../../../types";
import { editorPath, handleImageSelection } from "../util";

const Spacer = styled.div`
  width: 10px;
`;

const ExpandedSpacer = styled.div`
  margin-right: auto;
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

export const DatasetImageListItem = ({
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
}: {
  isInSelectMode: boolean;
  image: Image;
  refetchImages: () => void;
  isSelected: boolean;
  index: number;
  selectedImages: Set<string>;
  images: Image[] | undefined;
  setImageSelection: (imageId: string, selection: boolean) => void;
  setSelectedImages: React.Dispatch<React.SetStateAction<Set<string>>>;
  isShiftPressed: boolean;
  selectedRange: { start: number; end: number };
  setSelectedRange: React.Dispatch<
    React.SetStateAction<{ start: number; end: number }>
  >;
  deleteAnnotation: (annotation: Annotation) => void;
  deleteImage: (image: Image) => void;
  isLast: boolean;
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

  return (
    <>
      <ListItem isLast={isLast}>
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
          {image.dataUri}
        </ClickableText>
        <ExpandedSpacer />
        {isInSelectMode && (
          <>
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
            <Spacer />
          </>
        )}
        {!isInSelectMode && (
          <IconButton
            icon="trash"
            tooltipTx="delete-image-title"
            onPointerDown={() => deleteImage(image)}
            style={{ marginLeft: "auto" }}
            tooltipPosition="left"
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
                    {annotation.dataUri}
                  </ClickableText>
                  {!isInSelectMode && (
                    <IconButton
                      icon="trash"
                      tooltipTx="delete-annotation-title"
                      onPointerDown={() => {
                        deleteAnnotation(annotation);
                      }}
                      style={{ marginLeft: "auto" }}
                      tooltipPosition="left"
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
