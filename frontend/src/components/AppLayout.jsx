import React from "react";
import { Outlet } from "react-router-dom";

import AppSidebar from "./AppSidebar";

function AppLayout() {
  return (
    <div className="crm-sidebar-layout">
      <AppSidebar />
      <div className="crm-sidebar-layout__content">
        <Outlet />
      </div>
    </div>
  );
}

export default AppLayout;
