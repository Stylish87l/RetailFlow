import {
  tenants,
  users,
  products,
  transactions,
  transactionItems,
  returns,
  returnItems,
  cashHandovers,
  type Tenant,
  type User,
  type Product,
  type Transaction,
  type TransactionItem,
  type Return,
  type CashHandover,
  type InsertTenant,
  type InsertUser,
  type InsertProduct,
  type InsertTransaction,
  type InsertTransactionItem,
  type InsertReturn,
  type InsertCashHandover,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, sum, count } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // Tenant operations
  getTenant(subdomain: string): Promise<Tenant | undefined>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;

  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(tenantId: string, username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsersByTenant(tenantId: string): Promise<User[]>;

  // Product operations
  getProducts(tenantId: string): Promise<Product[]>;
  getProduct(id: string, tenantId: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, tenantId: string, updates: Partial<Product>): Promise<Product>;
  deleteProduct(id: string, tenantId: string): Promise<boolean>;
  getProductByBarcode(barcode: string, tenantId: string): Promise<Product | undefined>;
  updateProductStock(id: string, tenantId: string, quantity: number): Promise<void>;

  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  addTransactionItems(items: InsertTransactionItem[]): Promise<TransactionItem[]>;
  getTransaction(id: string, tenantId: string): Promise<Transaction | undefined>;
  getTransactions(tenantId: string, limit?: number): Promise<Transaction[]>;
  updateTransactionStatus(id: string, tenantId: string, status: string): Promise<Transaction>;

  // Returns operations
  createReturn(returnData: InsertReturn): Promise<Return>;
  getReturns(tenantId: string): Promise<Return[]>;

  // Cash handover operations
  createCashHandover(handover: InsertCashHandover): Promise<CashHandover>;
  getCashHandovers(tenantId: string): Promise<CashHandover[]>;
  updateCashHandover(id: string, tenantId: string, updates: Partial<CashHandover>): Promise<CashHandover>;

  // Analytics operations
  getDashboardKPIs(tenantId: string): Promise<{
    todaySales: number;
    todayTransactions: number;
    lowStockItems: number;
    activeStaff: number;
  }>;
  getSalesReport(tenantId: string, startDate: Date, endDate: Date): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getTenant(subdomain: string): Promise<Tenant | undefined> {
    const [tenant] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.subdomain, subdomain));
    return tenant;
  }

  async createTenant(tenant: InsertTenant): Promise<Tenant> {
    const [newTenant] = await db
      .insert(tenants)
      .values(tenant)
      .returning();
    return newTenant;
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(tenantId: string, username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.tenantId, tenantId), eq(users.username, username)));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values(user)
      .returning();
    return newUser;
  }

  async getUsersByTenant(tenantId: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.tenantId, tenantId));
  }

  async getProducts(tenantId: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(and(eq(products.tenantId, tenantId), eq(products.isActive, true)))
      .orderBy(products.name);
  }

  async getProduct(id: string, tenantId: string): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db
      .insert(products)
      .values(product)
      .returning();
    return newProduct;
  }

  async updateProduct(id: string, tenantId: string, updates: Partial<Product>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: string, tenantId: string): Promise<boolean> {
    const result = await db
      .update(products)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getProductByBarcode(barcode: string, tenantId: string): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.barcode, barcode), eq(products.tenantId, tenantId)));
    return product;
  }

  async updateProductStock(id: string, tenantId: string, quantity: number): Promise<void> {
    await db
      .update(products)
      .set({ 
        stock: sql`${products.stock} - ${quantity}`,
        updatedAt: new Date()
      })
      .where(and(eq(products.id, id), eq(products.tenantId, tenantId)));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async addTransactionItems(items: InsertTransactionItem[]): Promise<TransactionItem[]> {
    return await db
      .insert(transactionItems)
      .values(items)
      .returning();
  }

  async getTransaction(id: string, tenantId: string): Promise<Transaction | undefined> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), eq(transactions.tenantId, tenantId)));
    return transaction;
  }

  async getTransactions(tenantId: string, limit: number = 50): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.tenantId, tenantId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  async updateTransactionStatus(id: string, tenantId: string, status: string): Promise<Transaction> {
    const [updatedTransaction] = await db
      .update(transactions)
      .set({ status: status as any, updatedAt: new Date() })
      .where(and(eq(transactions.id, id), eq(transactions.tenantId, tenantId)))
      .returning();
    return updatedTransaction;
  }

  async createReturn(returnData: InsertReturn): Promise<Return> {
    const [newReturn] = await db
      .insert(returns)
      .values(returnData)
      .returning();
    return newReturn;
  }

  async getReturns(tenantId: string): Promise<Return[]> {
    return await db
      .select()
      .from(returns)
      .where(eq(returns.tenantId, tenantId))
      .orderBy(desc(returns.createdAt));
  }

  async createCashHandover(handover: InsertCashHandover): Promise<CashHandover> {
    const [newHandover] = await db
      .insert(cashHandovers)
      .values(handover)
      .returning();
    return newHandover;
  }

  async getCashHandovers(tenantId: string): Promise<CashHandover[]> {
    return await db
      .select()
      .from(cashHandovers)
      .where(eq(cashHandovers.tenantId, tenantId))
      .orderBy(desc(cashHandovers.createdAt));
  }

  async updateCashHandover(id: string, tenantId: string, updates: Partial<CashHandover>): Promise<CashHandover> {
    const [updatedHandover] = await db
      .update(cashHandovers)
      .set(updates)
      .where(and(eq(cashHandovers.id, id), eq(cashHandovers.tenantId, tenantId)))
      .returning();
    return updatedHandover;
  }

  async getDashboardKPIs(tenantId: string): Promise<{
    todaySales: number;
    todayTransactions: number;
    lowStockItems: number;
    activeStaff: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's sales
    const [salesResult] = await db
      .select({ total: sum(transactions.total) })
      .from(transactions)
      .where(and(
        eq(transactions.tenantId, tenantId),
        eq(transactions.status, "completed"),
        sql`${transactions.createdAt} >= ${today}`,
        sql`${transactions.createdAt} < ${tomorrow}`
      ));

    // Today's transaction count
    const [transactionResult] = await db
      .select({ count: count() })
      .from(transactions)
      .where(and(
        eq(transactions.tenantId, tenantId),
        sql`${transactions.createdAt} >= ${today}`,
        sql`${transactions.createdAt} < ${tomorrow}`
      ));

    // Low stock items
    const [lowStockResult] = await db
      .select({ count: count() })
      .from(products)
      .where(and(
        eq(products.tenantId, tenantId),
        eq(products.isActive, true),
        sql`${products.stock} <= ${products.minStock}`
      ));

    // Active staff count
    const [staffResult] = await db
      .select({ count: count() })
      .from(users)
      .where(and(eq(users.tenantId, tenantId), eq(users.isActive, true)));

    return {
      todaySales: Number(salesResult?.total || 0),
      todayTransactions: Number(transactionResult?.count || 0),
      lowStockItems: Number(lowStockResult?.count || 0),
      activeStaff: Number(staffResult?.count || 0),
    };
  }

  async getSalesReport(tenantId: string, startDate: Date, endDate: Date): Promise<any> {
    const salesData = await db
      .select({
        date: sql`DATE(${transactions.createdAt})`.as("date"),
        total: sum(transactions.total),
        count: count(),
      })
      .from(transactions)
      .where(and(
        eq(transactions.tenantId, tenantId),
        eq(transactions.status, "completed"),
        sql`${transactions.createdAt} >= ${startDate}`,
        sql`${transactions.createdAt} <= ${endDate}`
      ))
      .groupBy(sql`DATE(${transactions.createdAt})`)
      .orderBy(sql`DATE(${transactions.createdAt})`);

    return salesData;
  }
}

