
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { ProcessData, Proponent } from '@/types';
import { formatLocalDate } from '@/utils/dateUtils';

export const exportToExcel = (processData: ProcessData, proponents: Proponent[]) => {
  try {
    const workbook = XLSX.utils.book_new();

    // Hoja 1: Información del proceso
    const processInfo = [
      ['Número del proceso', processData.processNumber],
      ['Objeto del proceso', processData.processObject],
      ['Fecha de cierre', processData.closingDate ? formatLocalDate(processData.closingDate) : 'No definida'],
      ['Valor del contrato', new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(processData.totalContractValue)],
      ['Salario mínimo', new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(processData.minimumSalary)]
    ];

    const processSheet = XLSX.utils.aoa_to_sheet(processInfo);
    XLSX.utils.book_append_sheet(workbook, processSheet, 'Información del Proceso');

    // Hoja 2: Ranking de proponentes
    const sortedProponents = [...proponents].sort((a, b) => b.totalScore - a.totalScore);
    
    const rankingHeaders = [
      'Posición', 'Nombre', 'Tipo', 'Puntaje Total',
      'Mujer Empresaria', 'MIPYME', 'Discapacidad', 'Factor de Calidad',
      'Calidad Ambiental', 'Industria Nacional', 'Requiere Subsanación'
    ];

    const rankingData = sortedProponents.map((proponent, index) => [
      index + 1,
      proponent.name,
      proponent.isPlural ? 'Plural' : 'Singular',
      proponent.totalScore.toFixed(2),
      proponent.scoring.womanEntrepreneurship.toFixed(2),
      proponent.scoring.mipyme.toFixed(2),
      proponent.scoring.disabled.toFixed(2),
      proponent.scoring.qualityFactor.toFixed(2),
      proponent.scoring.environmentalQuality.toFixed(2),
      proponent.scoring.nationalIndustrySupport.toFixed(2),
      proponent.needsSubsanation ? 'Sí' : 'No'
    ]);

    const rankingSheet = XLSX.utils.aoa_to_sheet([rankingHeaders, ...rankingData]);
    XLSX.utils.book_append_sheet(workbook, rankingSheet, 'Ranking Proponentes');

    // Hoja 3: Detalle de contratos por proponente
    const contractsHeaders = [
      'Proponente', 'Contrato #', 'Entidad Contratante', 'Número de Contrato',
      'Objeto', 'Valor Total SMMLV', 'Participación %', 'Valor Ajustado',
      'Tipo de Contrato', 'Cumple', 'Observaciones'
    ];

    const contractsData = [];
    sortedProponents.forEach(proponent => {
      if (proponent.contractors && proponent.contractors.length > 0) {
        proponent.contractors.forEach(contract => {
          contractsData.push([
            proponent.name,
            contract.order || '',
            contract.contractingEntity || '',
            contract.contractNumber || '',
            contract.object || '',
            contract.totalValueSMMLV || 0,
            contract.participationPercentage || 0,
            contract.adjustedValue || 0,
            contract.contractType === 'private' ? 'Privado' : 'Público',
            contract.contractComplies ? 'Sí' : 'No',
            contract.nonComplianceReason || ''
          ]);
        });
      } else {
        contractsData.push([
          proponent.name,
          'Sin contratos registrados',
          '', '', '', '', '', '', '', '', ''
        ]);
      }
    });

    const contractsSheet = XLSX.utils.aoa_to_sheet([contractsHeaders, ...contractsData]);
    XLSX.utils.book_append_sheet(workbook, contractsSheet, 'Contratos Aportados');

    // Hoja 4: Requisitos habilitantes
    const requirementsHeaders = [
      'Proponente', 'Experiencia General', 'Experiencia Específica', 'Tarjeta Profesional',
      'RUP Vigente', 'Detalles de Subsanación'
    ];

    const requirementsData = sortedProponents.map(proponent => [
      proponent.name,
      proponent.requirements?.generalExperience ? 'Cumple' : 'No cumple',
      proponent.requirements?.specificExperience ? 'Cumple' : 'No cumple',
      proponent.requirements?.professionalCard ? 'Cumple' : 'No cumple',
      proponent.rup?.complies ? 'Cumple' : 'No cumple',
      Array.isArray(proponent.subsanationDetails) ? proponent.subsanationDetails.join('; ') : ''
    ]);

    const requirementsSheet = XLSX.utils.aoa_to_sheet([requirementsHeaders, ...requirementsData]);
    XLSX.utils.book_append_sheet(workbook, requirementsSheet, 'Requisitos Habilitantes');

    XLSX.writeFile(workbook, `Evaluacion_${processData.processNumber}_${new Date().toISOString().split('T')[0]}.xlsx`);
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    throw new Error('Error al generar el archivo Excel');
  }
};

