declare type DOMContainer = Element | Document;

declare var __DEV__: boolean;
declare var __SVG__: boolean;

declare type Props = { [key: string]: mixed } & {
  autoFocus?: boolean,
  children?: mixed,
  hidden?: boolean,
};

declare type HostContext = {
  isSvg: boolean,
};
