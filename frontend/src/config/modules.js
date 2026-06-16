export const optionSets = {
  productDesignStatus: ['draft', 'active', 'archived'],
  productDesignCategory: [
    'mens_suits',
    'waistcoats',
    'sherwanis',
    'shalwar_kameez',
    'kurta_pajama',
    'dress_shirts_pants',
  ],
  invoiceStatus: ['draft', 'unpaid', 'partial', 'paid', 'cancelled'],
  paymentMethod: ['cash', 'bank_transfer', 'card', 'easypaisa', 'jazzcash', 'other'],
}

export const authScreens = {
  signup: {
    title: 'Create your Velora account',
    subtitle: 'Register your account to continue to the boutique management workspace.',
    submitLabel: 'Create Account',
    fields: [
      { key: 'username', label: 'Username', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'password', label: 'Password', type: 'password', required: true },
      { key: 'image', label: 'Image', type: 'file' },
      { key: 'role', label: 'Role', type: 'select', required: true },
    ],
  },
  verifyOtp: {
    title: 'Verify your OTP',
    subtitle: 'Enter the OTP sent to your Gmail account to continue to login.',
    submitLabel: 'Verify OTP',
    fields: [
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'otp', label: 'OTP', type: 'text', required: true },
    ],
  },
  login: {
    title: 'Welcome back to Velora',
    subtitle: 'Login with your registered email and password to open the dashboard.',
    submitLabel: 'Login',
    fields: [
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'password', label: 'Password', type: 'password', required: true },
    ],
  },
}

export const accountActions = [
  {
    key: 'generate-otp',
    title: 'Generate OTP',
    submitLabel: 'Generate OTP',
    fields: [{ key: 'email', label: 'Email', type: 'email', required: true }],
  },
  {
    key: 'verify-otp',
    title: 'Verify OTP',
    submitLabel: 'Verify OTP',
    fields: [
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'otp', label: 'OTP', type: 'text', required: true },
    ],
  },
  {
    key: 'change-password',
    title: 'Change Password',
    submitLabel: 'Update Password',
    fields: [
      { key: 'old_password', label: 'Old Password', type: 'password', required: true },
      { key: 'new_password', label: 'New Password', type: 'password', required: true },
    ],
  },
]

export const dashboardCards = [
  'products_low_stock',
  'products_high_stock',
  'product_stock',
  'total_users',
  'total_clients',
  'total_workers',
  'total_products',
  'total_invoices',
  'total_payments',
  'total_product_designs',
  'total_invoices_count',
  'products',
  'product_designs',
  'payments',
]

