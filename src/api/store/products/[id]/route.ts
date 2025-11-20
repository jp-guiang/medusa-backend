import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DUST_MODULE } from "../../../../modules/dust"
import { Modules } from "@medusajs/framework/utils"

/**
 * GET /store/products/:id
 * Extended product endpoint that includes dust settings
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params

  // Get the product module service
  const productModuleService = req.scope.resolve(Modules.PRODUCT)
  
  // Retrieve the product
  const product = await productModuleService.retrieveProduct(id)

  // Get dust settings for this product
  const dustService = req.scope.resolve(DUST_MODULE)
  const dustSettings = await dustService.getProductDustSettings(id)

  // Clean up product response - remove dust settings from metadata and root level
  const productResponse: any = {
    ...product,
  }

  // Remove dust settings from metadata if they exist
  if (productResponse.metadata) {
    const { dust_only, dust_price, ...cleanMetadata } = productResponse.metadata
    productResponse.metadata = cleanMetadata
  }

  // Remove any dust settings from root level
  delete productResponse.dust_only
  delete productResponse.dust_price

  // Add dust settings in a clean 'dust' object
  productResponse.dust = dustSettings ? {
    dust_only: dustSettings.dust_only || false,
    dust_price: dustSettings.dust_price || null,
  } : {
    dust_only: false,
    dust_price: null,
  }

  res.json({ product: productResponse })
}

