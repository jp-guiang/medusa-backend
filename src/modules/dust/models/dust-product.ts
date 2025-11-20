import { model } from "@medusajs/framework/utils"

/**
 * Model to link products to dust settings
 * This allows us to store dust-only flag and dust_price separately from product metadata
 */
const DustProduct = model.define("dust_product", {
  id: model.id().primaryKey(),
  product_id: model.text(),
  dust_only: model.boolean(),
  dust_price: model.number(),
})

export default DustProduct

