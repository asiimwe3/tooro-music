module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      "react-native-reanimated/plugin",
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./src",
            "@components": "./src/components",
            "@screens": "./src/screens",
            "@hooks": "./src/hooks",
            "@store": "./src/store",
            "@api": "./src/api",
            "@utils": "./src/utils",
            "@types": "./src/types",
            "@constants": "./src/constants",
            "@assets": "./assets",
          },
        },
      ],
    ],
  };
};
