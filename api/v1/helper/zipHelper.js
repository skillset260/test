const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

exports.createZip = async (zipPath, files) => {
  return new Promise(async (resolve, reject) => {
    try {
      await fs.promises.mkdir(path.dirname(zipPath), { recursive: true });

      const output = fs.createWriteStream(zipPath);
      const archive = archiver("zip", { zlib: { level: 9 } });

      output.on("close", () => resolve());
      output.on("error", reject);
      archive.on("error", reject);

      archive.pipe(output);

      for (const f of files) {
        archive.file(f.path, { name: f.name });
      }

      await archive.finalize();
    } catch (err) {
      reject(err);
    }
  });
};
