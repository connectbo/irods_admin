import React, { useState } from 'react';

import BlockIcon from '@material-ui/icons/Block';

import Appbar from './Appbar';
import Sidebar from './Sidebar';
import Cookies from 'js-cookie';
import { makeStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';

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
    }
}));

function User() {
    const classes = useStyles();
    const token = Cookies.get('token');
    const [open, setOpen] = useState(false);
    const [user_type, setUserType] = useState();
    const isAuthenticated = token != null ? true : false;

    async function addUser() {
        handleOpen();
    }

    const handleUserType = event => {
        setUserType(event.target.value);
    }

    const handleOpen = () => {
        setOpen(true);
    }

    const handleClose = () => {
        setOpen(false);
    }

    return (
        <div>
            {isAuthenticated == true ? <div className={classes.root}>
                <Appbar />
                <Sidebar />
                <main className={classes.content}>
                    <div className={classes.toolbar} />
                    <div className={classes.main}>
                        <Button variant="outlined" color="primary" onClick={addUser}>
                            Add New User
                        </Button>
                        <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                            <DialogTitle>Add New User</DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    You can add a new user there.
                                </DialogContentText>
                                <TextField
                                    autoFocus
                                    id="name"
                                    label="Username"
                                />
                                <Select
                                    native
                                    value={user_type}
                                    onChange={handleUserType}
                                >
                                    <option aria-label="None" value="" />
                                    <option value="rodsadmin">rodsadmin</option>
                                    <option value="groupadmin">groupadmin</option>
                                    <option value="rodsuser">rodsuser</option>
                                </Select>
                            </DialogContent>
                        </Dialog>
                    </div>
                </main>
            </div> : <div className={classes.logout}><BlockIcon /><br /><div>Please <a href="http://localhost:3000/">login</a> to use the administration dashboard.</div></div>}
        </div>
    );
}

export default User;