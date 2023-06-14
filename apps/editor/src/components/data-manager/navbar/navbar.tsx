import { FloatingUIButton } from "@visian/ui-shared";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;

  display: flex;
  justify-content: space-between;
  flex-direction: column;
`;

const Button = styled(FloatingUIButton)`
  margin-right: 16px;
`;

export const Navbar = ({ className }: { className?: string }) => {
  const navigate = useNavigate();
  return (
    <Container className={className}>
      <Button
        icon="home"
        tooltipTx="home"
        tooltipPosition="right"
        onPointerDown={() => navigate(`/projects`)}
        isActive={false}
      />
      <Button
        icon="pixelBrush"
        tooltipTx="open-editor"
        tooltipPosition="right"
        onPointerDown={() => navigate(`/editor`)}
        isActive={false}
      />
    </Container>
  );
};

export default Navbar;
