
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
        proponent.contractors.forEach((contract, index) => {
          contractsData.push([
            proponent.name,
            index + 1,
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

    // === PORTADA ===
    // Fondo azul para el header
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, 210, 50, 'F');

    // Título principal en blanco
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('RESUMEN DE EVALUACIÓN', 105, 25, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('Sistema de Evaluación de Proponentes', 105, 35, { align: 'center' });

    // Volver texto a negro
    doc.setTextColor(0, 0, 0);
    
    // === INFORMACIÓN DEL PROCESO ===
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('INFORMACIÓN DEL PROCESO', 20, 65);
    
    // Card de información del proceso
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(250, 250, 250);
    doc.rect(20, 70, 170, 40, 'FD');
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Número: ${processData.processNumber}`, 25, 80);
    
    // Manejar texto largo del objeto del proceso
    const objectText = `Objeto: ${processData.processObject}`;
    const objectLines = doc.splitTextToSize(objectText, 160);
    let currentObjectY = 88;
    objectLines.forEach((line: string) => {
      doc.text(line, 25, currentObjectY);
      currentObjectY += 6;
    });
    
    doc.text(`Fecha de cierre: ${processData.closingDate ? formatLocalDate(processData.closingDate) : 'No definida'}`, 25, currentObjectY + 2);
    
    const contractValue = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(processData.totalContractValue);
    doc.text(`Valor del contrato: ${contractValue}`, 25, currentObjectY + 10);

    // === RANKING DE PROPONENTES ===
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('RANKING DE PROPONENTES', 20, currentObjectY + 25);

    const rankingData = sortedProponents.map((proponent, index) => {
      const position = index + 1;
      // Reemplazar emojis con texto para evitar problemas de encoding
      const positionText = position === 1 ? '1º' : position === 2 ? '2º' : position === 3 ? '3º' : `${position}º`;
      
      // Limitar longitud del nombre para evitar desbordamiento
      const proponentName = proponent.number ? `${proponent.number}. ${proponent.name}` : proponent.name;
      const truncatedName = proponentName.length > 45 ? proponentName.substring(0, 42) + '...' : proponentName;
      
      return [
        positionText,
        truncatedName,
        proponent.isPlural ? `Plural (${proponent.partners?.length || 0} socios)` : 'Singular',
        proponent.totalScore.toFixed(2),
        proponent.needsSubsanation ? 'Sí' : 'No'
      ];
    });

    autoTable(doc, {
      head: [['Pos.', 'Proponente', 'Tipo', 'Puntaje Total', 'Requiere Subsanación']],
      body: rankingData,
      startY: currentObjectY + 30,
      styles: { 
        fontSize: 9,
        cellPadding: 3,
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      headStyles: { 
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        2: { halign: 'center', cellWidth: 30 },
        3: { halign: 'center', cellWidth: 25 },
        4: { halign: 'center', cellWidth: 30 }
      }
    });

    // === NUEVA PÁGINA: DESGLOSE DE PUNTAJES ===
    doc.addPage();
    
    // Header de la página
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('DESGLOSE DE PUNTAJES', 105, 20, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);

    const scoringData = sortedProponents.map((proponent, index) => {
      const proponentName = proponent.number ? `${proponent.number}. ${proponent.name}` : proponent.name;
      const truncatedName = proponentName.length > 35 ? proponentName.substring(0, 32) + '...' : proponentName;
      
      return [
        `${index + 1}°`,
        truncatedName,
        proponent.scoring.womanEntrepreneurship.toFixed(2),
        proponent.scoring.mipyme.toFixed(2),
        proponent.scoring.disabled.toFixed(2),
        proponent.scoring.qualityFactor.toFixed(2),
        proponent.scoring.environmentalQuality.toFixed(2),
        proponent.scoring.nationalIndustrySupport.toFixed(2),
        proponent.totalScore.toFixed(2)
      ];
    });

    autoTable(doc, {
      head: [['Pos.', 'Proponente', 'Mujer Empres.', 'MIPYME', 'Discapacidad', 'Calidad', 'Ambiental', 'Nacional', 'TOTAL']],
      body: scoringData,
      startY: 40,
      styles: { 
        fontSize: 8,
        cellPadding: 2,
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      headStyles: { 
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        2: { halign: 'center', cellWidth: 15 },
        3: { halign: 'center', cellWidth: 15 },
        4: { halign: 'center', cellWidth: 15 },
        5: { halign: 'center', cellWidth: 15 },
        6: { halign: 'center', cellWidth: 15 },
        7: { halign: 'center', cellWidth: 15 },
        8: { halign: 'center', cellWidth: 18, fontStyle: 'bold', fillColor: [230, 240, 250] }
      }
    });

    // === NUEVA PÁGINA: INFORMACIÓN DETALLADA ===
    doc.addPage();
    
    // Header de la página
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('INFORMACIÓN DETALLADA DE PROPONENTES', 105, 20, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    let currentY = 45;
    
    sortedProponents.forEach((proponent, proponentIndex) => {
      // Verificar si necesitamos nueva página
      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }

      // Card del proponente
      doc.setDrawColor(41, 128, 185);
      doc.setFillColor(245, 248, 252);
      doc.rect(15, currentY - 5, 180, 25, 'FD');

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(41, 128, 185);
      
      // Manejar nombre largo del proponente
      const proponentTitle = `${proponentIndex + 1}° LUGAR: ${proponent.number ? `${proponent.number}. ` : ''}${proponent.name}`;
      const titleLines = doc.splitTextToSize(proponentTitle, 170);
      let titleY = currentY + 5;
      titleLines.forEach((line: string) => {
        doc.text(line, 20, titleY);
        titleY += 6;
      });
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`Tipo: ${proponent.isPlural ? 'Plural' : 'Singular'} | Puntaje: ${proponent.totalScore.toFixed(2)} pts`, 20, titleY + 2);
      
      // Mostrar información de socios si es plural
      if (proponent.isPlural && proponent.partners && proponent.partners.length > 0) {
        // Manejar lista larga de socios
        const partnersText = `Socios: ${proponent.partners.map(p => p.name).join(', ')}`;
        const partnersLines = doc.splitTextToSize(partnersText, 170);
        let partnersY = titleY + 8;
        partnersLines.forEach((line: string) => {
          doc.text(line, 20, partnersY);
          partnersY += 5;
        });
        currentY = partnersY + 5;
        
        // Detalles de RUP de socios
        doc.setFontSize(9);
        doc.text('Fechas renovación RUP socios:', 25, currentY);
        currentY += 5;
        proponent.partners.forEach(partner => {
          if (partner.rupRenewalDate) {
            const rupText = `• ${partner.name}: ${formatLocalDate(partner.rupRenewalDate)}`;
            const rupLines = doc.splitTextToSize(rupText, 160);
            rupLines.forEach((line: string) => {
              doc.text(line, 30, currentY);
              currentY += 4;
            });
          }
        });
        currentY += 5;
      } else {
        currentY = titleY + 15;
      }

      if (proponent.contractors && proponent.contractors.length > 0) {
        const contractsData = proponent.contractors.map((contract, index) => [
          (index + 1).toString(),
          contract.contractingEntity || '',
          contract.contractNumber || '',
          (contract.totalValueSMMLV || 0).toString(),
          `${contract.participationPercentage || 0}%`,
          contract.contractComplies ? 'Sí' : 'No',
          contract.nonComplianceReason || ''
        ]);

        autoTable(doc, {
          head: [['#', 'Entidad Contratante', 'No. Contrato', 'Valor SMMLV', 'Part. %', 'Cumple', 'Observaciones']],
          body: contractsData,
          startY: currentY,
          styles: { 
            fontSize: 7,
            cellPadding: 2,
            lineColor: [200, 200, 200],
            lineWidth: 0.1
          },
          headStyles: { 
            fillColor: [52, 152, 219],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          margin: { left: 25, right: 25 },
          tableWidth: 'wrap',
          columnStyles: {
            0: { cellWidth: 10 },
            3: { halign: 'center' },
            4: { halign: 'center' },
            5: { halign: 'center' }
          }
        });

        currentY = (doc as any).lastAutoTable.finalY + 20;
      } else {
        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(128, 128, 128);
        doc.text('📋 Sin contratos aportados', 25, currentY);
        currentY += 20;
      }
    });

    // === NUEVA PÁGINA: REQUISITOS HABILITANTES ===
    doc.addPage();
    
    // Header de la página
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('REQUISITOS HABILITANTES', 105, 20, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);

    const requirementsData = sortedProponents.map((proponent, index) => {
      const proponentName = proponent.number ? `${proponent.number}. ${proponent.name}` : proponent.name;
      const truncatedName = proponentName.length > 35 ? proponentName.substring(0, 32) + '...' : proponentName;
      
      return [
        `${index + 1}°`,
        truncatedName,
        proponent.requirements?.generalExperience ? '✓ Sí' : '✗ No',
        proponent.requirements?.specificExperience ? '✓ Sí' : '✗ No',
        proponent.requirements?.professionalCard ? '✓ Sí' : '✗ No',
        proponent.rup?.complies ? '✓ Sí' : '✗ No'
      ];
    });

    autoTable(doc, {
      head: [['Pos.', 'Proponente', 'Exp. General', 'Exp. Específica', 'Tarjeta Prof.', 'RUP Vigente']],
      body: requirementsData,
      startY: 40,
      styles: { 
        fontSize: 9,
        cellPadding: 3,
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      headStyles: { 
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        2: { halign: 'center', cellWidth: 25 },
        3: { halign: 'center', cellWidth: 25 },
        4: { halign: 'center', cellWidth: 25 },
        5: { halign: 'center', cellWidth: 25 }
      }
    });

    // Agregar detalles de subsanación si existen
    const proponentsWithSubsanation = sortedProponents.filter(p => p.needsSubsanation && p.subsanationDetails);
    
    if (proponentsWithSubsanation.length > 0) {
      doc.addPage();
      
      // Header de la página
      doc.setFillColor(41, 128, 185);
      doc.rect(0, 0, 210, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('DETALLES DE SUBSANACIÓN', 105, 20, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      let subsanationY = 45;
      
      proponentsWithSubsanation.forEach(proponent => {
        if (subsanationY > 250) {
          doc.addPage();
          subsanationY = 20;
        }
        
        // Card del proponente
        doc.setDrawColor(220, 53, 69);
        doc.setFillColor(254, 242, 242);
        doc.rect(15, subsanationY - 5, 180, 20, 'FD');
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(220, 53, 69);
        
        // Manejar nombre largo del proponente
        const proponentTitle = `${proponent.number ? `${proponent.number}. ` : ''}${proponent.name}`;
        const titleLines = doc.splitTextToSize(proponentTitle, 170);
        let titleY = subsanationY + 5;
        titleLines.forEach((line: string) => {
          doc.text(line, 20, titleY);
          titleY += 6;
        });
        subsanationY = titleY + 10;
        
        if (Array.isArray(proponent.subsanationDetails)) {
          proponent.subsanationDetails.forEach(detail => {
            doc.setFont(undefined, 'normal');
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            
            // Manejar texto largo de subsanación
            const detailText = `• ${detail}`;
            const detailLines = doc.splitTextToSize(detailText, 170);
            detailLines.forEach((line: string) => {
              doc.text(line, 25, subsanationY);
              subsanationY += 5;
            });
            subsanationY += 2;
          });
        }
        
        subsanationY += 10;
      });
    }

    doc.save(`Evaluacion_${processData.processNumber}_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error al exportar a PDF:', error);
    throw new Error('Error al generar el archivo PDF');
  }
};
