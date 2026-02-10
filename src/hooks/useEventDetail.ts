"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Event, Product } from "@/db/schema";

/** 상품 폼 상태 타입 */
export interface ProductFormState {
  name: string;
  description: string;
  imageUrl: string;
  totalQuantity: string;
  weight: string;
}

/** 이벤트 설정 폼 상태 타입 */
export interface EventFormState {
  name: string;
  description: string;
  titleImageUrl: string;
  titleImageWidth: number;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  subTextColor: string;
  accentColor: string;
  posterUrl: string;
  posterOverlay: boolean;
  showStockPanel: boolean;
}

/** 확률이 포함된 상품 타입 */
export interface ProductWithProbability extends Product {
  /** 기본 확률 (가중치 미적용, 수량만 기반) */
  baseProbability: number;
  /** 실제 확률 (가중치 적용) */
  weightedProbability: number;
  /** 현재 재고 기준 확률 */
  currentProbability: number;
}

const INITIAL_PRODUCT_FORM: ProductFormState = {
  name: "",
  description: "",
  imageUrl: "",
  totalQuantity: "",
  weight: "1.00",
};

const INITIAL_EVENT_FORM: EventFormState = {
  name: "",
  description: "",
  titleImageUrl: "",
  titleImageWidth: 80,
  primaryColor: "#c026d3",
  secondaryColor: "#701a75",
  backgroundColor: "#fdf4ff",
  textColor: "#1f2937",
  subTextColor: "#6b7280",
  accentColor: "#e879f9",
  posterUrl: "",
  posterOverlay: true,
  showStockPanel: true,
};

/** 이벤트 상세 훅 반환 타입 */
interface UseEventDetailReturn {
  state: {
    event: Event | undefined;
    products: Product[];
    loading: boolean;
    error: boolean;
    showProductForm: boolean;
    editingProduct: Product | null;
    productForm: ProductFormState;
    eventForm: EventFormState;
  };
  computed: {
    totalQuantity: number;
    totalRemaining: number;
    consumptionRate: number;
    productsWithProbability: ProductWithProbability[];
    canRunDraw: boolean;
  };
  actions: {
    openProductForm: () => void;
    closeProductForm: () => void;
    startEditProduct: (product: Product) => void;
    submitProduct: (e: React.FormEvent) => void;
    deleteProduct: (productId: number) => void;
    adjustStock: (productId: number, adjustment: number) => void;
    setStock: (productId: number, newValue: number) => void;
    resetAllStock: () => void;
    updateProductForm: <K extends keyof ProductFormState>(field: K, value: ProductFormState[K]) => void;
    updateEventForm: <K extends keyof EventFormState>(field: K, value: EventFormState[K]) => void;
    saveEventSettings: (e: React.FormEvent) => void;
    toggleEventActive: () => void;
  };
  pending: {
    updateEvent: boolean;
    addProduct: boolean;
    updateProduct: boolean;
    deleteProduct: boolean;
    adjustStock: boolean;
    resetAllStock: boolean;
  };
}

/** API 함수 */
const fetchEvent = async (id: string): Promise<Event> => {
  const res = await fetch(`/api/events/${id}`);
  if (!res.ok) throw new Error("Failed to fetch event");
  return res.json();
};

