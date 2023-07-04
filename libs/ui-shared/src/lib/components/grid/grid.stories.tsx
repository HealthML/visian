import React from "react";

import { Grid, GridItem } from "./grid";

export default {
  component: Grid,
  title: "Grid",
};

export const primary = () => (
  <Grid>
    <GridItem label="Annotation" trailingIcon="eyeCrossed" />
    <GridItem label="Base Image" trailingIcon="eye" disableTrailingIcon />
    <GridItem label="Base Image II" trailingIcon="eye" disableTrailingIcon />
    <GridItem label="Annotation II" trailingIcon="eyeCrossed" />
    <GridItem label="Background" trailingIcon="eye" />
  </Grid>
);
