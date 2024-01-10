import React, { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import styled, { useTheme } from "styled-components";

import { ProgressBarTooltip } from "./progress-bar-tooltip";
import { ProgressBarProps } from "./progress-bar.props";
import { color, fontSize, Theme } from "../../theme";
import { Text } from "../text";
import { usePreviousValue } from "../utils";

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;

  width: 100%;
  height: 25px;
`;

const TotalBar = styled.div`
  grid-area: 1 / 1 / 2 / 2;

  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;

  overflow: hidden;
  background-color: ${color("veryLightGray")};
  border: 1px solid ${color("lightGray")};
  border-radius: 25px;
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
  margin-right: 7px;
`;

export const Dot = styled.div<{ dotColor: keyof Theme["colors"] }>`
  background-color: ${({ dotColor }) => color(dotColor)};
  border-radius: 12px;
  width: 12px;
  height: 12px;
  margin-right: 7px;
`;

const Bar = ({
  width,
  barColor,
  label,
  showConfetti,
}: {
  width: number;
  barColor: keyof Theme["colors"];
  label: string;
  showConfetti?: boolean;
}) => {
  const theme = useTheme() as Theme;
  const dotRef = useRef<HTMLDivElement>(null);
  const [confettiSource, setConfettiSource] = useState<
    { x: number; y: number; w: number; h: number } | undefined
  >();
  const [isConfettiVisible, setIsConfettiVisible] = useState(false);

  const previousWidth = usePreviousValue(width);

  useEffect(() => {
    if (!dotRef.current || !previousWidth || !showConfetti) return;
    if (previousWidth < 100 && width === 100) {
      setTimeout(() => {
        setConfettiSource({
          x: dotRef.current?.offsetLeft || 0,
          y: dotRef.current?.offsetTop || 0,
          w: 0,
          h: 0,
        });
        setIsConfettiVisible(true);
      }, 500);
    }
  }, [previousWidth, width, dotRef, showConfetti]);

  return (
    <>
      {isConfettiVisible && (
        <Confetti
          colors={[color(barColor)({ theme })]}
          confettiSource={confettiSource}
          numberOfPieces={50}
          initialVelocityY={10}
          tweenDuration={100}
          recycle={false}
          style={{ zIndex: 1000 }}
        />
      )}
      <ColoredBar width={width} barColor={barColor}>
        <BaseBackground />
        <Background barColor={barColor} />
        <LabelContainer>
          <Label>{label}</Label>
          <Dot dotColor={barColor} ref={dotRef} />
        </LabelContainer>
      </ColoredBar>
    </>
  );
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  total,
  totalLabel,
  totalLabelTx,
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
        .sort((a, b) => {
          // We first sort by value and then by original index position.
          if (a.value > b.value) return -1;
          if (a.value < b.value) return 1;
          return bars.indexOf(b) - bars.indexOf(a);
        })
        .map((bar) => (
          <Bar
            width={(bar.value / total) * 100}
            barColor={bar.color}
            label={bar.value.toString()}
            showConfetti={bar.showConfetti}
            key={bar.labelTx}
          />
        ))}
      <ProgressBarTooltip
        totalLabel={totalLabel}
        totalLabelTx={totalLabelTx}
        total={total}
        bars={bars}
        anchor={containerRef.current}
        isShown={isHovered}
      />
    </Container>
  );
};
