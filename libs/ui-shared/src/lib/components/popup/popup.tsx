import React, { useRef } from "react";
import ReactDOM from "react-dom";
import styled, { css } from "styled-components";

import { PopUpProps } from "./popup.props";
import { stopPropagation } from "../../event-handling";
import { color, fontWeight, zIndex } from "../../theme";
import { useModalRoot } from "../box";
import { InvisibleButton } from "../button";
import { coverMixin } from "../mixins";
import { Sheet } from "../sheet";
import { Title } from "../text";
import { useOutsidePress } from "../utils";

const PopUpUnderlay = styled.div`
  ${coverMixin}

  align-items: center;
  background-color: ${color("modalUnderlay")};
  backdrop-filter: blur(3px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  pointer-events: auto;
  z-index: ${zIndex("overlay")};
`;
const PopUpContainer = styled(Sheet)<Pick<PopUpProps, "showUnderlay">>`
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  padding: 30px 40px;
  pointer-events: auto;
  overflow: hidden;

  z-index: ${zIndex("modal")};

  ${(props) =>
    !props.showUnderlay &&
    css`
      position: absolute;
    `}
`;
const PopUpTitle = styled(Title)`
  display: block;
  flex: 1;
  font-size: 28px;
  font-weight: ${fontWeight("regular")};
  line-height: 28px;
`;

const ExportFileName = styled(Title)`
  display: block;
  font-size: 28px;
  font-weight: ${fontWeight("regular")};
  line-height: 28px;
  color: ${color("lightText")};
`;

const TitleRow = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  margin-bottom: 30px;
  width: 100%;
`;

const CloseIcon = styled(InvisibleButton)`
  width: 30px;
  height: 30px;
`;

export const PopUp: React.FC<PopUpProps> = ({
  childrenBefore,
  titleTx,
  title,
  secondaryTitleTx,
  secondaryTitle,
  showUnderlay = true,
  isOpen,
  dismiss,
  shouldDismissOnOutsidePress,
  children,
  ...rest
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useOutsidePress(
    ref,
    shouldDismissOnOutsidePress ? dismiss : undefined,
    isOpen,
  );

  const modalRootRef = useModalRoot();

  const popup = (
    <PopUpContainer
      onWheel={stopPropagation}
      {...rest}
      ref={ref}
      showUnderlay={showUnderlay}
    >
      {(titleTx || title) && (
        <TitleRow>
          <PopUpTitle tx={titleTx} text={title} />
          <ExportFileName tx={secondaryTitleTx} text={secondaryTitle} />
          <CloseIcon icon="xSmall" onClick={dismiss} />
        </TitleRow>
      )}
      {children}
    </PopUpContainer>
  );

  const node =
    isOpen === false ? null : showUnderlay ? (
      <PopUpUnderlay onWheel={stopPropagation}>
        {childrenBefore}
        {popup}
      </PopUpUnderlay>
    ) : (
      popup
    );

  return modalRootRef.current
    ? ReactDOM.createPortal(node, modalRootRef.current)
    : node;
};
