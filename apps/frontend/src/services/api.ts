// Configuration de l'API
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Import des types partagés
import type {
  ApiResponse,
  ProductsResponse,
  Product,
  Category,
  User,
  LoginCredentials,
  RegisterData,
  Cart,
  Order,
  OrderPayload,
  PaymentIntentRequest,
  PaymentIntentResponse,
  UserOrdersResponse,
} from "@beyana/types";

// Les types sont maintenant importés depuis @beyana/types

// Classe API principale
class ApiService {
  private baseURL: string;
  private token: string | null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
  }

  // Méthode pour mettre à jour le token
  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("token");
      }
    }
  }

  // Méthode pour construire les headers
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Méthode générique pour les requêtes
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Une erreur est survenue",
      };
    }
  }

  // ===== PRODUITS =====

  // Récupérer tous les produits
  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<ApiResponse<ProductsResponse>> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.category) searchParams.append("category", params.category);
    if (params?.search) searchParams.append("keyword", params.search);
    if (params?.sort) searchParams.append("sort", params.sort);
    if (params?.minPrice)
      searchParams.append("minPrice", params.minPrice.toString());
    if (params?.maxPrice)
      searchParams.append("maxPrice", params.maxPrice.toString());

    const queryString = searchParams.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ""}`;

    return this.request<ProductsResponse>(endpoint);
  }

  // Récupérer un produit par ID
  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/products/${id}`);
  }

  // Récupérer les produits vedettes
  async getFeaturedProducts(): Promise<ApiResponse<Product[]>> {
    return this.request<Product[]>("/products/featured");
  }

  // Récupérer les nouveaux produits
  async getNewProducts(): Promise<ApiResponse<Product[]>> {
    return this.request<Product[]>("/products/new");
  }

  // Récupérer les produits en promotion
  async getSaleProducts(): Promise<ApiResponse<Product[]>> {
    return this.request<Product[]>("/products/sale");
  }

  // Récupérer un produit par slug
  async getProductBySlug(slug: string): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/products/slug/${slug}`);
  }

  // ===== CATÉGORIES =====

  // Récupérer toutes les catégories
  async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.request<Category[]>("/categories");
  }

  // Récupérer une catégorie par ID
  async getCategory(id: string): Promise<ApiResponse<Category>> {
    return this.request<Category>(`/categories/${id}`);
  }

  // ===== AUTHENTIFICATION =====

  // Connexion
  async login(
    credentials: LoginCredentials
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>(
      "/users/login",
      {
        method: "POST",
        body: JSON.stringify(credentials),
      }
    );

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  // Inscription
  async register(
    data: RegisterData
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>(
      "/users/register",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  // Déconnexion
  async logout(): Promise<ApiResponse<void>> {
    const response = await this.request<void>("/users/logout", {
      method: "POST",
    });

    this.setToken(null);
    return response;
  }

  // Récupérer le profil utilisateur
  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<User>("/users/profile");
  }

  // Mettre à jour le profil utilisateur
  async updateProfile(
    userData: Partial<User>
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>(
      "/users/profile",
      {
        method: "PUT",
        body: JSON.stringify(userData),
      }
    );

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  // Changer le mot de passe
  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>(
      "/users/change-password",
      {
        method: "PUT",
        body: JSON.stringify(passwordData),
      }
    );

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  // ===== PANIER =====

  // Récupérer le panier
  async getCart(): Promise<ApiResponse<Cart>> {
    return this.request<Cart>("/cart");
  }

  // Ajouter au panier
  async addToCart(
    productId: string,
    quantity: number = 1
  ): Promise<ApiResponse<Cart>> {
    return this.request<Cart>("/cart/add", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    });
  }

  // Mettre à jour le panier
  async updateCartItem(
    itemId: string,
    quantity: number
  ): Promise<ApiResponse<Cart>> {
    return this.request<Cart>(`/cart/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
  }

  // Supprimer du panier
  async removeFromCart(itemId: string): Promise<ApiResponse<Cart>> {
    return this.request<Cart>(`/cart/items/${itemId}`, {
      method: "DELETE",
    });
  }

  // Vider le panier
  async clearCart(): Promise<ApiResponse<Cart>> {
    return this.request<Cart>("/cart/clear", {
      method: "DELETE",
    });
  }

  // ===== COMMANDES =====

  // Méthode pour créer une commande (nouvelle signature)
  async createOrder(orderData: OrderPayload): Promise<ApiResponse<Order>> {
    return this.request<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  }

  // Méthode pour créer une intention de paiement
  async createPaymentIntent(
    paymentData: PaymentIntentRequest
  ): Promise<PaymentIntentResponse> {
    try {
      const url = `${this.baseURL}/payment/create-payment-intent`;
      const response = await fetch(url, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Une erreur inattendue est survenue",
      };
    }
  }

  // Récupérer les commandes de l'utilisateur (pagination/filtrage)
  async getUserOrders(params?: {
    page?: number;
    status?: string;
  }): Promise<ApiResponse<UserOrdersResponse>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.status) searchParams.append("status", params.status);
    const queryString = searchParams.toString();
    const endpoint = `/orders/myorders${queryString ? `?${queryString}` : ""}`;
    return this.request<UserOrdersResponse>(endpoint);
  }

  // Récupérer une commande par ID
  async getOrder(id: string): Promise<ApiResponse<Order>> {
    return this.request<Order>(`/orders/${id}`);
  }

  // Récupérer la wishlist
  async getWishlist(): Promise<ApiResponse<Product[]>> {
    return this.request<Product[]>("/users/wishlist");
  }

  // Ajouter un produit à la wishlist
  async addToWishlist(productId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/users/wishlist/${productId}`, {
      method: "POST",
    });
  }

  // Retirer un produit de la wishlist
  async removeFromWishlist(productId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/users/wishlist/${productId}`, {
      method: "DELETE",
    });
  }

  // Upload de l'avatar utilisateur
  async uploadAvatar(
    file: File
  ): Promise<ApiResponse<{ avatar: string; user: User }>> {
    console.log("Entrée dans uploadAvatar", file);
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      console.log("this.baseURL dans uploadAvatar:", this.baseURL);
      console.log("URL upload avatar:", `${this.baseURL}/users/avatar`);
      const response = await fetch(`${this.baseURL}/users/avatar`, {
        method: "PUT",
        headers: {
          Authorization: this.token ? `Bearer ${this.token}` : "",
        },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          error: data.message || "Erreur lors de l'upload de l'avatar",
        };
      }
      return data;
    } catch (err) {
      console.error("Erreur fetch uploadAvatar:", err);
      throw err;
    }
  }
}

// Instance singleton
export const apiService = new ApiService();

// Exports des fonctions individuelles pour faciliter l'importation
export const {
  getProducts,
  getProduct,
  getFeaturedProducts,
  getNewProducts,
  getSaleProducts,
  getCategories,
  getCategory,
  login,
  register,
  logout,
  getProfile,
  updateProfile,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  createOrder,
  createPaymentIntent,
  getUserOrders,
  getOrder,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  changePassword,
  uploadAvatar,
  getProductBySlug,
} = apiService;

export type {
  ApiResponse,
  ProductsResponse,
  Product,
  Category,
  User,
  LoginCredentials,
  RegisterData,
  Cart,
  Order,
  OrderPayload,
  PaymentIntentRequest,
  PaymentIntentResponse,
  UserOrdersResponse,
} from "@beyana/types";
