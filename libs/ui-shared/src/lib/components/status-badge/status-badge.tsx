import styled from "styled-components";
import { color, radius, Theme } from "../../theme";
import { ListItemLabel } from "../list";
import { StatusBadgeProps } from "./status-badge.props";

export const StatusBadgeContainer = styled.div<Pick<StatusBadgeProps, "color">>`
  box-sizing: border-box;
  padding: 1% 9%;
  width: 10em;
  height: fit-content;
  border-radius: ${radius("default")};
  background-color: ${(props) => color(props.color as keyof Theme["colors"])};
`;

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  color,
  text,
  tx,
}) => {
  return (
    <StatusBadgeContainer color={color}>
      <ListItemLabel tx={tx} text={text} />
    </StatusBadgeContainer>
  );
};

export default StatusBadge;
