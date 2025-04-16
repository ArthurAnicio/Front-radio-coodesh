import { test, expect } from '@playwright/test'

test('buscar uma rádio e ver resultado na lista', async ({ page }) => {
  // 1. Acesse a aplicação (troque a URL se for diferente)
  await page.goto('http://localhost:5173')

  // 2. Clique no botão de busca
  await page.click('#search')

  // 3. Digite algo na barra de busca
  await page.fill('input.searchBar', 'rock')

  // 4. Aguarde resultados carregarem
  await page.waitForTimeout(1000) // tempo para a API responder

  // 5. Verifique se algum card de rádio apareceu
  const cards = await page.locator('.cardRadio').count()
  expect(cards).toBeGreaterThan(0)
})