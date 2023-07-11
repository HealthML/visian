import { space } from "@visian/ui-shared";
import styled from "styled-components";

import { Navbar } from "../navbar";

const PageContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  overflow-y: scroll;
  height: 100vh;
`;

const ScrollContainer = styled.div`
  width: 100%;
  max-width: 1200px;
`;

const Container = styled.div`
  width: 100%;
  margin: ${space("pageSectionMargin")} auto 0;
  padding: 0 ${space("pageSectionMargin")};
  box-sizing: border-box;
`;

const navbarWidth = 40;

const PaddedNavbar = styled(Navbar)`
  width: ${navbarWidth}px;
  overflow: hidden;
  padding: ${space("pageSectionMargin")};
`;

const LayoutPlaceholder = styled.div<{ fixedWidth?: boolean }>`
  --nav-width: calc(${space("pageSectionMargin")} + ${navbarWidth}px);

  max-width: var(--nav-width);
  width: ${({ fixedWidth }) => (fixedWidth ? "var(--nav-width)" : "auto")};
  flex: ${({ fixedWidth }) => (fixedWidth ? "0 0 auto" : "1 0 auto")}};

  visibility: hidden;
  height: 100px;
`;

// This component creates a layout where the navbar on the left scrolls with the page,
// but the main content is still centered in the middle. To achieve this, we use two
// invisible placeholders with the navbar width, where the left one behind the navbar
// does not shrink (hence keeping the main content from overflowing the navbar) and the
// right one does shrink as soon as it does not fit anymore.
export const Page = ({ children }: { children?: React.ReactNode }) => (
  <PageContainer>
    <PaddedNavbar />
    <LayoutPlaceholder fixedWidth />
    <ScrollContainer>
      <Container>{children}</Container>
    </ScrollContainer>
    <LayoutPlaceholder />
  </PageContainer>
);
