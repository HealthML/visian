import { Button, space, Text, Title } from "@visian/ui-shared";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  width: 100%;
  margin-top: 30vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const BackButton = styled(Button)`
  margin-top: ${space("pageSectionMargin")};

  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 21px;
    height: 21px;
  }
`;

const BackText = styled(Text)`
  margin-left: 14px;
`;

export const PageError = ({
  backPath,
  errorTx,
  error,
}: {
  backPath: string;
  errorTx?: string;
  error?: string;
}) => {
  const navigate = useNavigate();
  return (
    <Container>
      <Title tx="error" />
      <Text tx={errorTx}>{error}</Text>
      <BackButton
        icon="arrowBack"
        onPointerDown={() => navigate(backPath)}
        isActive={false}
      >
        <BackText tx="back" />
      </BackButton>
    </Container>
  );
};