// In-memory storage for development when database is unavailable
export class MemStorage implements IStorage {
  private tenants: Map<string, Tenant> = new Map();
  private users: Map<string, User> = new Map();
  private products: Map<string, Product> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private transactionItems: Map<string, TransactionItem> = new Map();
  private returns: Map<string, Return> = new Map();
  private cashHandovers: Map<string, CashHandover> = new Map();

  constructor() {
    // Initialize with demo data
    this.initializeDemoData();
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private async initializeDemoData() {
    // Create demo tenant
    const demoTenant: Tenant = {
      id: "demo-tenant-1",
      name: "Demo Shop",
      subdomain: "demo",
      address: "123 Demo Street",
      phone: "+1234567890",
      email: "demo@shop.com",
      logoUrl: null,
      primaryColor: "#1976D2",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tenants.set("demo", demoTenant);

    // Create demo user
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const demoUser: User = {
      id: "demo-user-1",
      tenantId: "demo-tenant-1",
      username: "admin",
      email: "admin@shop.com",
      passwordHash: hashedPassword,
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set("demo-user-1", demoUser);

    // Create demo products
    const demoProducts: Product[] = [
      {
        id: "prod-1",
        tenantId: "demo-tenant-1",
        name: "Coca Cola",
        description: "Classic Coca Cola 500ml",
        sku: "CC-500",
        barcode: "123456789",
        category: "beverages",
        price: "2.50",
        cost: "1.50",
        stock: 50,
        minStock: 10,
        imageUrl: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "prod-2",
        tenantId: "demo-tenant-1",
        name: "Bread",
        description: "Fresh white bread",
        sku: "BR-001",
        barcode: "987654321",
        category: "household",
        price: "1.50",
        cost: "0.80",
        stock: 25,
        minStock: 5,
        imageUrl: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    
    demoProducts.forEach(product => {
      this.products.set(product.id, product);
    });
  }

  async getTenant(subdomain: string): Promise<Tenant | undefined> {
    return this.tenants.get(subdomain);
  }

  async createTenant(tenant: InsertTenant): Promise<Tenant> {
    const newTenant: Tenant = {
      id: this.generateId(),
      ...tenant,
      address: tenant.address ?? null,
      phone: tenant.phone ?? null,
      email: tenant.email ?? null,
      logoUrl: tenant.logoUrl ?? null,
      primaryColor: tenant.primaryColor ?? null,
      isActive: tenant.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tenants.set(newTenant.subdomain, newTenant);
    return newTenant;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(tenantId: string, username: string): Promise<User | undefined> {
    for (const user of Array.from(this.users.values())) {
      if (user.tenantId === tenantId && user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: this.generateId(),
      ...user,
      email: user.email ?? null,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      role: user.role ?? "staff",
      isActive: user.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async getUsersByTenant(tenantId: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.tenantId === tenantId);
  }

  async getProducts(tenantId: string): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(product => product.tenantId === tenantId && product.isActive)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async getProduct(id: string, tenantId: string): Promise<Product | undefined> {
    const product = this.products.get(id);
    return product && product.tenantId === tenantId ? product : undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const newProduct: Product = {
      id: this.generateId(),
      ...product,
      description: product.description ?? null,
      barcode: product.barcode ?? null,
      category: product.category ?? "other",
      cost: product.cost ?? null,
      stock: product.stock ?? 0,
      minStock: product.minStock ?? 0,
      imageUrl: product.imageUrl ?? null,
      isActive: product.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.set(newProduct.id, newProduct);
    return newProduct;
  }

  async updateProduct(id: string, tenantId: string, updates: Partial<Product>): Promise<Product> {
    const product = this.products.get(id);
    if (!product || product.tenantId !== tenantId) {
      throw new Error("Product not found");
    }
    const updatedProduct = { ...product, ...updates, updatedAt: new Date() };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string, tenantId: string): Promise<boolean> {
    const product = this.products.get(id);
    if (!product || product.tenantId !== tenantId) {
      return false;
    }
    const updatedProduct = { ...product, isActive: false, updatedAt: new Date() };
    this.products.set(id, updatedProduct);
    return true;
  }

  async getProductByBarcode(barcode: string, tenantId: string): Promise<Product | undefined> {
    for (const product of Array.from(this.products.values())) {
      if (product.barcode === barcode && product.tenantId === tenantId) {
        return product;
      }
    }
    return undefined;
  }

  async updateProductStock(id: string, tenantId: string, quantity: number): Promise<void> {
    const product = this.products.get(id);
    if (product && product.tenantId === tenantId) {
      const updatedProduct = { 
        ...product, 
        stock: (product.stock || 0) - quantity,
        updatedAt: new Date()
      };
      this.products.set(id, updatedProduct);
    }
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const newTransaction: Transaction = {
      id: this.generateId(),
      ...transaction,
      attendantId: transaction.attendantId ?? null,
      customerName: transaction.customerName ?? null,
      tax: transaction.tax ?? "0",
      discount: transaction.discount ?? "0",
      status: transaction.status ?? "pending",
      receiptNumber: transaction.receiptNumber ?? null,
      notes: transaction.notes ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.transactions.set(newTransaction.id, newTransaction);
    return newTransaction;
  }

  async addTransactionItems(items: InsertTransactionItem[]): Promise<TransactionItem[]> {
    const newItems: TransactionItem[] = items.map(item => ({
      id: this.generateId(),
      ...item,
      createdAt: new Date(),
    }));
    newItems.forEach(item => this.transactionItems.set(item.id, item));
    return newItems;
  }

  async getTransaction(id: string, tenantId: string): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    return transaction && transaction.tenantId === tenantId ? transaction : undefined;
  }

  async getTransactions(tenantId: string, limit: number = 50): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.tenantId === tenantId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }

  async updateTransactionStatus(id: string, tenantId: string, status: string): Promise<Transaction> {
    const transaction = this.transactions.get(id);
    if (!transaction || transaction.tenantId !== tenantId) {
      throw new Error("Transaction not found");
    }
    const updatedTransaction = { ...transaction, status: status as any, updatedAt: new Date() };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async createReturn(returnData: InsertReturn): Promise<Return> {
    const newReturn: Return = {
      id: this.generateId(),
      ...returnData,
      notes: returnData.notes ?? null,
      createdAt: new Date(),
    };
    this.returns.set(newReturn.id, newReturn);
    return newReturn;
  }

  async getReturns(tenantId: string): Promise<Return[]> {
    return Array.from(this.returns.values())
      .filter(returnItem => returnItem.tenantId === tenantId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createCashHandover(handover: InsertCashHandover): Promise<CashHandover> {
    const newHandover: CashHandover = {
      id: this.generateId(),
      ...handover,
      supervisorId: handover.supervisorId ?? null,
      notes: handover.notes ?? null,
      isSubmitted: handover.isSubmitted ?? false,
      createdAt: new Date(),
    };
    this.cashHandovers.set(newHandover.id, newHandover);
    return newHandover;
  }

  async getCashHandovers(tenantId: string): Promise<CashHandover[]> {
    return Array.from(this.cashHandovers.values())
      .filter(handover => handover.tenantId === tenantId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async updateCashHandover(id: string, tenantId: string, updates: Partial<CashHandover>): Promise<CashHandover> {
    const handover = this.cashHandovers.get(id);
    if (!handover || handover.tenantId !== tenantId) {
      throw new Error("Cash handover not found");
    }
    const updatedHandover = { ...handover, ...updates };
    this.cashHandovers.set(id, updatedHandover);
    return updatedHandover;
  }

  async getDashboardKPIs(tenantId: string): Promise<{
    todaySales: number;
    todayTransactions: number;
    lowStockItems: number;
    activeStaff: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayTransactions = Array.from(this.transactions.values())
      .filter(t => t.tenantId === tenantId && 
                  t.createdAt && t.createdAt >= today && 
                  t.createdAt < tomorrow);

    const todaySales = todayTransactions
      .filter(t => t.status === "completed")
      .reduce((sum, t) => sum + parseFloat(t.total), 0);

    const lowStockItems = Array.from(this.products.values())
      .filter(p => p.tenantId === tenantId && 
                  p.isActive && 
                  (p.stock || 0) <= (p.minStock || 0)).length;

    const activeStaff = Array.from(this.users.values())
      .filter(u => u.tenantId === tenantId && u.isActive).length;

    return {
      todaySales,
      todayTransactions: todayTransactions.length,
      lowStockItems,
      activeStaff,
    };
  }

  async getSalesReport(tenantId: string, startDate: Date, endDate: Date): Promise<any> {
    const transactionsInRange = Array.from(this.transactions.values())
      .filter(t => t.tenantId === tenantId && 
                  t.status === "completed" &&
                  t.createdAt && t.createdAt >= startDate && 
                  t.createdAt <= endDate);

    const groupedByDate = transactionsInRange.reduce((acc, transaction) => {
      const date = transaction.createdAt?.toISOString().split('T')[0] || '';
      if (!acc[date]) {
        acc[date] = { date, total: 0, count: 0 };
      }
      acc[date].total += parseFloat(transaction.total);
      acc[date].count += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(groupedByDate).sort((a: any, b: any) => a.date.localeCompare(b.date));
  }
}

// Use in-memory storage when database is not available
export const storage: IStorage = new MemStorage();
