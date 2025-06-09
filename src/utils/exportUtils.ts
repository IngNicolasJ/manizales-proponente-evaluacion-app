
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { ProcessData, Proponent } from '@/types';

export const exportToPDF = (processData: ProcessData, proponents: Proponent[]) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(16);
  doc.text('Resumen de Proponentes', 20, 20);
  
  // Process information
  doc.setFontSize(12);
  doc.text(`Proceso: ${processData.processNumber}`, 20, 35);
  doc.text(`Objeto: ${processData.processObject}`, 20, 45);
  doc.text(`Fecha de cierre: ${new Date(processData.closingDate).toLocaleDateString()}`, 20, 55);
  doc.text(`Valor del contrato: $${processData.totalContractValue.toLocaleString()}`, 20, 65);
  
  // Table data
  const tableData = proponents.map(proponent => [
    proponent.name,
    proponent.totalScore.toFixed(2),
    proponent.requirements.generalExperience ? 'Sí' : 'No',
    proponent.requirements.specificExperience ? 'Sí' : 'No',
    proponent.requirements.additionalSpecificExperience.complies ? 'Sí' : 'No',
    proponent.requirements.professionalCard ? 'Sí' : 'No',
    proponent.rup.complies ? 'Sí' : 'No',
    proponent.needsSubsanation ? 'SUBSANAR' : 'CUMPLE'
  ]);
  
  autoTable(doc, {
    head: [['Proponente', 'Puntaje', 'Exp. General', 'Exp. Específica', 'Exp. Esp. Adicional', 'Tarjeta Prof.', 'RUP', 'Estado']],
    body: tableData,
    startY: 80,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [66, 139, 202] }
  });
  
  doc.save(`resumen-proponentes-${processData.processNumber}.pdf`);
};

export const exportToExcel = (processData: ProcessData, proponents: Proponent[]) => {
  const workbook = XLSX.utils.book_new();
  
  // Process information sheet
  const processInfo = [
    ['Número del proceso', processData.processNumber],
    ['Objeto del proceso', processData.processObject],
    ['Fecha de cierre', new Date(processData.closingDate).toLocaleDateString()],
    ['Valor del contrato', processData.totalContractValue.toString()],
    ['Puntaje máximo', Object.values(processData.scoring).reduce((a, b) => a + b, 0).toString()]
  ];
  
  const processSheet = XLSX.utils.aoa_to_sheet(processInfo);
  XLSX.utils.book_append_sheet(workbook, processSheet, 'Información del Proceso');
  
  // Proponents summary sheet
  const proponentsData = [
    ['Proponente', 'Puntaje Total', 'Exp. General', 'Exp. Específica', 'Exp. Esp. Adicional', 'Tarjeta Profesional', 'RUP Vigente', 'Estado', 'Emprendimiento Mujer', 'MIPYME', 'Discapacitado', 'Factor Calidad', 'Factor Calidad Ambiental', 'Apoyo Industria Nacional']
  ];
  
  proponents.forEach(proponent => {
    proponentsData.push([
      proponent.name,
      proponent.totalScore.toString(),
      proponent.requirements.generalExperience ? 'Sí' : 'No',
      proponent.requirements.specificExperience ? 'Sí' : 'No',
      proponent.requirements.additionalSpecificExperience.complies ? 'Sí' : 'No',
      proponent.requirements.professionalCard ? 'Sí' : 'No',
      proponent.rup.complies ? 'Sí' : 'No',
      proponent.needsSubsanation ? 'SUBSANAR' : 'CUMPLE',
      proponent.scoring.womanEntrepreneurship.toString(),
      proponent.scoring.mipyme.toString(),
      proponent.scoring.disabled.toString(),
      proponent.scoring.qualityFactor.toString(),
      proponent.scoring.environmentalQuality.toString(),
      proponent.scoring.nationalIndustrySupport.toString()
    ]);
  });
  
  const proponentsSheet = XLSX.utils.aoa_to_sheet(proponentsData);
  XLSX.utils.book_append_sheet(workbook, proponentsSheet, 'Resumen Proponentes');
  
  // Detailed scoring sheet
  const detailedData = [
    ['Proponente', 'Criterio', 'Puntaje Obtenido', 'Puntaje Máximo', 'Comentario']
  ];
  
  proponents.forEach(proponent => {
    const criteria = [
      { name: 'Emprendimiento Mujer', score: proponent.scoring.womanEntrepreneurship, max: processData.scoring.womanEntrepreneurship, comment: proponent.scoring.comments.womanEntrepreneurship },
      { name: 'MIPYME', score: proponent.scoring.mipyme, max: processData.scoring.mipyme, comment: proponent.scoring.comments.mipyme },
      { name: 'Discapacitado', score: proponent.scoring.disabled, max: processData.scoring.disabled, comment: proponent.scoring.comments.disabled },
      { name: 'Factor de Calidad', score: proponent.scoring.qualityFactor, max: processData.scoring.qualityFactor, comment: proponent.scoring.comments.qualityFactor },
      { name: 'Factor de Calidad Ambiental', score: proponent.scoring.environmentalQuality, max: processData.scoring.environmentalQuality, comment: proponent.scoring.comments.environmentalQuality },
      { name: 'Apoyo a la Industria Nacional', score: proponent.scoring.nationalIndustrySupport, max: processData.scoring.nationalIndustrySupport, comment: proponent.scoring.comments.nationalIndustrySupport }
    ];
    
    criteria.forEach(criterion => {
      detailedData.push([
        proponent.name,
        criterion.name,
        criterion.score.toString(),
        criterion.max.toString(),
        criterion.comment || ''
      ]);
    });
  });
  
  const detailedSheet = XLSX.utils.aoa_to_sheet(detailedData);
  XLSX.utils.book_append_sheet(workbook, detailedSheet, 'Puntajes Detallados');
  
  XLSX.writeFile(workbook, `resumen-proponentes-${processData.processNumber}.xlsx`);
};
