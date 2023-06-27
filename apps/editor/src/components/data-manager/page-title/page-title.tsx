import {
  FloatingUIButton,
  fontSize,
  LoadingBlock,
  space,
  Title,
  TitleLabel,
} from "@visian/ui-shared";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { PageTitleProps } from "./page-title.props";
import { useCallback } from "react";

const TitleContainer = styled.div`
  margin-bottom: ${space("pageSectionMargin")};
`;

const BackButton = styled(FloatingUIButton)`
  width: 40px;
  margin: 0;
  margin-bottom: ${space("pageSectionMargin")};
  margin-left: -9px;

  background: none;
  border: none;
  backdrop-filter: none;
`;

const TitleLoadingBlock = styled(LoadingBlock)`
  width: 250px;
  height: ${fontSize("title")};
`;

export const PageTitle = ({
  title,
  titleTx,
  label,
  labelTx,
  backPath,
  isLoading,
}: PageTitleProps) => {
  const navigate = useNavigate();
  const navigateBack = useCallback(
    () => backPath && navigate(backPath),
    [navigate, backPath],
  );
  return (
    <TitleContainer>
      {backPath && (
        <BackButton
          icon="arrowBack"
          tooltipTx="back"
          tooltipPosition="right"
          onPointerDown={navigateBack}
          isActive={false}
        />
      )}
      <TitleLabel tx={labelTx}>{label}</TitleLabel>
      {isLoading ? <TitleLoadingBlock /> : <Title tx={titleTx}>{title}</Title>}
    </TitleContainer>
  );
};