const fetchProducts = async (eventId: string): Promise<Product[]> => {
  const res = await fetch(`/api/events/${eventId}/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
};

/** 이벤트 상세 비즈니스 로직 훅 */
export function useEventDetail(eventId: string): UseEventDetailReturn {
  const queryClient = useQueryClient();

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(INITIAL_PRODUCT_FORM);
  const [eventForm, setEventForm] = useState<EventFormState>(INITIAL_EVENT_FORM);
  const [isEventFormInitialized, setIsEventFormInitialized] = useState(false);

  /** 이벤트 조회 */
  const {
    data: event,
    isLoading: eventLoading,
    error: eventError,
  } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => fetchEvent(eventId),
  });

  /** 상품 목록 조회 */
  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
  } = useQuery({
    queryKey: ["products", eventId],
    queryFn: () => fetchProducts(eventId),
  });

  /** 이벤트 데이터로 폼 초기화 */
  useEffect(() => {
    if (event && !isEventFormInitialized) {
      setEventForm({
        name: event.name || "",
        description: event.description || "",
        titleImageUrl: event.titleImageUrl || "",
        titleImageWidth: event.titleImageWidth ?? 80,
        primaryColor: event.primaryColor || "#c026d3",
        secondaryColor: event.secondaryColor || "#701a75",
        backgroundColor: event.backgroundColor || "#fdf4ff",
        textColor: event.textColor || "#1f2937",
        subTextColor: event.subTextColor || "#6b7280",
        accentColor: event.accentColor || "#e879f9",
        posterUrl: event.posterUrl || "",
        posterOverlay: event.posterOverlay ?? true,
        showStockPanel: event.showStockPanel ?? true,
      });
      setIsEventFormInitialized(true);
    }
  }, [event, isEventFormInitialized]);

  /** 이벤트 업데이트 */
  const updateEventMutation = useMutation({
    mutationFn: async (data: Partial<Event>) => {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update event");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
    },
  });

  /** 상품 추가 */
  const addProductMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      imageUrl: string;
      totalQuantity: number;
      weight: number;
    }) => {
      const res = await fetch(`/api/events/${eventId}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, probability: 0 }),
      });
      if (!res.ok) throw new Error("Failed to add product");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", eventId] });
      resetProductForm();
    },
  });

  /** 상품 수정 */
  const updateProductMutation = useMutation({
    mutationFn: async ({ productId, data }: { productId: number; data: Partial<Product> }) => {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update product");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", eventId] });
      resetProductForm();
    },
  });

  /** 상품 삭제 */
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete product");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", eventId] });
    },
  });

  /** 재고 조정 */
  const adjustStockMutation = useMutation({
    mutationFn: async ({ productId, adjustment }: { productId: number; adjustment: number }) => {
      const res = await fetch(`/api/products/${productId}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adjustment }),
      });
      if (!res.ok) throw new Error("Failed to adjust stock");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", eventId] });
    },
  });

  /** 전체 재고 리셋 */
  const resetAllStockMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(
        products.map((product) =>
          fetch(`/api/products/${product.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ remainingQuantity: product.totalQuantity }),
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", eventId] });
    },
  });

  /** 계산된 값들 */
  const totalQuantity = products.reduce((sum, p) => sum + p.totalQuantity, 0);
  const totalRemaining = products.reduce((sum, p) => sum + p.remainingQuantity, 0);
  const consumptionRate = totalQuantity > 0 ? (1 - totalRemaining / totalQuantity) * 100 : 0;

  // 가중치 적용 총합 계산
  const totalWeightedQuantity = products.reduce((sum, p) => {
    const weight = typeof p.weight === "string" ? parseFloat(p.weight) : (p.weight ?? 1);
    return sum + p.totalQuantity * weight;
  }, 0);

  const totalWeightedRemaining = products.reduce((sum, p) => {
    const weight = typeof p.weight === "string" ? parseFloat(p.weight) : (p.weight ?? 1);
    return sum + p.remainingQuantity * weight;
  }, 0);

  const productsWithProbability: ProductWithProbability[] = products.map((p) => {
    const weight = typeof p.weight === "string" ? parseFloat(p.weight) : (p.weight ?? 1);

    // 기본 확률 (가중치 미적용)
    const baseProbability = totalQuantity > 0
      ? (p.totalQuantity / totalQuantity) * 100
      : 0;

    // 가중치 적용 확률
    const weightedProbability = totalWeightedQuantity > 0
      ? ((p.totalQuantity * weight) / totalWeightedQuantity) * 100
      : 0;

    // 현재 재고 기준 확률 (가중치 적용)
    const currentProbability = totalWeightedRemaining > 0
      ? ((p.remainingQuantity * weight) / totalWeightedRemaining) * 100
      : 0;

    return {
      ...p,
      baseProbability,
      weightedProbability,
      currentProbability,
    };
  });

  const canRunDraw = !!event?.isActive && products.length > 0 && totalRemaining > 0;

  /** 상품 폼 초기화 */
  const resetProductForm = useCallback(() => {
    setProductForm(INITIAL_PRODUCT_FORM);
    setEditingProduct(null);
    setShowProductForm(false);
  }, []);

  /** 상품 폼 열기 */
  const openProductForm = useCallback(() => {
    setProductForm(INITIAL_PRODUCT_FORM);
    setEditingProduct(null);
    setShowProductForm(true);
  }, []);

  /** 상품 수정 시작 */
  const startEditProduct = useCallback((product: Product) => {
    setProductForm({
      name: product.name,
      description: product.description || "",
      imageUrl: product.imageUrl || "",
      totalQuantity: String(product.totalQuantity),
      weight: String(product.weight ?? "1.00"),
    });
    setEditingProduct(product);
    setShowProductForm(true);
  }, []);

  /** 상품 폼 제출 */
  const submitProduct = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const newTotal = parseInt(productForm.totalQuantity);
      const weight = parseFloat(productForm.weight) || 1.0;

      if (editingProduct) {
        const oldTotal = editingProduct.totalQuantity;
        const currentRemaining = editingProduct.remainingQuantity;
        const diff = newTotal - oldTotal;
        const newRemaining = Math.max(0, Math.min(newTotal, currentRemaining + diff));

        updateProductMutation.mutate({
          productId: editingProduct.id,
          data: {
            name: productForm.name,
            description: productForm.description,
            imageUrl: productForm.imageUrl,
            totalQuantity: newTotal,
            remainingQuantity: newRemaining,
            weight: String(weight),
          },
        });
      } else {
        addProductMutation.mutate({
          name: productForm.name,
          description: productForm.description,
          imageUrl: productForm.imageUrl,
          totalQuantity: newTotal,
          weight,
        });
      }
    },
    [productForm, editingProduct, updateProductMutation, addProductMutation]
  );

  /** 상품 삭제 */
  const handleDeleteProduct = useCallback(
    (productId: number) => {
      if (!confirm("상품을 삭제하시겠습니까?")) return;
      deleteProductMutation.mutate(productId);
    },
    [deleteProductMutation]
  );

  /** 재고 조정 */
  const handleAdjustStock = useCallback(
    (productId: number, adjustment: number) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return;

      const newRemaining = product.remainingQuantity + adjustment;
      if (newRemaining < 0 || newRemaining > product.totalQuantity) return;

      adjustStockMutation.mutate({ productId, adjustment });
    },
    [products, adjustStockMutation]
  );

  /** 재고 설정 */
  const handleSetStock = useCallback(
    (productId: number, newValue: number) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return;

      const newRemaining = Math.max(0, Math.min(product.totalQuantity, newValue));
      const adjustment = newRemaining - product.remainingQuantity;
      if (adjustment === 0) return;

      adjustStockMutation.mutate({ productId, adjustment });
    },
    [products, adjustStockMutation]
  );

  /** 전체 재고 리셋 */
  const handleResetAllStock = useCallback(() => {
    if (!confirm("모든 상품의 재고를 초기 수량으로 리셋하시겠습니까?")) return;
    resetAllStockMutation.mutate();
  }, [resetAllStockMutation]);

  /** 이벤트 설정 저장 */
  const saveEventSettings = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      updateEventMutation.mutate(eventForm, {
        onSuccess: () => alert("설정이 저장되었습니다."),
        onError: () => alert("저장에 실패했습니다."),
      });
    },
    [eventForm, updateEventMutation]
  );

  /** 이벤트 활성화 토글 */
  const toggleEventActive = useCallback(() => {
    if (!event) return;

    const newStatus = !event.isActive;
    const confirmMsg = newStatus
      ? "이벤트를 활성화하시겠습니까?\n활성화하면 럭키드로우를 실행할 수 있습니다."
      : "이벤트를 비활성화하시겠습니까?\n비활성화하면 럭키드로우를 실행할 수 없습니다.";

    if (!confirm(confirmMsg)) return;
    updateEventMutation.mutate({ isActive: newStatus });
  }, [event, updateEventMutation]);

  /** 상품 폼 필드 업데이트 */
  const updateProductForm = useCallback(
    <K extends keyof ProductFormState>(field: K, value: ProductFormState[K]) => {
      setProductForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  /** 이벤트 폼 필드 업데이트 */
  const updateEventForm = useCallback(
    <K extends keyof EventFormState>(field: K, value: EventFormState[K]) => {
      setEventForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const loading = eventLoading || productsLoading;
  const error = !!(eventError || productsError);

  return {
    state: {
      event,
      products,
      loading,
      error,
      showProductForm,
      editingProduct,
      productForm,
      eventForm,
    },
    computed: {
      totalQuantity,
      totalRemaining,
      consumptionRate,
      productsWithProbability,
      canRunDraw,
    },
    actions: {
      openProductForm,
      closeProductForm: resetProductForm,
      startEditProduct,
      submitProduct,
      deleteProduct: handleDeleteProduct,
      adjustStock: handleAdjustStock,
      setStock: handleSetStock,
      resetAllStock: handleResetAllStock,
      updateProductForm,
      updateEventForm,
      saveEventSettings,
      toggleEventActive,
    },
    pending: {
      updateEvent: updateEventMutation.isPending,
      addProduct: addProductMutation.isPending,
      updateProduct: updateProductMutation.isPending,
      deleteProduct: deleteProductMutation.isPending,
      adjustStock: adjustStockMutation.isPending,
      resetAllStock: resetAllStockMutation.isPending,
    },
  };
}
