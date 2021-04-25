import React from "react";

import { List, ListItem } from "./list";

export default {
  component: List,
  title: "List",
};

export const primary = () => {
  return (
    <List>
      <ListItem label="Annotation" trailingIcon="eyeCrossed" />
      <ListItem label="Base Image" trailingIcon="eye" disableTrailingIcon />
      <ListItem
        label="Background"
        trailingIcon="eye"
        disableTrailingIcon
        isLast
      />
    </List>
  );
};
