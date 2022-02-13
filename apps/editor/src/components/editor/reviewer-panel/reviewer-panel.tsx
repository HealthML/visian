import {
  BooleanParam,
  Divider,
  Modal,
  NumberParam,
  TaskType,
} from "@visian/ui-shared";
import { observer } from "mobx-react-lite";
import React, { useCallback, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useStore } from "../../../app/root-store";

const scaleAnimationIn = keyframes`
  0% {
    opacity: 0;
    animation-timing-function: ease-in;
  }
  100% {
    opacity: 1;
  }
`;

const UnificationOptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  animation: ${scaleAnimationIn} 0.5s;
`;

export const ReviewerPanel = observer(() => {
  const store = useStore();
  if (!(store?.currentTask?.kind === TaskType.Correct)) return <></>;

  const [shouldUnifyAnnotations, setShouldUnifyAnnotations] = useState(false);
  const [
    shouldShowAnnotationDensity,
    setShouldShowAnnotationDensity,
  ] = useState(false);
  const setAnnotationConsensus = useCallback(
    (value: number) => {
      store?.editor.activeDocument?.setAnnotationConsensusCount(value);
    },
    [store?.editor.activeDocument],
  );

  return (
    <Modal labelTx="annotations">
      <BooleanParam
        labelTx="unify-annotations"
        value={shouldUnifyAnnotations}
        setValue={() => {
          setShouldUnifyAnnotations(!shouldUnifyAnnotations);
        }}
      />
      {shouldUnifyAnnotations && (
        <UnificationOptionsContainer>
          <Divider />
          <NumberParam
            labelTx="annotation-consensus"
            min={1}
            max={Math.max(store.currentTask.annotations.length, 1)}
            stepSize={1}
            value={store?.editor.activeDocument?.annotationConsensusCount}
            setValue={setAnnotationConsensus}
          />
          <Divider />
          <BooleanParam
            labelTx="show-annotation-density"
            value={shouldShowAnnotationDensity}
            setValue={() => {
              setShouldShowAnnotationDensity(!shouldShowAnnotationDensity);
            }}
          />
        </UnificationOptionsContainer>
      )}
    </Modal>
  );
});
