import { space, Title } from "@visian/ui-shared";
import styled from "styled-components";

const TitleContainer = styled.div`
  padding: ${space("pageSectionMargin")} 0;
`;

const Transparent = styled.span`
  opacity: 0.5;
`;

export const MiaTitle = () => (
  <TitleContainer>
    <Title>
      MIA <Transparent>/ Medical Image Annotation Platform</Transparent>
    </Title>
  </TitleContainer>
);
