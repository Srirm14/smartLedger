"use client"
import { useState } from "react"
import StaffManagement from "../StaffManagement"
import StaffDetailsView from "../staff-details-view"
export default function StaffLayout() {
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  return (
    <main className="min-h-screen">
      {selectedEmployee ? (
        <StaffDetailsView employee={selectedEmployee} onBack={() => setSelectedEmployee(null)} />
      ) : (
        <StaffManagement onViewDetails={setSelectedEmployee} />
      )}
    </main>
  )
}
