
import api from '@/api/axios';

export interface Micronutrient {
    id: number;
    name: string;
    unit: string;
    category: string;
    created_at: string;
}

export interface FoodMicronutrientValue {
    id: number;
    food_nutrition_value_id: number;
    micronutrient_id: number;
    amount: string;
    created_at: string;
    micronutrients: Micronutrient;
}

export interface FoodNutritionValue {
    id: number;
    food_id: number;
    data_source_id: number;
    calories_kcal: string | null;
    protein_g: string | null;
    carbs_g: string | null;
    fat_g: string | null;
    base_serving_size: string | null;
    base_unit: string | null;
    state: string;
    notes: string | null;
    deleted_at: string | null;
    created_at: string | null;
    fiber_g: string | null;
    glycemic_index: string | null;
    glycemic_load: string | null;
    food_micronutrient_values: FoodMicronutrientValue[];
}

export interface Food {
    id: number;
    name: string;
    brand: string | null;
    category_id: number;
    exchange_group_id: number;
    is_recipe: boolean;
    base_serving_size: string | null;
    base_unit: string | null;
    calories_kcal: string | null;
    protein_g: string | null;
    carbs_g: string | null;
    fat_g: string | null;
    food_nutrition_values: FoodNutritionValue[];
}

export interface ExchangeGroup {
    id: number;
    system_id: number;
    name: string;
    avg_calories: number;
    color_code: string;
}

export interface TotalMicronutrient {
    id: number;
    name: string;
    unit: string;
    category: string;
    amount: number;
}

export interface MenuItem {
    id: number;
    menu_meal_id: number;
    exchange_group_id: number;
    food_id: number;
    serving_unit_id: number | null;
    quantity: number;
    recipe_id: number | null;
    equivalent_quantity: string;
    foods: Food;
    exchange_groups: ExchangeGroup;
    serving_units: any | null;
}

export interface MenuMeal {
    id: number;
    menu_id: number;
    name: string;
    source_meal_plan_meal_id: number | null;
    menu_items_menu_items_menu_meal_idTomenu_meals: MenuItem[];
    total_calories: number;
    total_glycemic_load: number;
    total_micronutrients: TotalMicronutrient[];
}

export interface Menu {
    id: number;
    meal_plan_id: number | null;
    client_id: number | null;
    start_date: string;
    end_date: string;
    created_at: string;
    created_by: number;
    is_reusable: boolean;
    description_: string;
    title: string;
    menu_meals: MenuMeal[];
}

export const menusService = {
  getMenus: async (clientId?: string) => {
    const params = clientId ? { client_id: clientId } : {};
    const response = await api.get<Menu[]>('/v1/menus', { params });
    return response.data;
  },

  getMenusPool: async (clientId: string, date: string) => {
    const response = await api.get<Menu[]>('/v1/menus/pool', { 
        params: { client_id: clientId, date } 
    });
    return response.data;
  },

  getMenusPoolCalendar: async (clientId: string, date: string) => {
    const response = await api.get<Menu[]>('/v1/menus/pool/calendar', { 
        params: { client_id: clientId, date } 
    });
    return response.data;
  },

  getMenuById: async (id: number) => {
    const response = await api.get<Menu>(`/v1/menus/${id}`);
    return response.data;
  },

  swapMenu: async (data: { client_id: number; date: string; new_menu_id: number }) => {
    const response = await api.patch('/v1/menus/daily/swap', data);
    return response.data;
  },

  getDailyMenu: async (clientId: string, date: string) => {
    const response = await api.get<Menu>(`/v1/menus/daily`, {
        params: { client_id: clientId, date }
    });
    return response.data;
  },

  getFoodsByExchangeGroup: async (groupId: number) => {
    const response = await api.get<Food[]>(`/v1/foods/exchange-group/${groupId}`);
    return response.data;
  }
};
