import React, { useCallback, useState } from "react";

import { Notification } from "./notification";
import { NotificationProps } from "./notification.props";

export default {
  component: Notification,
  title: "Notification",
};

export const primary = ({ ...args }: NotificationProps) => {
  return <Notification {...args} />;
};
primary.args = {
  title: "Oops! That’s the wrong file...",
  description: "We can’t import .mp4 yet - choose another!",
};
