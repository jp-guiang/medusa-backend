import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DUST_MODULE } from "../../../../modules/dust"

/**
 * GET /store/dust/products
 * Get dust settings for all products (or specific product IDs)
 * This allows the storefront to know which products are dust-only
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const dustService = req.scope.resolve(DUST_MODULE)
    const productIds = req.query.product_ids as string | string[] | undefined

    let settings: any[] = []

    if (productIds) {
      // Get settings for specific products
      // Handle both comma-separated string and array formats
      let ids: string[] = []
      if (Array.isArray(productIds)) {
        ids = productIds
      } else if (typeof productIds === 'string') {
        // Handle comma-separated string: "id1,id2,id3"
        ids = productIds.split(',').map(id => id.trim()).filter(id => id.length > 0)
      } else {
        ids = [productIds]
      }
      
      if (ids.length > 0) {
        const settingsMap = await dustService.getProductsDustSettings(ids)
        settings = Object.values(settingsMap)
      }
    } else {
      // Get all dust product settings
      settings = await dustService.listDustProducts({})
    }

    // Transform to a map for easier lookup
    const settingsMap: Record<string, any> = {}
    settings.forEach((setting: any) => {
      settingsMap[setting.product_id] = {
        dust_only: setting.dust_only,
        dust_price: setting.dust_price,
      }
    })

    res.json({
      settings: settingsMap,
      count: Object.keys(settingsMap).length,
    })
  } catch (error: any) {
    console.error("Error fetching dust product settings:", error)
    res.status(500).json({
      message: "Failed to fetch dust product settings",
      error: error.message,
    })
  }
}

