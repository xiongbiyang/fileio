import { expect, test } from '@playwright/test'

test('home page loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/FileIO/i)
  await expect(page.locator('body')).toContainText(/FileIO/i)
})

test('transfer tool page is reachable', async ({ page }) => {
  await page.goto('/transfer')
  await expect(page).toHaveURL(/\/transfer/)
})
