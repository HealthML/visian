import {
  FloatingUIButton,
  List,
  ListDivider,
  Sheet,
  useCtrlAPress,
  useShiftKey,
} from "@visian/ui-shared";
import { Fragment, useCallback, useState } from "react";
import styled from "styled-components";

import { Image } from "../../../types";
import { ImageListItem, SelectionCheckbox } from "./image-list-item";
import { ImageListProps } from "./image-list.props";

const Container = styled.div`
  width: 100%;
`;

const ListContainer = styled(Sheet)`
  box-sizing: border-box;
`;

const ListHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 0 13px 13px 13px;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  margin-left: 10px;
`;

const ActionButton = styled(FloatingUIButton)`
  margin: 0;
  margin-right: 11px;
`;

export const ImageList = ({
  images,
  showAnnotations,
  selectedImages,
  onSelect,
  onImageDelete,
  onAnnotationDelete,
  onStartJob,
  annotationsFilter,
}: ImageListProps) => {
  const deleteImage = useCallback(
    (image: Image) => onImageDelete && onImageDelete([image]),
    [onImageDelete],
  );
  const deleteSelectedImages = useCallback(
    () => onImageDelete && selectedImages && onImageDelete(selectedImages),
    [onImageDelete, selectedImages],
  );
  const startJobWithSelected = useCallback(
    () => onStartJob && selectedImages && onStartJob(selectedImages),
    [onStartJob, selectedImages],
  );

  const [lastSelectedIndex, setLastSelectedIndex] = useState<number>();
  const isShiftPressed = useShiftKey();

  const numberOfSelectedImages = selectedImages?.length || 0;
  const areAllSelected = numberOfSelectedImages === images.length;
  const areSomeSelected = numberOfSelectedImages > 0;
  const areNoneSelected = numberOfSelectedImages === 0;

  const selectImage = useCallback(
    (image: Image, index: number, selected: boolean) => {
      if (!onSelect || !selectedImages) return;
      if (isShiftPressed && lastSelectedIndex !== undefined) {
        const start = Math.min(lastSelectedIndex, index);
        const end = Math.max(lastSelectedIndex, index);
        const newSelectedImages = [...selectedImages];
        for (let i = start; i <= end; i++) {
          const img = images[i];
          if (!newSelectedImages.includes(img)) {
            newSelectedImages.push(img);
          }
        }
        onSelect(newSelectedImages);
      } else if (selected) {
        onSelect([...selectedImages, image]);
        setLastSelectedIndex(index);
      } else {
        onSelect([...selectedImages].filter((i) => i.id !== image.id));
      }
    },
    [images, isShiftPressed, lastSelectedIndex, onSelect, selectedImages],
  );

  const selectAll = useCallback(() => {
    if (!onSelect) return;
    if (areAllSelected) onSelect([]);
    else onSelect(images);
  }, [onSelect, areAllSelected, images]);

  useCtrlAPress(selectAll);

  return (
    <Container>
      {onSelect && (
        <ListHeader>
          <SelectionCheckbox
            icon={areAllSelected ? "checked" : "unchecked"}
            onPointerDown={selectAll}
            emphasized={areAllSelected}
          />
          <Actions>
            {onImageDelete && (
              <ActionButton
                icon="trashSmall"
                onPointerDown={deleteSelectedImages}
                isDisabled={areNoneSelected}
              />
            )}
            {onStartJob && (
              <ActionButton
                icon="mlAutoAnnotation"
                onPointerDown={startJobWithSelected}
                isDisabled={areNoneSelected}
              />
            )}
          </Actions>
        </ListHeader>
      )}
      <ListContainer>
        <List>
          {images.map((image: Image, index: number) => (
            <Fragment key={image.id}>
              <ImageListItem
                image={image}
                isSelected={selectedImages?.includes(image)}
                areSomeSelected={areSomeSelected}
                onDelete={onImageDelete && deleteImage}
                onSelect={
                  onSelect &&
                  ((selected) => selectImage(image, index, selected))
                }
                showAnnotations={showAnnotations}
                onAnnotationDelete={onAnnotationDelete}
                annotationsFilter={annotationsFilter}
              />
              {index !== images.length - 1 && <ListDivider />}
            </Fragment>
          ))}
        </List>
      </ListContainer>
    </Container>
  );
};