export const exportToPDF = (processData: ProcessData, proponents: Proponent[]) => {
  try {
    const doc = new jsPDF();
    const sortedProponents = [...proponents].sort((a, b) => b.totalScore - a.totalScore);

    // Título principal
    doc.setFontSize(16);
    doc.text('RESUMEN DE EVALUACIÓN', 20, 20);
    
    // Información del proceso
    doc.setFontSize(12);
    doc.text(`Proceso: ${processData.processNumber}`, 20, 35);
    doc.text(`Objeto: ${processData.processObject}`, 20, 45);
    doc.text(`Fecha: ${processData.closingDate ? formatLocalDate(processData.closingDate) : 'No definida'}`, 20, 55);
    
    const contractValue = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(processData.totalContractValue);
    doc.text(`Valor: ${contractValue}`, 20, 65);

    // Tabla de ranking
    const rankingData = sortedProponents.map((proponent, index) => [
      (index + 1).toString(),
      proponent.name,
      proponent.isPlural ? 'Plural' : 'Singular',
      proponent.totalScore.toFixed(2),
      proponent.needsSubsanation ? 'Sí' : 'No'
    ]);

    autoTable(doc, {
      head: [['Pos.', 'Proponente', 'Tipo', 'Puntaje', 'Subsanación']],
      body: rankingData,
      startY: 75,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    // Nueva página para desglose de puntajes
    doc.addPage();
    doc.setFontSize(14);
    doc.text('DESGLOSE DE PUNTAJES', 20, 20);

    const scoringData = sortedProponents.map(proponent => [
      proponent.name,
      proponent.scoring.womanEntrepreneurship.toFixed(2),
      proponent.scoring.mipyme.toFixed(2),
      proponent.scoring.disabled.toFixed(2),
      proponent.scoring.qualityFactor.toFixed(2),
      proponent.scoring.environmentalQuality.toFixed(2),
      proponent.scoring.nationalIndustrySupport.toFixed(2)
    ]);

    autoTable(doc, {
      head: [['Proponente', 'Mujer', 'MIPYME', 'Discap.', 'Calidad', 'Ambiental', 'Nacional']],
      body: scoringData,
      startY: 30,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    // Nueva página para contratos detallados
    doc.addPage();
    doc.setFontSize(14);
    doc.text('CONTRATOS APORTADOS POR PROPONENTE', 20, 20);

    let currentY = 30;
    
    sortedProponents.forEach((proponent, proponentIndex) => {
      // Verificar si necesitamos nueva página
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`${proponentIndex + 1}. ${proponent.name}`, 20, currentY);
      currentY += 10;

      if (proponent.contractors && proponent.contractors.length > 0) {
        const contractsData = proponent.contractors.map(contract => [
          contract.order?.toString() || '',
          contract.contractingEntity || '',
          contract.contractNumber || '',
          (contract.totalValueSMMLV || 0).toString(),
          `${contract.participationPercentage || 0}%`,
          contract.contractComplies ? 'Sí' : 'No',
          contract.nonComplianceReason || ''
        ]);

        autoTable(doc, {
          head: [['#', 'Entidad', 'Número', 'Valor SMMLV', 'Participación', 'Cumple', 'Observaciones']],
          body: contractsData,
          startY: currentY,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [52, 152, 219] },
          margin: { left: 25 }
        });

        currentY = (doc as any).lastAutoTable.finalY + 15;
      } else {
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.text('No se registraron contratos para este proponente', 25, currentY);
        currentY += 15;
      }
    });

    // Nueva página para requisitos habilitantes
    doc.addPage();
    doc.setFontSize(14);
    doc.text('REQUISITOS HABILITANTES', 20, 20);

    const requirementsData = sortedProponents.map(proponent => [
      proponent.name,
      proponent.requirements?.generalExperience ? 'Sí' : 'No',
      proponent.requirements?.specificExperience ? 'Sí' : 'No',
      proponent.requirements?.professionalCard ? 'Sí' : 'No',
      proponent.rup?.complies ? 'Sí' : 'No'
    ]);

    autoTable(doc, {
      head: [['Proponente', 'Exp. General', 'Exp. Específica', 'T. Profesional', 'RUP']],
      body: requirementsData,
      startY: 30,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    // Agregar detalles de subsanación si existen
    const proponentsWithSubsanation = sortedProponents.filter(p => p.needsSubsanation && p.subsanationDetails);
    
    if (proponentsWithSubsanation.length > 0) {
      doc.addPage();
      doc.setFontSize(14);
      doc.text('DETALLES DE SUBSANACIÓN', 20, 20);
      
      let subsanationY = 30;
      
      proponentsWithSubsanation.forEach(proponent => {
        if (subsanationY > 250) {
          doc.addPage();
          subsanationY = 20;
        }
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`${proponent.name}:`, 20, subsanationY);
        subsanationY += 10;
        
        if (Array.isArray(proponent.subsanationDetails)) {
          proponent.subsanationDetails.forEach(detail => {
            doc.setFont(undefined, 'normal');
            doc.setFontSize(10);
            doc.text(`• ${detail}`, 25, subsanationY);
            subsanationY += 8;
          });
        }
        
        subsanationY += 5;
      });
    }

    doc.save(`Evaluacion_${processData.processNumber}_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error al exportar a PDF:', error);
    throw new Error('Error al generar el archivo PDF');
  }
};
