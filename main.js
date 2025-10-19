#!/usr/bin/env node
import { Command } from "commander";
import fs from "fs";

const program = new Command();

program
  .option("-i, --input <path>", "шлях до вхідного файлу JSON (обов’язковий)")
  .option("-o, --output <path>", "шлях до файлу для запису результату")
  .option("-d, --display", "вивести результат у консоль");

program.parse(process.argv);
const options = program.opts();

//перевіряємо i як обов'язковий параметр
if (!options.input) {
  console.error("Please, specify input file");
  process.exit(1);
}

//перевіряємо чи існує файл
if (!fs.existsSync(options.input)) {
  console.error("Cannot find input file");
  process.exit(1);
}

//зчитуємо файл
const fileContent = fs.readFileSync(options.input, "utf8");

//не задано жоден необов'язковий параметр
if (!options.output && !options.display) {
  process.exit(0);
}

//задано o та d
if (options.output && options.display) {
  console.log(fileContent);
  fs.writeFileSync(options.output, fileContent, "utf8");
}




