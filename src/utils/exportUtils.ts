
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { ProcessData, Proponent } from '@/types';

export const exportToPDF = (processData: ProcessData, proponents: Proponent[]) => {
  const doc = new jsPDF();
  let yPosition = 20;
  
  // Header principal
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('RESUMEN DE EVALUACIÓN DE PROPONENTES', 20, yPosition);
  yPosition += 15;
  
  // Línea separadora
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 15;
  
  // Información del proceso - Sección organizada
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('INFORMACIÓN DEL PROCESO', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  
  // Datos del proceso en formato estructurado - handling multiline for process object
  const processInfoSimple = [
    ['Número del proceso:', processData.processNumber],
    ['Fecha de cierre:', new Date(processData.closingDate).toLocaleDateString('es-ES')],
    ['Valor total del contrato:', `$${processData.totalContractValue.toLocaleString('es-ES')}`],
    ['Puntaje máximo posible:', `${Object.values(processData.scoring).reduce((a, b) => a + b, 0).toFixed(2)} puntos`]
  ];
  
  // Handle simple fields first
  processInfoSimple.forEach(([label, value]) => {
    doc.setFont(undefined, 'bold');
    doc.text(label, 25, yPosition);
    doc.setFont(undefined, 'normal');
    const labelWidth = doc.getTextWidth(label);
    doc.text(value, 25 + labelWidth + 5, yPosition);
    yPosition += 7;
  });
  
  // Handle "Objeto del proceso" with text wrapping
  doc.setFont(undefined, 'bold');
  doc.text('Objeto:', 25, yPosition);
  yPosition += 7;
  
  doc.setFont(undefined, 'normal');
  const maxWidth = 165; // Maximum width for text (190 - 25 margin)
  const processObjectLines = doc.splitTextToSize(processData.processObject, maxWidth);
  
  processObjectLines.forEach((line: string) => {
    doc.text(line, 25, yPosition);
    yPosition += 5;
  });
  
  yPosition += 10;
  
  // Tabla de resumen de proponentes
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('RESUMEN DE EVALUACIÓN', 20, yPosition);
  yPosition += 10;
  
  // Preparar datos para la tabla principal
  const tableData = proponents.map((proponent, index) => [
    (index + 1).toString(),
    proponent.name,
    `${proponent.totalScore.toFixed(2)} pts`,
    proponent.requirements.generalExperience ? '✓' : '✗',
    proponent.requirements.specificExperience ? '✓' : '✗',
    proponent.requirements.additionalSpecificExperience.complies ? '✓' : '✗',
    proponent.requirements.professionalCard ? '✓' : '✗',
    proponent.rup.complies ? '✓' : '✗',
    proponent.needsSubsanation ? 'SUBSANAR' : 'CUMPLE'
  ]);
  
  autoTable(doc, {
    head: [['#', 'Proponente', 'Puntaje Total', 'Exp. Gral', 'Exp. Esp.', 'Exp. Adic.', 'T. Prof.', 'RUP', 'Estado']],
    body: tableData,
    startY: yPosition,
    styles: { 
      fontSize: 8,
      cellPadding: 3,
      halign: 'center'
    },
    headStyles: { 
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'left', cellWidth: 50 },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'center', cellWidth: 15 },
      4: { halign: 'center', cellWidth: 15 },
      5: { halign: 'center', cellWidth: 15 },
      6: { halign: 'center', cellWidth: 15 },
      7: { halign: 'center', cellWidth: 15 },
      8: { halign: 'center', cellWidth: 25 }
    }
  });
  
  // Nueva página para detalles de puntajes
  doc.addPage();
  yPosition = 20;
  
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('DETALLE DE PUNTAJES POR CRITERIO', 20, yPosition);
  yPosition += 15;
  
  // Tabla detallada de puntajes
  const detailedData: any[] = [];
  
  proponents.forEach((proponent, index) => {
    const criteria = [
      { name: 'Emprendimiento Mujer', score: proponent.scoring.womanEntrepreneurship, max: processData.scoring.womanEntrepreneurship },
      { name: 'MIPYME', score: proponent.scoring.mipyme, max: processData.scoring.mipyme },
      { name: 'Discapacitado', score: proponent.scoring.disabled, max: processData.scoring.disabled },
      { name: 'Factor de Calidad', score: proponent.scoring.qualityFactor, max: processData.scoring.qualityFactor },
      { name: 'Factor Calidad Ambiental', score: proponent.scoring.environmentalQuality, max: processData.scoring.environmentalQuality },
      { name: 'Apoyo Industria Nacional', score: proponent.scoring.nationalIndustrySupport, max: processData.scoring.nationalIndustrySupport }
    ];
    
    criteria.forEach(criterion => {
      detailedData.push([
        (index + 1).toString(),
        proponent.name,
        criterion.name,
        `${criterion.score.toFixed(2)}`,
        `${criterion.max.toFixed(2)}`,
        `${((criterion.score / criterion.max) * 100).toFixed(1)}%`
      ]);
    });
  });
  
  autoTable(doc, {
    head: [['#', 'Proponente', 'Criterio', 'Obtenido', 'Máximo', '% Logrado']],
    body: detailedData,
    startY: yPosition,
    styles: { 
      fontSize: 8,
      cellPadding: 3
    },
    headStyles: { 
      fillColor: [52, 152, 219],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'left', cellWidth: 45 },
      2: { halign: 'left', cellWidth: 50 },
      3: { halign: 'center', cellWidth: 20 },
      4: { halign: 'center', cellWidth: 20 },
      5: { halign: 'center', cellWidth: 25 }
    }
  });
  
  // Footer con fecha de generación
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')} - Página ${i} de ${pageCount}`, 20, 285);
  }
  
  doc.save(`evaluacion-proponentes-${processData.processNumber}.pdf`);
};

