import React from "react";
import PropTypes from "prop-types";

import { NavLink, useLocation } from "react-router-dom";

import {
  Divider,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import LabelIcon from "@mui/icons-material/Label";

const ListItemLink = React.forwardRef(function ListItemLink(
  { href, children, ...props },
  ref,
) {
  const { pathname } = useLocation();
  return (
    <ListItemButton
      ref={ref}
      component={NavLink}
      to={href}
      selected={pathname === href}
      {...props}
    >
      {children}
    </ListItemButton>
  );
});

ListItemLink.propTypes = {
  href: PropTypes.string.isRequired,
  children: PropTypes.node,
};

const SidebarMenu = () => {
  return (
    <>
      <List>
        <ListItemLink href="/">
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText
            primary={browser.i18n.getMessage("SidebarLink_Dashboard")}
          />
        </ListItemLink>
      </List>
      <Divider />
      <List>
        <ListItemLink href="/users">
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText
            primary={browser.i18n.getMessage("SidebarLink_Users")}
          />
        </ListItemLink>
        <ListItemLink href="/keywords">
          <ListItemIcon>
            <LabelIcon />
          </ListItemIcon>
          <ListItemText
            primary={browser.i18n.getMessage("SidebarLink_Keywords")}
          />
        </ListItemLink>
      </List>
    </>
  );
};

export default SidebarMenu;
