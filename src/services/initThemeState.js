import { UStoreProvider } from '@ustore/core'

export const initiateThemeState = async () => {
  const {Categories:categoriesTree} = await UStoreProvider.api.categories.getCategoryTree(3)
  const firstLevelCategories = categoriesTree.map((node) => node.Category)
  UStoreProvider.state.customState.set('categories', firstLevelCategories)
  UStoreProvider.state.customState.set('categoriesTree', categoriesTree)

  if (UStoreProvider.state.get().currentStore) {
    const { RequireOrderApproval: requireOrderApproval} = UStoreProvider.state.get().currentStore

    if (requireOrderApproval) {
      const userOrdersSummary = await UStoreProvider.api.orders.getUserOrdersSummary()
      UStoreProvider.state.customState.set('userOrdersSummary', userOrdersSummary)
    }
  }


}

