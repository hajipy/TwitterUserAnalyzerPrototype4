const path = require("path");

module.exports = {
    entry: "./src/main/main.ts",
    output: {
        path: path.resolve(__dirname, "dist/main"),
        filename: "bundle.js"
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader"
            }
        ]
    },
    resolve: {
        extensions: [".ts"]
    }
};
