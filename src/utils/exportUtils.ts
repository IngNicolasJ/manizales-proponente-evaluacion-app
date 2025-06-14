
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
  doc.text('RESUMEN COMPLETO DE EVALUACIÓN DE PROPONENTES', 20, yPosition);
  yPosition += 15;
  
  // Línea separadora
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 15;
  
  // Información del proceso completa
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('INFORMACIÓN DEL PROCESO', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  
  const processInfo = [
    ['Número del proceso:', processData.processNumber],
    ['Fecha de cierre:', new Date(processData.closingDate).toLocaleDateString('es-ES')],
    ['Valor total del contrato:', `$${processData.totalContractValue.toLocaleString('es-ES')}`],
    ['Puntaje máximo posible:', `${Object.values(processData.scoring).reduce((a, b) => a + b, 0).toFixed(2)} puntos`]
  ];
  
  processInfo.forEach(([label, value]) => {
    doc.setFont(undefined, 'bold');
    doc.text(label, 25, yPosition);
    doc.setFont(undefined, 'normal');
    const labelWidth = doc.getTextWidth(label);
    doc.text(value, 25 + labelWidth + 5, yPosition);
    yPosition += 7;
  });
  
  // Objeto del proceso con manejo de texto largo
  doc.setFont(undefined, 'bold');
  doc.text('Objeto:', 25, yPosition);
  yPosition += 7;
  
  doc.setFont(undefined, 'normal');
  const maxWidth = 165;
  const processObjectLines = doc.splitTextToSize(processData.processObject, maxWidth);
  
  processObjectLines.forEach((line: string) => {
    doc.text(line, 25, yPosition);
    yPosition += 5;
  });
  
  yPosition += 10;

  // Experiencia requerida
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('REQUISITOS DE EXPERIENCIA', 20, yPosition);
  yPosition += 8;
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text(`Experiencia general: ${processData.experience.general} SMLMV`, 25, yPosition);
  yPosition += 6;
  doc.text(`Experiencia específica: ${processData.experience.specific} SMLMV`, 25, yPosition);
  yPosition += 6;
  
  if (processData.experience.classifierCodes && processData.experience.classifierCodes.length > 0) {
    doc.text(`Códigos clasificadores: ${processData.experience.classifierCodes.join(', ')}`, 25, yPosition);
    yPosition += 6;
  }
  
  if (processData.experience.additionalSpecific && processData.experience.additionalSpecific.length > 0) {
    doc.text('Experiencia específica adicional:', 25, yPosition);
    yPosition += 5;
    processData.experience.additionalSpecific.forEach((exp, idx) => {
      const expText = `${idx + 1}. ${exp.name}: ${exp.value} ${exp.unit}`;
      const expLines = doc.splitTextToSize(expText, maxWidth - 10);
      expLines.forEach((line: string) => {
        doc.text(line, 30, yPosition);
        yPosition += 4;
      });
    });
  }
  
  yPosition += 10;
  
  // Tabla de resumen de proponentes mejorada
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('RESUMEN DE EVALUACIÓN', 20, yPosition);
  yPosition += 10;
  
  const tableData = proponents.map((proponent, index) => {
    const additionalComplies = Array.isArray(proponent.requirements.additionalSpecificExperience) 
      ? proponent.requirements.additionalSpecificExperience.every(exp => exp.complies)
      : true;
    
    return [
      (index + 1).toString(),
      proponent.name,
      proponent.isPlural ? 'Plural' : 'Singular',
      `${proponent.totalScore.toFixed(2)} pts`,
      proponent.requirements.generalExperience ? '✓' : '✗',
      proponent.requirements.specificExperience ? '✓' : '✗',
      additionalComplies ? '✓' : '✗',
      proponent.requirements.professionalCard ? '✓' : '✗',
      proponent.rup.complies ? '✓' : '✗',
      proponent.needsSubsanation ? 'SUBSANAR' : 'CUMPLE'
    ];
  });
  
  autoTable(doc, {
    head: [['#', 'Proponente', 'Tipo', 'Puntaje', 'Exp. Gral', 'Exp. Esp.', 'Exp. Adic.', 'T. Prof.', 'RUP', 'Estado']],
    body: tableData,
    startY: yPosition,
    styles: { 
      fontSize: 8,
      cellPadding: 2,
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
      0: { halign: 'center', cellWidth: 8 },
      1: { halign: 'left', cellWidth: 40 },
      2: { halign: 'center', cellWidth: 15 },
      3: { halign: 'center', cellWidth: 18 },
      4: { halign: 'center', cellWidth: 12 },
      5: { halign: 'center', cellWidth: 12 },
      6: { halign: 'center', cellWidth: 12 },
      7: { halign: 'center', cellWidth: 12 },
      8: { halign: 'center', cellWidth: 12 },
      9: { halign: 'center', cellWidth: 20 }
    }
  });
  
  // Información detallada de cada proponente
  proponents.forEach((proponent, proponentIndex) => {
    doc.addPage();
    yPosition = 20;
    
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(`DETALLE DEL PROPONENTE ${proponentIndex + 1}`, 20, yPosition);
    yPosition += 15;
    
    // Información básica del proponente
    doc.setFontSize(12);
    doc.text('INFORMACIÓN BÁSICA', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    const proponentInfo = [
      ['Nombre:', proponent.name],
      ['Tipo:', proponent.isPlural ? 'Proponente Plural' : 'Proponente Singular'],
      ['Puntaje total:', `${proponent.totalScore.toFixed(2)} / ${Object.values(processData.scoring).reduce((a, b) => a + b, 0).toFixed(2)} puntos`],
      ['Estado final:', proponent.needsSubsanation ? 'REQUIERE SUBSANACIÓN' : 'CUMPLE REQUISITOS']
    ];
    
    proponentInfo.forEach(([label, value]) => {
      doc.setFont(undefined, 'bold');
      doc.text(label, 25, yPosition);
      doc.setFont(undefined, 'normal');
      const labelWidth = doc.getTextWidth(label);
      doc.text(value, 25 + labelWidth + 5, yPosition);
      yPosition += 7;
    });
    
    // Socios (si es plural)
    if (proponent.isPlural && proponent.partners && proponent.partners.length > 0) {
      yPosition += 5;
      doc.setFont(undefined, 'bold');
      doc.text('SOCIOS:', 25, yPosition);
      yPosition += 5;
      
      proponent.partners.forEach((partner, idx) => {
        doc.setFont(undefined, 'normal');
        doc.text(`${idx + 1}. ${partner.name} (${partner.percentage}%)`, 30, yPosition);
        yPosition += 5;
      });
    }
    
    yPosition += 10;
    
    // Puntajes detallados
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('PUNTAJES POR CRITERIO', 20, yPosition);
    yPosition += 10;
    
    const scoringData = [
      ['Criterio', 'Obtenido', 'Máximo', '% Logrado', 'Comentario'],
      ['Emprendimiento Mujer', proponent.scoring.womanEntrepreneurship.toFixed(2), processData.scoring.womanEntrepreneurship.toFixed(2), 
       `${((proponent.scoring.womanEntrepreneurship / processData.scoring.womanEntrepreneurship) * 100).toFixed(1)}%`, 
       proponent.scoring.comments.womanEntrepreneurship || 'Sin comentarios'],
      ['MIPYME', proponent.scoring.mipyme.toFixed(2), processData.scoring.mipyme.toFixed(2), 
       `${((proponent.scoring.mipyme / processData.scoring.mipyme) * 100).toFixed(1)}%`, 
       proponent.scoring.comments.mipyme || 'Sin comentarios'],
      ['Discapacitado', proponent.scoring.disabled.toFixed(2), processData.scoring.disabled.toFixed(2), 
       `${((proponent.scoring.disabled / processData.scoring.disabled) * 100).toFixed(1)}%`, 
       proponent.scoring.comments.disabled || 'Sin comentarios'],
      ['Factor de Calidad', proponent.scoring.qualityFactor.toFixed(2), processData.scoring.qualityFactor.toFixed(2), 
       `${((proponent.scoring.qualityFactor / processData.scoring.qualityFactor) * 100).toFixed(1)}%`, 
       proponent.scoring.comments.qualityFactor || 'Sin comentarios'],
      ['Factor Calidad Ambiental', proponent.scoring.environmentalQuality.toFixed(2), processData.scoring.environmentalQuality.toFixed(2), 
       `${((proponent.scoring.environmentalQuality / processData.scoring.environmentalQuality) * 100).toFixed(1)}%`, 
       proponent.scoring.comments.environmentalQuality || 'Sin comentarios'],
      ['Apoyo Industria Nacional', proponent.scoring.nationalIndustrySupport.toFixed(2), processData.scoring.nationalIndustrySupport.toFixed(2), 
       `${((proponent.scoring.nationalIndustrySupport / processData.scoring.nationalIndustrySupport) * 100).toFixed(1)}%`, 
       proponent.scoring.comments.nationalIndustrySupport || 'Sin comentarios']
    ];
    
    autoTable(doc, {
      head: [scoringData[0]],
      body: scoringData.slice(1),
      startY: yPosition,
      styles: { 
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: { 
        fillColor: [52, 152, 219],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 40 },
        1: { halign: 'center', cellWidth: 20 },
        2: { halign: 'center', cellWidth: 20 },
        3: { halign: 'center', cellWidth: 20 },
        4: { halign: 'left', cellWidth: 60 }
      }
    });
    
    // Requisitos habilitantes
    yPosition = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('REQUISITOS HABILITANTES', 20, yPosition);
    yPosition += 10;
    
    const requirementsData = [
      ['Requisito', 'Cumple', 'Observaciones'],
      ['Experiencia General', proponent.requirements.generalExperience ? 'SÍ' : 'NO', 
       proponent.requirements.generalExperience ? 'Cumple requisito' : 'No cumple experiencia general'],
      ['Experiencia Específica', proponent.requirements.specificExperience ? 'SÍ' : 'NO', 
       proponent.requirements.specificExperience ? 'Cumple requisito' : 'No cumple experiencia específica'],
      ['Tarjeta Profesional', proponent.requirements.professionalCard ? 'SÍ' : 'NO', 
       proponent.requirements.professionalCard ? 'Aporta tarjeta profesional' : 'No aporta tarjeta profesional'],
      ['RUP Vigente', proponent.rup.complies ? 'SÍ' : 'NO', 
       proponent.rup.complies ? 'RUP vigente' : 'RUP no vigente o no aporta']
    ];
    
    // Agregar experiencia específica adicional
    if (Array.isArray(proponent.requirements.additionalSpecificExperience)) {
      proponent.requirements.additionalSpecificExperience.forEach((exp, idx) => {
        requirementsData.push([
          exp.name,
          exp.complies ? 'SÍ' : 'NO',
          `Aportado: ${exp.amount} | ${exp.comment || 'Sin observaciones'}`
        ]);
      });
    }
    
    autoTable(doc, {
      head: [requirementsData[0]],
      body: requirementsData.slice(1),
      startY: yPosition,
      styles: { 
        fontSize: 8,
        cellPadding: 3
      },
      headStyles: { 
        fillColor: [46, 125, 50],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 60 },
        1: { halign: 'center', cellWidth: 20 },
        2: { halign: 'left', cellWidth: 80 }
      }
    });
    
    // Contratos aportados
    if (proponent.contractors && proponent.contractors.length > 0) {
      yPosition = (doc as any).lastAutoTable.finalY + 15;
      
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('CONTRATOS APORTADOS', 20, yPosition);
      yPosition += 10;
      
      const contractsData = [
        ['#', 'Entidad', 'No. Contrato', 'Objeto', 'Tipo', 'Cumple']
      ];
      
      proponent.contractors.forEach((contractor, idx) => {
        contractsData.push([
          contractor.order.toString(),
          contractor.contractingEntity || 'No especificada',
          contractor.contractNumber || 'No especificado',
          contractor.object ? (contractor.object.length > 40 ? contractor.object.substring(0, 40) + '...' : contractor.object) : 'No especificado',
          contractor.contractType === 'public' ? 'Público' : 'Privado',
          contractor.contractComplies ? 'SÍ' : 'NO'
        ]);
      });
      
      autoTable(doc, {
        head: [contractsData[0]],
        body: contractsData.slice(1),
        startY: yPosition,
        styles: { 
          fontSize: 7,
          cellPadding: 2
        },
        headStyles: { 
          fillColor: [156, 39, 176],
          textColor: 255,
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 10 },
          1: { halign: 'left', cellWidth: 35 },
          2: { halign: 'left', cellWidth: 25 },
          3: { halign: 'left', cellWidth: 50 },
          4: { halign: 'center', cellWidth: 20 },
          5: { halign: 'center', cellWidth: 15 }
        }
      });
    }
    
    // Motivos de subsanación si aplica
    if (proponent.needsSubsanation && proponent.subsanationDetails && proponent.subsanationDetails.length > 0) {
      yPosition = (doc as any).lastAutoTable.finalY + 15;
      
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(220, 53, 69);
      doc.text('MOTIVOS DE SUBSANACIÓN', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      
      proponent.subsanationDetails.forEach((detail, idx) => {
        const detailLines = doc.splitTextToSize(`${idx + 1}. ${detail}`, maxWidth);
        detailLines.forEach((line: string) => {
          doc.text(line, 25, yPosition);
          yPosition += 5;
        });
      });
    }
  });
  
  // Footer con fecha de generación
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')} - Página ${i} de ${pageCount}`, 20, 285);
  }
  
  doc.save(`evaluacion-completa-proponentes-${processData.processNumber}-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportToExcel = (processData: ProcessData, proponents: Proponent[]) => {
  const workbook = XLSX.utils.book_new();
  
  // Hoja 1: Información del proceso completa
  const processInfo = [
    ['INFORMACIÓN COMPLETA DEL PROCESO', ''],
    ['', ''],
    ['Número del proceso', processData.processNumber],
    ['Objeto del proceso', processData.processObject],
    ['Fecha de cierre', new Date(processData.closingDate).toLocaleDateString('es-ES')],
    ['Valor total del contrato', `$${processData.totalContractValue.toLocaleString('es-ES')}`],
    ['Puntaje máximo posible', Object.values(processData.scoring).reduce((a, b) => a + b, 0).toFixed(2)],
    ['', ''],
    ['REQUISITOS DE EXPERIENCIA', ''],
    ['', ''],
    ['Experiencia General (SMLMV)', processData.experience.general.toString()],
    ['Experiencia Específica (SMLMV)', processData.experience.specific.toString()],
    ['Códigos Clasificadores', (processData.experience.classifierCodes || []).join(', ') || 'No especificados'],
    ['', ''],
    ['EXPERIENCIA ESPECÍFICA ADICIONAL', ''],
    ['', '']
  ];
  
  // Agregar experiencia específica adicional
  if (processData.experience.additionalSpecific && processData.experience.additionalSpecific.length > 0) {
    processData.experience.additionalSpecific.forEach((exp, idx) => {
      processInfo.push([`Criterio ${idx + 1}`, exp.name]);
      processInfo.push([`Valor requerido`, `${exp.value} ${exp.unit}`]);
      processInfo.push(['', '']);
    });
  }
  
  processInfo.push(['', '']);
  processInfo.push(['DISTRIBUCIÓN DE PUNTAJES MÁXIMOS', '']);
  processInfo.push(['', '']);
  processInfo.push(['Emprendimiento Mujer', processData.scoring.womanEntrepreneurship.toString()]);
  processInfo.push(['MIPYME', processData.scoring.mipyme.toString()]);
  processInfo.push(['Discapacitado', processData.scoring.disabled.toString()]);
  processInfo.push(['Factor de Calidad', processData.scoring.qualityFactor.toString()]);
  processInfo.push(['Factor de Calidad Ambiental', processData.scoring.environmentalQuality.toString()]);
  processInfo.push(['Apoyo a la Industria Nacional', processData.scoring.nationalIndustrySupport.toString()]);
  
  const processSheet = XLSX.utils.aoa_to_sheet(processInfo);
  processSheet['!cols'] = [{ width: 35 }, { width: 50 }];
  
  XLSX.utils.book_append_sheet(workbook, processSheet, 'Información del Proceso');
  
  // Hoja 2: Resumen completo de proponentes
  const proponentsData = [
    ['RESUMEN COMPLETO DE EVALUACIÓN DE PROPONENTES', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['#', 'Proponente', 'Tipo', 'Socios', 'Puntaje Total', 'Puntaje Máximo', '% Logrado', 'Exp. General', 'Exp. Específica', 'Exp. Esp. Adicional', 'Tarjeta Profesional', 'RUP Vigente', 'Estado', 'Emprendimiento Mujer', 'MIPYME', 'Discapacitado', 'Factor Calidad', 'Factor Calidad Ambiental', 'Apoyo Industria Nacional', 'Motivos Subsanación']
  ];
  
  const maxScore = Object.values(processData.scoring).reduce((a, b) => a + b, 0);
  
  proponents.forEach((proponent, index) => {
    const percentage = ((proponent.totalScore / maxScore) * 100).toFixed(1);
    const additionalComplies = Array.isArray(proponent.requirements.additionalSpecificExperience) 
      ? proponent.requirements.additionalSpecificExperience.every(exp => exp.complies)
      : true;
    
    const partnersInfo = proponent.isPlural && proponent.partners 
      ? proponent.partners.map(p => `${p.name} (${p.percentage}%)`).join('; ')
      : 'N/A';
    
    const subsanationReasons = proponent.needsSubsanation && proponent.subsanationDetails
      ? proponent.subsanationDetails.join('; ')
      : 'N/A';
    
    proponentsData.push([
      (index + 1).toString(),
      proponent.name,
      proponent.isPlural ? 'Plural' : 'Singular',
      partnersInfo,
      proponent.totalScore.toFixed(2),
      maxScore.toFixed(2),
      `${percentage}%`,
      proponent.requirements.generalExperience ? 'SÍ' : 'NO',
      proponent.requirements.specificExperience ? 'SÍ' : 'NO',
      additionalComplies ? 'SÍ' : 'NO',
      proponent.requirements.professionalCard ? 'SÍ' : 'NO',
      proponent.rup.complies ? 'SÍ' : 'NO',
      proponent.needsSubsanation ? 'SUBSANAR' : 'CUMPLE',
      proponent.scoring.womanEntrepreneurship.toFixed(2),
      proponent.scoring.mipyme.toFixed(2),
      proponent.scoring.disabled.toFixed(2),
      proponent.scoring.qualityFactor.toFixed(2),
      proponent.scoring.environmentalQuality.toFixed(2),
      proponent.scoring.nationalIndustrySupport.toFixed(2),
      subsanationReasons
    ]);
  });
  
  const proponentsSheet = XLSX.utils.aoa_to_sheet(proponentsData);
  
  proponentsSheet['!cols'] = [
    { width: 5 }, { width: 30 }, { width: 10 }, { width: 40 }, { width: 12 }, { width: 12 }, 
    { width: 10 }, { width: 12 }, { width: 15 }, { width: 18 }, { width: 18 }, { width: 12 }, 
    { width: 12 }, { width: 18 }, { width: 10 }, { width: 12 }, { width: 15 }, { width: 20 }, 
    { width: 22 }, { width: 60 }
  ];
  
  XLSX.utils.book_append_sheet(workbook, proponentsSheet, 'Resumen Completo');
  
  // Hoja 3: Detalle de experiencia específica adicional
  if (processData.experience.additionalSpecific && processData.experience.additionalSpecific.length > 0) {
    const additionalExpData = [
      ['DETALLE DE EXPERIENCIA ESPECÍFICA ADICIONAL', '', '', '', '', ''],
      ['', '', '', '', '', ''],
      ['Proponente', 'Criterio', 'Valor Requerido', 'Valor Aportado', 'Cumple', 'Comentarios']
    ];
    
    proponents.forEach(proponent => {
      if (Array.isArray(proponent.requirements.additionalSpecificExperience)) {
        proponent.requirements.additionalSpecificExperience.forEach((exp, idx) => {
          const processExp = processData.experience.additionalSpecific![idx];
          additionalExpData.push([
            proponent.name,
            exp.name,
            `${processExp.value} ${processExp.unit}`,
            exp.amount.toString(),
            exp.complies ? 'SÍ' : 'NO',
            exp.comment || 'Sin comentarios'
          ]);
        });
      }
    });
    
    const additionalExpSheet = XLSX.utils.aoa_to_sheet(additionalExpData);
    additionalExpSheet['!cols'] = [
      { width: 30 }, { width: 50 }, { width: 20 }, { width: 20 }, { width: 10 }, { width: 40 }
    ];
    
    XLSX.utils.book_append_sheet(workbook, additionalExpSheet, 'Experiencia Adicional');
  }
  
  // Hoja 4: Contratos por proponente
  const contractsData = [
    ['CONTRATOS APORTADOS POR PROPONENTE', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', ''],
    ['Proponente', 'No. Contrato', 'Entidad Contratante', 'Objeto', 'Tipo', 'Valor', 'Fecha Inicio', 'Fecha Fin', 'Cumple', 'Observaciones']
  ];
  
  proponents.forEach(proponent => {
    if (proponent.contractors && proponent.contractors.length > 0) {
      proponent.contractors.forEach(contractor => {
        contractsData.push([
          proponent.name,
          contractor.contractNumber || 'No especificado',
          contractor.contractingEntity || 'No especificada',
          contractor.object || 'No especificado',
          contractor.contractType === 'public' ? 'Público' : 'Privado',
          contractor.contractValue ? `$${contractor.contractValue.toLocaleString('es-ES')}` : 'No especificado',
          contractor.startDate || 'No especificada',
          contractor.endDate || 'No especificada',
          contractor.contractComplies ? 'SÍ' : 'NO',
          contractor.nonComplianceReason || 'Sin observaciones'
        ]);
      });
    } else {
      contractsData.push([
        proponent.name,
        'Sin contratos aportados',
        '', '', '', '', '', '', '', ''
      ]);
    }
  });
  
  const contractsSheet = XLSX.utils.aoa_to_sheet(contractsData);
  contractsSheet['!cols'] = [
    { width: 30 }, { width: 20 }, { width: 30 }, { width: 40 }, { width: 15 }, 
    { width: 18 }, { width: 15 }, { width: 15 }, { width: 10 }, { width: 40 }
  ];
  
  XLSX.utils.book_append_sheet(workbook, contractsSheet, 'Contratos Detallados');
  
  // Hoja 5: Comentarios detallados de puntajes
  const commentsData = [
    ['COMENTARIOS DETALLADOS DE PUNTAJES', '', '', '', '', ''],
    ['', '', '', '', '', ''],
    ['Proponente', 'Criterio', 'Puntaje Obtenido', 'Puntaje Máximo', '% Logrado', 'Comentario']
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
      const percentage = criterion.max > 0 ? ((criterion.score / criterion.max) * 100).toFixed(1) : '0.0';
      commentsData.push([
        proponent.name,
        criterion.name,
        criterion.score.toFixed(2),
        criterion.max.toFixed(2),
        `${percentage}%`,
        criterion.comment || 'Sin comentarios'
      ]);
    });
  });
  
  const commentsSheet = XLSX.utils.aoa_to_sheet(commentsData);
  commentsSheet['!cols'] = [
    { width: 30 }, { width: 25 }, { width: 15 }, { width: 15 }, { width: 12 }, { width: 50 }
  ];
  
  XLSX.utils.book_append_sheet(workbook, commentsSheet, 'Comentarios Puntajes');
  
  // Hoja 6: Estadísticas y análisis
  const stats = [
    ['ESTADÍSTICAS Y ANÁLISIS DEL PROCESO', ''],
    ['', ''],
    ['RESUMEN GENERAL', ''],
    ['Total de proponentes evaluados', proponents.length.toString()],
    ['Proponentes que cumplen requisitos', proponents.filter(p => !p.needsSubsanation).length.toString()],
    ['Proponentes que necesitan subsanación', proponents.filter(p => p.needsSubsanation).length.toString()],
    ['Proponentes plurales', proponents.filter(p => p.isPlural).length.toString()],
    ['Proponentes singulares', proponents.filter(p => !p.isPlural).length.toString()],
    ['', ''],
    ['ANÁLISIS DE PUNTAJES', ''],
    ['Puntaje promedio', (proponents.reduce((acc, p) => acc + p.totalScore, 0) / proponents.length).toFixed(2)],
    ['Puntaje más alto', Math.max(...proponents.map(p => p.totalScore)).toFixed(2)],
    ['Puntaje más bajo', Math.min(...proponents.map(p => p.totalScore)).toFixed(2)],
    ['Desviación estándar', calculateStandardDeviation(proponents.map(p => p.totalScore)).toFixed(2)],
    ['', ''],
    ['CUMPLIMIENTO POR REQUISITO', ''],
    ['Experiencia General', `${proponents.filter(p => p.requirements.generalExperience).length}/${proponents.length}`],
    ['Experiencia Específica', `${proponents.filter(p => p.requirements.specificExperience).length}/${proponents.length}`],
    ['Tarjeta Profesional', `${proponents.filter(p => p.requirements.professionalCard).length}/${proponents.length}`],
    ['RUP Vigente', `${proponents.filter(p => p.rup.complies).length}/${proponents.length}`],
    ['', ''],
    ['INFORMACIÓN DE GENERACIÓN', ''],
    ['Fecha de generación', new Date().toLocaleDateString('es-ES')],
    ['Hora de generación', new Date().toLocaleTimeString('es-ES')],
    ['Usuario/Sistema', 'Sistema de Evaluación Alcaldía']
  ];
  
  const statsSheet = XLSX.utils.aoa_to_sheet(stats);
  statsSheet['!cols'] = [{ width: 35 }, { width: 25 }];
  
  XLSX.utils.book_append_sheet(workbook, statsSheet, 'Estadísticas');
  
  XLSX.writeFile(workbook, `evaluacion-completa-proponentes-${processData.processNumber}-${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Función auxiliar para calcular desviación estándar
function calculateStandardDeviation(values: number[]): number {
  const mean = values.reduce((acc, val) => acc + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / values.length;
  return Math.sqrt(variance);
}
