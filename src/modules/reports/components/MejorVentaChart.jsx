import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
} from "recharts";
import { farmaColors } from "../../../app/theme";

const MejorVentaChart = ({ datos, formatXAxis }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={datos} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
        <defs>
          <linearGradient id="colorVentas2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={farmaColors.primary} stopOpacity={0.3} />
            <stop offset="95%" stopColor={farmaColors.primary} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="nombreProducto" tickFormatter={formatXAxis}
          tick={{ fontSize: 10, fill: '#666' }} angle={-45} textAnchor="end" interval={0} />
        <YAxis tick={{ fontSize: 11, fill: '#666' }} />
        <RechartsTooltip />
        <Area type="monotone" dataKey="numeroVecesVendido"
          stroke={farmaColors.primary} fill="url(#colorVentas2)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default MejorVentaChart;