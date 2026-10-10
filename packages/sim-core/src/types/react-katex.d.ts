declare module "react-katex" {
  import React from "react";
  export interface BlockMathProps { math?: string; children?: React.ReactNode; renderError?: (error: Error | TypeError) => React.ReactNode; }
  export interface InlineMathProps { math?: string; children?: React.ReactNode; renderError?: (error: Error | TypeError) => React.ReactNode; }
  export const BlockMath: React.ComponentType<BlockMathProps>;
  export const InlineMath: React.ComponentType<InlineMathProps>;
}
