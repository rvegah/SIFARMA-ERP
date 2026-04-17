import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { farmaColors } from "../../../app/theme";

const MejorVentaChart = ({ datos, formatXAxis }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={datos}
        margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
      >
        <defs>
          <linearGradient id="colorVentas2" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor={farmaColors.primary}
              stopOpacity={0.3}
            />
            <stop
              offset="95%"
              stopColor={farmaColors.primary}
              stopOpacity={0.02}
            />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="nombreProducto"
          tickFormatter={formatXAxis}
          tick={{ fontSize: 10, fill: "#666" }}
          angle={-45}
          textAnchor="end"
          interval={0}
        />
        <YAxis tick={{ fontSize: 11, fill: "#666" }} />
        <RechartsTooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div
                style={{
                  background: "white",
                  border: `1px solid ${farmaColors.primary}`,
                  borderRadius: 8,
                  padding: "8px 12px",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    marginBottom: 2,
                  }}
                >
                  {d.nombreProducto}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#666",
                    marginBottom: 4,
                  }}
                >
                  {d.codigo}
                </div>
                <div
                  style={{
                    color: farmaColors.primary,
                    fontWeight: 600,
                    fontSize: "0.78rem",
                  }}
                >
                  Veces vendido: {d.numeroVecesVendido}
                </div>
              </div>
            );
          }}
        />
        <Area
          type="monotone"
          dataKey="numeroVecesVendido"
          stroke={farmaColors.primary}
          fill="url(#colorVentas2)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default MejorVentaChart;
