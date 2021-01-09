import React from "react";

import { Subtitle, Text, Title } from "./text";
import { TextProps } from "./text.props";

export default {
  component: Text,
  title: "Text",
  argTypes: {
    date: {
      control: {
        type: "date",
      },
    },
  },
};

export const primary = (args: TextProps) => {
  return <Text {...args} />;
};
primary.args = {
  text: "This is an example text.",
};

export const subtitle = (args: TextProps) => {
  return <Subtitle {...args} />;
};
subtitle.args = {
  text: "This is a Subtitle",
};

export const title = (args: TextProps) => {
  return <Title {...args} />;
};
title.args = {
  text: "This is a Title",
};

export const i18n = (args: TextProps) => {
  return <Text {...args} />;
};
i18n.storyName = "i18n";
i18n.args = {
  tx: "__test",
};

export const date = ({ date, ...args }: TextProps & { date: string }) => {
  return <Text {...args} data={{ date: new Date(date) }} />;
};
date.args = {
  tx: "date",
  date: new Date(),
};
