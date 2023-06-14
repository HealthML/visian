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

const Container = styled.div`
  margin-bottom: ${space("pageSectionMargin")};
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

export const PageSectionIconButton = styled(InvisibleButton)`
  margin-left: ${space("pageSectionMarginSmall")};
  padding: 0;
  width: ${size("buttonHeight")};
  height: ${size("buttonHeight")};
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
}: {
  title?: string;
  titleTx?: string;
  info?: string;
  infoTx?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  showActions?: boolean;
  isLoading?: boolean;
}) => {
  const hasInfo = info || infoTx;
  return (
    <Container>
      <TopBar>
        <Subtitle tx={titleTx}>{title}</Subtitle>
        {showActions ? isLoading ? <ActionLoadingBlock /> : actions : null}
      </TopBar>
      {hasInfo ? (
        <InfoContainer>
          <Text tx={infoTx}>{info}</Text>
        </InfoContainer>
      ) : isLoading ? (
        <LoadingBlock height="200px" />
      ) : (
        children
      )}
    </Container>
  );
};
