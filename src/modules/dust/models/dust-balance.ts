import { model } from "@medusajs/framework/utils"

const DustBalance = model.define("dust_balance", {
  id: model.id().primaryKey(),
  customer_id: model.text(),
  balance: model.number(),
})

export default DustBalance

