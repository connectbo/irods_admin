import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { Link } from '@reach/router'

import { BlockIcon } from '@material-ui/icons';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import Appbar from '../components/Appbar';
import Sidebar from '../components/Sidebar';
import Cookies from 'js-cookie';
import { LinearProgress } from '@material-ui/core';
import { makeStyles, Tab, Typography } from '@material-ui/core';
import { Button, Checkbox, FormControl, TextField, InputLabel, Select } from '@material-ui/core';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Paper } from '@material-ui/core';

import { useServer } from '../contexts/ServerContext';
import { useEnvironment } from '../contexts/EnvironmentContext';

import Pagination from '@material-ui/lab/Pagination';
import { StylesProvider } from '@material-ui/core/styles';
import '../App.css';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    toolbar: theme.mixins.toolbar,
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing(3),
    },
    main: {
        whiteSpace: "pre-wrap",
        fontSize: 20
    },
    logout: {
        marginTop: theme.spacing(20),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontSize: theme.spacing(3)
    },
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        minWidth: 200
    },
    link_button: {
        textDecoration: 'none'
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120
    },
    table: {
        minWidth: 650
    },
    user_table: {
        maxWidth: 650
    },
    tableContainer: {
        marginTop: 20
    },
    errorMsg: {
        color: 'red'
    },
    pagination: {
        display: 'flex',
        flexDirection: 'row',
        margin: theme.spacing(1),
        justifyContent: 'center'
    },
    pagination_item: {
        transitionDuration: '1.5s'
    },
    search: {
        marginLeft: 30,
        width: 200
    },
    add_button: {
        marginLeft: 30
    },
    itemsControl: {
        marginLeft: 30,
        minWidth: 120
    }
}));

