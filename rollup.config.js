import typescript from "@rollup/plugin-typescript";
import pkg from "./package.json";

export default {
    input: "src/index.ts",
    output: [
        // { file: pkg.main, format: "cjs", dir: "dist/"},
        // { file: pkg.module, format: "es" },
        // { file: pkg.browser, name: "jokits", format: "umd"},
        // { format: "cjs", dir: "dist/cjs/"},
        // { format: "es", dir: "dist/es/" },
        { name: "jokits", format: "umd", dir:"dist/"},
        
    ],
    plugins: [typescript({
        declaration: true,
        declarationDir: "dist/",
        rootDir: 'src/',

    })],
};

