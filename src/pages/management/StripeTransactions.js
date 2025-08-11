import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import companyAPI from "../../utils/api/companyAPI";
import Breadcrumb from "../../components/Breadcrumb";

const StripeTransactions = () => {
  const { user } = useSelector((state) => state.auth);

  // State management
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState({
    status: "",
    createdAfter: "",
    createdBefore: "",
  });

  // Load transactions data
  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };

      const response = await companyAPI.getStripeTransactions(params);

      if (response.success) {
        setTransactions(response.data);
        setSummary(response.summary);
        setPagination((prev) => ({
          ...prev,
          total: response.total,
          pages: response.pagination.current.pages,
        }));
      }
    } catch (error) {
      toast.error(error.error || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  // Initial load
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  // Table columns
  const columns = [
    {
      name: "Transaction ID",
      selector: (row) => row.id,
      sortable: true,
      cell: (row) => (
        <div className="font-mono text-sm text-gray-900">{row.id}</div>
      ),
    },
    {
      name: "Type",
      selector: (row) => row.type,
      sortable: true,
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.type === "payment"
              ? "bg-blue-100 text-blue-800"
              : row.type === "subscription"
              ? "bg-green-100 text-green-800"
              : row.type === "invoice"
              ? "bg-purple-100 text-purple-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.type}
        </span>
      ),
    },
    {
      name: "Amount",
      selector: (row) => row.amount,
      sortable: true,
      cell: (row) => (
        <div className="text-right">
          <div className="font-medium text-gray-900">
            ${(row.amount / 100).toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 uppercase">{row.currency}</div>
        </div>
      ),
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.status === "succeeded" || row.status === "active"
              ? "bg-green-100 text-green-800"
              : row.status === "failed"
              ? "bg-red-100 text-red-800"
              : row.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      name: "Description",
      selector: (row) => row.description,
      sortable: true,
      cell: (row) => (
        <div
          className="text-sm text-gray-900 max-w-xs truncate"
          title={row.description}
        >
          {row.description}
        </div>
      ),
    },
    {
      name: "Created",
      selector: (row) => row.created,
      sortable: true,
      cell: (row) => (
        <div className="text-sm text-gray-900">
          {new Date(row.created * 1000).toLocaleDateString()}
        </div>
      ),
    },
    {
      name: "Customer",
      selector: (row) => row.customer,
      sortable: true,
      cell: (row) => (
        <div className="font-mono text-xs text-gray-600">{row.customer}</div>
      ),
    },
  ];

  // Filtered data
  const filteredData = transactions.filter((transaction) => {
    if (filters.status && transaction.status !== filters.status) return false;

    if (filters.createdAfter) {
      const createdDate = new Date(transaction.created * 1000);
      const afterDate = new Date(filters.createdAfter);
      if (createdDate < afterDate) return false;
    }

    if (filters.createdBefore) {
      const createdDate = new Date(transaction.created * 1000);
      const beforeDate = new Date(filters.createdBefore);
      if (createdDate > beforeDate) return false;
    }

    return true;
  });

  return (
    <div className="container-fluid mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Stripe Transactions
            </h1>
            <p className="text-gray-600">
              View comprehensive Stripe transactions, payments, and subscription
              data
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="/company-management"
              className="btn btn-secondary flex items-center gap-2"
            >
              🏢 Company Management
            </a>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb
          items={[
            { text: "Dashboard", href: "/dashboard", icon: "📊" },
            {
              text: "Company Management",
              href: "/company-management",
              icon: "🏢",
            },
            { text: "Stripe Transactions", icon: "💳" },
          ]}
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              className="form-select w-full"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">All Status</option>
              <option value="succeeded">Succeeded</option>
              <option value="active">Active</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Created After
            </label>
            <input
              type="date"
              className="form-input w-full"
              value={filters.createdAfter}
              onChange={(e) =>
                handleFilterChange("createdAfter", e.target.value)
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Created Before
            </label>
            <input
              type="date"
              className="form-input w-full"
              value={filters.createdBefore}
              onChange={(e) =>
                handleFilterChange("createdBefore", e.target.value)
              }
            />
          </div>
          <div className="flex items-end">
            <button
              className="btn btn-primary w-full"
              onClick={() => {
                setFilters({
                  status: "",
                  createdAfter: "",
                  createdBefore: "",
                });
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(summary.totalRevenue / 100).toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-500">
                💰
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Subscription Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(summary.totalSubscriptionsRevenue / 100).toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-500">
                📊
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Payments
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.totalPayments}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 text-purple-500">
                💳
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Subscriptions
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.totalSubscriptions}
                </p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
                🔄
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          paginationServer
          paginationTotalRows={pagination.total}
          onChangePage={handlePageChange}
          progressPending={loading}
          responsive
          highlightOnHover
          striped
          subHeader
          subHeaderComponent={
            <div className="w-full text-right py-2">
              <span className="text-sm text-gray-600">
                {filteredData.length} of {pagination.total} transactions found
              </span>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default StripeTransactions;
