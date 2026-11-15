import React from "react";
import {
  Step1AccountPanel as InnerStep1AccountPanel,
  type Step1AccountPanelProps,
} from "@/domains/shop/components/register/step1/Step1AccountPanel";

export const Step1AccountPanel: React.FC<Step1AccountPanelProps> = (props) => {
  return <InnerStep1AccountPanel {...props} />;
};

export default Step1AccountPanel;
