const path = require("path");

const moduleSetting = {
    rules: [
        {
            test: /\.ts$/,
            use: "ts-loader"
        }
    ]
};

const resolveSetting = {
    extensions: [".ts"]
};

const mainProcessConfig = {
    entry: "./src/main/main.ts",
    output: {
        path: path.resolve(__dirname, "dist/main"),
        filename: "bundle.js"
    },
    module: moduleSetting,
    resolve: resolveSetting
};

const rendererProsessConfig = {
    entry: "./src/renderer/main.ts",
    output: {
        path: path.resolve(__dirname, "dist/renderer"),
        filename: "bundle.js"
    },
    module: moduleSetting,
    resolve: resolveSetting
};

module.exports = [
    mainProcessConfig, rendererProsessConfig
];
