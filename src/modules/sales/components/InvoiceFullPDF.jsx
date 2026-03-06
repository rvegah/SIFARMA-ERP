// src/modules/sales/components/InvoiceFullPDF.jsx
import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import QRCode from "react-qr-code";

const InvoiceFullPDF = React.forwardRef(({ invoiceData }, ref) => {
  const {
    empresa,
    factura,
    cliente,
    items,
    totales,
    pagado,
    cambio,
    leyendas,
  } = invoiceData;

  const esAlquiler = factura?.esAlquiler || false;

  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleString("es-BO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // ENCUENTRA toda la función numeroATexto y REEMPLAZA con esta:
  const numeroATexto = (numero) => {
    if (numero === 0) return "Cero 00/100 Bolivianos";

    const parteEntera = Math.floor(numero);
    const parteDecimal = Math.round((numero - parteEntera) * 100);

    const unidades = [
      "",
      "uno",
      "dos",
      "tres",
      "cuatro",
      "cinco",
      "seis",
      "siete",
      "ocho",
      "nueve",
    ];
    const especiales = [
      "diez",
      "once",
      "doce",
      "trece",
      "catorce",
      "quince",
      "dieciséis",
      "diecisiete",
      "dieciocho",
      "diecinueve",
    ];
    const decenas = [
      "",
      "diez",
      "veinte",
      "treinta",
      "cuarenta",
      "cincuenta",
      "sesenta",
      "setenta",
      "ochenta",
      "noventa",
    ];
    const centenas = [
      "",
      "ciento",
      "doscientos",
      "trescientos",
      "cuatrocientos",
      "quinientos",
      "seiscientos",
      "setecientos",
      "ochocientos",
      "novecientos",
    ];

    const convertirGrupo = (n) => {
      if (n === 0) return "";
      let res = "";
      const c = Math.floor(n / 100);
      if (c > 0) {
        res = n === 100 ? "cien" : centenas[c];
        n %= 100;
        if (n > 0) res += " ";
      }
      if (n >= 10 && n < 20) return res + especiales[n - 10];
      const d = Math.floor(n / 10);
      if (d > 0) {
        res += decenas[d];
        n %= 10;
        if (n > 0) res += d === 2 ? "i" : " y ";
      }
      if (n > 0) res += unidades[n];
      return res.trim();
    };

    const convertirEntero = (n) => {
      if (n === 0) return "cero";
      if (n === 1) return "uno";
      let res = "";
      if (n >= 1000000) {
        const mill = Math.floor(n / 1000000);
        res += mill === 1 ? "un millón" : convertirGrupo(mill) + " millones";
        n %= 1000000;
        if (n > 0) res += " ";
      }
      if (n >= 1000) {
        const miles = Math.floor(n / 1000);
        res += miles === 1 ? "mil" : convertirGrupo(miles) + " mil";
        n %= 1000;
        if (n > 0) res += " ";
      }
      if (n > 0) res += convertirGrupo(n);
      return res.trim();
    };

    const palabras = convertirEntero(parteEntera);
    const capitalizada = palabras.charAt(0).toUpperCase() + palabras.slice(1);
    return `${capitalizada} ${String(parteDecimal).padStart(2, "0")}/100 Bolivianos`;
  };

  const labelStyle = { fontSize: "10px", fontWeight: "bold" };
  const valueStyle = { fontSize: "10px" };
  const centerBold = {
    fontSize: "11px",
    fontWeight: "bold",
    textAlign: "center",
  };

  return (
    <Box
      ref={ref}
      sx={{
        width: "300px",
        padding: "10px",
        backgroundColor: "white",
        fontFamily: "Arial, sans-serif",
        fontSize: "10px",
        lineHeight: "1.4",
        color: "#000",
      }}
    >
      {/* ===================== ENCABEZADO ===================== */}
      <Box sx={{ textAlign: "center", mb: 1 }}>
        {/* Título primero — igual que SIAT */}
        <Typography sx={{ fontSize: "12px", fontWeight: "bold" }}>
          {esAlquiler ? "FACTURA DE ALQUILER" : "FACTURA"}
        </Typography>
        <Typography sx={{ fontSize: "9px", mb: 0.5 }}>
          CON DERECHO A CRÉDITO FISCAL
        </Typography>

        {/* Empresa */}
        <Typography sx={centerBold}>{empresa.razonSocial}</Typography>
        <Typography sx={{ fontSize: "9px" }}>Casa Matriz</Typography>
        <Typography sx={{ fontSize: "9px" }}>
          No. Punto de Venta {factura.puntoVenta ?? 0}
        </Typography>
        <Typography sx={{ fontSize: "9px" }}>
          {empresa.direccionCasaMatriz}
        </Typography>
        <Typography sx={{ fontSize: "9px" }}>
          Tel. {empresa.telefono}
        </Typography>
        <Typography sx={{ fontSize: "9px" }}>{empresa.ciudad}</Typography>
      </Box>

      <Divider sx={{ borderStyle: "dashed", my: 1 }} />

      {/* ===================== NIT / FACTURA / CUF ===================== */}
      <Box sx={{ textAlign: "center", mb: 1 }}>
        <Typography sx={centerBold}>NIT</Typography>
        <Typography sx={{ fontSize: "11px", textAlign: "center" }}>
          {empresa.nit}
        </Typography>

        <Typography sx={{ ...centerBold, mt: 0.5 }}>FACTURA N°</Typography>
        <Typography sx={{ fontSize: "11px", textAlign: "center" }}>
          {factura.numeroFactura}
        </Typography>

        <Typography sx={{ ...centerBold, mt: 0.5 }}>
          CÓD. AUTORIZACIÓN
        </Typography>
        <Typography
          sx={{ fontSize: "8px", wordBreak: "break-all", textAlign: "center" }}
        >
          {factura.codigoAutorizacion}
        </Typography>
      </Box>

      <Divider sx={{ borderStyle: "dashed", my: 1 }} />

      {/* ===================== DATOS DEL CLIENTE ===================== */}
      <Box sx={{ mb: 1 }}>
        <Box sx={{ display: "flex", gap: 0.5, mb: 0.3 }}>
          <Typography sx={labelStyle}>NOMBRE/RAZÓN SOCIAL:</Typography>
          <Typography sx={valueStyle}>
            {cliente.nombre?.toUpperCase()}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 0.5, mb: 0.3 }}>
          <Typography sx={labelStyle}>NIT/CI/CEX:</Typography>
          <Typography sx={valueStyle}>{cliente.nit}</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 0.5, mb: 0.3 }}>
          <Typography sx={labelStyle}>COD. CLIENTE:</Typography>
          <Typography sx={valueStyle}>{cliente.nit}</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 0.5, mb: 0.3 }}>
          <Typography sx={labelStyle}>FECHA DE EMISIÓN:</Typography>
          <Typography sx={valueStyle}>
            {formatFecha(factura.fechaEmision)}
          </Typography>
        </Box>

        {/* PERIODO FACTURADO — solo alquiler */}
        {esAlquiler && factura.periodoFacturado && (
          <Box sx={{ display: "flex", gap: 0.5, mb: 0.3 }}>
            <Typography sx={labelStyle}>PERIODO FACTURADO:</Typography>
            <Typography sx={valueStyle}>{factura.periodoFacturado}</Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ borderStyle: "solid", my: 1 }} />

      {/* ===================== DETALLE ===================== */}
      <Typography sx={{ ...centerBold, mb: 0.5 }}>DETALLE</Typography>

      {items.map((item, index) => (
        <Box key={index} sx={{ mb: 1 }}>
          <Typography sx={{ fontSize: "9px", fontWeight: "bold" }}>
            {item.codigo} - {item.nombre}
          </Typography>
          <Typography sx={{ fontSize: "8px" }}>
            Unidad de Medida: {item.unidadMedida}
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "9px",
            }}
          >
            <span>
              {item.cantidad} X {item.precio.toFixed(2)} -{" "}
              {item.descuento.toFixed(2)}
            </span>
            <span style={{ fontWeight: "bold" }}>
              {item.subtotal.toFixed(2)}
            </span>
          </Box>
        </Box>
      ))}

      <Divider sx={{ borderStyle: "dashed", my: 1 }} />

      {/* ===================== TOTALES ===================== */}
      <Box sx={{ mb: 1 }}>
        {[
          { label: "SUBTOTAL Bs", value: totales.subtotal },
          { label: "DESCUENTO Bs", value: totales.descuentoAdicional },
          { label: "TOTAL Bs", value: totales.total, bold: true },
          // PAGADO y CAMBIO — solicitado por FARMA DINÁMICA
          { label: "PAGADO Bs", value: pagado },
          { label: "CAMBIO Bs", value: cambio },
          { label: "MONTO A PAGAR Bs", value: totales.total, bold: true },
          { label: "IMPORTE BASE CRÉDITO FISCAL Bs", value: totales.total },
        ].map(({ label, value, bold }) => (
          <Box
            key={label}
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.3 }}
          >
            <Typography
              sx={{ fontSize: "9px", fontWeight: bold ? "bold" : "normal" }}
            >
              {label}
            </Typography>
            <Typography
              sx={{ fontSize: "9px", fontWeight: bold ? "bold" : "normal" }}
            >
              {value.toFixed(2)}
            </Typography>
          </Box>
        ))}
      </Box>

      <Typography sx={{ fontSize: "8px", mb: 1 }}>
        Son: {numeroATexto(totales.total)}
      </Typography>

      <Divider sx={{ borderStyle: "solid", my: 1 }} />

      {/* ===================== LEYENDAS ===================== */}
      <Box sx={{ mb: 1, textAlign: "center" }}>
        <Typography sx={{ fontSize: "8px", fontWeight: "bold", mb: 0.5 }}>
          {leyendas.principal}
        </Typography>
        <Typography sx={{ fontSize: "7px", mb: 0.5 }}>
          {leyendas.ley453}
        </Typography>
        <Typography sx={{ fontSize: "7px", fontStyle: "italic" }}>
          "{leyendas.documentoDigital}"
        </Typography>
      </Box>

      {/* ===================== QR ===================== */}
      <Box sx={{ display: "flex", justifyContent: "center", my: 1 }}>
        <QRCode
          value={factura.qrUrl || "https://siat.impuestos.gob.bo"}
          size={120}
          level="M"
        />
      </Box>

      {/*}
      <Typography sx={{ fontSize: "8px", textAlign: "center" }}>
        Gracias por su compra
      </Typography>*/}
    </Box>
  );
});

InvoiceFullPDF.displayName = "InvoiceFullPDF";
export default InvoiceFullPDF;
