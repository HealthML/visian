import React, { useCallback, useState } from "react";

import { Modal } from "./modal";
import { ModalProps } from "./modal.props";

export default {
  component: Modal,
  title: "Modal",
};

export const primary = ({ ...args }: ModalProps) => {
  return <Modal {...args} />;
};
primary.args = {
  label: "Menu",
};
