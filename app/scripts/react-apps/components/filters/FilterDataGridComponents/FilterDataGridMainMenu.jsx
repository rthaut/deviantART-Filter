import React, { useState } from "react";
import PropTypes from "prop-types";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ArchiveIcon from "@mui/icons-material/Archive";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export default function FilterDataGridMainMenu({
  title,
  onExportClick,
  onResetClick,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        id={`${title.toLowerCase()}-filter-menu-button`}
        aria-controls={open ? `${title.toLowerCase()}-filter-menu` : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id={`${title.toLowerCase()}-filter-menu`}
        open={open}
        onClose={handleClose}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        MenuListProps={{
          "aria-labelledby": `${title.toLowerCase()}-filter-menu-button`,
        }}
      >
        <MenuItem
          onClick={() => {
            onExportClick();
            handleClose();
          }}
        >
          <ListItemIcon>
            <ArchiveIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            {browser.i18n.getMessage("FilterDataGrid_MenuLabel_ExportAll", [
              title.toLowerCase(),
            ])}
          </ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            onResetClick();
            handleClose();
          }}
        >
          <ListItemIcon>
            <DeleteSweepIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            {browser.i18n.getMessage("FilterDataGrid_MenuLabel_DeleteAll", [
              title.toLowerCase(),
            ])}
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
FilterDataGridMainMenu.propTypes = {
  title: PropTypes.string.isRequired,
  onExportClick: PropTypes.func.isRequired,
  onResetClick: PropTypes.func.isRequired,
};
