import { css } from "styled-components";

import { color } from "../theme";

/**
 * A mixin that absolutely positions an element to cover the whole area of its
 * next relatively positioned parent.
 */
export const coverMixin = css`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`;

export const styledScrollbarMixin = css`
  /* width */
  ::-webkit-scrollbar {
    width: 4px;
    margin-bottom: 10px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: transparent;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: ${color("lightGray")};
    border-radius: 10px;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: ${color("gray")};
  }
`;
