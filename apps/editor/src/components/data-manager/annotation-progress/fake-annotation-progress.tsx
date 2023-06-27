import {
  Button,
  Progress as ProgressBar,
  Sheet,
  space,
  Text,
} from "@visian/ui-shared";
import { useEffect, useState } from "react";
import styled from "styled-components";

const ProgressSheet = styled(Sheet)`
  padding: ${space("pageSectionMarginSmall")};
  display: flex;
  align-items: start;
`;

const ProgressTitle = styled(Text)`
  margin-bottom: ${space("pageSectionMarginSmall")};
  font-size: 15pt;
`;

const ProgressButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: end;
  margin-top: ${space("pageSectionMarginSmall")};

  svg {
    width: 32px;
    height: 32px;
    margin-left: -7px;
  }
`;

const ButtonText = styled(Text)`
  margin-left: 7px;
`;

function lerp(start: number, end: number, t: number) {
  return start * (1 - t) + end * t;
}

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

export const FakeAnnotationProgress = ({
  total,
  annotated,
  verified,
  msTime,
}: {
  total: number;
  annotated?: number;
  verified?: number;
  msTime: number;
}) => {
  const [verifiedImages, setVerifiedImages] = useState(0);
  const [annotatedImages, setAnnotatedImages] = useState(0);

  useEffect(() => {
    if (annotated !== undefined && verified !== undefined) {
      setVerifiedImages(verified);
      setAnnotatedImages(annotated);
      return;
    }

    const startTime = Date.now();
    const endTime = startTime + msTime;
    const interval = setInterval(() => {
      const now = Date.now();
      const t = (now - startTime) / (endTime - startTime);
      if (t >= 1) {
        clearInterval(interval);
        setVerifiedImages(total);
        setAnnotatedImages(total);
      } else {
        setVerifiedImages(Math.round(lerp(0, total, easeInOut(t * 0.8))));
        setAnnotatedImages(Math.round(lerp(0, total, easeInOut(t))));
      }
    }, 100);
  }, [total, msTime, annotated, verified]);

  return (
    <ProgressSheet>
      <ProgressTitle tx="annotated-verified-images" />
      <ProgressBar
        total={total}
        totalLabelTx="progress-total"
        bars={[
          {
            color: "green",
            labelTx: "progress-verified",
            value: verifiedImages,
          },
          {
            color: "blueBorder",
            labelTx: "progress-annotated",
            value: annotatedImages,
          },
        ]}
      />
      <ProgressButton icon="play">
        <ButtonText tx="review-annotations" />
      </ProgressButton>
    </ProgressSheet>
  );
};
