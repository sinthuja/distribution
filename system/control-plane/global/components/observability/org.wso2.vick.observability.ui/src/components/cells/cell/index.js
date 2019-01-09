/*
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Button from "@material-ui/core/Button/Button";
import Details from "./Details";
import Grey from "@material-ui/core/colors/grey";
import HttpUtils from "../../../utils/api/httpUtils";
import {Link} from "react-router-dom";
import Metrics from "./Metrics";
import MicroserviceList from "./MicroserviceList";
import Paper from "@material-ui/core/Paper/Paper";
import React from "react";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import Timeline from "@material-ui/icons/Timeline";
import TopToolbar from "../../common/toptoolbar";
import {withStyles} from "@material-ui/core/styles";
import * as PropTypes from "prop-types";

const styles = (theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing.unit * 3,
        paddingTop: 0,
        margin: Number(theme.spacing.unit)
    },
    tabBar: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: theme.spacing.unit * 2,
        borderBottomWidth: 1,
        borderBottomStyle: "solid",
        borderBottomColor: Grey[200]
    },
    viewTracesContent: {
        paddingLeft: theme.spacing.unit
    },
    traceButton: {
        fontSize: 12
    }
});

class Cell extends React.Component {

    constructor(props) {
        super(props);

        this.tabContentRef = React.createRef();
        this.mounted = false;

        this.tabs = [
            "details",
            "microservices",
            "metrics"
        ];
        const queryParams = HttpUtils.parseQueryParams(props.location.search);
        const preSelectedTab = queryParams.tab ? this.tabs.indexOf(queryParams.tab) : null;

        this.state = {
            selectedTabIndex: (preSelectedTab ? preSelectedTab : 0)
        };
    }

    handleTabChange = (event, value) => {
        const {history, location, match} = this.props;

        this.setState({
            selectedTabIndex: value
        });

        // Updating the Browser URL
        const queryParams = HttpUtils.generateQueryParamString({
            tab: this.tabs[value]
        });
        history.replace(match.url + queryParams, {
            ...location.state
        });
    };

    handleOnUpdate = (isUserAction, startTime, endTime) => {
        if (this.tabContentRef.current && this.tabContentRef.current.update) {
            this.tabContentRef.current.update(isUserAction, startTime, endTime);
        }
    };

    render = () => {
        const {classes, match} = this.props;
        const {selectedTabIndex} = this.state;

        const cellName = match.params.cellName;

        const tabContent = [Details, MicroserviceList, Metrics];
        const SelectedTabContent = tabContent[selectedTabIndex];

        const traceSearch = {
            cell: cellName
        };
        return (
            <React.Fragment>
                <TopToolbar title={`${cellName}`} subTitle="- Cell" onUpdate={this.handleOnUpdate}/>
                <Paper className={classes.root}>
                    <div className={classes.tabBar}>
                        <Tabs value={selectedTabIndex} indicatorColor="primary"
                            onChange={this.handleTabChange} className={classes.tabs}>
                            <Tab label="Details"/>
                            <Tab label="Microservices"/>
                            <Tab label="Metrics"/>
                        </Tabs>
                        <Button className={classes.traceButton} component={Link} size="small"
                            to={`/tracing/search${HttpUtils.generateQueryParamString(traceSearch)}`}>
                            <Timeline/><span className={classes.viewTracesContent}>View Traces</span>
                        </Button>
                    </div>
                    <SelectedTabContent innerRef={this.tabContentRef} cell={cellName}/>
                </Paper>
            </React.Fragment>
        );
    };

}

Cell.propTypes = {
    classes: PropTypes.object.isRequired,
    match: PropTypes.shape({
        params: PropTypes.shape({
            cellName: PropTypes.string.isRequired
        }).isRequired
    }).isRequired,
    history: PropTypes.shape({
        replace: PropTypes.func.isRequired
    }),
    location: PropTypes.shape({
        search: PropTypes.string.isRequired
    }).isRequired
};

export default withStyles(styles)(Cell);