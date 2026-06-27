import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';

export const exportChat = (messages, format) => {
  const textContent = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
  
  if (format === 'txt' || format === 'md') {
    const blob = new Blob([textContent], { type: 'text/plain' });
    downloadBlob(blob, `mirage-chat.${format}`);
  } else if (format === 'json') {
    const blob = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' });
    downloadBlob(blob, 'mirage-chat.json');
  } else if (format === 'pdf') {
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(textContent, 180);
    doc.text(lines, 10, 10);
    doc.save('mirage-chat.pdf');
  } else if (format === 'docx') {
    const doc = new Document({
      sections: [{
        properties: {},
        children: messages.map(m => 
          new Paragraph({
            children: [
              new TextRun({ text: `${m.role}: `, bold: true }),
              new TextRun(m.content)
            ]
          })
        )
      }]
    });
    Packer.toBlob(doc).then(blob => downloadBlob(blob, 'mirage-chat.docx'));
  }
};

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
};
