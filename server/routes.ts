import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { loginSchema } from "@shared/schema";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "24h";

// Middleware to authenticate JWT tokens
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = user;
    req.tenantId = user.tenantId;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

// Middleware to check user roles
const requireRole = (roles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { shopId, username, password } = loginSchema.parse(req.body);
      
      // Get tenant by subdomain
      const tenant = await storage.getTenant(shopId);
      if (!tenant) {
        return res.status(400).json({ message: "Shop not found" });
      }

      // Get user by username and tenant
      const user = await storage.getUserByUsername(tenant.id, username);
      if (!user || !user.isActive) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, tenantId: user.tenantId, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        tenant: {
          id: tenant.id,
          name: tenant.name,
          subdomain: tenant.subdomain,
          primaryColor: tenant.primaryColor,
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    const tenant = await storage.getTenant("");
    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: req.user.role,
      },
      tenant
    });
  });

  // Product routes
  app.get("/api/products", authenticateToken, async (req: any, res) => {
    try {
      const products = await storage.getProducts(req.tenantId);
      res.json(products);
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/products", authenticateToken, requireRole(['admin']), async (req: any, res) => {
    try {
      const productData = { ...req.body, tenantId: req.tenantId };
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      console.error("Create product error:", error);
      res.status(400).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", authenticateToken, requireRole(['admin']), async (req: any, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.tenantId, req.body);
      res.json(product);
    } catch (error) {
      console.error("Update product error:", error);
      res.status(400).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", authenticateToken, requireRole(['admin']), async (req: any, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id, req.tenantId);
      if (success) {
        res.json({ message: "Product deleted successfully" });
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    } catch (error) {
      console.error("Delete product error:", error);
      res.status(400).json({ message: "Failed to delete product" });
    }
  });

  app.get("/api/products/barcode/:barcode", authenticateToken, async (req: any, res) => {
    try {
      const product = await storage.getProductByBarcode(req.params.barcode, req.tenantId);
      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    } catch (error) {
      console.error("Get product by barcode error:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Transaction routes
  app.post("/api/transactions", authenticateToken, requireRole(['admin', 'cashier']), async (req: any, res) => {
    try {
      const { items, ...transactionData } = req.body;
      
      // Create transaction
      const transaction = await storage.createTransaction({
        ...transactionData,
        tenantId: req.tenantId,
        cashierId: req.user.id,
        receiptNumber: `RCP-${Date.now()}`,
      });

      // Add transaction items and update stock
      const transactionItems = items.map((item: any) => ({
        ...item,
        transactionId: transaction.id,
      }));
      
      await storage.addTransactionItems(transactionItems);

      // Update product stock
      for (const item of items) {
        await storage.updateProductStock(item.productId, req.tenantId, item.quantity);
      }

      // Update transaction status to completed
      const completedTransaction = await storage.updateTransactionStatus(
        transaction.id, 
        req.tenantId, 
        "completed"
      );

      res.json(completedTransaction);
    } catch (error) {
      console.error("Create transaction error:", error);
      res.status(400).json({ message: "Failed to create transaction" });
    }
  });

  app.get("/api/transactions", authenticateToken, async (req: any, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 50;
      const transactions = await storage.getTransactions(req.tenantId, limit);
      res.json(transactions);
    } catch (error) {
      console.error("Get transactions error:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get("/api/transactions/:id", authenticateToken, async (req: any, res) => {
    try {
      const transaction = await storage.getTransaction(req.params.id, req.tenantId);
      if (transaction) {
        res.json(transaction);
      } else {
        res.status(404).json({ message: "Transaction not found" });
      }
    } catch (error) {
      console.error("Get transaction error:", error);
      res.status(500).json({ message: "Failed to fetch transaction" });
    }
  });

  // Returns routes
  app.post("/api/returns", authenticateToken, requireRole(['admin', 'cashier']), async (req: any, res) => {
    try {
      const returnData = {
        ...req.body,
        tenantId: req.tenantId,
        processedById: req.user.id,
      };
      const returnRecord = await storage.createReturn(returnData);
      res.json(returnRecord);
    } catch (error) {
      console.error("Create return error:", error);
      res.status(400).json({ message: "Failed to process return" });
    }
  });

  app.get("/api/returns", authenticateToken, requireRole(['admin', 'cashier']), async (req: any, res) => {
    try {
      const returns = await storage.getReturns(req.tenantId);
      res.json(returns);
    } catch (error) {
      console.error("Get returns error:", error);
      res.status(500).json({ message: "Failed to fetch returns" });
    }
  });

  // Cash handover routes
  app.post("/api/handovers", authenticateToken, requireRole(['admin', 'cashier']), async (req: any, res) => {
    try {
      const handoverData = {
        ...req.body,
        tenantId: req.tenantId,
        cashierId: req.user.id,
      };
      const handover = await storage.createCashHandover(handoverData);
      res.json(handover);
    } catch (error) {
      console.error("Create handover error:", error);
      res.status(400).json({ message: "Failed to create handover" });
    }
  });

  app.get("/api/handovers", authenticateToken, async (req: any, res) => {
    try {
      const handovers = await storage.getCashHandovers(req.tenantId);
      res.json(handovers);
    } catch (error) {
      console.error("Get handovers error:", error);
      res.status(500).json({ message: "Failed to fetch handovers" });
    }
  });

  app.put("/api/handovers/:id", authenticateToken, requireRole(['admin', 'cashier']), async (req: any, res) => {
    try {
      const handover = await storage.updateCashHandover(req.params.id, req.tenantId, req.body);
      res.json(handover);
    } catch (error) {
      console.error("Update handover error:", error);
      res.status(400).json({ message: "Failed to update handover" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/kpis", authenticateToken, async (req: any, res) => {
    try {
      const kpis = await storage.getDashboardKPIs(req.tenantId);
      res.json(kpis);
    } catch (error) {
      console.error("Get KPIs error:", error);
      res.status(500).json({ message: "Failed to fetch KPIs" });
    }
  });

  app.get("/api/reports/sales", authenticateToken, async (req: any, res) => {
    try {
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);
      const salesReport = await storage.getSalesReport(req.tenantId, startDate, endDate);
      res.json(salesReport);
    } catch (error) {
      console.error("Get sales report error:", error);
      res.status(500).json({ message: "Failed to fetch sales report" });
    }
  });

  // User management routes
  app.get("/api/users", authenticateToken, requireRole(['admin']), async (req: any, res) => {
    try {
      const users = await storage.getUsersByTenant(req.tenantId);
      res.json(users);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", authenticateToken, requireRole(['admin']), async (req: any, res) => {
    try {
      const { password, ...userData } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const newUser = await storage.createUser({
        ...userData,
        tenantId: req.tenantId,
        passwordHash: hashedPassword,
      });
      
      res.json(newUser);
    } catch (error) {
      console.error("Create user error:", error);
      res.status(400).json({ message: "Failed to create user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
