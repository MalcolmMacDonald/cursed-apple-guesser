import {readdir} from "node:fs/promises";

// read all the files in the current directory, recursively
const files = await readdir("../", {recursive: true});
console.log(files);
const screens: Element[] = files
    .filter((file) => file.endsWith(".tsx"))
    .map((file) => {
        const module = require(`../${file}`);
        return module.default;
    });

export default screens;