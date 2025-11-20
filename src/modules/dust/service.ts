import { MedusaService } from "@medusajs/framework/utils"
import DustBalance from "./models/dust-balance"
import DustTransaction from "./models/dust-transaction"
import DustProduct from "./models/dust-product"

class DustModuleService extends MedusaService({
  DustBalance,
  DustTransaction,
  DustProduct,
}) {
  /**
   * Get or create dust balance for a customer
   */
  async getBalance(customerId: string) {
    const balances = await this.listDustBalances({
      customer_id: customerId,
    })

    if (!balances || balances.length === 0) {
      // Create balance if it doesn't exist
      return await this.createDustBalances({
        customer_id: customerId,
        balance: 0,
      })
    }

    return balances[0]
  }

  /**
   * Credit dust to a customer
   */
  async creditDust(
    customerId: string,
    amount: number,
    referenceType?: string,
    referenceId?: string,
    description?: string
  ) {
    if (amount <= 0) {
      throw new Error("Credit amount must be positive")
    }

    const balance = await this.getBalance(customerId)

    // Create transaction record
    await this.createDustTransactions({
      customer_id: customerId,
      amount,
      type: "credit",
      reference_type: referenceType,
      reference_id: referenceId,
      description: description || `Credited ${amount} dust`,
    })

    // Update balance
    const [updated] = await this.updateDustBalances({
      selector: { id: balance.id },
      data: {
        balance: balance.balance + amount,
      },
    })

    return updated || balance
  }

  /**
   * Debit dust from a customer
   */
  async debitDust(
    customerId: string,
    amount: number,
    referenceType?: string,
    referenceId?: string,
    description?: string
  ) {
    if (amount <= 0) {
      throw new Error("Debit amount must be positive")
    }

    const balance = await this.getBalance(customerId)

    if (balance.balance < amount) {
      throw new Error("Insufficient dust balance")
    }

    // Create transaction record
    await this.createDustTransactions({
      customer_id: customerId,
      amount: -amount,
      type: "debit",
      reference_type: referenceType,
      reference_id: referenceId,
      description: description || `Debited ${amount} dust`,
    })

    // Update balance
    const [updated] = await this.updateDustBalances({
      selector: { id: balance.id },
      data: {
        balance: balance.balance - amount,
      },
    })

    return updated || balance
  }

  /**
   * Get transaction history for a customer
   */
  async getTransactionHistory(
    customerId: string,
    options?: { take?: number; skip?: number }
  ) {
    return await this.listDustTransactions({
      customer_id: customerId,
      ...options,
    })
  }

  /**
   * Set dust settings for a product
   */
  async setProductDustSettings(productId: string, dustOnly: boolean, dustPrice?: number) {
    const results = await this.listDustProducts({
      product_id: productId,
    })
    const existing = results?.[0]

    if (existing) {
      // Update existing
      const [updated] = await this.updateDustProducts({
        selector: { id: existing.id },
        data: {
          dust_only: dustOnly,
          dust_price: dustPrice ?? undefined,
        },
      })
      return updated || existing
    } else {
      // Create new
      return await this.createDustProducts({
        product_id: productId,
        dust_only: dustOnly,
        dust_price: dustPrice ?? undefined,
      })
    }
  }

  /**
   * Get dust settings for a product
   */
  async getProductDustSettings(productId: string) {
    const results = await this.listDustProducts({
      product_id: productId,
    })

    return results?.[0] || null
  }

  /**
   * Get dust settings for multiple products
   */
  async getProductsDustSettings(productIds: string[]) {
    const results = await this.listDustProducts({
      product_id: productIds,
    })

    const settingsMap: Record<string, any> = {}
    results?.forEach((setting: any) => {
      settingsMap[setting.product_id] = setting
    })

    return settingsMap
  }
}

export default DustModuleService
