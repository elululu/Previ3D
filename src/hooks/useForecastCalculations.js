import { useMemo } from 'react';

const SCENARIO_MULTIPLIERS = {
  pessimist: 0.8,
  realist: 1,
  optimist: 1.2,
};

const useForecastCalculations = ({
  services,
  scenario,
  fixedCharges,
  improvementExpenses,
  salaries,
  hourlyRate,
  taxRate,
  targetNetProfit,
  configurableServices,
  competitors,
  users,
  pricingStrategyWeight,
}) => {
  const displayServices = useMemo(() => {
    const multiplier = SCENARIO_MULTIPLIERS[scenario] || 1;
    return services.map((service) => ({
      ...service,
      quantity: Math.round((service.quantity || 0) * multiplier),
    }));
  }, [services, scenario]);

  const calculations = useMemo(() => {
    const totalRevenue = displayServices.reduce(
      (acc, service) => acc + (service.quantity || 0) * (service.unitPrice || 0),
      0,
    );

    const totalVariableCosts = displayServices.reduce(
      (acc, service) =>
        acc +
        (service.quantity || 0) * (((service.hoursSpent || 0) * hourlyRate) + (service.subcontractingCost || 0)),
      0,
    );

    const totalMonthlyFixedCharges = fixedCharges.reduce(
      (acc, charge) => acc + (charge.frequency === 'annual' ? (charge.amount || 0) / 12 : charge.amount || 0),
      0,
    );

    const totalImprovementExpenses = improvementExpenses
      .filter((expense) => expense.included)
      .reduce((acc, expense) => acc + (expense.amount || 0), 0);

    const totalFixedAndOtherCharges = totalMonthlyFixedCharges + totalImprovementExpenses;

    const totalSalariesCost = salaries.reduce((acc, salary) => acc + ((salary.grossSalary || 0) * 1.42), 0);

    const totalExpenses = totalVariableCosts + totalFixedAndOtherCharges + totalSalariesCost;

    const grossMargin = totalRevenue - totalVariableCosts;
    const preTaxProfit = totalRevenue - totalExpenses;
    const taxAmount = preTaxProfit > 0 ? preTaxProfit * (taxRate / 100) : 0;
    const afterTaxProfit = preTaxProfit - taxAmount;
    const breakEvenPoint = totalRevenue > 0 ? (totalFixedAndOtherCharges + totalSalariesCost) / ((grossMargin / totalRevenue) || 1) : 0;
    const profitability = totalRevenue > 0 ? (afterTaxProfit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalVariableCosts,
      totalFixedCharges: totalFixedAndOtherCharges,
      totalSalariesCost,
      totalExpenses,
      grossMargin,
      preTaxProfit,
      afterTaxProfit,
      breakEvenPoint,
      profitability,
    };
  }, [displayServices, fixedCharges, salaries, improvementExpenses, hourlyRate, taxRate]);

  const userPerformance = useMemo(() => {
    const performance = users.reduce((acc, user) => {
      acc[user.name] = { revenue: 0, hours: 0 };
      return acc;
    }, {});

    displayServices.forEach((service) => {
      if (performance[service.realizedBy]) {
        performance[service.realizedBy].revenue += (service.quantity || 0) * (service.unitPrice || 0);
        performance[service.realizedBy].hours += (service.quantity || 0) * (service.hoursSpent || 0);
      }
    });

    return Object.entries(performance).map(([name, data]) => ({
      name,
      ...data,
      averageHourlyRate: data.hours > 0 ? data.revenue / data.hours : 0,
    }));
  }, [displayServices, users]);

  const strategicPricing = useMemo(() => {
    const scenarioAdjustment = scenario === 'realist' ? 1 : SCENARIO_MULTIPLIERS[scenario] || 1;
    const totalCostsToCover = (calculations.totalFixedCharges / scenarioAdjustment) + calculations.totalSalariesCost;
    const totalRevenueTarget = totalCostsToCover + targetNetProfit;
    const totalMonthlyHours = users.reduce((acc, user) => acc + ((user.weeklyHours || 0) * 4.33), 0);
    const costBasedGlobalHourlyRate = totalMonthlyHours > 0 ? totalRevenueTarget / totalMonthlyHours : 0;

    const results = configurableServices.map((configService) => {
      const soldService = services.find((service) => service.name === configService.name);
      const hoursSpent = soldService?.hoursSpent || 0;
      const subcontractingCost = soldService?.subcontractingCost || 0;
      const serviceCompetitors = competitors.filter((competitor) => competitor.serviceName === configService.name);
      const marketPrice =
        serviceCompetitors.length > 0
          ? serviceCompetitors.reduce((acc, competitor) => acc + (competitor.price || 0), 0) / serviceCompetitors.length
          : 0;
      const costBasedPrice = (hoursSpent * costBasedGlobalHourlyRate) + subcontractingCost;

      let suggestedPrice = costBasedPrice;
      if (marketPrice > 0) {
        suggestedPrice = (costBasedPrice * pricingStrategyWeight) + (marketPrice * (1 - pricingStrategyWeight));
      }

      const effectiveHourlyRate = hoursSpent > 0 ? (suggestedPrice - subcontractingCost) / hoursSpent : 0;

      return {
        id: configService.id,
        name: configService.name,
        hoursSpent,
        marketPrice,
        costBasedPrice,
        suggestedPrice,
        effectiveHourlyRate,
      };
    });

    return {
      results,
      costBasedGlobalHourlyRate,
      totalRevenueTarget,
    };
  }, [
    configurableServices,
    services,
    competitors,
    calculations,
    targetNetProfit,
    users,
    pricingStrategyWeight,
    scenario,
  ]);

  return { displayServices, calculations, userPerformance, strategicPricing };
};

export default useForecastCalculations;
