import styled from "styled-components";

import { color as getColor, radius, Theme } from "../../theme";
import { ListItemLabel } from "../list";
import { StatusBadgeProps } from "./status-badge.props";

export const StatusBadgeContainer = styled.div<
  Pick<StatusBadgeProps, "color" | "borderColor">
>`
  box-sizing: border-box;
  display: inline-block;
  text-align: center;
  padding: 0.1em 1em;
  width: fit-content;
  height: fit-content;
  border-radius: ${radius("default")};
  border: 1px solid;
  border-color: ${(props) =>
    getColor(props.borderColor as keyof Theme["colors"])};
  background-color: ${(props) =>
    getColor(props.color as keyof Theme["colors"])};
`;

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  color,
  borderColor,
  text,
  tx,
}) => {
  const lineColor = borderColor ?? "rgba(0, 0, 0, 0)";
  const backgroundColor = color ?? "rgba(0, 0, 0, 0)";
  return (
    <StatusBadgeContainer color={backgroundColor} borderColor={lineColor}>
      <ListItemLabel tx={tx} text={text} />
    </StatusBadgeContainer>
  );
};

export default styled(StatusBadge)``;
