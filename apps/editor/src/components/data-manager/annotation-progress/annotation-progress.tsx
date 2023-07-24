import { Progress } from "@visian/mia-api";
import { Button, ProgressBar, Sheet, space, Text } from "@visian/ui-shared";
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

export const AnnotationProgress = ({
  progress,
  onReviewClick,
}: {
  progress: Progress;
  onReviewClick?: () => void;
}) => (
  <ProgressSheet>
    <ProgressTitle tx="annotated-verified-images" />
    <ProgressBar
      total={progress.totalImages}
      totalLabelTx="progress-total"
      bars={[
        {
          color: "green",
          labelTx: "progress-verified",
          value: progress.verifiedImages,
        },
        {
          color: "blueBorder",
          labelTx: "progress-annotated",
          value: progress.annotatedImages,
        },
      ]}
    />
    {onReviewClick && (
      <ProgressButton icon="play" onClick={onReviewClick}>
        <ButtonText tx="review-annotations" />
      </ProgressButton>
    )}
  </ProgressSheet>
);
