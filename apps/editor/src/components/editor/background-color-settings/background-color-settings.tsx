import { Modal, SliderField } from "@visian/ui-shared";
import React from "react";

export const BackgroundColorSettings: React.FC = () => (
  <Modal labelTx="background-color">
    <SliderField labelTx="Color" showValueLabel min={0} max={2} />
  </Modal>
);
