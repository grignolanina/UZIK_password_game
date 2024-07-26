const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '/', // Définir le chemin de base pour le déploiement
  configureWebpack: {
    // Optionnel : Configurations supplémentaires si nécessaire
  },
  devServer: {
    // Optionnel : Configurations du serveur de développement
  }
});
