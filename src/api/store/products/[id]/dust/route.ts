import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DUST_MODULE } from "../../../../../modules/dust"

/**
 * GET /store/products/:id/dust
 * Get dust settings for a specific product
 * This endpoint exposes dust-only flag and dust_price to the storefront
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params

  const dustService = req.scope.resolve(DUST_MODULE)
  const dustSettings = await dustService.getProductDustSettings(id)

  if (!dustSettings) {
    return res.json({
      dust_only: false,
      dust_price: null,
    })
  }

  res.json({
    dust_only: dustSettings.dust_only || false,
    dust_price: dustSettings.dust_price || null,
  })
}

