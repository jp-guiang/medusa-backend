import { model } from "@medusajs/framework/utils"

const DustTransaction = model.define("dust_transaction", {
  id: model.id().primaryKey(),
  customer_id: model.text(),
  amount: model.number(), // Positive for credits, negative for debits
  type: model.text(), // "credit" or "debit"
  reference_type: model.text(), // e.g., "order", "promotion", "admin_adjustment"
  reference_id: model.text(), // ID of the related entity (order_id, etc.)
  description: model.text(),
})

export default DustTransaction

