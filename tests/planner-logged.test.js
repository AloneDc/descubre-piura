const { Builder, By, until } = require("selenium-webdriver");
const fs = require("fs");

(async function testPlannerAccessWithLogin() {
  const driver = await new Builder().forBrowser("chrome").build();
  const LOGIN_URL = "http://localhost:3000/auth/login";
  const PLANNER_URL = "http://localhost:3000/planner";

  try {
    // === Paso 1: Login válido ===
    await driver.get(LOGIN_URL);
    await driver
      .findElement(By.name("email"))
      .sendKeys("eduardev0911@gmail.com");
    await driver.findElement(By.name("password")).sendKeys("admin1234");
    await driver.findElement(By.css("button[type='submit']")).click();

    // Esperar que redireccione a /admin o cualquier otra página después de login
    await driver.wait(until.urlContains("/admin"), 8000);

    // === Paso 2: Ir a /planner ===
    await driver.get(PLANNER_URL);

    // Esperar que aparezca el título del formulario
    const titleElement = await driver.wait(
      until.elementLocated(
        By.xpath("//h1[contains(text(), 'Planifica tu viaje')]")
      ),
      8000
    );

    const titleText = await titleElement.getText();
    console.assert(
      titleText.includes("Planifica tu viaje"),
      `❌ No se encontró el título del planificador. Se obtuvo: "${titleText}"`
    );

    // Asegurarse que NO aparece el mensaje de "Debes iniciar sesión"
    const bodyText = await driver.findElement(By.tagName("body")).getText();
    console.assert(
      !bodyText.includes("Debes iniciar sesión"),
      "❌ El mensaje de sesión NO debería estar visible para usuarios logueados"
    );

    console.log("✅ Acceso a /planner con login confirmado correctamente");
  } catch (error) {
    console.error(
      "❌ Test de acceso a planner con login falló:",
      error instanceof Error ? error.message : error
    );

    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync("planner-login-failure.png", screenshot, "base64");
    console.log("🖼️ Screenshot guardada en planner-login-failure.png");
  } finally {
    await driver.quit();
  }
})();
