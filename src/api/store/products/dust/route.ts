import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DUST_MODULE } from "../../../../modules/dust"
import { Modules } from "@medusajs/framework/utils"

/**
 * GET /store/products/dust
 * Get dust settings for multiple products
 * Query param: ?ids=product_id1,product_id2,product_id3
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const productIdsParam = req.query.ids as string | undefined

  if (!productIdsParam) {
    return res.status(400).json({
      message: "ids query parameter is required (comma-separated product IDs)",
    })
  }

  const productIds = productIdsParam.split(",").map(id => id.trim()).filter(Boolean)

  if (productIds.length === 0) {
    return res.status(400).json({
      message: "At least one product ID is required",
    })
  }

  const dustService = req.scope.resolve(DUST_MODULE)
  const settingsMap = await dustService.getProductsDustSettings(productIds)

  res.json({
    products: settingsMap,
  })
}

