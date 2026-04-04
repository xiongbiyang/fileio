import { expect, test } from '@playwright/test'

test('home page loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/ToolPort/i)
  await expect(page.locator('body')).toContainText(/ToolPort/i)
})

test('qr tool page is reachable', async ({ page }) => {
  await page.goto('/tools/qr-code')
  await expect(page).toHaveURL(/\/tools\/qr-code/)
  await expect(page.locator('body')).toContainText(/QR|二维码/i)
  await expect(page.getByRole('button', { name: /Generate|生成/i }).first()).toBeVisible()
})
