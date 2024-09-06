'use client';

import {useState} from 'react';
import * as XLSX from 'xlsx';
import {calculateIncomeTax, calculateTaxRebate} from '@/utils/taxCalculator';
import {
    Button,
    TextField,
    Container,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Grid
} from '@mui/material';
import {FaPlus, FaMinus} from 'react-icons/fa';

const MAX_INVESTMENT_AMOUNTS = {
    DPS: 120000,
    SanchayPatra: 500000,
    Others: -1
};

interface Investment {
    type: string;
    amount: number;
    details: string;
    error: string;
}

export default function Page() {
    const [salary, setSalary] = useState<number>(0);
    const [gender, setGender] = useState<string>('male');
    const [age, setAge] = useState<number>(0);
    const [tax, setTax] = useState<number>(0);
    const [taxableSalary, setTaxableSalary] = useState<number>(0);
    const [taxRebate, setTaxRebate] = useState<number>(0);
    const [payableTax, setPayableTax] = useState<number>(0);
    const [investments, setInvestments] = useState<Investment[]>([{type: '', amount: 0, details: '', error: ''}]);

    const handleCalculate = () => {
        const calculatedTax = calculateIncomeTax({salary, gender, age});
        const rebate = calculateTaxRebate({salary, investments});
        setTax(calculatedTax.tax);
        setTaxableSalary(calculatedTax.taxableSalary);
        setTaxRebate(rebate);
        setPayableTax(calculatedTax.tax - rebate);
    };

    const handleDownload = () => {
        const mainData = [
            {Label: 'Salary', Value: salary},
            {Label: 'Gender', Value: gender},
            {Label: 'Age', Value: age},
            {Label: 'Calculated Tax', Value: tax},
            {Label: 'Tax Rebate', Value: taxRebate},
            {Label: 'Tax Payable', Value: payableTax},
        ];

        const investmentData = investments.map((investment, index) => ({
            [`Investment ${index + 1} Type`]: investment.type,
            [`Investment ${index + 1} Amount`]: investment.amount,
            [`Investment ${index + 1} Details`]: investment.details,
        }));

        const data = [
            ...mainData,
            ...investmentData.flatMap(item => Object.keys(item).map(key => ({Label: key, Value: item[key]})))
        ];

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Income Tax');
        XLSX.writeFile(wb, 'Income_Tax_Result.xlsx');
    };

    const handleInvestmentChange = (index: number, field: keyof Investment, value: string | number) => {
        const newInvestments = investments.map((investment, i) =>
            i === index ? {...investment, [field]: value} : investment
        );
        setInvestments(newInvestments);
    };

    const handleAddInvestment = () => {
        setInvestments([...investments, {type: '', amount: 0, details: '', error: ''}]);
    };

    const handleRemoveInvestment = (index: number) => {
        const newInvestments = investments.filter((_, i) => i !== index);
        setInvestments(newInvestments);
    };

    const validateInvestmentAmount = (index: number) => {
        const investment = investments[index];
        const amount = Number(investment.amount);
        const maxAmount = MAX_INVESTMENT_AMOUNTS[investment.type as keyof typeof MAX_INVESTMENT_AMOUNTS];

        if (amount > maxAmount && maxAmount !== -1) {
            const newInvestments = investments.map((inv, i) =>
                i === index ? {
                    ...inv,
                    amount: maxAmount,
                    error: `Amount cannot exceed ${maxAmount}`
                } : inv
            );
            setInvestments(newInvestments);
        } else {
            handleInvestmentChange(index, 'error', '');
        }
    };

    return (
        <Container maxWidth="sm"
                   style={{marginTop: '2rem', backgroundColor: '#f0f0f0', padding: '2rem', borderRadius: '8px'}}
        >
            <Typography variant="h4" gutterBottom>Income Tax Calculator</Typography>
            <TextField
                label="Enter Salary"
                type="number"
                fullWidth
                margin="normal"
                value={salary}
                onChange={(e) => setSalary(Number(e.target.value))}
            />
            <FormControl fullWidth margin="normal">
                <InputLabel>Gender</InputLabel>
                <Select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    label="Gender"
                >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                </Select>
            </FormControl>
            <TextField
                label="Enter Age"
                type="number"
                fullWidth
                margin="normal"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
            />

            <Typography variant="h6" style={{marginTop: '1rem'}}>Investments</Typography>
            {investments.map((investment, index) => (
                <Grid container spacing={2} alignItems="center" key={index} style={{marginBottom: '1rem'}}>
                    <Grid item xs={4}>
                        <FormControl fullWidth>
                            <InputLabel>Investment Type</InputLabel>
                            <Select
                                value={investment.type}
                                onChange={(e) => handleInvestmentChange(index, 'type', e.target.value)}
                                label="Investment Type"
                            >
                                <MenuItem value="DPS">DPS</MenuItem>
                                <MenuItem value="SanchayPatra">Sanchay Patra</MenuItem>
                                <MenuItem value="Others">Others</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            label="Investment Amount"
                            type="number"
                            fullWidth
                            value={investment.amount}
                            onChange={(e) => handleInvestmentChange(index, 'amount', Number(e.target.value))}
                            onBlur={() => validateInvestmentAmount(index)}
                            error={!!investment.error}
                            helperText={investment.error}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            label="Investment Details"
                            type="text"
                            fullWidth
                            value={investment.details}
                            onChange={(e) => handleInvestmentChange(index, 'details', e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={1}>
                        <IconButton onClick={() => handleRemoveInvestment(index)} color="error">
                            <FaMinus/>
                        </IconButton>
                    </Grid>
                </Grid>
            ))}
            <Button
                variant="outlined"
                color="primary"
                onClick={handleAddInvestment}
                startIcon={<FaPlus/>}
                style={{marginBottom: '1rem'}}
            >
                Add Investment
            </Button>

            <div style={{marginTop: '1rem'}}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCalculate}
                    style={{marginRight: '1rem'}}
                >
                    Calculate Tax
                </Button>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleDownload}
                    disabled={tax === 0}
                >
                    Download Excel
                </Button>
            </div>

            {tax !== 0 && (
                <Typography variant="h6" style={{marginTop: '1rem'}}>
                    Taxable Salary: bdt {taxableSalary}
                    <br/>
                    Calculated Tax: bdt {tax}
                    <br/>
                    Calculated Rebate: bdt {taxRebate}
                    <br/>
                    Payable Tax: bdt {payableTax}
                    <br/>
                    <span style={{fontWeight: 'bold'}}>
                        Minimum Payable Tax: bdt 5000
                    </span>
                </Typography>
            )}
        </Container>
    );
}