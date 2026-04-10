const { PDFParse } = require('pdf-parse');
const fs = require('fs');

async function main() {
  const buf = fs.readFileSync('C:/Users/visha/Downloads/BRSR_2025.pdf');
  const parser = new PDFParse({ data: buf });
  const result = await parser.getText({});
  console.log(`Total pages: ${result.total}`);
  console.log('---');
  console.log(result.text.slice(0, 40000));
}

main().catch(console.error);
