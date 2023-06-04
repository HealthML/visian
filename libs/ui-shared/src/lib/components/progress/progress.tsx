import React, { useRef, useState } from "react";
import styled from "styled-components";

import { color, fontSize, Theme } from "../../theme";
import { Text } from "../text";
import { ProgressProps } from "./progress.props";
import { ProgressTooltip } from "./progressTooltip";

const Container = styled.div`
  position: relative;

  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;

  width: 100%;
  height: 20px;
`;

const TotalBar = styled.div`
  grid-area: 1 / 1 / 2 / 2;

  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;

  overflow: hidden;
  background-color: ${color("veryLightGray")};
  border: 1px solid ${color("lightGray")};
  border-radius: 20px;
  transition: width 0.5s ease-in-out;

  min-width: 40px;
  max-width: 100%;

  /* Required to account for border width */
  box-sizing: border-box;

  /* Required so that z-index of label is relative to this container */
  z-index: 0;
`;

const BaseBackground = styled.div`
  background-color: ${color("background")};
  grid-area: 1 / 1 / 2 / 2;
`;

const Background = styled(BaseBackground)<{ barColor: keyof Theme["colors"] }>`
  background-color: ${({ barColor }) => color(barColor)};
  opacity: 0.3;
`;

const ColoredBar = styled(TotalBar)<{
  barColor: keyof Theme["colors"];
  width: number;
}>`
  width: ${({ width }) => width}%;
  border: 1px solid ${({ barColor }) => color(barColor)};
`;

const LabelContainer = styled.div`
  grid-area: 1 / 1 / 2 / 2;

  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  height: 100%;

  /* Required so that the < 0 opacity elements don't overlay the label */
  z-index: 1;
`;

const Label = styled(Text)`
  font-size: ${fontSize("small")};
  color: ${color("text")};
  margin-top: 1px;
  margin-right: 5px;
`;

export const Dot = styled.div<{ dotColor: keyof Theme["colors"] }>`
  background-color: ${({ dotColor }) => color(dotColor)};
  border-radius: 12px;
  width: 12px;
  height: 12px;
  margin-right: 5px;
`;

const Bar = ({
  width,
  barColor,
  label,
}: {
  width: number;
  barColor: keyof Theme["colors"];
  label: string;
}) => (
  <ColoredBar width={width} barColor={barColor}>
    <BaseBackground />
    <Background barColor={barColor} />
    <LabelContainer>
      <Label>{label}</Label>
      <Dot dotColor={barColor} />
    </LabelContainer>
  </ColoredBar>
);

export const Progress: React.FC<ProgressProps> = ({
  total,
  totalLabel,
  bars,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <Container
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      ref={containerRef}
    >
      <TotalBar>
        <LabelContainer>
          <Label>{total}</Label>
        </LabelContainer>
      </TotalBar>
      {bars
        ?.filter((bar) => bar.value > 0)
        .sort((a, b) => b.value - a.value)
        .map((bar) => (
          <Bar
            width={(bar.value / total) * 100}
            barColor={bar.color}
            label={bar.value.toString()}
          />
        ))}
      <ProgressTooltip
        totalLabel={totalLabel}
        total={total}
        bars={bars}
        anchor={containerRef.current}
        isShown={isHovered}
      />
    </Container>
  );
};
