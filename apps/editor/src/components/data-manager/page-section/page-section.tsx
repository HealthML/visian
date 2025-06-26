import {
  ButtonParam,
  InvisibleButton,
  LoadingBlock,
  Sheet,
  size,
  space,
  Subtitle,
  Text,
} from "@visian/ui-shared";
import styled from "styled-components";

import { PageSectionProps } from "./page-section.props";

const Container = styled.div`
  margin-bottom: ${space("pageSectionMargin")};
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${space("pageSectionMarginSmall")};
`;

const ActionLoadingBlock = styled(LoadingBlock)`
  width: 100px;
  height: ${space("pageSectionMargin")};
`;

const InfoContainer = styled(Sheet)`
  width: 100%;
  height: 150px;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const Hidden = styled.div`
  display: none;
`;

export const SectionSheet = styled(Sheet)`
  padding: ${space("pageSectionMarginSmall")};
  box-sizing: border-box;
`;

export const PageSectionIconButton = styled(InvisibleButton)`
  margin-left: ${space("pageSectionMarginSmall")};
  padding: 0;
  width: ${size("buttonHeight")};
  height: ${size("buttonHeight")};
`;

export const PaddedPageSectionIconButton = styled(PageSectionIconButton)`
  padding: 0 9px;
`;

export const PageSectionButton = styled(ButtonParam)`
  margin: 0px;
  width: auto;
`;

export const PageSection = ({
  title,
  titleTx,
  info,
  infoTx,
  children,
  actions,
  showActions = true,
  isLoading,
}: PageSectionProps) => {
  const hasInfo = info || infoTx;
  return (
    <Container>
      <TopBar>
        <Subtitle tx={titleTx}>{title}</Subtitle>
        {showActions ? isLoading ? <ActionLoadingBlock /> : actions : null}
      </TopBar>
      {hasInfo ? (
        <>
          <InfoContainer>
            <Text tx={infoTx}>{info}</Text>
          </InfoContainer>
          {/* We include but hide child components here to ensure that components relevant for
              actions (e.g. creation modals) are present even when info text is shown. */}
          <Hidden>{children}</Hidden>
        </>
      ) : isLoading ? (
        <LoadingBlock height="200px" />
      ) : (
        children
      )}
    </Container>
  );
};
