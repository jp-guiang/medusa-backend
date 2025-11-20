import DustModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const DUST_MODULE = "dust"

export default Module(DUST_MODULE, {
  service: DustModuleService,
})

