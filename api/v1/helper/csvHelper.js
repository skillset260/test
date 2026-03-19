const fs = require("fs");
const { Parser } = require("json2csv");

exports.writeCSV = async (filePath, data, fields) => {
  try {
    const parser = new Parser({ fields });
    const csv = parser.parse(data || []);
    await fs.promises.writeFile(filePath, csv);
  } catch (err) {
    console.log("Error writing CSV:", err);
    throw err;
  }
};
