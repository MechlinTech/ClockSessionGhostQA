import { Box, Grid, OutlinedInput, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { StyledTypography } from "./style";
import { Button, Divider } from "@mui/material";
import { header, headerForm } from "../../../utils/authheader";
import axios from "axios";
import { toast } from "react-toastify";
import { Delete, Edit } from "@material-ui/icons";
const BASE_URL = process.env.REACT_APP_BASE_URL;
export default function DataEntryPanel({ PerformanceFileId }) {
  const [testDataList, settestDataList] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [expandedAccord, setExpandedAccord] = useState("");
  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/Performance/GetTestDataByPerformanceFileId?PerformanceFileId=${PerformanceFileId}`,
        header()
      );
      // console.log("res", JSON.parse(response.data[3].JsonData));
      const resData = response.data;
      if(Array.isArray(resData)){
        settestDataList(resData.map((data)=>({...data, JsonData:JSON.parse(data.JsonData)})))
      }
        
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileChange = (event) => {
    // Get the selected file from the input event
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("Id", 0);
    formData.append("PerformanceFileId", PerformanceFileId);
    formData.append("file", selectedFile);
    submitTestData(formData);
    setSelectedFile(null)
  };

  const submitTestData = async (formData) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/Performance/AddTestData`,
        formData,
        headerForm()
      );
      if (res.data === "Success") {
        toast.info("Successfully saved", {
          style: {
            background: "rgb(101, 77, 247)",
            color: "rgb(255, 255, 255)",
          },
        });

        // Update propertyList after successful submission
        fetchData();
      }
    } catch (error) {
      console.log("error saving ", error);
      toast.error("Network error");
    }
  };
  const handleDelete = async (testId,event) => {
    event.stopPropagation()
    try {
      const res = await axios.post(
        `${BASE_URL}/Performance/DeleteTestData?Id=${testId}`,
        header()
      );

      if (res.data.status === "success") {
        toast.info("Successfully deleted", {
          style: {
            background: "rgb(101, 77, 247)",
            color: "rgb(255, 255, 255)",
          },
        });

        // Update propertyList after successful deletion
        fetchData();
      }
    } catch (error) {
      console.log("error deleting ", error);
      toast.error("Network error");
    }
  };
  const handleExpandAccord = (panel) => (e, isExpanded) => {
    setExpandedAccord(isExpanded ? panel : "");
  };
  return (
    <Box
      style={{
        border: "solid 2px #DADADA",
        borderRadius: "5px",
        padding: "10px",
      }}
    >
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Grid container spacing={1}>
            {testDataList?.map((test, index) => {
              return (
                <React.Fragment key={index}>
                  <Grid item xs={12} md={6}>
                    <Typography
                      style={{
                        fontSize: "12px",
                        color: "rgba(196, 196, 196, 0.8)",
                      }}
                    >
                      file name
                    </Typography>
                    <Box
                      style={{
                        padding: "15px 10px ",
                        border: "1px solid #DADADA",
                        width: "100%",
                      }}
                    >
                      <StyledTypography>{test.Name}</StyledTypography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography
                      style={{
                        fontSize: "12px",
                        color: "rgba(196, 196, 196, 0.8)",
                      }}
                    >
                      uploaded file
                    </Typography>
                    <Accordion
                      expanded={expandedAccord === test}
                      onChange={handleExpandAccord(test)}
                      key={index}
                      sx={{
                        boxShadow: "none",
                        border: "1px solid rgb(217, 217, 217)",
                        marginBottom: "3px",
                        // '&:hover': {
                        //   border: "2px solid rgb(101, 77, 247)",
                        // },
                      }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box
                          style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <StyledTypography>{test.Name}</StyledTypography>
                          <Box>
                            <Delete
                              style={{ color: "red" }}
                              onClick={(e) => handleDelete(test.Id,e)}
                            />
                            <Edit style={{ color: "blue" }} />
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: "0" }}>
                        <Divider />
                        {console.log('json',test.JsonData)}
                        <TableContainer
                          style={{
                            border: "solid 2px #DADADA",
                            borderRadius: "5px",
                          }}
                        >
                          <Table aria-label="simple table">
                            <TableHead>
                              <TableRow>
                                <TableCell> Name</TableCell>
                                <TableCell align="left">Numeric</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {test.JsonData?.map((item)=>(
                                <TableRow>
                                  <TableCell>{item.Name}</TableCell>
                                  <TableCell>{item.Numeric}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                </React.Fragment>
              );
            })}
          </Grid>
        </Grid>
        <Grid item xs={6}>
          <Typography
            style={{ fontSize: "12px", color: "rgba(196, 196, 196, 0.8)" }}
          >
            upload a file
          </Typography>
          <input
            accept=".csv"
            style={{ display: "none" }}
            id="file-input"
            type="file"
            onChange={handleFileChange}
          />
          <Box
            style={{
              width: "100%",
              border: "1px solid #DADADA",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <label htmlFor="file-input" >
              <StyledTypography sx={{cursor:'pointer', paddingLeft:'15px'}}>
              {selectedFile ? `${selectedFile.name}` : 'Add a File'}
                
              </StyledTypography>
            </label>

            <Tooltip title="Submit" placement="top">
            <Box
              variant="contained"
              color="primary"
              component="span"
              style={{
                borderRadius: "3px",
                padding: "5px 8px",
                fontSize: 25,
                backgroundColor: "rgb(101, 77, 247)",
                color: "#ffffff",
                cursor: "pointer",
              }}
              // disabled={!selectedFile}
              onClick={handleUpload}
            >
              +
            </Box>
            </Tooltip>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
