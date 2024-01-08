import { color, InvisibleButton, ListDivider, Text } from "@visian/ui-shared";
import { MiaAnnotation } from "@visian/utils";
import { Fragment, useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { useStore } from "../../../app/root-store";
import { MiaReviewStrategy, TaskType } from "../../../models/review-strategy";
import { useAnnotationsByImage } from "../../../queries";
import { ImageListItemProps } from "./image-list-item.props";

const CollapseButton = styled(InvisibleButton)<{ isOpen: boolean }>`
  width: 20px;
  margin-right: 8px;
  transform: rotate(${({ isOpen }) => (isOpen ? "90deg" : "0deg")});
  transition: transform 0.1s ease-in-out;
`;

export const SelectionCheckbox = styled(InvisibleButton)<{
  emphasized?: boolean;
  largerMargin?: boolean;
}>`
  width: 18px;
  margin-right: ${({ largerMargin }) => (largerMargin ? "12px" : "8px")};
  opacity: ${({ emphasized }) => (emphasized ? 1 : 0.4)};
  transition: opacity 0.1s ease-in-out;
`;

const IconButton = styled(InvisibleButton)`
  width: 20px;
  height: 20px;
`;

const VerifiedDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${color("Neuronic Neon")};
  margin: 0 10px;
`;

const ClickableText = styled(Text)`
  cursor: pointer;
`;

const Actions = styled.div`
  flex-grow: 1;
  display: flex;
  justify-content: flex-end;
`;

const TrashButton = styled(IconButton)`
  opacity: 0;
  transition: opacity 0.1s ease-in-out;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 12px;

  &:hover ${TrashButton} {
    opacity: 1;
  }
`;

// Add padding for list padding, collapsible width, collapsible margin, optionally checkbox size:
const AnnotationRow = styled(Row)<{ addCheckboxMargin?: boolean }>`
  padding-left: calc(
    12px + 8px + 20px +
      ${({ addCheckboxMargin }) => (addCheckboxMargin ? "26px" : "0px")}
  );
`;

const AnnotationListDivider = styled(ListDivider)<{
  addCheckboxMargin?: boolean;
}>`
  margin-left: calc(
    12px + 8px + 20px +
      ${({ addCheckboxMargin }) => (addCheckboxMargin ? "26px" : "0px")}
  );
  width: auto;
`;

export const ImageListItem = ({
  image,
  areSomeSelected,
  isSelectionHovered,
  isSelected,
  onSelect,
  onDelete,
  showAnnotations,
  onAnnotationDelete,
  annotationsFilter,
}: ImageListItemProps) => {
  const { data: allAnnotations } = useAnnotationsByImage(image.id);
  const annotations = allAnnotations?.filter((a: MiaAnnotation) =>
    annotationsFilter ? annotationsFilter(a) : true,
  );
  const [areAnnotationsOpen, setAnnotationsOpen] = useState(false);

  const navigate = useNavigate();

  const hasVerifiedAnnotation = useMemo(
    () =>
      annotations?.some((annotation: MiaAnnotation) => annotation.verified) ??
      false,
    [annotations],
  );

  const toggleShowAnnotations = useCallback(
    () => setAnnotationsOpen(!areAnnotationsOpen),
    [areAnnotationsOpen],
  );

  const selectImage = useCallback(() => {
    if (onSelect) onSelect(!isSelected);
  }, [onSelect, isSelected]);

  const store = useStore();
  const startReviewWithAnnotation = useCallback(
    async (id: string) => {
      store?.startReview(
        () => MiaReviewStrategy.fromAnnotationId(store, id, TaskType.Create),
        navigate,
      );
    },
    [store, navigate],
  );
  const startReviewWithImage = useCallback(() => {
    store?.startReview(
      () =>
        MiaReviewStrategy.fromImageIds(
          store,
          [image.id],
          TaskType.Create,
          annotations?.map((a) => a.id),
        ),
      navigate,
    );
  }, [store, navigate, image.id, annotations]);

  return (
    <>
      <Row>
        {onSelect && (
          <SelectionCheckbox
            icon={isSelected ? "checked" : "unchecked"}
            onPointerDown={selectImage}
            emphasized={isSelected || isSelectionHovered}
            largerMargin={!showAnnotations}
          />
        )}
        {showAnnotations && (
          <CollapseButton
            icon="collapseClosed"
            onPointerDown={toggleShowAnnotations}
            isOpen={areAnnotationsOpen}
            isDisabled={!annotations?.length}
          />
        )}
        <ClickableText title={image.dataUri} onClick={startReviewWithImage}>
          {image.dataUri.split("/").pop()}
        </ClickableText>
        {hasVerifiedAnnotation && <VerifiedDot />}
        <Actions>
          {!areSomeSelected && onDelete && (
            <TrashButton
              icon="trashSmall"
              tooltipTx="delete-image-title"
              onPointerDown={() => onDelete(image)}
              tooltipPosition="left"
            />
          )}
        </Actions>
      </Row>
      {areAnnotationsOpen &&
        annotations &&
        annotations.map((annotation, index) => (
          <Fragment key={annotation.id}>
            {index === 0 && <ListDivider />}
            <AnnotationRow addCheckboxMargin={!!onSelect}>
              <ClickableText
                title={annotation.dataUri}
                onClick={() => startReviewWithAnnotation(annotation.id)}
              >
                {annotation.dataUri.split("/").pop()}
              </ClickableText>
              {annotation.verified && <VerifiedDot />}
              <Actions>
                {!areSomeSelected && onAnnotationDelete && (
                  <TrashButton
                    icon="trashSmall"
                    tooltipTx="delete-annotation-title"
                    onPointerDown={() => onAnnotationDelete(annotation)}
                  />
                )}
              </Actions>
            </AnnotationRow>
            {index !== annotations.length - 1 && (
              <AnnotationListDivider addCheckboxMargin={!!onSelect} />
            )}
          </Fragment>
        ))}
    </>
  );
};
