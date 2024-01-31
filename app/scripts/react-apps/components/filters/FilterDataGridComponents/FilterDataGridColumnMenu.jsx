import React from "react";
import { GridColumnMenu } from "@mui/x-data-grid";

export default function FilterDataGridColumnMenu(props) {
  return (
    <GridColumnMenu
      {...props}
      slots={{
        columnMenuColumnsItem: null,
      }}
    />
  );
}