export const modules = [
  {
    key: 'users',
    title: 'Users',
    emptyMessage: 'No users available.',
    columns: ['id', 'username', 'email', 'image', 'role'],
    fields: [
      { key: 'username', label: 'Username', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      { key: 'password', label: 'Password', type: 'password', required: true },
      { key: 'image', label: 'Image', type: 'file' },
      { key: 'role', label: 'Role', type: 'select', required: true },
    ],
  },
  {
    key: 'admin-profiles',
    title: 'Admin Profiles',
    emptyMessage: 'No profiles available.',
    columns: ['id', 'user_display', 'phone', 'admin_code'],
    fields: [
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'admin_code', label: 'Admin Code', type: 'text' },
    ],
  },
  {
    key: 'manager-profiles',
    title: 'Manager Profiles',
    emptyMessage: 'No profiles available.',
    columns: ['id', 'user_display', 'phone', 'department', 'salary', 'joining_date', 'manager_code'],
    fields: [
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'department', label: 'Department', type: 'text' },
      { key: 'salary', label: 'Salary', type: 'number' },
      { key: 'joining_date', label: 'Joining Date', type: 'date' },
      { key: 'manager_code', label: 'Manager Code', type: 'text' },
    ],
  },
  {
    key: 'worker-profiles',
    title: 'Worker Profiles',
    emptyMessage: 'No profiles available.',
    columns: ['id', 'user_display', 'phone', 'skill', 'experience_years', 'salary', 'availability'],
    fields: [
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'skill', label: 'Skill', type: 'text' },
      { key: 'experience_years', label: 'Experience Years', type: 'number' },
      { key: 'salary', label: 'Salary', type: 'number' },
      { key: 'availability', label: 'Availability', type: 'checkbox' },
    ],
  },
  {
    key: 'client-profiles',
    title: 'Client Profiles',
    emptyMessage: 'No profiles available.',
    columns: ['id', 'user_display', 'phone', 'gender', 'chest_size', 'waist_size', 'shoulder_size', 'arm_size', 'hip_size', 'neck_size'],
    fields: [
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'gender', label: 'Gender', type: 'text' },
      { key: 'chest_size', label: 'Chest Size', type: 'text' },
      { key: 'waist_size', label: 'Waist Size', type: 'text' },
      { key: 'shoulder_size', label: 'Shoulder Size', type: 'text' },
      { key: 'arm_size', label: 'Arm Size', type: 'text' },
      { key: 'hip_size', label: 'Hip Size', type: 'text' },
      { key: 'neck_size', label: 'Neck Size', type: 'text' },
    ],
  },
  {
    key: 'product-designs',
    title: 'Product Designs',
    emptyMessage: 'No product designs available.',
    columns: ['id', 'code', 'name', 'description', 'image', 'price', 'created_by', 'status', 'category'],
    illustration: '/product-design-illustration.svg',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'image', label: 'Image', type: 'file' },
      { key: 'price', label: 'Price', type: 'number' },
      { key: 'created_by', label: 'Created By', type: 'select' },
      { key: 'status', label: 'Status', type: 'select', options: optionSets.productDesignStatus },
      { key: 'category', label: 'Category', type: 'select', options: optionSets.productDesignCategory },
    ],
    filters: {
      fields: [
        { key: 'id', label: 'ID', type: 'number' },
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'category', label: 'Category', type: 'select', options: optionSets.productDesignCategory },
        { key: 'price', label: 'Price', type: 'number' },
        { key: 'description', label: 'Description', type: 'text' },
      ],
      search: true,
      ordering: ['id', 'name', 'category', 'created_at'],
    },
  },
  {
    key: 'products',
    title: 'Products',
    emptyMessage: 'No products available.',
    columns: ['id', 'design', 'title', 'stock', 'created_by'],
    illustration: '/product-inventory-illustration.svg',
    fields: [
      { key: 'design', label: 'Design', type: 'select' },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'stock', label: 'Stock', type: 'number' },
      { key: 'created_by', label: 'Created By', type: 'select' },
    ],
  },
  {
    key: 'invoices',
    title: 'Invoices',
    emptyMessage: 'No invoices available.',
    columns: ['id', 'invoice_number', 'created_by', 'customer', 'issue_date', 'due_date', 'subtotal', 'discount_amount', 'grand_total', 'tax_amount', 'paid_amount', 'remaining_amount', 'status', 'payment_method', 'notes'],
    fields: [
      { key: 'created_by', label: 'Created By', type: 'select' },
      { key: 'customer', label: 'Customer', type: 'select' },
      { key: 'issue_date', label: 'Issue Date', type: 'date' },
      { key: 'due_date', label: 'Due Date', type: 'date' },
      { key: 'subtotal', label: 'Subtotal', type: 'number' },
      { key: 'discount_amount', label: 'Discount Amount', type: 'number' },
      { key: 'grand_total', label: 'Grand Total', type: 'number' },
      { key: 'tax_amount', label: 'Tax Amount', type: 'number' },
      { key: 'paid_amount', label: 'Paid Amount', type: 'number' },
      { key: 'remaining_amount', label: 'Remaining Amount', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: optionSets.invoiceStatus },
      { key: 'payment_method', label: 'Payment Method', type: 'select', options: optionSets.paymentMethod },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
    filters: {
      fields: [
        { key: 'id', label: 'ID', type: 'number' },
        { key: 'invoice_number', label: 'Invoice Number', type: 'text' },
        { key: 'customer', label: 'Customer', type: 'select' },
        { key: 'status', label: 'Status', type: 'select', options: optionSets.invoiceStatus },
        { key: 'issue_date', label: 'Issue Date', type: 'date' },
        { key: 'due_date', label: 'Due Date', type: 'date' },
      ],
      search: true,
      ordering: ['id', 'created_at', 'issue_date', 'due_date', 'grand_total', 'paid_amount', 'remaining_amount'],
    },
  },
  {
    key: 'invoice-items',
    title: 'Invoice Items',
    emptyMessage: 'No invoice items available.',
    columns: ['id', 'invoice', 'product_design', 'item_name', 'quantity', 'unit_price', 'discount_percentage', 'tax_percentage', 'line_total', 'discount_amount', 'tax_amount'],
    fields: [
      { key: 'invoice', label: 'Invoice', type: 'select' },
      { key: 'product_design', label: 'Product Design', type: 'select' },
      { key: 'item_name', label: 'Item Name', type: 'text', required: true },
      { key: 'quantity', label: 'Quantity', type: 'number' },
      { key: 'unit_price', label: 'Unit Price', type: 'number' },
      { key: 'discount_percentage', label: 'Discount Percentage', type: 'number' },
      { key: 'tax_percentage', label: 'Tax Percentage', type: 'number' },
      { key: 'line_total', label: 'Line Total', type: 'number' },
      { key: 'discount_amount', label: 'Discount Amount', type: 'number' },
      { key: 'tax_amount', label: 'Tax Amount', type: 'number' },
    ],
    filters: {
      fields: [
        { key: 'id', label: 'ID', type: 'number' },
        { key: 'invoice', label: 'Invoice', type: 'select' },
        { key: 'product_design', label: 'Product Design', type: 'select' },
        { key: 'item_name', label: 'Item Name', type: 'text' },
      ],
      search: true,
      ordering: ['id', 'created_at', 'quantity', 'unit_price'],
    },
  },
  {
    key: 'payments',
    title: 'Payments',
    emptyMessage: 'No payments available.',
    columns: ['id', 'invoice', 'amount', 'payment_method', 'transaction_id', 'paid_at', 'received_by', 'notes'],
    fields: [
      { key: 'invoice', label: 'Invoice', type: 'select' },
      { key: 'amount', label: 'Amount', type: 'number' },
      { key: 'payment_method', label: 'Payment Method', type: 'select', options: optionSets.paymentMethod },
      { key: 'transaction_id', label: 'Transaction ID', type: 'text' },
      { key: 'paid_at', label: 'Paid At', type: 'datetime-local' },
      { key: 'received_by', label: 'Received By', type: 'select' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
    filters: {
      fields: [
        { key: 'id', label: 'ID', type: 'number' },
        { key: 'invoice', label: 'Invoice', type: 'select' },
        { key: 'payment_method', label: 'Payment Method', type: 'select', options: optionSets.paymentMethod },
        { key: 'paid_at', label: 'Paid At', type: 'datetime-local' },
      ],
      search: true,
      ordering: ['id', 'paid_at', 'amount', 'created_at'],
    },
  },
]

export const navigation = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'users', label: 'Users' },
  { key: 'profiles', label: 'Profiles' },
  { key: 'product-management', label: 'Products' },
  { key: 'billing', label: 'Billing' },
]

export const groupedPageKeys = ['profiles', 'product-management', 'billing']
