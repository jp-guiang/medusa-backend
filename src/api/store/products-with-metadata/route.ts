import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { DUST_MODULE } from "../../../modules/dust"

/**
 * GET /store/products-with-metadata
 * Custom endpoint that returns products WITH metadata included
 * This is needed because the standard /store/products endpoint doesn't return metadata
 * 
 * Note: The official Medusa loyalty points tutorial uses promotions, not metadata.
 * This endpoint is a workaround to access metadata from the storefront.
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const regionId = req.query.region_id as string | undefined
    const limit = parseInt((req.query.limit as string) || "100")

    // Fetch products with metadata using Query API
    const { data: products } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "description",
        "handle",
        "status",
        "metadata",
        "tags.*",
        "images.*",
        "options.*",
        "variants.*",
        "variants.prices.*",
        "variants.calculated_price.*",
      ],
      pagination: {
        take: limit,
      },
    })

    // Get dust settings for all products
    const dustService = req.scope.resolve(DUST_MODULE)
    const productIds = (products || []).map((p: any) => p.id)
    const dustSettingsMap = productIds.length > 0 
      ? await dustService.getProductsDustSettings(productIds)
      : {}

    // Transform to match store API format
    const transformedProducts = (products || []).map((product: any) => {
      // Clean up metadata - remove dust settings if they exist
      const cleanMetadata = { ...(product.metadata || {}) }
      delete cleanMetadata.dust_only
      delete cleanMetadata.dust_price

      // Remove dust settings from root level
      const cleanProduct: any = { ...product }
      delete cleanProduct.dust_only
      delete cleanProduct.dust_price

      return {
        ...cleanProduct,
        // Ensure metadata is included (without dust settings)
        metadata: cleanMetadata,
        // Add dust settings in a clean 'dust' object
        dust: dustSettingsMap[product.id] ? {
          dust_only: dustSettingsMap[product.id].dust_only || false,
          dust_price: dustSettingsMap[product.id].dust_price || null,
        } : {
          dust_only: false,
          dust_price: null,
        },
      }
    })

    res.json({
      products: transformedProducts,
      count: transformedProducts.length,
    })
  } catch (error: any) {
    console.error("Error fetching products with metadata:", error)
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    })
  }
}

