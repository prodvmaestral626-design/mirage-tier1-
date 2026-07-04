import { create } from 'zustand'

export const useProviderStore = create((set, get) => ({
  // Selected provider and model
  selectedProviderId: 'openrouter',
  selectedModelId: 'openrouter/auto',

  // API keys per provider { providerId: 'key-string' }
  apiKeys: {},

  // Live model lists per provider { providerId: [...models] }
  modelLists: {},

  // Loading/error state per provider
  modelLoadState: {}, // { providerId: 'idle' | 'loading' | 'error' | 'loaded' }

  // Actions
  setProvider: (providerId) => set({
    selectedProviderId: providerId,
    selectedModelId: null, // reset model when provider changes
  }),

  setModel: (modelId) => set({ selectedModelId: modelId }),

  setApiKey: (providerId, key) => set((state) => ({
    apiKeys: { ...state.apiKeys, [providerId]: key }
  })),

  setModelList: (providerId, models) => set((state) => ({
    modelLists: { ...state.modelLists, [providerId]: models },
    modelLoadState: { ...state.modelLoadState, [providerId]: 'loaded' },
  })),

  setModelLoadState: (providerId, status) => set((state) => ({
    modelLoadState: { ...state.modelLoadState, [providerId]: status },
  })),

  getApiKey: (providerId) => get().apiKeys[providerId] || null,
  getModelList: (providerId) => get().modelLists[providerId] || [],
  getModelLoadState: (providerId) => get().modelLoadState[providerId] || 'idle',
}))
