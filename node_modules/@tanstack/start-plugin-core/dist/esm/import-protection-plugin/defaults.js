const frameworks = ["react", "solid", "vue"];
function getDefaultImportProtectionRules() {
  const clientSpecifiers = frameworks.map(
    (fw) => `@tanstack/${fw}-start/server`
  );
  return {
    client: {
      specifiers: clientSpecifiers,
      files: ["**/*.server.*"]
    },
    server: {
      specifiers: [],
      files: ["**/*.client.*"]
    }
  };
}
function getMarkerSpecifiers() {
  return {
    serverOnly: frameworks.map((fw) => `@tanstack/${fw}-start/server-only`),
    clientOnly: frameworks.map((fw) => `@tanstack/${fw}-start/client-only`)
  };
}
export {
  getDefaultImportProtectionRules,
  getMarkerSpecifiers
};
//# sourceMappingURL=defaults.js.map
