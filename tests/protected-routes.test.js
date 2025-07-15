const { Builder, By, until } = require("selenium-webdriver");
const fs = require("fs");

(async function testProtectedRoutesWithoutLogin() {
  const driver = await new Builder().forBrowser("chrome").build();

  const BASE_URL = "http://localhost:3000";

  // 🧪 Lista de rutas privadas que deberían estar protegidas
  const protectedRoutes = [
    "/perfil/editar",
    "/admin/usuarios",
    "/admin",
    "/planner", // esta será tratada de forma especial
    "/perfil",
  ];

  try {
    for (const route of protectedRoutes) {
      const url = `${BASE_URL}${route}`;
      console.log(`🔍 Probando acceso sin sesión a: ${route}`);
      await driver.get(url);

      if (route === "/planner") {
        // En /planner se muestra un mensaje, no redirección
        const warningElement = await driver.wait(
          until.elementLocated(
            By.xpath("//h2[contains(text(), 'Debes iniciar sesión')]")
          ),
          8000,
          `No se encontró el mensaje de advertencia en /planner`
        );

        const warningText = await warningElement.getText();
        console.assert(
          warningText.includes("Debes iniciar sesión"),
          `❌ /planner no mostró el mensaje esperado. Texto encontrado: "${warningText}"`
        );
        console.log(`✅ "/planner" muestra aviso correctamente sin redirigir`);
      } else {
        // Para las demás rutas, esperamos redirección a /auth/login
        await driver.wait(until.urlContains("/auth/login"), 8000);

        const currentUrl = await driver.getCurrentUrl();
        console.assert(
          currentUrl.includes("/auth/login"),
          `❌ Acceso no protegido: "${route}" no redirigió a /auth/login. URL actual: ${currentUrl}`
        );

        console.log(`✅ "${route}" correctamente redirigida a /auth/login`);
      }
    }

    console.log(
      "🎉 Todas las rutas protegidas se comportan como se esperaba sin sesión"
    );
  } catch (error) {
    console.error(
      "❌ Test de rutas protegidas falló:",
      error instanceof Error ? error.message : error
    );

    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync("protected-routes-failure.png", screenshot, "base64");
    console.log("🖼️ Screenshot guardada en protected-routes-failure.png");
  } finally {
    await driver.quit();
  }
})();
