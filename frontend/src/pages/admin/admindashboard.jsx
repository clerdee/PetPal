// src/pages/admin/admindashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx'; 
import axios from 'axios';
import Loader from '../../layout/Loader.jsx';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar 
} from 'recharts'; 
import { Box, Typography, Paper, Grid, Button, TextField } from '@mui/material';

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// --- 1. Chart Components (Moved from AdminCharts.jsx) ---
const MonthlySalesChart = ({ data }) => {
    const formattedData = data.map(item => ({
        ...item,
        name: `${monthNames[item._id.month - 1]} ${item._id.year}`
    }));
    return (
        <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>Monthly Sales Trend</Typography>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={formattedData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `₱${value.toLocaleString()}`} />
                    <Tooltip formatter={(value) => [`₱${value.toLocaleString()}`, 'Revenue']} />
                    <Legend />
                    <Line type="monotone" dataKey="totalSales" stroke="#e67e22" activeDot={{ r: 8 }} name="Revenue" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </Paper>
    );
};

const RangeSalesChart = ({ initialData, startDate, endDate, fetchSales }) => {
    const [start, setStart] = useState(startDate || '');
    const [end, setEnd] = useState(endDate || '');

    const handleFilter = () => {
        if (start && end) {
            fetchSales(start, end);
        } else {
            alert('Please select both start and end dates.');
        }
    };
    
    const formattedData = initialData.map(item => ({
        date: item._id,
        revenue: item.totalSales,
    }));

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Sales by Date Range</Typography>
            
            {/* Date Range Filter Controls */}
            <Box display="flex" gap={2} mb={3}>
                <TextField 
                    label="Start Date" 
                    type="date" 
                    size="small"
                    InputLabelProps={{ shrink: true }} 
                    value={start} 
                    onChange={(e) => setStart(e.target.value)} 
                />
                <TextField 
                    label="End Date" 
                    type="date" 
                    size="small"
                    InputLabelProps={{ shrink: true }} 
                    value={end} 
                    onChange={(e) => setEnd(e.target.value)} 
                />
                <Button variant="contained" onClick={handleFilter} sx={{ mt: 1 }}>Filter</Button>
            </Box>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={formattedData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(value) => `₱${value.toLocaleString()}`} />
                    <Tooltip formatter={(value) => [`₱${value.toLocaleString()}`, 'Daily Revenue']} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#27ae60" name="Daily Revenue" />
                </BarChart>
            </ResponsiveContainer>
        </Paper>
    );
};


// --- 3. Main Dashboard Component ---
const AdminDashboard = () => {
    const { idToken } = useAuth();
    const [monthlySales, setMonthlySales] = useState(null);
    const [rangeSales, setRangeSales] = useState(null);
    const [loading, setLoading] = useState(true);
    const backendUrl = import.meta.env.VITE_APP_API_URL;

    const fetchMonthlySales = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/admin/sales/monthly`, {
                headers: { 'Authorization': `Bearer ${idToken}` }
            });
            setMonthlySales(data.sales);
        } catch (error) {
            console.error("Monthly Sales Fetch Error:", error);
        }
    };

    const fetchRangeSales = async (startDate, endDate) => {
        if (!startDate || !endDate) return; 

        try {
            const { data } = await axios.get(`${backendUrl}/admin/sales/range`, {
                params: { startDate, endDate },
                headers: { 'Authorization': `Bearer ${idToken}` }
            });
            setRangeSales(data.sales);
        } catch (error) {
            console.error("Range Sales Fetch Error:", error);
        }
    };

    // Initial Data Fetch
    useEffect(() => {
        if (idToken) {
            setLoading(true); // ⬅️ Start loading
            const today = new Date();
            const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
            const formatDate = (date) => date.toISOString().split('T')[0];

            // ⭐️ Use Promise.all to fetch both in parallel ⭐️
            Promise.all([
                fetchMonthlySales(),
                fetchRangeSales(formatDate(thirtyDaysAgo), formatDate(today))
            ]).then(() => {
                setLoading(false); // ⬅️ Stop loading after ALL fetches are done
            });
        }
    }, [idToken]);


    if (loading) return <Loader />;
    if (!monthlySales || !rangeSales) return <Typography>No sales data available yet. Place an order!</Typography>;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Dashboard & Sales Overview</Typography>
            
            {/* ⭐️ FIX: Replaced <Grid> with <Box> for a simple stack ⭐️ */}
            <Box display="flex" flexDirection="column" gap={3}>
                
                {/* Monthly Sales Chart (Line Chart) */}
                <MonthlySalesChart data={monthlySales} />
                
                {/* Date Range Chart (Bar Chart with Filter) */}
                <RangeSalesChart 
                    initialData={rangeSales} 
                    startDate={new Date(new Date().getTime() - (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]}
                    endDate={new Date().toISOString().split('T')[0]}
                    fetchSales={fetchRangeSales} 
                />
                
            </Box>
        </Box>
    );
};

export default AdminDashboard;