function Group() {
    const classes = useStyles();
    const token = Cookies.get('token');
    const server = useServer();
    const environment = useEnvironment();

    const [isLoading, setLoading] = useState(false);

    const [errorMsg, setErrorMsg] = useState();
    const [addFormOpen, setAddFormOpen] = useState(false);
    const [addGroupName, setAddGroupName] = useState();
    const [addGroupZoneName, setAddGroupZoneName] = useState();
    const [addGroupUsers, setAddGroupUsers] = useState([]);
    const [groups, setGroup] = useState([]);
    const [users, setUsers] = useState([]);
    const [currGroup, setCurrGroup] = useState([]);


    const [searchGroupName, setSearchName] = useState();
    let group_id = 0;
    const isAuthenticated = token != null ? true : false;

    const [zone, setZone] = useState(localStorage.getItem('zoneName'));
    const [currPage, setCurrPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalPage, setTotalPage] = useState();

    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState(0);


    useEffect(() => {
        loadContent(currPage, perPage);
    }, [currPage, perPage, searchGroupName])

    useEffect(() => {
        if (groups.length !== 0) {
            const sortedArray = [...groups];
            sortedArray.sort(getComparator(order, orderBy));
            setGroup(sortedArray);
            console.log(sortedArray);
        }
    }, [order, orderBy])

    function descendingComparator(a, b, orderBy) {
        if (b[orderBy] < a[orderBy]) {
            return -1;
        }
        if (b[orderBy] > a[orderBy]) {
            return 1;
        }
        return 0;
    }

    function getComparator(order, orderBy) {
        return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
    }

    const loadContent = async (prop) => {
        console.log(server)
        let _query;
        if (searchGroupName == undefined) {
            _query = `SELECT USER_NAME, USER_TYPE WHERE USER_TYPE = 'rodsgroup'`
        }
        else {
            _query = `SELECT USER_NAME, USER_TYPE WHERE USER_TYPE = 'rodsgroup' and USER_NAME LIKE '%${searchGroupName}%'`
        }
        const groupResult = axios({
            method: 'GET',
            url: `${environment.restApiLocation}/irods-rest/1.0.0/query`,
            headers: {
                'Authorization': Cookies.get('token')
            },
            params: {
                query_string: _query,
                query_limit: perPage,
                row_offset: (currPage - 1) * perPage,
                query_type: 'general'
            }
        }).then((res) => {
            let sortedArray = res.data._embedded;
            sortedArray.sort();
            setGroup(sortedArray);
            setTotalPage(Math.ceil(res.data.total / perPage));
        }).catch((e) => {
        });
    }

    const updateContent = () => {
        server.updateGroup();
        loadContent();
    }

    async function addGroup() {
        try {
            const addGroupResult = await axios({
                method: 'POST',
                url: `${environment.restApiLocation}/irods-rest/1.0.0/admin`,
                params: {
                    action: 'add',
                    target: 'user',
                    arg2: addGroupName,
                    arg3: 'rodsgroup',
                    arg4: addGroupZoneName,
                    arg5: ''
                },
                headers: {
                    'Authorization': token,
                    'Accept': 'application/json'
                }
            }).then(res => {
                window.location.reload();
                console.log(res);
            })
        }
        catch (e) {
            setErrorMsg("Cannot add new group. Please check your group name or zone name.")
            console.log(e);
        }
    }

    async function removeGroup() {
        try {
            const addGroupResult = await axios({
                method: 'POST',
                url: `${environment.restApiLocation}/irods-rest/1.0.0/admin`,
                params: {
                    action: 'rm',
                    target: 'user',
                    arg2: currGroup[0],
                    arg3: zone,
                },
                headers: {
                    'Authorization': token,
                    'Accept': 'application/json'
                }
            }).then(res => {
                console.log(res);
                window.location.reload();
            })
        } catch (e) {
            console.log(e);
        }
    }

    const handlecurrentGroup = event => {
        if (event.target.id !== '') {
            setCurrGroup(groups[event.target.id]);
            console.log(groups[event.target.id]);
        }
    }

    const selectUser = event => {
        let _index = addGroupUsers.indexOf(users[event.target.id]);
        if (_index == -1) {
            let addArray = [...addGroupUsers];
            addArray.push(users[event.target.id]);
            setAddGroupUsers(addArray);
        }
        else {
            const oldArray = [...addGroupUsers];
            const newArray = oldArray.filter(user => {
                return user[0] != users[event.target.id][0];
            })
            setAddGroupUsers(newArray);
        }
    }

    const handleAddFormOpen = () => {
        setAddFormOpen(true);
    }

    const handleAddFormClose = () => {
        setAddFormOpen(false);
    }

    const handleAddGroupName = event => {
        setAddGroupName(event.target.value);
    }

    const handleAddZoneName = event => {
        setAddGroupZoneName(event.target.value);
    }

    const handlePageChange = (event, value) => {
        setCurrPage(value);
    }

    const handleSort = props => {
        const isAsc = orderBy === props && order == 'desc';
        setOrder(isAsc ? 'asc' : 'desc');
        setOrderBy(props);
    }

    return (
        <div>
            {isAuthenticated == true ? <div className={classes.root}>
                <Appbar />
                <Sidebar menu_id="2" />
                <main className={classes.content}>
                    <div className={classes.toolbar} />
                    <div className={classes.main}>
                        <div className={classes.pagination}>
                            <Pagination className={classes.pagination_item} count={totalPage} onChange={handlePageChange} />
                            <FormControl className={classes.itemsControl}>
                                <InputLabel htmlFor="items-per-page">Items Per Page</InputLabel>
                                <Select
                                    native
                                    id="items-per-page"
                                    label="Items Per Page"
                                    onChange={(event) => { setPerPage(event.target.value); setCurrPage(1); }}
                                >
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </Select>
                            </FormControl>
                            <TextField
                                className={classes.search}
                                id="search-term"
                                label="Search"
                                placeholder="Search by GroupName"
                                onChange={(event) => setSearchName(event.target.value)}
                            />
                            <Button className={classes.add_button} variant="outlined" color="primary" onClick={handleAddFormOpen}>
                                Add New Group
                        </Button>
                        </div>
                        <TableContainer className={classes.tableContainer} component={Paper}>
                            <Table className={classes.table} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={{ fontSize: '1.1rem', width: '20%' }}><b>Group Name</b><TableSortLabel active={orderBy === 0} direction={orderBy === 0 ? order : 'asc'} onClick={() => { handleSort(0) }} /></TableCell>
                                        <TableCell style={{ fontSize: '1.1rem', width: '20%' }} align="right"><b>Action</b></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {groups.map(group =>
                                        <TableRow key={group_id}>
                                            <TableCell style={{ fontSize: '1.1rem', width: '20%' }} component="th" scope="row">{group[0]}</TableCell>
                                            <TableCell style={{ fontSize: '1.1rem', width: '20%' }} align='right'><Link className={classes.link_button} to='/group/edit' state={{ groupInfo: group }}><Button color="primary">Edit</Button></Link> {group[0] == 'public' ? <span id={group_id++}></span> : <Button id={group_id++} color="secondary" onMouseOver={handlecurrentGroup} onClick={removeGroup}>Remove</Button>}</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Dialog open={addFormOpen} className={classes.formContainer} onClose={handleAddFormClose} aria-labelledby="form-dialog-title">
                            <DialogTitle>Add New Group</DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    Enter your group and zone name:
                                </DialogContentText>
                                <form className={classes.container}>
                                    <FormControl className={classes.formControl}>
                                        <TextField
                                            native
                                            id="name"
                                            label="Group Name"
                                            onChange={handleAddGroupName}
                                        />
                                    </FormControl>
                                    <FormControl className={classes.formControl}>
                                        <InputLabel htmlFor="group-zone-select">Zone Name</InputLabel>
                                        <Select
                                            native
                                            id="zone"
                                            label="Zone Name"
                                            onChange={handleAddZoneName}
                                            defaultValue={zone}
                                        >
                                            <option value={zone} selected>{zone}</option>
                                        </Select>
                                    </FormControl>
                                </form>
                                <br />
                                <p className={classes.errorMsg}>{errorMsg}</p>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={addGroup} color="primary">Save</Button>
                                <Button onClick={handleAddFormClose} color="primary">Cancel</Button>
                            </DialogActions>
                        </Dialog>
                    </div>
                </main>
            </div> : <div className={classes.logout}><BlockIcon /><br /><div>Please <a href={window.location.origin}>login</a> to use the administration dashboard.</div></div>
            }
        </div >
    );
}

export default Group;