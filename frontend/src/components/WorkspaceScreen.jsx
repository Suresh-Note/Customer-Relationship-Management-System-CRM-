import React from "react";

import buildWorkspaceConfig from "../data/workspaceBuilders";
import { useCrmData } from "../hooks/useCrmData";
import ResourceWorkspace from "./ResourceWorkspace";

export default function WorkspaceScreen({ resource }) {
  const { data, apiStatus, usingFallback } = useCrmData();
  const config = buildWorkspaceConfig(resource, data, apiStatus, usingFallback);

  return <ResourceWorkspace config={config} />;
}
