import React, { useCallback, useState } from "react";

import { Icon } from "../icon";
import { List, ListItem } from "./list";

export default {
  component: List,
  title: "List",
};

export const primary = () => {
  return (
    <List>
      <ListItem label="Annotation" icon="eyeCrossed" />
      <ListItem label="Base Image" icon="eye" iconDisabled />
      <ListItem label="Background" icon="eye" iconDisabled lastItem />
    </List>
  );
};