export const exportToExcel = (processData: ProcessData, proponents: Proponent[]) => {
  const workbook = XLSX.utils.book_new();
  
  // Hoja 1: Información del proceso
  const processInfo = [
    ['INFORMACIÓN DEL PROCESO', ''],
    ['', ''],
    ['Número del proceso', processData.processNumber],
    ['Objeto del proceso', processData.processObject],
    ['Fecha de cierre', new Date(processData.closingDate).toLocaleDateString('es-ES')],
    ['Valor total del contrato', `$${processData.totalContractValue.toLocaleString('es-ES')}`],
    ['Puntaje máximo posible', Object.values(processData.scoring).reduce((a, b) => a + b, 0).toFixed(2)],
    ['', ''],
    ['DISTRIBUCIÓN DE PUNTAJES MÁXIMOS', ''],
    ['', ''],
    ['Emprendimiento Mujer', processData.scoring.womanEntrepreneurship.toString()],
    ['MIPYME', processData.scoring.mipyme.toString()],
    ['Discapacitado', processData.scoring.disabled.toString()],
    ['Factor de Calidad', processData.scoring.qualityFactor.toString()],
    ['Factor de Calidad Ambiental', processData.scoring.environmentalQuality.toString()],
    ['Apoyo a la Industria Nacional', processData.scoring.nationalIndustrySupport.toString()]
  ];
  
  const processSheet = XLSX.utils.aoa_to_sheet(processInfo);
  
  // Aplicar formato a la hoja de proceso
  processSheet['!cols'] = [{ width: 30 }, { width: 40 }];
  
  XLSX.utils.book_append_sheet(workbook, processSheet, 'Información del Proceso');
  
  // Hoja 2: Resumen de proponentes
  const proponentsData = [
    ['RESUMEN DE EVALUACIÓN DE PROPONENTES', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['#', 'Proponente', 'Tipo', 'Puntaje Total', 'Puntaje Máximo', '% Logrado', 'Exp. General', 'Exp. Específica', 'Exp. Esp. Adicional', 'Tarjeta Profesional', 'RUP Vigente', 'Estado', 'Emprendimiento Mujer', 'MIPYME', 'Discapacitado', 'Factor Calidad', 'Factor Calidad Ambiental', 'Apoyo Industria Nacional']
  ];
  
  const maxScore = Object.values(processData.scoring).reduce((a, b) => a + b, 0);
  
  proponents.forEach((proponent, index) => {
    const percentage = ((proponent.totalScore / maxScore) * 100).toFixed(1);
    proponentsData.push([
      (index + 1).toString(),
      proponent.name,
      proponent.isPlural ? 'Plural' : 'Singular',
      proponent.totalScore.toFixed(2),
      maxScore.toFixed(2),
      `${percentage}%`,
      proponent.requirements.generalExperience ? 'SÍ' : 'NO',
      proponent.requirements.specificExperience ? 'SÍ' : 'NO',
      proponent.requirements.additionalSpecificExperience.complies ? 'SÍ' : 'NO',
      proponent.requirements.professionalCard ? 'SÍ' : 'NO',
      proponent.rup.complies ? 'SÍ' : 'NO',
      proponent.needsSubsanation ? 'SUBSANAR' : 'CUMPLE',
      proponent.scoring.womanEntrepreneurship.toFixed(2),
      proponent.scoring.mipyme.toFixed(2),
      proponent.scoring.disabled.toFixed(2),
      proponent.scoring.qualityFactor.toFixed(2),
      proponent.scoring.environmentalQuality.toFixed(2),
      proponent.scoring.nationalIndustrySupport.toFixed(2)
    ]);
  });
  
  const proponentsSheet = XLSX.utils.aoa_to_sheet(proponentsData);
  
  // Configurar ancho de columnas
  proponentsSheet['!cols'] = [
    { width: 5 }, { width: 30 }, { width: 10 }, { width: 12 }, { width: 12 }, 
    { width: 10 }, { width: 12 }, { width: 15 }, { width: 18 }, { width: 18 }, 
    { width: 12 }, { width: 12 }, { width: 18 }, { width: 10 }, { width: 12 }, 
    { width: 15 }, { width: 20 }, { width: 22 }
  ];
  
  XLSX.utils.book_append_sheet(workbook, proponentsSheet, 'Resumen Proponentes');
  
  // Hoja 3: Detalle de puntajes por criterio
  const detailedData = [
    ['DETALLE DE PUNTAJES POR CRITERIO', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['#', 'Proponente', 'Criterio', 'Puntaje Obtenido', 'Puntaje Máximo', '% Logrado', 'Comentario']
  ];
  
  proponents.forEach((proponent, index) => {
    const criteria = [
      { name: 'Emprendimiento Mujer', score: proponent.scoring.womanEntrepreneurship, max: processData.scoring.womanEntrepreneurship, comment: proponent.scoring.comments.womanEntrepreneurship },
      { name: 'MIPYME', score: proponent.scoring.mipyme, max: processData.scoring.mipyme, comment: proponent.scoring.comments.mipyme },
      { name: 'Discapacitado', score: proponent.scoring.disabled, max: processData.scoring.disabled, comment: proponent.scoring.comments.disabled },
      { name: 'Factor de Calidad', score: proponent.scoring.qualityFactor, max: processData.scoring.qualityFactor, comment: proponent.scoring.comments.qualityFactor },
      { name: 'Factor de Calidad Ambiental', score: proponent.scoring.environmentalQuality, max: processData.scoring.environmentalQuality, comment: proponent.scoring.comments.environmentalQuality },
      { name: 'Apoyo a la Industria Nacional', score: proponent.scoring.nationalIndustrySupport, max: processData.scoring.nationalIndustrySupport, comment: proponent.scoring.comments.nationalIndustrySupport }
    ];
    
    criteria.forEach(criterion => {
      const percentage = criterion.max > 0 ? ((criterion.score / criterion.max) * 100).toFixed(1) : '0.0';
      detailedData.push([
        (index + 1).toString(),
        proponent.name,
        criterion.name,
        criterion.score.toFixed(2),
        criterion.max.toFixed(2),
        `${percentage}%`,
        criterion.comment || 'Sin comentarios'
      ]);
    });
    
    // Agregar fila separadora entre proponentes
    if (index < proponents.length - 1) {
      detailedData.push(['', '', '', '', '', '', '']);
    }
  });
  
  const detailedSheet = XLSX.utils.aoa_to_sheet(detailedData);
  
  // Configurar ancho de columnas para la hoja de detalles
  detailedSheet['!cols'] = [
    { width: 5 }, { width: 30 }, { width: 25 }, { width: 15 }, 
    { width: 15 }, { width: 12 }, { width: 40 }
  ];
  
  XLSX.utils.book_append_sheet(workbook, detailedSheet, 'Puntajes Detallados');
  
  // Hoja 4: Estadísticas del proceso
  const stats = [
    ['ESTADÍSTICAS DEL PROCESO', ''],
    ['', ''],
    ['Total de proponentes evaluados', proponents.length.toString()],
    ['Proponentes que cumplen requisitos', proponents.filter(p => !p.needsSubsanation).length.toString()],
    ['Proponentes que necesitan subsanación', proponents.filter(p => p.needsSubsanation).length.toString()],
    ['', ''],
    ['PUNTAJES ESTADÍSTICOS', ''],
    ['', ''],
    ['Puntaje promedio', (proponents.reduce((acc, p) => acc + p.totalScore, 0) / proponents.length).toFixed(2)],
    ['Puntaje más alto', Math.max(...proponents.map(p => p.totalScore)).toFixed(2)],
    ['Puntaje más bajo', Math.min(...proponents.map(p => p.totalScore)).toFixed(2)],
    ['', ''],
    ['Fecha de generación', new Date().toLocaleDateString('es-ES')],
    ['Hora de generación', new Date().toLocaleTimeString('es-ES')]
  ];
  
  const statsSheet = XLSX.utils.aoa_to_sheet(stats);
  statsSheet['!cols'] = [{ width: 35 }, { width: 20 }];
  
  XLSX.utils.book_append_sheet(workbook, statsSheet, 'Estadísticas');
  
  XLSX.writeFile(workbook, `evaluacion-proponentes-${processData.processNumber}.xlsx`);
};
