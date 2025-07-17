import React, { useState } from "react";
import { useSelector } from "react-redux";
import DataTable from "react-data-table-component";

const SystemManagement = () => {
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("uhf");
  const [filterText, setFilterText] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);

  // Sample data for UHF devices
  const uhfDevicesData = [
    {
      id: 1,
      name: "UHF Scanner Pro",
      model: "UHF-SP100",
      serialNumber: "UHF12345678",
      location: "Main Distribution Center",
      assignedTo: "John Smith",
      lastMaintenance: "2023-05-15",
      nextMaintenance: "2023-11-15",
      status: "active",
      companyId: 1,
      companyName: "NextGen Retail Corp",
    },
    {
      id: 2,
      name: "UHF Gate Reader",
      model: "UHF-GR200",
      serialNumber: "UHF23456789",
      location: "West Coast Facility",
      assignedTo: "Sarah Johnson",
      lastMaintenance: "2023-04-10",
      nextMaintenance: "2023-10-10",
      status: "active",
      companyId: 1,
      companyName: "NextGen Retail Corp",
    },
    {
      id: 3,
      name: "UHF Handheld Reader",
      model: "UHF-HR150",
      serialNumber: "UHF34567890",
      location: "Central Storage",
      assignedTo: "Michael Brown",
      lastMaintenance: "2023-06-20",
      nextMaintenance: "2023-12-20",
      status: "maintenance",
      companyId: 2,
      companyName: "Fashion Forward Inc",
    },
    {
      id: 4,
      name: "UHF Fixed Reader",
      model: "UHF-FR300",
      serialNumber: "UHF45678901",
      location: "Southern Hub",
      assignedTo: "Jessica Williams",
      lastMaintenance: "2023-03-05",
      nextMaintenance: "2023-09-05",
      status: "active",
      companyId: 2,
      companyName: "Fashion Forward Inc",
    },
    {
      id: 5,
      name: "UHF Desktop Reader",
      model: "UHF-DR100",
      serialNumber: "UHF56789012",
      location: "Tech Storage Facility",
      assignedTo: "David Miller",
      lastMaintenance: "2023-07-12",
      nextMaintenance: "2024-01-12",
      status: "inactive",
      companyId: 3,
      companyName: "Tech Gadgets Ltd",
    },
  ];

  // Sample data for RFID devices
  const rfidDevicesData = [
    {
      id: 1,
      name: "RFID Portal Scanner",
      model: "RFID-PS500",
      serialNumber: "RFID12345678",
      location: "Main Distribution Center",
      assignedTo: "John Smith",
      lastMaintenance: "2023-06-05",
      nextMaintenance: "2023-12-05",
      status: "active",
      companyId: 1,
      companyName: "NextGen Retail Corp",
    },
    {
      id: 2,
      name: "RFID Mobile Reader",
      model: "RFID-MR300",
      serialNumber: "RFID23456789",
      location: "West Coast Facility",
      assignedTo: "Sarah Johnson",
      lastMaintenance: "2023-05-20",
      nextMaintenance: "2023-11-20",
      status: "active",
      companyId: 1,
      companyName: "NextGen Retail Corp",
    },
    {
      id: 3,
      name: "RFID Printer",
      model: "RFID-PR200",
      serialNumber: "RFID34567890",
      location: "Central Storage",
      assignedTo: "Michael Brown",
      lastMaintenance: "2023-04-15",
      nextMaintenance: "2023-10-15",
      status: "active",
      companyId: 2,
      companyName: "Fashion Forward Inc",
    },
    {
      id: 4,
      name: "RFID Handheld Scanner",
      model: "RFID-HS150",
      serialNumber: "RFID45678901",
      location: "Southern Hub",
      assignedTo: "Jessica Williams",
      lastMaintenance: "2023-07-10",
      nextMaintenance: "2024-01-10",
      status: "maintenance",
      companyId: 2,
      companyName: "Fashion Forward Inc",
    },
    {
      id: 5,
      name: "RFID Label Printer",
      model: "RFID-LP100",
      serialNumber: "RFID56789012",
      location: "Tech Storage Facility",
      assignedTo: "David Miller",
      lastMaintenance: "2023-03-25",
      nextMaintenance: "2023-09-25",
      status: "active",
      companyId: 3,
      companyName: "Tech Gadgets Ltd",
    },
    {
      id: 6,
      name: "RFID Inventory Wand",
      model: "RFID-IW250",
      serialNumber: "RFID67890123",
      location: "Northeast Depot",
      assignedTo: "Emily Davis",
      lastMaintenance: "2023-06-30",
      nextMaintenance: "2023-12-30",
      status: "inactive",
      companyId: 1,
      companyName: "NextGen Retail Corp",
    },
  ];

  // Get the current data based on active tab
  const currentData = activeTab === "uhf" ? uhfDevicesData : rfidDevicesData;

  // Filter data based on search input and user's company (if not super_admin)
  const filteredData = currentData.filter((item) => {
    // First filter by company if user is not super_admin
    if (user.role !== "super_admin" && user.companyId !== item.companyId) {
      return false;
    }

    // Then filter by search text
    const searchText = filterText.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(searchText)) ||
      (item.model && item.model.toLowerCase().includes(searchText)) ||
      (item.serialNumber &&
        item.serialNumber.toLowerCase().includes(searchText)) ||
      (item.location && item.location.toLowerCase().includes(searchText)) ||
      (item.assignedTo && item.assignedTo.toLowerCase().includes(searchText)) ||
      (item.status && item.status.toLowerCase().includes(searchText))
    );
  });

  // Table columns
  const columns = [
    { name: "Device Name", selector: (row) => row.name, sortable: true },
    { name: "Model", selector: (row) => row.model, sortable: true },
    {
      name: "Serial Number",
      selector: (row) => row.serialNumber,
      sortable: true,
    },
    { name: "Location", selector: (row) => row.location, sortable: true },
    { name: "Assigned To", selector: (row) => row.assignedTo, sortable: true },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => {
        let statusClass = "bg-green-100 text-green-800";
        if (row.status === "maintenance") {
          statusClass = "bg-yellow-100 text-yellow-800";
        } else if (row.status === "inactive") {
          statusClass = "bg-red-100 text-red-800";
        }

        return (
          <span className={`px-2 py-1 rounded-full text-xs ${statusClass}`}>
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          </span>
        );
      },
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => {
              setSelectedDevice(row);
              setShowEditModal(true);
            }}
          >
            Edit
          </button>
          <button className="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600">
            Details
          </button>
        </div>
      ),
    },
  ];

  // If user is super_admin, add company column
  if (user.role === "super_admin") {
    columns.splice(4, 0, {
      name: "Company",
      selector: (row) => row.companyName,
      sortable: true,
    });
  }

  // Calculate device statistics
  const totalDevices = filteredData.length;
  const activeDevices = filteredData.filter(
    (device) => device.status === "active"
  ).length;
  const maintenanceDevices = filteredData.filter(
    (device) => device.status === "maintenance"
  ).length;
  const inactiveDevices = filteredData.filter(
    (device) => device.status === "inactive"
  ).length;

  // Get upcoming maintenance devices (next 30 days)
  const today = new Date();
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(today.getDate() + 30);

  const upcomingMaintenance = filteredData.filter((device) => {
    const nextMaintDate = new Date(device.nextMaintenance);
    return nextMaintDate >= today && nextMaintDate <= thirtyDaysLater;
  }).length;

  return (
    <div className="container-fluid mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">System Management</h1>
        <p className="text-gray-600">
          Manage UHF and RFID devices across all locations
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "uhf"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("uhf")}
        >
          UHF Devices
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "rfid"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("rfid")}
        >
          RFID Devices
        </button>
      </div>

      {/* Search and Add Button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div className="w-full md:w-1/3 mb-4 md:mb-0">
          <input
            type="text"
            placeholder={`Search ${activeTab.toUpperCase()} devices...`}
            className="form-input w-full"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          Add New {activeTab.toUpperCase()} Device
        </button>
      </div>

      {/* Device Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Devices</p>
              <p className="text-2xl font-bold text-gray-900">{totalDevices}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">📱</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeDevices}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-500">
              ✅
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Maintenance</p>
              <p className="text-2xl font-bold text-gray-900">
                {maintenanceDevices}
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
              🔧
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-900">
                {inactiveDevices}
              </p>
            </div>
            <div className="p-3 rounded-full bg-red-100 text-red-500">❌</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Upcoming Maintenance
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {upcomingMaintenance}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-500">
              📅
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          responsive
          highlightOnHover
          striped
          subHeader
          subHeaderComponent={
            <div className="w-full text-right py-2">
              <span className="text-sm text-gray-600">
                {filteredData.length} {activeTab.toUpperCase()} devices found
              </span>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default SystemManagement;
