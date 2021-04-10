import React from "react";

import { List, ListItem } from "./list";

export default {
  component: List,
  title: "List",
};

export const primary = () => {
  return (
    <List>
      <ListItem label="Annotation" icon="eyeCrossed" />
      <ListItem label="Base Image" icon="eye" disableIcon />
      <ListItem label="Background" icon="eye" disableIcon isLast />
    </List>
  );
};
