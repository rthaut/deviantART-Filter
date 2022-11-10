import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import {
  Typography,
  Divider,
  Card,
  CardContent,
  CardActions,
  Button,
} from "@mui/material";

const DashboardFilterCard = ({ filterKey, title, link }) => {
  const [filterCount, setFilterCount] = useState(0);

  useEffect(() => {
    const getFilterCount = async () => {
      try {
        const data = await browser.storage.local.get(filterKey);
        setFilterCount(Array.from(data[filterKey] ?? [])?.length);
      } catch (ex) {
        // console.error(ex);
      }
    };
    getFilterCount();
  }, [setFilterCount, filterKey]);

  const onStorageChanged = (changes, areaName) => {
    if (areaName === "local" && Object.keys(changes).includes(filterKey)) {
      setFilterCount(changes[filterKey].newValue.length);
    }
  };

  useEffect(() => {
    if (!browser.storage.onChanged.hasListener(onStorageChanged)) {
      browser.storage.onChanged.addListener(onStorageChanged);
    }

    return () => {
      if (browser.storage.onChanged.hasListener(onStorageChanged)) {
        browser.storage.onChanged.removeListener(onStorageChanged);
      }
    };
  }, []);

  return (
    <Card>
      <CardContent>
        <Typography component="h2" variant="h6" gutterBottom>
          {browser.i18n.getMessage("FilterNameWithCount", [filterCount, title])}
        </Typography>
      </CardContent>
      <Divider variant="middle" />
      <CardActions>
        <Button color="primary" component={NavLink} to={link}>
          {browser.i18n.getMessage("ManageFilterText")}
        </Button>
      </CardActions>
    </Card>
  );
};

DashboardFilterCard.propTypes = {
  filterKey: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
};

export default DashboardFilterCard;
