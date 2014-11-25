var config = module.exports;

config["DOMAnnotations tests"] = {
    environment: "node",
    rootPath: "../",
    sources: [
        "lib/*.js",
    ],
    tests: [
        "test/*_test.js"
    ]
};
