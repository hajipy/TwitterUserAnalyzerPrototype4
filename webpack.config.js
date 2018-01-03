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
    extensions: [".js", ".ts"],
    alias: {
        "vue$": "vue/dist/vue.esm.js"
    }
};

var nodeSetting = {
    __dirname: false,
};

const mainProcessConfig = {
    entry: "./src/main/main.ts",
    output: {
        path: path.resolve(__dirname, "dist/main"),
        filename: "bundle.js"
    },
    target: "electron-main",
    module: moduleSetting,
    resolve: resolveSetting,
    node: nodeSetting
};

const rendererProsessConfig = {
    entry: "./src/renderer/main.ts",
    output: {
        path: path.resolve(__dirname, "dist/renderer"),
        filename: "bundle.js"
    },
    target: "electron-renderer",
    module: moduleSetting,
    resolve: resolveSetting
};

module.exports = [
    mainProcessConfig, rendererProsessConfig
];
