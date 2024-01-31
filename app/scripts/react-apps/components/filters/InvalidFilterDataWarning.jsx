import React, { useState } from "react";
import PropTypes from "prop-types";

import { useConfirm } from "material-ui-confirm";
import { useLocalStorage } from "react-use";

import Accordion from "@mui/material/Accordion";
import AccordionActions from "@mui/material/AccordionActions";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import DialogContentText from "@mui/material/DialogContentText";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import WarningIcon from "@mui/icons-material/Warning";

export default function InvalidFilterDataWarning({
  filterKey,
  idPropName,
  invalidFilters,
  purgeInvalidFilters,
}) {
  const confirm = useConfirm();

  const [ignore, setIgnore] = useLocalStorage(
    `ignore-invalid-${filterKey}-filters`,
    false,
  );

  // NOTE: can't just bind Accordion `defaultExpanded={!ignore}` as it must be fully controlled,
  // and we don't want to collapse the accordion as soon as the user checks the ignore checkbox
  const [expanded, setExpanded] = useState(!ignore);

  const onPurgeClick = () => {
    confirm({
      title: browser.i18n.getMessage("PurgeInvalidFilters_Dialog_Title"),
      content: (
        <DialogContentText
          dangerouslySetInnerHTML={{
            __html: browser.i18n.getMessage(
              "PurgeInvalidFilters_Dialog_Description",
            ),
          }}
        />
      ),
      // NOTE: swapping button order and appearance so that the "confirm" button is the encouraged choice
      buttonOrder: ["cancel", "confirm"],
      confirmationButtonProps: {
        autoFocus: true,
        color: "primary",
        variant: "contained",
      },
      cancellationButtonProps: {
        color: "primary",
        variant: "outlined",
      },
    })
      .then(() => purgeInvalidFilters())
      .catch(() => {});
  };

  return (
    <Accordion
      expanded={expanded}
      onChange={(event, isExpanded) => {
        setExpanded(isExpanded);
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" spacing={2}>
          <WarningIcon color="primary" />
          <Typography color="primary" fontWeight="bold">
            {browser.i18n.getMessage("InvalidFilterData_Warning_Title")}
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Typography
          paragraph
          dangerouslySetInnerHTML={{
            __html: browser.i18n.getMessage(
              "InvalidFilterData_Warning_Description_Line1",
            ),
          }}
        ></Typography>
        <Typography
          paragraph
          dangerouslySetInnerHTML={{
            __html: browser.i18n.getMessage(
              "InvalidFilterData_Warning_Description_Line2",
            ),
          }}
        ></Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  {browser.i18n.getMessage(
                    "InvalidFilterData_Table_ColumnHeader_RawFilterValue",
                  )}
                </TableCell>
                <TableCell align="right">
                  {browser.i18n.getMessage(
                    "InvalidFilterData_Table_ColumnHeader_Reason",
                  )}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invalidFilters.map(({ reason, filter }, index) => (
                <TableRow
                  key={index}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell>
                    <code>{JSON.stringify(filter)}</code>
                  </TableCell>
                  <TableCell style={{ width: "25%" }} align="right">
                    {browser.i18n.getMessage(
                      `InvalidFilterData_Table_ReasonText_${reason}`,
                      [idPropName],
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </AccordionDetails>
      <AccordionActions>
        <FormControlLabel
          control={
            <Checkbox
              checked={ignore}
              onChange={(event) => setIgnore(event.target.checked)}
            />
          }
          label={browser.i18n.getMessage(
            "InvalidFilterData_Warning_CheckboxLabel_Ignore",
          )}
          sx={{ marginLeft: 0, marginRight: "auto" }}
        />
        <Button variant="contained" onClick={onPurgeClick}>
          {browser.i18n.getMessage(
            "InvalidFilterData_ButtonLabel_PurgeFilters",
          )}
        </Button>
      </AccordionActions>
    </Accordion>
  );
}

InvalidFilterDataWarning.propTypes = {
  filterKey: PropTypes.string.isRequired,
  idPropName: PropTypes.string.isRequired,
  invalidFilters: PropTypes.arrayOf(PropTypes.any).isRequired,
  purgeInvalidFilters: PropTypes.func.isRequired,
};
