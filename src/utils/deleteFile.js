const fs = require("fs/promises");
module.exports = async function deleteFile(filePath) {
    try {
        await fs.unlink(filePath);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`File not found: ${filePath}`);
        } else {
            console.error(`Error deleting file: ${filePath}`, error);
        }
    }
}