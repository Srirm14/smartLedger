"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { Trash2, CirclePlus, ToggleLeft, ToggleRight, ChevronDown, Check, X } from "lucide-react"
import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IslandDynamicTable } from "../Component/IslandDynamicTable"
import { SummaryCard } from "./salse-products-summary-card"
import useGlobalDateStore from "../../../../store/useGlobalStore"
import { useCashflowStore } from "../../../../store/usePortfolioStore"
import useInventoryStore from "../../../../store/useInventoryStore"
import { useSalesTabQuery } from "@/queryHooks/storeCachedQueries/useSalesTabQuery"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { StatusBadge } from "@/components/ui/StatusBadge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import WarningPrompt from "@/components/WarningPrompt"
import TooltipMessage from "@/components/TooltipMessage"

/**
 * SalesProductsTab - Component for managing sales products
 *
 * @param {Object} props - Component props
 * @param {Object} props.shift - Current shift information
 */
export function SalesProductsTab({ shift }) {
  const { portfolioName } = useParams()
  const navigate = useNavigate()
  const currentPath = window.location.pathname

  // Dialog state for delete confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedSalesUnit, setSelectedSalesUnit] = useState(null)

  // Get state and actions from stores
  const selectedDate = useGlobalDateStore((state) => state.selectedDate)
  const { fetchInventoryProducts, inventoryProducts: inventoryProductsList } = useInventoryStore()
  const { setTotalSales } = useCashflowStore()

  // Use React Query hook
  const {
    salesProducts: salesUnits,
    isSalesProductsListLoading,
    isUpserting,
    isDeleting,
    isUpdatingStatus,
    salesProductsError,
    upsertMeterReadings,
    deleteSalesUnitMutation,
    updateMeterReadingStatus,
  } = useSalesTabQuery(shift.portfolio_id, shift.shift_id, selectedDate)

  // Local component state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [showActions, setShowActions] = useState(false)
  const [originalData, setOriginalData] = useState([])
  const [salesProducts, setSalesProducts] = useState([])
  const [savedRows, setSavedRows] = useState(new Set())
  const [validationErrors, setValidationErrors] = useState(new Map())

  const [clickedCellDetails, setClickedCellDetails] = useState({
    row: null,
    rowIndex: null,
  })

  // Compute loading state
  const isLoading = useMemo(() => 
    isSalesProductsListLoading || isUpserting || isDeleting || isUpdatingStatus, 
    [isSalesProductsListLoading, isUpserting, isDeleting, isUpdatingStatus]
  )

  /**
   * Calculates sales income based on price and quantity
   * @param {number|string} price - Product price
   * @param {number|string} quantity - Quantity sold
   * @returns {string} Formatted sales income
   */
  const calculateSalesIncome = useCallback((price, quantity) => {
    const priceValue = Number.parseFloat(typeof price === "string" ? price.replace("₹", "") : price) || 0
    const quantityValue = Number.parseFloat(quantity) || 0
    const income = priceValue * quantityValue
    return `₹${income.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }, [])

  /**
   * Handles cell click events
   * @param {Object} row - Row data
   * @param {number} rowIndex - Index of the row
   */
  const handleCellClick = useCallback((row, rowIndex) => {
    setClickedCellDetails({ row: row, rowIndex: rowIndex })
  }, [])

  /**
   * Updates the status of a sales unit
   * @param {Object} salesUnit - Sales unit to update
   */
  const handleSalseStatusUpdate = useCallback(async (salesUnit) => {
    try {
      await updateMeterReadingStatus(salesUnit.id)
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }, [updateMeterReadingStatus])

  /**
   * Adds a new product to the table
   */
  const handleAddProduct = useCallback(() => {
    // Generate a unique temporary ID
    const uniqueTempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`

    const newProduct = {
      id: uniqueTempId,
      salesUnitName: " ",
      productName: " ",
      price: "₹0.00",
      category: "",
      uom: "",
      initialReading: null,
      currentReading: null,
      soldQuantity: "0",
      salesIncome: "₹0.00",
      portfolioName: portfolioName,
      shiftName: shift?.name || "",
    }

    setSalesProducts(prev => [newProduct, ...prev])
    setShowActions(true)
  }, [portfolioName, shift?.name])

  /**
   * Updates a row in the table and recalculates dependent values
   * @param {number} rowIndex - Index of the row to update
   * @param {string} columnId - ID of the column to update
   * @param {any} value - New value for the cell
   */
  const handleUpdateRow = useCallback((rowIndex, columnId, value) => {
    setSalesProducts(prevData => {
      // Create a deep copy of the data to avoid mutation issues
      const newData = JSON.parse(JSON.stringify(prevData))

      // Only proceed if index is valid
      if (rowIndex < 0 || rowIndex >= newData.length) {
        console.error("Invalid row index:", rowIndex)
        return prevData
      }

      const updatedRow = { ...newData[rowIndex] }

      // Handle empty values appropriately
      if (value === undefined || value === null) {
        value = ""
      }

      // Update the specific field with the new value
      updatedRow[columnId] = value

      // If product is changed, update related fields from the inventory list
      if (columnId === "productName" && value) {
        const product = inventoryProductsList.find((prod) => prod.product === value)
        if (product) {
          updatedRow.productName = product.product
          updatedRow.price = `₹${product.price}` // Might be a number or string
          updatedRow.category = product.category
          updatedRow.uom = product.uom
        }
      }

      // Validate and clean numeric inputs
      if (columnId === "initialReading" || columnId === "currentReading") {
        // Remove non-numeric characters except decimal point
        const cleanedValue = value.toString().replace(/[^\d.-]/g, "")
        updatedRow[columnId] = cleanedValue || ""
      }

      // Recalculate soldQuantity if initial or current readings are updated
      if (
        columnId === "initialReading" ||
        columnId === "currentReading" ||
        columnId === "soldQuantity" ||
        columnId === "productName"
      ) {
        const initial = Number.parseFloat(updatedRow.initialReading)
        const current = Number.parseFloat(updatedRow.currentReading)

        // Only recalc if both values are valid numbers
        if (!isNaN(initial) && !isNaN(current)) {
          updatedRow.soldQuantity = Math.abs(current - initial)
            .toFixed(2)
            .toString()
        } else {
          updatedRow.soldQuantity = "0"
        }
      }

      // Recalculate salesIncome using the updated price and soldQuantity
      let priceNum = 0
      if (typeof updatedRow.price === "string") {
        priceNum = Number.parseFloat(updatedRow.price.replace(/[^\d.-]/g, "")) || 0
      } else {
        priceNum = Number(updatedRow.price) || 0
      }

      const soldQty = Number.parseFloat(updatedRow.soldQuantity) || 0
      const income = priceNum * soldQty
      updatedRow.salesIncome = `₹${income.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`

      newData[rowIndex] = updatedRow
      return newData
    })

    setShowActions(true)

    // Remove from savedRows when edited
    setSavedRows(prevSavedRows => {
      const newSavedRows = new Set(prevSavedRows)
      newSavedRows.delete(salesProducts[rowIndex]?.id)
      return newSavedRows
    })
  }, [inventoryProductsList, salesProducts])

  // Modify the handleSave function to track which fields have validation errors
  const handleSave = useCallback(async (data) => {
    // Track which rows and fields have validation errors
    const validationErrors = new Map()

    // Identify changed products
    const changedProducts = data.filter((product) => {
      // For new temporary products (with string IDs), always include them
      if (typeof product.id === "string" && product.id.startsWith("temp-")) {
        return true
      }

      // For existing products, check if they've changed
      const originalProduct = originalData.find((orig) => orig.id === product.id)
      return !originalProduct || JSON.stringify(product) !== JSON.stringify(originalProduct)
    })

    if (changedProducts.length === 0) {
      // No changes to save
      setShowActions(false)
      return
    }

    // Check for duplicate sales unit names
    const allSalesUnitNames = salesProducts.map((product) => product.salesUnitName.trim())
    const duplicateNames = allSalesUnitNames.filter(
      (name, index) => allSalesUnitNames.indexOf(name) !== index && name !== "" && name !== " ",
    )

    if (duplicateNames.length > 0) {
      toast.error(`Sales unit name "${duplicateNames[0]}" already exists. Please use a unique name.`)
      return
    }

    // For each changed product, prepare data for API call
    const updatedData = changedProducts.map((product) => {
      // Clean and parse numeric values
      const opening =
        product.initialReading && !isNaN(Number.parseFloat(product.initialReading))
          ? Number.parseFloat(product.initialReading)
          : 0
      const closing =
        product.currentReading && !isNaN(Number.parseFloat(product.currentReading))
          ? Number.parseFloat(product.currentReading)
          : 0
      let price = 0

      if (typeof product.price === "string") {
        price = Number.parseFloat(product.price.replace(/[^\d.-]/g, "")) || 0
      } else {
        price = Number.parseFloat(product.price) || 0
      }

      const soldQty = Number.parseFloat(product.soldQuantity) || 0
      let amount = 0

      if (typeof product.salesIncome === "string") {
        amount = Number.parseFloat(product.salesIncome.replace(/[^\d.-]/g, "")) || 0
      } else {
        amount = Number.parseFloat(product.salesIncome) || 0
      }

      // Find the product ID from inventory products list
      const inventoryProduct = inventoryProductsList.find((invProduct) => invProduct.product === product.productName)

      // Validate required fields for all rows (both new and existing)
      const errors = []

      if (!product.salesUnitName || product.salesUnitName.trim() === "" || product.salesUnitName.trim() === " ") {
        errors.push("salesUnitName")
      }

      if (
        !product.productName ||
        product.productName.trim() === "" ||
        product.productName.trim() === " " ||
        !inventoryProduct
      ) {
        errors.push("productName")
      }

      if (!product.initialReading && product.initialReading !== 0) {
        errors.push("initialReading")
      }

      if (!product.currentReading && product.currentReading !== 0) {
        errors.push("currentReading")
      }

      if (errors.length > 0) {
        validationErrors.set(product.id, errors)
      }

      return {
        // Only include ID for existing products
        ...(typeof product.id !== "string" || !product.id.startsWith("temp-") ? { id: product.id } : {}),
        sales_unit_name: product.salesUnitName.trim(),
        portfolio_id: shift.portfolio_id,
        product_id: inventoryProduct?.id || null, // Use product_id instead of product_name
        opening_reading: opening.toString(),
        closing_reading: closing.toString(),
        shift_id: shift.shift_id,
        price: price,
        category: product.category.trim(),
        uom: product.uom.trim(),
        sold_quantity: soldQty,
        amount: amount,
        date: selectedDate,
      }
    })

    // Store validation errors in state to trigger UI updates
    if (validationErrors.size > 0) {
      // Create a detailed error message for each product
      const errorMessages = changedProducts
        .filter((product) => validationErrors.has(product.id))
        .map((product) => {
          const errors = validationErrors.get(product.id);
          const productName = product.salesUnitName.trim() || "Empty Sales Unit";
          const missingFields = errors.map(error => {
            switch(error) {
              case "salesUnitName":
                return "Sales Unit Name";
              case "productName":
                return "Product Name";
              case "initialReading":
                return "Opening Reading";
              case "currentReading":
                return "Closing Reading";
              default:
                return error;
            }
          }).join(", ");
          
          return { productName, missingFields };
        });

      // Set validation errors in state to trigger UI updates
      setValidationErrors(validationErrors);

      // Show detailed error message
      toast.error(
        <div className="flex flex-col gap-1">
          <span className="font-semibold">Missing Required Fields:</span>
          {errorMessages.map(({ productName, missingFields }, index) => (
            <span key={index} className="text-sm">
              • <span className="font-semibold">{productName}:</span> {missingFields}
            </span>
          ))}
        </div>,
        { duration: 5000 }
      );
      return;
    }

    try {
      await upsertMeterReadings(updatedData)
      // Clear validation errors
      setValidationErrors(new Map())

      // Add all saved product IDs to savedRows
      setSavedRows(prevSavedRows => {
        const newSavedRows = new Set(prevSavedRows)
        changedProducts.forEach((product) => {
          newSavedRows.add(product.id)
        })
        return newSavedRows
      })
      setShowActions(false)
    } catch (error) {
      console.error("Error saving sales products:", error)
    }
  }, [originalData, salesProducts, inventoryProductsList, shift.portfolio_id, shift.shift_id, selectedDate, upsertMeterReadings])

  /**
   * Resets the table data to its original state
   */
  const handleReset = useCallback(() => {
    setSalesProducts([...originalData])
    setShowActions(false)
  }, [originalData])

  /**
   * Opens the delete confirmation dialog
   * @param {Object} row - Row to delete
   */
  const handleDialogOpen = useCallback((row) => {
    setSelectedSalesUnit(row)
    setIsDeleteDialogOpen(true)
  }, [])

  /**
   * Closes the delete confirmation dialog
   */
  const handleDialogClose = useCallback(() => {
    setIsDeleteDialogOpen(false)
    setSelectedSalesUnit(null)
  }, [])

  /**
   * Deletes a sales unit after confirmation
   */
  const handleDeleteSalesUnit = useCallback(async () => {
    try {
      if (!selectedSalesUnit) {
        toast.error("No sales unit selected for deletion")
        handleDialogClose()
        return
      }
      handleDialogClose()
      await deleteSalesUnitMutation(selectedSalesUnit)
    } catch (error) {
      handleDialogClose()
    }
  }, [selectedSalesUnit, handleDialogClose, deleteSalesUnitMutation])

  /**
   * @param {number} rowIndex - Index of the row to delete
   */
  const handleDeleteRow = useCallback((rowIndex, id) => {
    const productToDelete = salesProducts[rowIndex]
    if (productToDelete) {
      if (typeof productToDelete.id === "string" && productToDelete.id.startsWith("temp-")) {
        setSalesProducts(prev => {
          const newSalesProducts = [...prev]
          newSalesProducts.splice(rowIndex, 1)
          return newSalesProducts
        })
      } else {
        setSelectedSalesUnit(id)
        setIsDeleteDialogOpen(true)
      }
    }
  }, [salesProducts])

  // Fetch inventory products on initial load
  useEffect(() => {
    fetchInventoryProducts(selectedDate)
  }, [fetchInventoryProducts, selectedDate])

  // Transform API data to UI format
  useEffect(() => {
    if (!salesUnits) return;

    try {
      const transformedData = salesUnits.map((unit) => ({
        id: unit.id,
        salesUnitName: unit.sales_unit_name,
        productName: unit.product_name,
        price: `₹${Number(unit.price).toFixed(2)}`,
        category: unit.category,
        uom: unit.uom,
        initialReading: isNaN(Number.parseFloat(unit.opening_reading)) ? "" : Number.parseFloat(unit.opening_reading),
        currentReading: isNaN(Number.parseFloat(unit.closing_reading)) ? "" : Number.parseFloat(unit.closing_reading),
        soldQuantity: unit.sold_quantity,
        salesIncome: calculateSalesIncome(unit.price, unit.sold_quantity),
        status: unit.discontinued ? "Discontinued" : "Active",
      }))

      setSalesProducts(transformedData)
      setOriginalData(transformedData)

      // Mark all existing rows as saved
      const savedIds = new Set(transformedData.map((item) => item.id))
      setSavedRows(savedIds)
    } catch (error) {
      console.error("Error transforming sales data:", error)
      toast.error("Error loading sales data")
    }
  }, [salesUnits, calculateSalesIncome])

  // Show error toast if there's an error fetching data
  useEffect(() => {
    if (salesProductsError) {
      toast.error("Failed to load sales products")
      console.error("Sales products error:", salesProductsError)
    }
  }, [salesProductsError])

  /**
   * Calculates summary data for sales
   */
  const summary = useMemo(() => {
    const fuelSales = salesProducts
      .filter((product) => product.category === "Fuel")
      .reduce((total, product) => {
        const income = Number.parseFloat(product.salesIncome.replace("₹", "").replace(/,/g, "")) || 0
        return total + income
      }, 0)

    const othersSales = salesProducts
      .filter((product) => product.category === "Others")
      .reduce((total, product) => {
        const income = Number.parseFloat(product.salesIncome.replace("₹", "").replace(/,/g, "")) || 0
        return total + income
      }, 0)

    // Create fuel breakdown data
    const fuelBreakdown = salesProducts
      .filter((product) => product.category === "Fuel")
      .reduce((acc, product) => {
        const productName = product.productName
        const income = Number.parseFloat(product.salesIncome.replace("₹", "").replace(/,/g, "")) || 0
        const quantity = Number.parseFloat(product.soldQuantity) || 0

        if (!acc[productName]) {
          acc[productName] = { income: 0, quantity: 0 }
        }
        acc[productName].income += income
        acc[productName].quantity += quantity
        return acc
      }, {})

    // Convert breakdowns to array format for display
    const fuelBreakdownArray = Object.entries(fuelBreakdown).map(([name, data]) => ({
      name,
      income: data.income,
      quantity: data.quantity,
    }))

    // Create others breakdown data
    const othersBreakdown = salesProducts
      .filter((product) => product.category === "Others")
      .reduce((acc, product) => {
        const productName = product.productName
        const income = Number.parseFloat(product.salesIncome.replace("₹", "").replace(/,/g, "")) || 0
        const quantity = Number.parseFloat(product.soldQuantity) || 0

        if (!acc[productName]) {
          acc[productName] = { income: 0, quantity: 0 }
        }
        acc[productName].income += income
        acc[productName].quantity += quantity
        return acc
      }, {})

    // Convert others breakdown to array
    const othersBreakdownArray = Object.entries(othersBreakdown).map(
      ([name, data]) => ({
        name,
        income: data.income,
        quantity: data.quantity,
      })
    );

    const totalSales = fuelSales + othersSales;
    setTotalSales(totalSales);

    return {
      fuelSales,
      othersSales,
      totalSales,
      fuelBreakdown: fuelBreakdownArray,
      othersBreakdown: othersBreakdownArray,
    };
  }, [salesProducts, setTotalSales]);

  // Memoized columns configuration
  const columns = useMemo(() => [
    {
      id: "salesUnitName",
      header: "Sales Unit Name",
      placeholder: "Enter unit name",
      renderCell: ({ value, onChange, row, rowIndex }) => {
        const isNewRow = typeof row.id === "string" && row.id.startsWith("temp-")
        const hasError = validationErrors.has(row.id) && validationErrors.get(row.id).includes("salesUnitName")
        const isInactive = row.status === "Discontinued"

        return (
          <Input
            value={value === null || value === undefined ? "" : value}
            placeholder="Enter unit name"
            onChange={(e) => onChange(e.target.value)}
            className={`h-9 ${isNewRow && hasError ? "border-red-500 focus:ring-red-500" : ""} ${isInactive ? "bg-gray-100 cursor-not-allowed text-gray-400" : ""}`}
            tabIndex={isNewRow ? 0 : -1}
            disabled={isInactive}
          />
        )
      },
      renderEmptyCell: ({ onChange }) => (
        <Input
          placeholder="Enter unit name"
          onChange={(e) => onChange(e.target.value)}
          className="h-9"
          tabIndex={0}
        />
      ),
    },
    {
      id: "productName",
      header: "Product Name",
      renderCell: ({ value, onChange, row, rowIndex }) => {
        const isNewRow = typeof row.id === "string" && row.id.startsWith("temp-")
        const hasError = validationErrors.has(row.id) && validationErrors.get(row.id).includes("productName")
        const currentProduct = inventoryProductsList?.find(p => p.product === value)
        const isDiscontinued = currentProduct?.discontinued
        const isInactive = row.status === "Discontinued"

        // For existing products, render as read-only text
        if (!isNewRow) {
          return (
            <div className={`h-9 flex items-center px-2 ${isInactive ? "text-gray-400" : ""}`}>
              {value || "Select product"}
            </div>
          )
        }

        // For new products, render as select dropdown
        return (
          <Select onValueChange={onChange} value={value || ""}>
            <SelectTrigger
              className={`h-9 ${isNewRow && hasError ? "border-red-500 focus:ring-red-500" : ""} ${isDiscontinued ? "text-gray-500" : ""}`}
              tabIndex={isNewRow ? 0 : -1}
            >
              <SelectValue>
                {value || "Select product"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {inventoryProductsList?.map((product) =>
                product.discontinued ? null : (
                  <SelectItem key={product.product} value={product.product}>
                    {product.product}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        )
      },
      renderEmptyCell: ({ onChange, value }) => (
        <Select onValueChange={onChange} value={value || ""}>
          <SelectTrigger className="h-9" tabIndex={0}>
            <SelectValue>
              {value || "Select product"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {inventoryProductsList?.map((product) =>
              product.discontinued ? null : (
                <SelectItem key={product.product} value={product.product}>
                  {product.product}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "price",
      header: "Price",
      renderCell: ({ value, row }) => {
        const isInactive = row.status === "Discontinued"
        return (
          <div className={`h-9 flex items-center px-2 ${isInactive ? "text-gray-400" : ""}`}>
            {value || "₹0.00"}
          </div>
        )
      },
      renderEmptyCell: () => <div className="h-9 flex items-center px-2 text-gray-400">₹0.00</div>,
    },
    {
      id: "initialReading",
      header: "Opening Reading /(Qty)",
      placeholder: "Enter opening reading",
      renderCell: ({ value, onChange, row }) => {
        const isNewRow = typeof row.id === "string" && row.id.startsWith("temp-")
        const hasError = validationErrors.has(row.id) && validationErrors.get(row.id).includes("initialReading")
        const isInactive = row.status === "Discontinued"

        return (
          <Input
            value={value === null || value === undefined ? "" : value}
            onChange={(e) => onChange(e.target.value)}
            className={`h-9 ${isNewRow && hasError ? "border-red-500 focus:ring-red-500" : ""} ${isInactive ? "bg-gray-100 cursor-not-allowed text-gray-400" : ""}`}
            disabled={isInactive}
            tabIndex={0} // Always tabbable for both new and saved rows
          />
        )
      },
      renderEmptyCell: ({ placeholder, onChange }) => (
        <Input placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="h-9" value="" tabIndex={0} />
      ),
    },
    {
      id: "currentReading",
      header: "Closing Reading /(Qty)",
      placeholder: "Enter closing reading",
      renderCell: ({ value, onChange, placeholder, row }) => {
        const isNewRow = typeof row.id === "string" && row.id.startsWith("temp-")
        const hasError = validationErrors.has(row.id) && validationErrors.get(row.id).includes("currentReading")
        const isInactive = row.status === "Discontinued"

        return (
          <Input
            value={value === null || value === undefined ? "" : value}
            onChange={(e) => onChange(e.target.value)}
            className={`h-9 ${isNewRow && hasError ? "border-red-500 focus:ring-red-500" : ""} ${isInactive ? "bg-gray-100 cursor-not-allowed text-gray-400" : ""}`}
            placeholder={placeholder}
            disabled={isInactive}
            tabIndex={0} // Always tabbable for both new and saved rows
          />
        )
      },
      renderEmptyCell: ({ placeholder, onChange }) => (
        <Input placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="h-9" value="" tabIndex={0} />
      ),
    },
    {
      id: "soldQuantity",
      header: "Sold Quantity",
      renderCell: ({ value, row }) => {
        const isInactive = row.status === "Discontinued"
        return (
          <div className={`h-9 flex items-center px-2 ${isInactive ? "text-gray-400" : ""}`}>
            {value || "0"}
          </div>
        )
      },
      renderEmptyCell: () => <div className="h-9 flex items-center px-2 text-gray-400">0</div>,
    },
    {
      id: "salesIncome",
      header: "Amount",
      renderCell: ({ value, row }) => {
        const isInactive = row.status === "Discontinued"
        return (
          <div className={`h-9 flex items-center px-2 ${isInactive ? "text-gray-400" : ""}`}>
            {value || "₹0.00"}
          </div>
        )
      },
      renderEmptyCell: () => <div className="h-9 flex items-center px-2 text-gray-400">₹0.00</div>,
    },
    {
      id: "status",
      header: "Status",
      renderCell: ({ value, row }) => {
        const isActive = value === "Active"
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 flex items-center gap-2" tabIndex={-1}>
                <StatusBadge status={isActive} />
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  handleSalseStatusUpdate(row)
                }}
                className={`cursor-pointer p-2 flex items-center justify-between hover:bg-transparent focus:bg-transparent focus:text-inherit ${
                  isActive 
                    ? 'bg-red-50 text-red-500 hover:text-red-600 data-[highlighted]:bg-red-50 data-[highlighted]:text-red-700' 
                    : 'bg-green-50 text-green-500 hover:text-green-600 data-[highlighted]:bg-green-50 data-[highlighted]:text-green-700'
                }`}
              >
                {isActive ? 'Make Inactive' : 'Make Active'}
                {isActive ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      renderEmptyCell: () => (
        <StatusBadge status={true} />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      renderCell: ({ rowIndex, columnId, value, row }) => (
        <TooltipMessage message="Delete sales unit">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => handleDeleteRow(rowIndex, row.id)}
          tabIndex={-1}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        </TooltipMessage>
      ),
    },
  ], [validationErrors, savedRows, inventoryProductsList, handleUpdateRow, handleSalseStatusUpdate, handleDeleteRow])

  return (
    <div className="space-y-4 md:space-y-6 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <SummaryCard
          icon="fuel"
          title="Fuel Sales"
          value={`₹${summary.fuelSales.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          details={summary.fuelBreakdown.map((item) => ({
            name: item.name,
            value: `₹${item.income.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
            quantity: `${item.quantity} ${"L"}`,
          }))}
          loading={isLoading}
        />
        <SummaryCard
          icon="consumables"
          title="Others Sales"
          value={`₹${summary.othersSales.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          details={summary.othersBreakdown.map((item) => ({
            name: item.name,
            value: `₹${item.income.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
            quantity: `${item.quantity} units`,
          }))}
          loading={isLoading}
        />
        <SummaryCard
          icon="total"
          title="Total Sales"
          value={`₹${summary.totalSales.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          details={[
            {
              name: "Fuel",
              value: `₹${summary.fuelSales.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`,
            },
            {
              name: "Others",
              value: `₹${summary.othersSales.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`,
            },
          ]}
          loading={isLoading}
        />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 md:mb-4 gap-2 sm:gap-0">
        <h2 className="text-base md:text-lg font-medium md:font-semibold">Sales Products</h2>

        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          {showActions && (
            <div className="flex items-center gap-1 md:gap-2">
              <Button onClick={() => handleSave(salesProducts)} className="px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm rounded-lg" disabled={isLoading}>
                Save
              </Button>
              <Button variant="outline" onClick={handleReset} className="px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm rounded-lg" disabled={isLoading}>
                Reset
              </Button>
            </div>
          )}
          <Button
            onClick={handleAddProduct}
            className="px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm rounded-lg flex items-center space-x-1 md:space-x-2"
            disabled={isLoading}
          >
            <CirclePlus className="h-3 w-3 md:h-4 md:w-4" />
            <span>Add Sales Unit</span>
          </Button>
        </div>
      </div>

      <IslandDynamicTable
        columns={columns}
        data={salesProducts}
        onUpdateRow={handleUpdateRow}
        onDeleteRow={handleDeleteRow}
        loading={isLoading}
        onCellClick={handleCellClick}
        onSave={handleSave}
        onReset={handleReset}
        parentComponent={"salesTab"}
      />

      <WarningPrompt
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Sales Unit"
        description="Are you sure you want to delete this sales unit? This action cannot be undone."
        actionText="DELETE"
        onAction={handleDeleteSalesUnit}
        onCancel={() => setIsDeleteDialogOpen(false)}
        variant="danger"
      />
    </div>
  )
}
