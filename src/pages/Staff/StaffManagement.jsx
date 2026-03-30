"use client";

import { useState, useEffect } from "react";
import {
  Pencil,
  CirclePlus,
  Trash2,
  UserIcon,
  BriefcaseIcon,
  PhoneIcon,
  MailIcon,
  IndianRupeeIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import AttendanceTracker from "./attendance-tracker";
import { EmployeeActionDialog } from "./employee-action-dialog";
import { BaseTable } from "@/components/Table/BaseTable";
import TableDataPagination from "@/components/Table/TableDataPagination";
import { Button } from "@/components/ui/button";
import StaffHeader from "./components/StaffHeader";
import { getResponsiveWidth } from "@/lib/utils/responsiveWidth";
import useEmployeeStore from "../../../store/useEmployeeStore";
import toast from "react-hot-toast";
import Backdrop from "@/components/Backdrop";
import WarningPrompt from "@/components/WarningPrompt";
import TooltipMessage from "@/components/TooltipMessage";

export default function StaffManagement({ onViewDetails }) {
  const {
    employees,
    loading,
    error,
    fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
  } = useEmployeeStore();
  const [activeTab, setActiveTab] = useState("directory");
  const [openActionDialog, setOpenActionDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const responsiveWidth = getResponsiveWidth();

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Handle actions (edit, delete, add)
  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setActionType("edit");
    setOpenActionDialog(true);
  };

  const handleDelete = async (employee) => {
    setSelectedEmployee(employee);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteEmployee(selectedEmployee.id);
      toast.success("Employee deleted successfully");
      setShowDeleteDialog(false);
      setSelectedEmployee(null);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setActionType("add");
    setOpenActionDialog(true);
  };

  const handleViewDetails = (employee) => {
    onViewDetails(employee);
  };

  // Handle form submission for dialog actions
  const handleFormSubmit = async (formData) => {
    try {
      setOpenActionDialog(false);

      if (actionType === "edit") {
        await updateEmployee(formData);
        toast.success("Employee updated successfully");
      } else if (actionType === "add") {
        await addEmployee(formData);
        toast.success("Employee added successfully");
      }

      setSelectedEmployee(null);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Filter employees based on search query
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.employee_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Define table columns
  const columns = [
    {
      accessorKey: "employee_id",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Employee ID</span>
        </div>
      ),
      cell: ({ row }) => row.original.employee_id || "-",
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <UserIcon className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">Staff Name</span>
        </div>
      ),
      cell: ({ row }) => row.original.name,
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <BriefcaseIcon className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">Role</span>
        </div>
      ),
      cell: ({ row }) => row.original.role,
    },
    {
      accessorKey: "contact_number",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <PhoneIcon className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">Phone</span>
        </div>
      ),
      cell: ({ row }) => row.original.contact_number,
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <MailIcon className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">Email</span>
        </div>
      ),
      cell: ({ row }) => row.original.email,
    },
    {
      accessorKey: "salary",
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <IndianRupeeIcon className="h-4 w-4 text-gray-600" />
          <span className="text-gray-600">Salary</span>
        </div>
      ),
      cell: ({ row }) =>
        row.original.salary
          ? `₹${Number(row.original.salary).toLocaleString()}`
          : "-",
    },
    {
      id: "actions",
      header: () => <span className="text-gray-600">Actions</span>,
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <TooltipMessage message="Edit staff">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row.original);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          </TooltipMessage>
          <TooltipMessage message="Delete staff">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.original);
            }}
          >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </TooltipMessage>
        </div>
      ),
    },
  ];

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredEmployees.slice(startIndex, endIndex);
  };

  return (
    <div className="min-h-screen">
      <StaffHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
      />

      {/* Main Content */}
      <div
        className={`container mx-auto px-4 sm:px-6 lg:px-8 ${responsiveWidth.full} ${responsiveWidth.base} ${responsiveWidth.lg} ${responsiveWidth.xl}`}
      >
        {activeTab === "directory" ? (
          <Card className="mt-4">
            <CardContent className="p-0 flex flex-col">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 px-4 sm:px-6">
                <span className="text-md font-medium text-slate-700">
                  Staffs
                </span>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                  <div className="relative w-full sm:w-[240px]">
                    <Input
                      type="search"
                      placeholder="Search Staffs..."
                      className="w-full pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>

                  <Button
                    type="submit"
                    onClick={handleAddEmployee}
                    className="w-full sm:w-auto bg-primary-500 hover:bg-primary-700 text-white"
                  >
                    <CirclePlus className="w-4 h-4 mr-2" />
                    STAFF
                  </Button>
                </div>
              </div>

              {/* Table Section */}
              <div className="p-4 sm:p-6 overflow-x-auto">
                <BaseTable
                  columns={columns}
                  data={getCurrentPageData()}
                  loading={loading}
                  onRowClick={handleViewDetails}
                  isRowClickable={true}
                  isEmpty={getCurrentPageData().length === 0}
                  emptyTitle="No staff members available"
                  emptyDescription="Add your first staff member to start managing your team"
                  emptyActionLabel="Add Staff"
                  onEmptyAction={handleAddEmployee}
                />
              </div>
              {getCurrentPageData().length > 0 && (
              <div className="mt-auto px-4 sm:px-6 pb-4">
                <TableDataPagination
                  currentPage={currentPage}
                  totalItems={filteredEmployees.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(newPageSize) => {
                    setPageSize(newPageSize);
                    setCurrentPage(1);
                  }}
                />
              </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <AttendanceTracker
            employees={employees}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
          />
        )}

        {/* Action Dialog */}
        {openActionDialog && (
          <>
            <EmployeeActionDialog
              action={actionType}
              employee={selectedEmployee}
              onClose={() => setOpenActionDialog(false)}
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
          description={`Are you sure you want to delete ${selectedEmployee?.name}? This action cannot be undone.`}
          actionText="DELETE"
          onAction={handleDeleteConfirm}
          onCancel={() => setShowDeleteDialog(false)}
          variant="danger"
        />
      </div>
    </div>
  );
}
