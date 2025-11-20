import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Input, Label } from "@medusajs/ui"
import { useState, useEffect, useCallback } from "react"

/**
 * Widget to easily mark products as dust-only and set dust price
 * This widget appears on the product details page
 */
const DustProductWidget = () => {
  const [productId, setProductId] = useState<string | null>(null)
  
  const [isDustOnly, setIsDustOnly] = useState(false)
  const [dustPrice, setDustPrice] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)

  const loadDustSettings = useCallback(async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/admin/products/${id}/dust`, {
        credentials: "include",
      })
      
      if (response.ok) {
        const data = await response.json()
        setIsDustOnly(data.dust_only || false)
        setDustPrice(data.dust_price?.toString() || "")
      }
    } catch (error) {
      console.error("Failed to load dust settings:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Get product ID and load settings when component mounts
  useEffect(() => {
    // Get product ID from window location
    const getProductId = () => {
      const path = window.location.pathname
      const match = path.match(/\/products\/([^\/]+)/)
      return match ? match[1] : null
    }
    
    const id = getProductId()
    setProductId(id)
    if (id) {
      loadDustSettings(id)
    }
  }, [loadDustSettings])

  const handleSave = async () => {
    if (!productId) return
    
    if (isDustOnly && (!dustPrice || parseInt(dustPrice) <= 0)) {
      setMessage({ type: "error", text: "Dust price is required when dust-only is enabled" })
      return
    }

    setSaving(true)
    setMessage(null)
    
    try {
      const response = await fetch(`/admin/products/${productId}/dust`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          dust_only: isDustOnly,
          dust_price: isDustOnly ? parseInt(dustPrice) : null,
        }),
      })

      if (response.ok) {
        setMessage({ type: "success", text: "Dust settings saved successfully!" })
      } else {
        const error = await response.json()
        setMessage({ type: "error", text: error.message || "Failed to save dust settings" })
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to save dust settings" })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleDustOnly = () => {
    setIsDustOnly(!isDustOnly)
    if (!isDustOnly) {
      // When enabling, set default price if empty
      if (!dustPrice) {
        setDustPrice("100")
      }
    }
  }

  if (loading) {
    return (
      <Container className="p-0">
        <div className="px-6 py-4">
          <p>Loading dust settings...</p>
        </div>
      </Container>
    )
  }

  return (
    <Container className="p-0">
      <div className="px-6 py-4">
        <Heading level="h2" className="mb-4">Dust Points Settings</Heading>
        
        {message && (
          <div className={`mb-4 p-3 rounded ${
            message.type === "success" 
              ? "bg-green-50 text-green-800 border border-green-200" 
              : "bg-red-50 text-red-800 border border-red-200"
          }`}>
            {message.text}
          </div>
        )}
        
        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isDustOnly}
              onChange={handleToggleDustOnly}
              disabled={saving}
              className="rounded"
            />
            <span>This product can only be purchased with dust points</span>
          </label>
        </div>

        {isDustOnly && (
          <div className="mb-4">
            <Label className="mb-2">
              Dust Price (points required):
            </Label>
            <Input
              type="number"
              value={dustPrice}
              onChange={(e) => setDustPrice(e.target.value)}
              placeholder="e.g., 100"
              min="1"
              disabled={saving}
            />
            <p className="mt-2 text-sm text-gray-500">
              Enter the number of dust points required to purchase this product.
            </p>
          </div>
        )}

        <div className="mt-4">
          <Button 
            onClick={handleSave} 
            disabled={saving || (isDustOnly && (!dustPrice || parseInt(dustPrice) <= 0))}
            variant="primary"
          >
            {saving ? "Saving..." : "Save Dust Settings"}
          </Button>
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default DustProductWidget

