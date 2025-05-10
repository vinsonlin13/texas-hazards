import Papa from 'papaparse';

export const loadCSV = async () => {
  const response = await fetch('/data/NRI_Table_Counties_Texas.csv');
  const csvData = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csvData, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const filtered = results.data.map(row => ({
          COUNTY: row.COUNTY,
          POPULATION: row.POPULATION,
          RISK_SCORE: row.RISK_SCORE,
          RESL_SCORE: row.RESL_SCORE
        }));
        resolve(filtered);
      },
      error: reject
    });
  });
};