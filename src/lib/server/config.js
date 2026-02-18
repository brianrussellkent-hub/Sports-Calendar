import { SOURCES_CONFIG } from './sources.js';

export async function getConfig() {
  return SOURCES_CONFIG;
import fs from 'node:fs/promises';
import path from 'node:path';

const CONFIG_PATH = path.resolve('server/config/sources.json');

export async function getConfig() {
  const content = await fs.readFile(CONFIG_PATH, 'utf8');
  return JSON.parse(content);
}
