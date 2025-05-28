import { useAtomValue, useSetAtom } from 'jotai';
import { tokenAtom, userAtom } from '@/store/atoms';
import { useRouter } from 'next/router';
import {
  Drawer,
  Box,
  Typography,
  Button,
  IconButton,
  Toolbar,
  AppBar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Menu,
  MenuItem,
  InputBase,
  Paper
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  MenuBook as MenuIcon,
  Inventory as InventoryIcon,
  BarChart as SalesIcon,
  AccessTime as ShiftsIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  AccessAlarm as AttendanceIcon
} from '@mui/icons-material';
import Image from 'next/image';
import logo from '/public/images/logo.png';
import { useEffect, useMemo, useState } from 'react';

export default function DashboardLayout({ children }) {
  const user = useAtomValue(userAtom);
  const token = useAtomValue(tokenAtom);
  const setUser = useSetAtom(userAtom);
  const setToken = useSetAtom(tokenAtom);
  const router = useRouter();
  const username = router.query.restaurantUsername;

  const isManager = user?.role === 'manager';

  const [anchorEl, setAnchorEl] = useState(null);
  const handleOpenNotifications = (event) => setAnchorEl(event.currentTarget);
  const handleCloseNotifications = () => setAnchorEl(null);

  const managerTabs = [
    { label: 'Overview', icon: <DashboardIcon />, path: '' },
    { label: 'Staff', icon: <PeopleIcon />, path: 'staff' },
    { label: 'Menu', icon: <MenuIcon />, path: 'menu' },
    { label: 'Ingredient', icon: <InventoryIcon />, path: 'ingredient' },
    { label: 'Sales', icon: <SalesIcon />, path: 'sales' },
    { label: 'Shifts', icon: <ShiftsIcon />, path: 'shifts' },
    { label: 'Settings', icon: <SettingsIcon />, path: 'settings' }
  ];

  const staffTabs = [
    { label: 'Overview', icon: <DashboardIcon />, path: '' },
    { label: 'Menu', icon: <MenuIcon />, path: 'menu' },
    { label: 'Attendance', icon: <AttendanceIcon />, path: 'attendance' },
    { label: 'Settings', icon: <SettingsIcon />, path: 'settings' }
  ];

  const visibleTabs = useMemo(() => (isManager ? managerTabs : staffTabs), [isManager]);
  const currentPath = router.asPath.split('/').pop();

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  const handleTabClick = (tabPath) => {
    router.push(`/${username}/dashboard${tabPath ? '/' + tabPath : ''}`);
  };

  useEffect(() => {
    if (!token || !user) {
      router.push('/login');
    }
  }, [token, user]);

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Drawer variant="permanent" anchor="left" sx={{ width: 240 }}>
        <Box sx={{ width: 240 }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <Image src={logo} alt="ChowHub" width={120} height={100} />
          </Box>
          <List>
            {visibleTabs.map((tab) => (
              <ListItem
                key={tab.label}
                onClick={() => handleTabClick(tab.path)}
                selected={currentPath === tab.path}
                sx={{ cursor: 'pointer' }}
              >
                <ListItemIcon>{tab.icon}</ListItemIcon>
                <ListItemText primary={tab.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            {/* Restaurant name + search */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                {user?.restaurantUsername || 'My Restaurant'}
              </Typography>
              <Paper
                component="form"
                sx={{
                  p: '4px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  width: 280,
                  borderRadius: '12px',
                  backgroundColor: '#f5f5f5'
                }}
              >
                <InputBase
                  sx={{ ml: 1, flex: 1 }}
                  placeholder="Search..."
                  inputProps={{ 'aria-label': 'search dashboard' }}
                />
              </Paper>
            </Box>

            {/* User / notifications / logout */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isManager && (
                <>
                  <IconButton onClick={handleOpenNotifications}>
                    <Badge color="error" variant="dot">
                      <NotificationsIcon color="action" />
                    </Badge>
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleCloseNotifications}
                  >
                    <MenuItem disabled>🔔 No new notifications</MenuItem>
                  </Menu>
                </>
              )}

              <Typography variant="body1" color="textSecondary">
                👤 {user?.firstName|| user?.username ||  user?.email}
              </Typography>
              <Button variant="outlined" size="small" color="error" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 3 }}>{children}</Box>
      </Box>
    </Box>
  );
}
