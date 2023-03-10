import {
  InvisibleButton,
  List,
  ListItem,
  Text,
  useTranslation,
} from "@visian/ui-shared";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { useAnnotationsBy } from "../../../queries";
import { Annotation, Image } from "../../../types";

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
  toggleSelection,
}: {
  isInSelectMode: boolean;
  image: Image;
  refetchImages: () => void;
  isSelected: boolean;
  toggleSelection: () => void;
}) => {
  const {
    annotations,
    annotationsError,
    isErrorAnnotations,
    isLoadingAnnotations,
    refetchAnnotations,
  } = useAnnotationsBy(image.id);

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

  const configureEditorUrl = (
    img: Image | null,
    annotation: Annotation | null,
  ): string => {
    const query: string[] = [];
    if (img) {
      query.push(`imageId=${img.id}`);
    }
    if (annotation) {
      query.push(`annotationId=${annotation.id}`);
    }
    return `/editor?${query.join("&")}`;
  };

  const { t: translate } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <ListItem>
        {isInSelectMode && (
          <>
            <IconButton
              icon={isSelected ? "checked" : "unchecked"}
              onPointerDown={toggleSelection}
            />
            <Spacer />
          </>
        )}
        <ClickableText
          onClick={() => {
            navigate(configureEditorUrl(image, null));
          }}
        >
          {image.dataUri}
        </ClickableText>
        <ExpandedSpacer />
        <IconButton
          icon={showAnnotations ? "arrowDown" : "arrowLeft"}
          onPointerDown={toggleShowAnnotations}
        />
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
                      navigate(configureEditorUrl(image, annotation));
                    }}
                  >
                    {annotation.dataUri}
                  </ClickableText>
                </ListItem>
              ))}
            </AnnotationsList>
          )
        ))}
    </>
  );
};
