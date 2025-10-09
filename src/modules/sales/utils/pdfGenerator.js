// src/modules/sales/utils/pdfGenerator.js
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Genera PDF desde un componente React renderizado
 * @param {HTMLElement} element - Elemento DOM a convertir
 * @param {string} filename - Nombre del archivo PDF
 * @param {boolean} autoPrint - Si debe abrir diálogo de impresión
 */
export const generatePDFFromElement = async (element, filename = 'factura.pdf', autoPrint = true) => {
  try {
    console.log('📄 Generando PDF desde elemento...', element);

    if (!element) {
      throw new Error('Elemento no encontrado');
    }

    // Capturar el elemento como imagen
    const canvas = await html2canvas(element, {
      scale: 2, // Mayor calidad
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    console.log('✅ Canvas generado:', canvas.width, 'x', canvas.height);

    // Obtener dimensiones
    const imgWidth = 79; // mm (ancho papel térmico)
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    console.log('📏 Dimensiones PDF:', imgWidth, 'x', imgHeight, 'mm');

    // Crear PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [79, imgHeight + 10] // Ancho fijo, alto dinámico
    });

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 5, imgWidth, imgHeight);

    console.log('✅ PDF generado exitosamente');

    // Si autoPrint está activado, abrir diálogo de impresión
    if (autoPrint) {
      // Abrir en nueva ventana con autoprint
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      const printWindow = window.open(pdfUrl, '_blank');
      
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      } else {
        console.warn('⚠️ Popup bloqueado, descargando PDF en su lugar');
        pdf.save(filename);
      }

      return {
        success: true,
        pdfBlob: pdfBlob,
        pdfUrl: pdfUrl
      };
    } else {
      // Solo descargar
      pdf.save(filename);
      
      return {
        success: true,
        pdfBlob: pdf.output('blob'),
        pdfUrl: null
      };
    }

  } catch (error) {
    console.error('❌ Error generando PDF:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Genera PDF compacto (más rápido, sin html2canvas)
 * Para facturas muy simples sin mucho diseño
 */
export const generateCompactPDF = (invoiceData) => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [79, 150] // Formato ticket compacto
    });

    let y = 10;
    const lineHeight = 5;

    // Encabezado
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(invoiceData.empresa.razonSocial, 39.5, y, { align: 'center' });
    
    y += lineHeight;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`NIT: ${invoiceData.empresa.nit}`, 39.5, y, { align: 'center' });

    y += lineHeight + 2;
    pdf.line(5, y, 74, y);

    // Datos principales
    y += lineHeight;
    pdf.setFontSize(9);
    pdf.text(`Factura: ${invoiceData.factura.numeroFactura}`, 5, y);
    
    y += lineHeight;
    pdf.setFontSize(7);
    const codAuth = invoiceData.factura.codigoAutorizacion.substring(0, 30);
    pdf.text(`Cod. Autor: ${codAuth}...`, 5, y);

    y += lineHeight;
    pdf.setFontSize(8);
    const fecha = new Date(invoiceData.factura.fechaEmision).toLocaleString('es-BO');
    pdf.text(`Fecha: ${fecha}`, 5, y);

    y += lineHeight;
    pdf.text(`NIT: ${invoiceData.cliente.nit}`, 5, y);

    y += lineHeight;
    const nombreCliente = invoiceData.cliente.nombre.substring(0, 35);
    pdf.text(`Señor(es): ${nombreCliente}`, 5, y);

    y += lineHeight + 2;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text(`TOTAL: Bs. ${invoiceData.totales.total.toFixed(2)}`, 5, y);

    y += lineHeight;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text(`Pago: Efectivo Bs. ${invoiceData.pagado.toFixed(2)}`, 5, y);

    // Nota sobre QR
    y += lineHeight + 5;
    pdf.setFontSize(7);
    pdf.text('Escanea el QR para verificar', 39.5, y, { align: 'center' });
    pdf.text('(Ver en factura impresa)', 39.5, y + 4, { align: 'center' });

    return pdf;

  } catch (error) {
    console.error('❌ Error generando PDF compacto:', error);
    throw error;
  }
};

/**
 * Valida que el elemento esté listo para ser convertido a PDF
 */
export const validateElement = (element) => {
  if (!element) {
    return { valid: false, error: 'Elemento no encontrado' };
  }

  if (!element.offsetWidth || !element.offsetHeight) {
    return { valid: false, error: 'Elemento no tiene dimensiones válidas' };
  }

  return { valid: true };
};

export default {
  generatePDFFromElement,
  generateCompactPDF,
  validateElement
};