const fs = require('fs');
let c = fs.readFileSync('src/components/dashboard/dashboard-charts.tsx', 'utf-8');
c = c.replace('const months = [];', 'const months: any[] = [];');
c = c.replace(/formatter=\{\(value: number\) \=\> \[.*?undefined\]\}/g, "formatter={(value: any, name: any) => [`R$ ${Number(value).toLocaleString('pt-BR', {minimumFractionDigits:2})}`, name]}");
c = c.replace(/formatter=\{\(value: number\) \=\> \[.*?'Quantidade'\]\}/g, "formatter={(value: any, name: any) => [`${value} evento(s)`, name]}");
fs.writeFileSync('src/components/dashboard/dashboard-charts.tsx', c);
