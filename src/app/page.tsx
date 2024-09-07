'use client';

import {useState, useEffect} from 'react';
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
    Grid,
    Collapse
} from '@mui/material';
import {FaPlus, FaMinus, FaChevronDown, FaChevronUp} from 'react-icons/fa';

const MAX_INVESTMENT_AMOUNTS = {
    DPS: 120000,
    SanchayPatra: 500000,
    Others: -1
};

interface Investment {
    type: string;
    amount: string;
    details: string;
    error: string;
}

interface OtherIncomes {
    type: string;
    amount: string;
    details: string;
    error: string;
}

interface TaxPayed {
    type: string;
    amount: string;
    details: string;
    error: string;
}

export default function Page() {
    const [salary, setSalary] = useState<string>('');
    const [totalIncome, setTotalIncome] = useState<string>('');

    const [gender, setGender] = useState<string>('male');
    const [age, setAge] = useState<string>('');

    const [tax, setTax] = useState<number>(0);
    const [taxableIncome, setTaxableIncome] = useState<number>(0);
    const [taxRebate, setTaxRebate] = useState<number>(0);
    const [taxPaid, setTaxPaid] = useState<number>(0);
    const [payableTax, setPayableTax] = useState<number>(0);
    const [showData, setShowData] = useState<boolean>(false);

    const [investments, setInvestments] = useState<Investment[]>([{type: '', amount: '', details: '', error: ''}]);
    const [otherIncomes, setOtherIncomes] = useState<OtherIncomes[]>([{type: '', amount: '', details: '', error: ''}]);
    const [taxPayed, setTaxPayed] = useState<TaxPayed[]>([{type: '', amount: '', details: '', error: ''}]);

    const [isInvestmentsOpen, setIsInvestmentsOpen] = useState<boolean>(true);
    const [isIncomesOpen, setIsIncomesOpen] = useState<boolean>(true);
    const [isTaxPayedOpen, setIsTaxPayedOpen] = useState<boolean>(true);


    useEffect(() => {
        if (salary !== '' && totalIncome !== '') {
            const calculatedTax = calculateIncomeTax({salary: Number(totalIncome), gender, age: Number(age)});
            setTax(calculatedTax.tax);
            setTaxableIncome(calculatedTax.taxableIncome);

            const rebate = calculateTaxRebate({taxableIncome: taxableIncome, investments});

            setTaxRebate(rebate);
            setPayableTax(calculatedTax.tax - rebate);
            setShowData(true);
        }
    }, [totalIncome, taxableIncome, investments, age, gender, salary]);


    const handleCalculate = () => {
        let allIncomes = Number(salary);
        otherIncomes.forEach(incomeData => {
            allIncomes += Number(incomeData.amount);
        });
        setTotalIncome(String(allIncomes));

        let paidTaxes = 0;
        taxPayed.forEach(taxData => {
            paidTaxes += Number(taxData.amount);
        });
        setTaxPaid(paidTaxes);
    };

    const handleDownload = () => {
        const mainData = [
            {Label: 'Salary', Value: salary},
            {Label: 'Gender', Value: gender},
            {Label: 'Age', Value: age},
            {Label: 'Total Income', Value: totalIncome},
            {Label: 'Taxable Income', Value: taxableIncome},
            {Label: 'Calculated Tax', Value: tax},
            {Label: 'Tax Rebate', Value: taxRebate},
            {Label: 'Tax Already Paid', Value: taxPaid},
            {Label: 'Tax Payable', Value: payableTax},
        ];

        const investmentData = investments.map((investment, index) => ({
            [`Investment ${index + 1} Type`]: investment.type,
            [`Investment ${index + 1} Amount`]: investment.amount,
            [`Investment ${index + 1} Details`]: investment.details,
        }));

        const otherIncomeData = otherIncomes.map((income, index) => ({
            [`Income ${index + 1} Type`]: income.type,
            [`Income ${index + 1} Amount`]: income.amount,
            [`Income ${index + 1} Details`]: income.details,
        }));

        const data = [
            ...mainData,
            ...investmentData.flatMap(item => Object.keys(item).map(key => ({Label: key, Value: item[key]}))),
            ...otherIncomeData.flatMap(item => Object.keys(item).map(key => ({Label: key, Value: item[key]}))),
        ];

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Income Tax');
        XLSX.writeFile(wb, 'Income_Tax_Result.xlsx');
    };

    const handleSetSalary = (salary: string) => {
        setSalary(salary);
        setShowData(false);
    };

    const handleSetAge = (age: string) => {
        setAge(age);
        setShowData(false);
    };

    const handleSetGender = (gender: string) => {
        setGender(gender);
        setShowData(false);
    };

    const handleInvestmentChange = (index: number, field: keyof Investment, value: string | number) => {
        const newInvestments = investments.map((investment, i) =>
            i === index ? {...investment, [field]: value} : investment
        );
        setInvestments(newInvestments);
        setShowData(false);
    };

    const handleAddInvestment = () => {
        setInvestments([...investments, {type: '', amount: '', details: '', error: ''}]);
        setShowData(false);
    };

    const handleRemoveInvestment = (index: number) => {
        const newInvestments = investments.filter((_, i) => i !== index);
        setInvestments(newInvestments);
        setShowData(false);
    };

    const validateInvestmentAmount = (index: number) => {
        const investment = investments[index];
        const amount = investment.amount;
        const maxAmount = MAX_INVESTMENT_AMOUNTS[investment.type as keyof typeof MAX_INVESTMENT_AMOUNTS];

        if (Number(amount) > maxAmount && maxAmount !== -1) {
            const newInvestments = investments.map((inv, i) =>
                i === index ? {
                    ...inv,
                    amount: amount,
                    error: `Amount cannot exceed ${maxAmount}`
                } : inv
            );
            setInvestments(newInvestments);
        } else {
            handleInvestmentChange(index, 'error', '');
        }
        setShowData(false);
    };


    const handleIncomeChange = (index: number, field: keyof OtherIncomes, value: string | number) => {
        const newIncomes = otherIncomes.map((income, i) =>
            i === index ? {...income, [field]: value} : income
        );
        setOtherIncomes(newIncomes);
        setShowData(false);
    };

    const handleAddIncome = () => {
        setOtherIncomes([...otherIncomes, {type: '', amount: '', details: '', error: ''}]);
        setShowData(false);
    };

    const handleRemoveIncome = (index: number) => {
        const newIncomes = otherIncomes.filter((_, i) => i !== index);
        setOtherIncomes(newIncomes);
        setShowData(false);
    };

    const validateIncomeAmount = (index: number) => {
        const income = otherIncomes[index];
        const amount = income.amount;

        const newIncomes = otherIncomes.map((income, i) =>
            i === index ? {
                ...income,
                amount: amount,
                error: ''
            } : income
        );
        setOtherIncomes(newIncomes);

        setShowData(false);
    };


    const handleTaxPayedChange = (index: number, field: keyof TaxPayed, value: string | number) => {
        const newTaxes = taxPayed.map((tax, i) =>
            i === index ? {...tax, [field]: value} : tax
        );
        setTaxPayed(newTaxes);
        setShowData(false);
    };

    const handleAddTaxPayed = () => {
        setTaxPayed([...taxPayed, {type: '', amount: '', details: '', error: ''}]);
        setShowData(false);
    };

    const handleRemoveTaxPayed = (index: number) => {
        const newTaxes = taxPayed.filter((_, i) => i !== index);
        setTaxPayed(newTaxes);
        setShowData(false);
    };

    const validateTaxPayedAmount = (index: number) => {
        const tax = taxPayed[index];
        const amount = tax.amount;

        const newTaxes = taxPayed.map((tax, i) =>
            i === index ? {
                ...tax,
                amount: amount,
                error: ''
            } : tax
        );
        setTaxPayed(newTaxes);

        setShowData(false);
    };
    return (
        <Container maxWidth="sm"
                   style={{marginTop: '2rem', backgroundColor: '#f0f0f0', padding: '2rem', borderRadius: '8px'}}
        >
            <Typography variant="h4" gutterBottom>Income Tax Calculator (2024-2025) for Bangladesh</Typography>
            <TextField
                label="Enter Salary (yearly)"
                type="number"
                fullWidth
                margin="normal"
                value={salary}
                onChange={(e) => handleSetSalary(e.target.value)}
            />
            <FormControl fullWidth margin="normal">
                <InputLabel>Gender</InputLabel>
                <Select
                    value={gender}
                    onChange={(e) => handleSetGender(e.target.value)}
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
                onChange={(e) => handleSetAge(e.target.value)}
            />

            {/*Other incomes data*/}
            <Button
                variant="outlined"
                color="primary"
                onClick={() => setIsIncomesOpen(!isIncomesOpen)}
                endIcon={isIncomesOpen ? <FaChevronUp/> : <FaChevronDown/>}
                style={{marginTop: '1rem'}}
            >
                {isIncomesOpen ? 'Hide Other Incomes' : 'Show Other Incomes'}
            </Button>

            <Collapse in={isIncomesOpen}>
                <div style={{marginTop: '1rem'}}>
                    {otherIncomes.map((income, index) => (
                        <Grid container spacing={2} alignItems="center" key={index} style={{marginBottom: '1rem'}}>
                            <Grid item xs={4}>
                                <FormControl fullWidth>
                                    <InputLabel>Income Type</InputLabel>
                                    <Select
                                        value={income.type}
                                        onChange={(e) => handleIncomeChange(index, 'type', e.target.value)}
                                        label="Income Type"
                                    >
                                        <MenuItem value="BankReturn">Bank Return</MenuItem>
                                        <MenuItem value="Others">Others</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    label="Income Amount"
                                    type="number"
                                    fullWidth
                                    value={income.amount}
                                    onChange={(e) => handleIncomeChange(index, 'amount', Number(e.target.value))}
                                    onBlur={() => validateIncomeAmount(index)}
                                    error={!!income.error}
                                    helperText={income.error}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    label="Income Details"
                                    type="text"
                                    fullWidth
                                    value={income.details}
                                    onChange={(e) => handleIncomeChange(index, 'details', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={1}>
                                <IconButton onClick={() => handleRemoveIncome(index)} color="error">
                                    <FaMinus/>
                                </IconButton>
                            </Grid>
                        </Grid>
                    ))}
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleAddIncome}
                        startIcon={<FaPlus/>}
                        style={{marginBottom: '1rem'}}
                    >
                        Add Income
                    </Button>
                </div>
            </Collapse>

            {/*Investment data*/}
            <Button
                variant="outlined"
                color="primary"
                onClick={() => setIsInvestmentsOpen(!isInvestmentsOpen)}
                endIcon={isInvestmentsOpen ? <FaChevronUp/> : <FaChevronDown/>}
                style={{marginTop: '1rem'}}
            >
                {isInvestmentsOpen ? 'Hide Investments' : 'Show Investments'}
            </Button>

            <Collapse in={isInvestmentsOpen}>
                <div style={{marginTop: '1rem'}}>
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
                </div>
            </Collapse>

            {/*Tax Payed data*/}
            <Button
                variant="outlined"
                color="primary"
                onClick={() => setIsTaxPayedOpen(!isTaxPayedOpen)}
                endIcon={isTaxPayedOpen ? <FaChevronUp/> : <FaChevronDown/>}
                style={{marginTop: '1rem'}}
            >
                {isTaxPayedOpen ? 'Hide Paid Taxes' : 'Show Paid Taxes'}
            </Button>

            <Collapse in={isTaxPayedOpen}>
                <div style={{marginTop: '1rem'}}>
                    {taxPayed.map((tax, index) => (
                        <Grid container spacing={2} alignItems="center" key={index} style={{marginBottom: '1rem'}}>
                            <Grid item xs={4}>
                                <FormControl fullWidth>
                                    <InputLabel>Paid Tax Type</InputLabel>
                                    <Select
                                        value={tax.type}
                                        onChange={(e) => handleTaxPayedChange(index, 'type', e.target.value)}
                                        label="Paid Tax Type"
                                    >
                                        <MenuItem value="tds">Tax Deduction at Source</MenuItem>
                                        <MenuItem value="BankReturn">Bank Return</MenuItem>
                                        <MenuItem value="Others">Others</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    label="Paid Tax Amount"
                                    type="number"
                                    fullWidth
                                    value={tax.amount}
                                    onChange={(e) => handleTaxPayedChange(index, 'amount', Number(e.target.value))}
                                    onBlur={() => validateTaxPayedAmount(index)}
                                    error={!!tax.error}
                                    helperText={tax.error}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    label="Paid Tax Details"
                                    type="text"
                                    fullWidth
                                    value={tax.details}
                                    onChange={(e) => handleTaxPayedChange(index, 'details', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={1}>
                                <IconButton onClick={() => handleRemoveTaxPayed(index)} color="error">
                                    <FaMinus/>
                                </IconButton>
                            </Grid>
                        </Grid>
                    ))}
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleAddTaxPayed}
                        startIcon={<FaPlus/>}
                        style={{marginBottom: '1rem'}}
                    >
                        Add Tax
                    </Button>
                </div>
            </Collapse>

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

            {showData && salary !== '' && (
                <Typography variant="h6" style={{marginTop: '1rem'}}>
                    Total Income: bdt {totalIncome}
                    <br/>
                    Taxable Income: bdt {taxableIncome}
                    <br/>
                    <br/>
                    Calculated Tax: bdt {tax}
                    <br/>
                    Calculated Rebate: bdt {taxRebate}
                    <br/>
                    <br/>
                    Tax Paid: bdt {taxPaid}
                    <br/>
                    Payable Tax: bdt {payableTax}
                    <br/>
                    <br/>
                    <span style={{fontWeight: 'bold'}}>
                        Minimum Payable Tax: bdt 5000
                    </span>
                </Typography>
            )}
        </Container>
    );
}