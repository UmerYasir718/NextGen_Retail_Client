import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import { warehouseAPI } from "../../utils/helpfunction";

import { formatDate } from "../../utils/helpfunction";

const WarehousesManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [warehousesData, setwarehousesData] = useState([]);

  const [filterText, setFilterText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);

  useEffect(() => {
    fetchInventoryData();
  }, []);
  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      // const companyId = selectedCompany?.id || null;
      // if (!companyId) {
      //   setwarehousesData([]);
      //   return;
      // }

      const data = await warehouseAPI.getWarehouses("6876bda9694900c60234bf5e");
      console.log("object", data);
      setwarehousesData(Array.isArray(data?.data) ? data?.data : []);
      console.log("DATA RESPONSE", data);

      setError(null);
    } catch (err) {
      console.error("Error fetching inventory data:", err);
      // setError("Failed to load inventory data. Please try again.");
      toast.error("Failed to load inventory data");
      setwarehousesData([]);
    } finally {
      setLoading(false);
    }
  };
  // Sample data for warehouses
  // const warehousesData = [
  //   {
  //     id: 1,
  //     name: "Main Distribution Center",
  //     location: "New York, NY",
  //     address: "123 Warehouse Ave, New York, NY 10001",
  //     manager: "John Smith",
  //     phone: "555-123-4567",
  //     capacity: 10000,
  //     utilized: 6500,
  //     items: 1250,
  //     status: "active",
  //     companyId: 1,
  //     companyName: "NextGen Retail Corp",
  //   },
  //   {
  //     id: 2,
  //     name: "West Coast Facility",
  //     location: "Los Angeles, CA",
  //     address: "456 Storage Blvd, Los Angeles, CA 90001",
  //     manager: "Sarah Johnson",
  //     phone: "555-234-5678",
  //     capacity: 8000,
  //     utilized: 5200,
  //     items: 980,
  //     status: "active",
  //     companyId: 1,
  //     companyName: "NextGen Retail Corp",
  //   },
  //   {
  //     id: 3,
  //     name: "Central Storage",
  //     location: "Chicago, IL",
  //     address: "789 Inventory St, Chicago, IL 60601",
  //     manager: "Michael Brown",
  //     phone: "555-345-6789",
  //     capacity: 5000,
  //     utilized: 4800,
  //     items: 750,
  //     status: "active",
  //     companyId: 2,
  //     companyName: "Fashion Forward Inc",
  //   },
  //   {
  //     id: 4,
  //     name: "Southern Hub",
  //     location: "Atlanta, GA",
  //     address: "321 Logistics Way, Atlanta, GA 30301",
  //     manager: "Jessica Williams",
  //     phone: "555-456-7890",
  //     capacity: 7000,
  //     utilized: 3500,
  //     items: 620,
  //     status: "active",
  //     companyId: 2,
  //     companyName: "Fashion Forward Inc",
  //   },
  //   {
  //     id: 5,
  //     name: "Tech Storage Facility",
  //     location: "Austin, TX",
  //     address: "555 Tech Park, Austin, TX 78701",
  //     manager: "David Miller",
  //     phone: "555-567-8901",
  //     capacity: 3000,
  //     utilized: 1800,
  //     items: 430,
  //     status: "active",
  //     companyId: 3,
  //     companyName: "Tech Gadgets Ltd",
  //   },
  //   {
  //     id: 6,
  //     name: "Northeast Depot",
  //     location: "Boston, MA",
  //     address: "888 Supply Chain Rd, Boston, MA 02101",
  //     manager: "Emily Davis",
  //     phone: "555-678-9012",
  //     capacity: 4500,
  //     utilized: 2200,
  //     items: 510,
  //     status: "maintenance",
  //     companyId: 1,
  //     companyName: "NextGen Retail Corp",
  //   },
  //   {
  //     id: 7,
  //     name: "Pacific Northwest Storage",
  //     location: "Seattle, WA",
  //     address: "444 Warehouse District, Seattle, WA 98101",
  //     manager: "Robert Wilson",
  //     phone: "555-789-0123",
  //     capacity: 6000,
  //     utilized: 3600,
  //     items: 680,
  //     status: "active",
  //     companyId: 5,
  //     companyName: "Sports Unlimited",
  //   },
  // ];

  // Filter data based on search input and user's company (if not super_admin)
  const filteredData = warehousesData.filter((item) => {
    // First filter by company if user is not super_admin
    if (user.role !== "super_admin" && user.companyId !== item.companyId) {
      return false;
    }

    // Then filter by search text
    const searchText = filterText.toLowerCase();
    return (
      (item.name && item.name.toLowerCase().includes(searchText)) ||
      (item.location && item.location.toLowerCase().includes(searchText)) ||
      (item.manager && item.manager.toLowerCase().includes(searchText)) ||
      (item.status && item.status.toLowerCase().includes(searchText))
    );
  });

  // Table columns
  const columns = [
    { name: "Warehouse Name", selector: (row) => row.name, sortable: true },
    {
      name: "Location",
      selector: (row) => row.address.city + " " + row.address.country,
      sortable: true,
    },
    {
      name: "Manager_Info",
      selector: (row) => row?.contactInfo?.email,
      sortable: true,
    },
    {
      name: "Capacity Utilization",
      selector: (row) => row.utilized / row.capacity,
      sortable: true,
      cell: (row) => {
        const percentage = Math.round((row.utilized / row.capacity) * 100);
        let bgColor = "bg-green-500";
        if (percentage > 90) {
          bgColor = "bg-red-500";
        } else if (percentage > 70) {
          bgColor = "bg-yellow-500";
        }

        return (
          <div className="w-full">
            <div className="flex justify-between text-xs mb-1">
              <span>{percentage}%</span>
              <span>
                {row.utilized} / {row.capacity}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`${bgColor} h-2.5 rounded-full`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        );
      },
    },
    {
      name: "Status",
      selector: (row) => row?.isActive,
      sortable: true,
      cell: (row) => {
        let statusClass = "bg-green-100 text-green-800";
        const status = row?.isActive;

        if (status === true) {
          statusClass = "bg-green-100 text-green-800";
        } else if (status === false) {
          statusClass = "bg-red-100 text-red-800";
        }

        return (
          <span className={`px-2 py-1 rounded-full text-xs ${statusClass}`}>
            {status === true
              ? "Active"
              : status === false
              ? "Inactive"
              : "Unknown"}
          </span>
        );
      },
    },
    {
      name: "Created At",
      selector: (row) => formatDate(row.createdAt),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => {
              setSelectedWarehouse(row);
              setShowEditModal(true);
            }}
          >
            Edit
          </button>
          <button className="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600">
            View
          </button>
        </div>
      ),
    },
  ];

  // If user is super_admin, add company column
  if (user.role === "super_admin") {
    columns.splice(1, 0, {
      name: "Company",
      selector: (row) => row.companyName,
      sortable: true,
    });
  }

  // Calculate warehouse statistics
  const totalWarehouses = filteredData.length;
  const activeWarehouses = filteredData.filter(
    (warehouse) => warehouse.isActive === true
  ).length;
  const totalCapacity = filteredData.reduce((sum, warehouse) => {
    const capacity = Number(warehouse?.capacity);
    return sum + (isNaN(capacity) ? 0 : capacity);
  }, 0);

  const totalUtilized = filteredData.reduce(
    (sum, warehouse) => sum + warehouse.utilized,
    0
  );
  const utilizationPercentage =
    totalCapacity > 0 ? Math.round((totalUtilized / totalCapacity) * 100) : 0;

  return (
    <div className="container-fluid mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Warehouses Management
        </h1>
        <p className="text-gray-600">
          Manage warehouse locations and inventory capacity
        </p>
      </div>

      {/* Search and Add Button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div className="w-full md:w-1/3 mb-4 md:mb-0">
          <input
            type="text"
            placeholder="Search warehouses..."
            className="form-input w-full"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          Add New Warehouse
        </button>
      </div>

      {/* Warehouse Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Warehouses
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {totalWarehouses}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">🏭</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Warehouses
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {activeWarehouses}
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
              <p className="text-sm font-medium text-gray-600">
                Total Capacity
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {totalCapacity.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-500">
              📦
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Utilization</p>
              <p className="text-2xl font-bold text-gray-900">
                {utilizationPercentage}%
              </p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
              📊
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
                {filteredData.length} warehouses found
              </span>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default WarehousesManagement;
