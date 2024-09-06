interface TaxProps {
    salary: number;
    gender: string;
    age: number;
}

interface Investment {
    type: string;
    amount: number;
    details: string;
}

interface RebateProps {
    salary: number;
    investments: Investment[];
}

export const calculateTaxRebate = ({ salary, investments }: RebateProps) => {
    let rebate = 0;
    if (salary <= 350000) {
        return 0;
    }
    const salaryRebate = salary * 0.03;
    const maxRebate = 1000000;

    investments.forEach(investment => {
        rebate += (Number(investment.amount) || 0);
    });
    rebate = rebate * 0.15;

    return Math.min(salaryRebate, rebate, maxRebate);
};

export const calculateIncomeTax = ({ salary, gender, age }: TaxProps) => {
    let tax;
    const maxSalAdjustment = 450000;

    if (salary <= 350000) {
        return {
            tax: 0,
            taxableSalary: 0
        }
    }

    salary -= Math.min(maxSalAdjustment, salary / 3);
    const taxFreeAmount = (age >= 65 || gender === 'female') ? 400000 : (gender === 'other' ? 475000 : 350000);
    const firstSlab = 100000;
    const secondSlab = 400000;
    const thirdSlab = 500000;
    const fourthSlab = 500000;

    if (salary < taxFreeAmount) {
        tax = 0;
    } else if (salary <= taxFreeAmount + firstSlab) {
        tax = (salary - taxFreeAmount) * 0.05;
    } else if (salary <= taxFreeAmount + firstSlab + secondSlab) {
        tax = 5000 + (salary - taxFreeAmount - firstSlab) * 0.1;
    } else if (salary <= taxFreeAmount + firstSlab + secondSlab + thirdSlab) {
        tax = 5000 + 40000 + (salary - taxFreeAmount - firstSlab - secondSlab) * 0.15;
    } else if (salary <= taxFreeAmount + firstSlab + secondSlab + thirdSlab + fourthSlab) {
        tax = 5000 + 40000 + 75000 + (salary - taxFreeAmount - firstSlab - secondSlab - thirdSlab) * 0.20;
    } else {
        tax = 5000 + 40000 + 75000 + 100000 + (salary - taxFreeAmount - firstSlab - secondSlab - thirdSlab) * 0.25;
    }

    return {
        taxableSalary: salary,
        tax: tax
    };
};