const { Builder, By, until } = require("selenium-webdriver");
const fs = require("fs");

(async function testPlannerAccessWithoutLogin() {
  const driver = await new Builder().forBrowser("chrome").build();
  const PLANNER_URL = "http://localhost:3000/planner";

  try {
    await driver.get(PLANNER_URL);

    // Esperar que aparezca el mensaje de "Debes iniciar sesión"
    const warningElement = await driver.wait(
      until.elementLocated(
        By.xpath("//h2[contains(text(),'Debes iniciar sesión')]")
      ),
      8000
    );

    const warningText = await warningElement.getText();
    console.assert(
      warningText.includes("Debes iniciar sesión"),
      `❌ No se encontró el mensaje esperado. Se obtuvo: "${warningText}"`
    );

    // Verificar que el formulario de planificación NO está presente
    const pageSource = await driver.getPageSource();
    console.assert(
      !pageSource.includes("Planifica tu viaje"),
      "❌ El formulario de planificación no debería mostrarse a usuarios no logueados"
    );

    console.log("✅ Acceso a /planner sin login bloqueado correctamente");
  } catch (error) {
    console.error(
      "❌ Test de acceso a planner falló:",
      error instanceof Error ? error.message : error
    );

    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync("planner-failure.png", screenshot, "base64");
    console.log("🖼️ Screenshot guardada en planner-failure.png");
  } finally {
    await driver.quit();
  }
})();
