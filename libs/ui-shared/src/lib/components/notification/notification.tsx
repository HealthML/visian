import React from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

import { color, fontWeight, noise, zIndex } from "../../theme";
import { useModalRoot } from "../box";
import { Sheet } from "../sheet";
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
  descriptionData,
  description,
  ...rest
}) => {
  const modalRootRef = useModalRoot();

  const node = (
    <NotificationContainer {...rest}>
      <NotificationTitle tx={titleTx} text={title} />
      <NotificationDescription
        tx={descriptionTx}
        data={descriptionData}
        text={description}
      />
    </NotificationContainer>
  );

  return modalRootRef.current
    ? ReactDOM.createPortal(node, modalRootRef.current)
    : node;
};
