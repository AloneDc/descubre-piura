import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";

// Para obtener __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testFiles = [
  "planner-access.test.js",
  "planner-logged.test.js",
  "admin-access-restriction.test.js",
  "protected-routes.test.js",
  "admin-access.test.js",
];

const results = [];

async function runAllTests() {
  for (const file of testFiles) {
    const filePath = path.join(__dirname, file);
    console.log(chalk.blueBright(`\n🚀 Ejecutando ${file}...\n`));

    try {
      await new Promise((resolve, reject) => {
        exec(`node "${filePath}"`, (error, stdout, stderr) => {
          if (stdout) console.log(stdout);
          if (stderr) console.error(stderr);

          if (error) reject(error);
          else resolve();
        });
      });

      results.push({ file, status: "passed" });
    } catch (err) {
      results.push({ file, status: "failed", message: err.message });
      console.error(chalk.red(`❌ Error al ejecutar ${file}: ${err.message}`));
    }
  }

  // 📊 RESUMEN FINAL
  console.log(chalk.yellowBright("\n📊 RESUMEN FINAL DE TESTS"));

  const passed = results.filter((r) => r.status === "passed");
  const failed = results.filter((r) => r.status === "failed");

  console.log(chalk.green(`\n✅ ${passed.length} PASARON:`));
  passed.forEach((r) => console.log(`  ✔️ ${r.file}`));

  if (failed.length > 0) {
    console.log(chalk.red(`\n❌ ${failed.length} FALLARON:`));
    failed.forEach((r) => {
      console.log(`  ✖️ ${r.file}`);
      if (r.message) console.log(`     ${chalk.gray(r.message)}`);
    });
  } else {
    console.log(
      chalk.greenBright(`\n🎉 ¡Todos los tests pasaron correctamente!`)
    );
  }

  console.log(chalk.blueBright("\n🧪 Pruebas finalizadas\n"));
}

runAllTests();
