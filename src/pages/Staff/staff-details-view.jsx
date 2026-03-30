"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import StaffDetails from "./staff-details";
import AttendanceHistory from "./attendance-history";
import TransactionLedger from "./TransactionLedger";
import StaffHeader from "./components/StaffHeader";
import { EmployeeActionDialog } from "./employee-action-dialog";
import useEmployeeStore from "../../../store/useEmployeeStore";
import toast from "react-hot-toast";
import Backdrop from "@/components/Backdrop";
import WarningPrompt from "@/components/WarningPrompt";

export default function StaffDetailsView({
  employee: initialEmployee,
  onBack,
}) {
  const { loading, error, updateEmployee, fetchEmployee, deleteEmployee } =
    useEmployeeStore();
  const [employee, setEmployee] = useState(initialEmployee);
  const [mainTab, setMainTab] = useState("details");
  const [salaryTab, setSalaryTab] = useState("transactions");
  const [date, setDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("table");
  const [openActionDialog, setOpenActionDialog] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Refresh employee data when needed
  const refreshEmployeeData = async () => {
    try {
      const updatedEmployee = await fetchEmployee(employee.id);
      if (updatedEmployee) {
        setEmployee(updatedEmployee);
      }
    } catch (error) {
      console.error("Error refreshing employee data:", error);
    }
  };

  const handleEdit = () => {
    const employeeData = {
      ...employee,
      email: employee.email || "", // Ensure email is at least an empty string
      contact_number: employee.contact_number?.toString() || "",
      salary: employee.salary?.toString() || ""
    };
    setEditData(employeeData);
    setActionType("edit");
    setOpenActionDialog(true);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteEmployee(employee.id);
      toast.success("Employee deleted successfully");
      onBack(); // Go back to staff list
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      setOpenActionDialog(false);
      const updatedData = {
        ...formData,
        id: employee.id // Ensure ID is included
      };
      await updateEmployee(updatedData);
      await refreshEmployeeData();
      toast.success("Employee updated successfully");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setEditData(null); // Clear the edit data
    }
  };

  return (
    <div className="min-h-screen">
      <StaffHeader
        activeTab={mainTab}
        setActiveTab={setMainTab}
        currentDate={date}
        setCurrentDate={setDate}
        showTabs={false}
        onBack={onBack}
        employeeName={employee.name}
        showDatePicker={false}
      />
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            {/* Main Content Layout */}
            <div className="space-y-6">
              {/* Header Section */}
              <div className="flex justify-between items-center border-b pb-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">
                    {mainTab === "details" && "Staff Information"}
                    {mainTab === "attendance" && "Attendance History"}
                    {mainTab === "salary" && "Salary & Transaction Details"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {mainTab === "details" && "View and manage staff details"}
                    {mainTab === "attendance" && "Track attendance records"}
                    {mainTab === "salary" && "Manage salary and transactions"}
                  </p>
                </div>
              </div>

              {/* Main Content */}
              <Tabs value={mainTab} onValueChange={setMainTab}>
                <TabsContent value="details" className="mt-4">
                  <div className="px-4">
                    <StaffDetails
                      employee={employee}
                      loading={loading}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="attendance" className="mt-4">
                  <div className="px-4">
                    <AttendanceHistory
                      employeeId={employee.id}
                      viewMode={viewMode}
                      date={date}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="salary" className="mt-4">
                  <div className="px-4">
                    <TransactionLedger employeeId={employee.id} date={date} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Dialog (Edit) */}
      {openActionDialog && (
        <>
          <EmployeeActionDialog
            action={actionType}
            employee={editData || employee}
            onClose={() => {
              setOpenActionDialog(false);
              setEditData(null);
            }}
            onConfirm={handleFormSubmit}
            columns={[]}
          />
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <WarningPrompt
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Staff"
        description={`Are you sure you want to delete ${employee?.name}? This action cannot be undone.`}
        actionText="DELETE"
        onAction={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
        variant="danger"
      />
    </div>
  );
}
