import React from "react";
import styled from "styled-components";

import { color, fontWeight, zIndex } from "../../theme";
import { Sheet } from "../sheet";
import noise from "../sheet/noise.png";
import { Title } from "../text";
import { NotificationProps } from "./notification.props";

const NotificationContainer = styled(Sheet)`
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  padding: 14px 20px 14px 20px;

  background: url(${noise}) left top repeat, ${color("redSheet")};
  border: 1px solid ${color("redBorder")};

  z-index: ${zIndex("notification")};
`;

const NotificationTitle = styled(Title)`
  font-size: 20px;
  line-height: 20px;
  font-weight: ${fontWeight("regular")};
  margin-bottom: 8px;
  color: ${color("text")};
`;

const NotificationDescription = styled(Title)`
  font-size: 16px;
  line-height: 16px;
  font-weight: ${fontWeight("default")};
  color: ${color("lightText")};
`;

export const Notification: React.FC<NotificationProps> = ({
  titleTx,
  title,
  descriptionTx,
  description,
  ...rest
}) => (
  <NotificationContainer {...rest}>
    <NotificationTitle tx={titleTx} text={title} />
    <NotificationDescription tx={descriptionTx} text={description} />
  </NotificationContainer>
);
