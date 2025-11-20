import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DUST_MODULE } from "../../../../../modules/dust"

/**
 * GET /admin/products/:id/dust
 * Get dust settings for a product
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params

  const dustService = req.scope.resolve(DUST_MODULE)
  const dustSettings = await dustService.getProductDustSettings(id)

  res.json({
    dust_only: dustSettings?.dust_only || false,
    dust_price: dustSettings?.dust_price || null,
  })
}

/**
 * POST /admin/products/:id/dust
 * Set dust settings for a product
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params
  const body = req.body as { dust_only?: boolean; dust_price?: number }
  const { dust_only, dust_price } = body

  if (typeof dust_only !== "boolean") {
    return res.status(400).json({
      message: "dust_only must be a boolean",
    })
  }

  if (dust_only && (!dust_price || dust_price <= 0)) {
    return res.status(400).json({
      message: "dust_price is required and must be positive when dust_only is true",
    })
  }

  const dustService = req.scope.resolve(DUST_MODULE)
  const result = await dustService.setProductDustSettings(
    id,
    dust_only,
    dust_price || undefined
  )

  res.json({
    success: true,
    dust_only: result.dust_only,
    dust_price: result.dust_price,
  })
}

