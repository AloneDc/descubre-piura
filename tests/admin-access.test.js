const { Builder, By, until } = require("selenium-webdriver");
const fs = require("fs");

(async function testAdminAccess() {
  const driver = await new Builder().forBrowser("chrome").build();
  const LOGIN_URL = "http://localhost:3000/auth/login";
  const ADMIN_URL = "http://localhost:3000/admin";

  try {
    // === Paso 1: Login como admin ===
    console.log("🔐 Iniciando sesión como admin...");
    await driver.get(LOGIN_URL);

    await driver
      .findElement(By.name("email"))
      .sendKeys("eduardev0911@gmail.com");
    await driver.findElement(By.name("password")).sendKeys("admin1234");
    await driver.findElement(By.css("button[type='submit']")).click();

    // === Paso 2: Esperar redirección a /admin
    await driver.wait(until.urlContains("/admin"), 8000);

    const currentUrl = await driver.getCurrentUrl();
    console.assert(
      currentUrl.includes("/admin"),
      `❌ Login no redirigió a /admin. URL actual: ${currentUrl}`
    );
    console.log("✅ Redirección a /admin confirmada");

    // === Paso 3: Verificar contenido del panel
    const bodyText = await driver.findElement(By.tagName("body")).getText();

    console.assert(
      bodyText.includes("Usuarios") ||
        bodyText.includes("Itinerarios") ||
        bodyText.includes("Feedback promedio"),
      "❌ El contenido del panel de administración no se encontró"
    );

    console.log("✅ Panel de administración cargado correctamente");
    console.log("🎉 Test de acceso a /admin como admin PASÓ correctamente");
  } catch (error) {
    console.error("❌ Test falló:", error.message || error);

    const screenshot = await driver.takeScreenshot();
    fs.writeFileSync("admin-access-failure.png", screenshot, "base64");
    console.log("🖼️ Screenshot guardada en admin-access-failure.png");
  } finally {
    await driver.quit();
  }
})();
